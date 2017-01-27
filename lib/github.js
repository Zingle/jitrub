const HTTP = require("./http");
const LockError = require("./lock-error");
const create = Object.create;
const define = Object.defineProperties;
const assign = Object.assign;
const GitHub$internal = new WeakMap();

/**
 * Create GitHub API object.
 * @param {string} repo
 * @param {Credentials} creds
 * @returns {GitHub}
 */
function github(repo, creds) {
    var github = create(GitHub);

    GitHub$internal.set(github, {
        repo: repo,
        creds: creds
    });

    return github;
}

/**
 * Return HTTP headers to send with GitHub API requests.
 * @param {GitHub} github
 * @returns {object}
 */
function headers(github) {
    var creds = GitHub$internal.get(github).creds,
        auth = HTTP.basic(creds.ident, creds.secret),
        ua = HTTP.ua(creds.ident);

    return assign(ua, auth);
}

const GitHub = {
    /**
     * Return full URI for GitHub resource URI.
     * @param {string} uri
     * @returns {string}
     */
    url: function(uri) {
        return /^https?:/.test(uri) ? uri : `${this.endpoint}/${uri}`;
    },

    /**
     * Lookup branch info.
     * @param {string} branch
     * @returns {Promise}
     */
    branch: function(branch) {
        var url = this.url(`branches/${branch}`);
        return HTTP.get(url, headers(this)).then(res => {
            if (res.status === 200) return res.body;
            if (res.status === 404) return null;
            throw new Error(`unexpected ${res.status} status`);
        });
    },

    /**
     * Lookup ref info.  The ref should be in the form 'heads/A' or 'tags/B'.
     * @param {string} ref
     * @returns {Promise}
     */
    ref: function(ref) {
        var url = this.url(`git/refs/${ref}`);
        return HTTP.get(url, headers(this)).then(res => {
            if (res.status === 200) return res.body;
            if (res.status === 404) return null;
            throw new Error(`unexpected ${res.status} status`);
        });
    },

    /**
     * Create a reference.  The ref should be in the form 'heads/A' or 'tags/B'.
     * @param {string} ref
     * @param {string} sha
     * @returns {Promise}
     */
    createRef: function(ref, sha) {
        var url = this.url(`git/refs`),
            reference = {ref: `refs/${ref}`, sha: sha};

        return HTTP.post(url, headers(this), reference).then(res => {
            if (res.status === 201) return res.body;
            throw new Error(`unexpected ${res.status} status`);
        });
    },

    /**
     * Update ref.  Optionally force fast-forward.  The ref should be in the
     * form 'heads/A' or 'tags/B'.
     * @param {string} ref
     * @param {string} sha
     * @param {boolean} [ff]
     * @returns {Promise}
     */
    updateRef: function(ref, sha, ff) {
        var url = this.url(`git/refs/${ref}`),
            reference = {sha: sha, force: !ff};

        return HTTP.patch(url, headers(this), reference).then(res => {
            if (res.status === 200) return res.body;
            throw new Error(`unexpected ${res.status} status`);
        });
    },

    /**
     * Delete ref.  The ref should be in the form 'heads/A' or 'tags/B'.
     * @param {string} ref
     * @returns {Promise}
     */
    deleteRef: function(ref) {
        var url = this.url(`git/refs/${ref}`);
        return HTTP.delete(url, headers(this)).then(res => {
            if (res.status === 204) return true;
            if (res.status === 422) return false;
            throw new Error(`unexpected ${res.status} status`);
        });
    },

    /**
     * Lookup tag info.
     * @param {string} tag
     * @returns {Promise}
     */
    tag: function(tag) {
        return this.ref(`tags/${tag}`).then(ref => {
            var url;

            if (ref) {
                url = this.url(`git/tags/${ref.object.sha}`);
                return HTTP.get(url, headers(this)).then(res => {
                    if (res.status === 200) return res.body;
                    if (res.status === 404) return null;
                    throw new Error(`unexpected ${res.status} status`);
                });
            }
        });
    },

    /**
     * Create annotated tag.
     * @param {string} tag
     * @param {string} head
     * @param {string} message
     * @returns {Promise}
     */
    createTag: function(tag, head, message) {
        var url = this.url("git/tags");

        return this.ref(`heads/${head}`).then(ref => ({
            tag: tag,
            message: message,
            object: ref.object.sha,
            type: "commit",
            tagger: {
                name: this.creds.ident,
                email: this.creds.email,
                data: new Date().toISOString()
            }
        })).then(tag => {
            return HTTP.post(url, headers(this), tag).then(res => {
                if (res.status === 201) return res.body;
                throw new Error(`unexpected ${res.status} status`);
            });
        }).then(tag => {
            return this.createRef(`tags/${tag.tag}`, tag.sha).then(() => tag);
        });
    },

    /**
     * Reset a branch to match a reference branch.
     * @param {string} branch
     * @param {string} reference
     */
    reset: function(branch, reference) {
        return this.ref(`heads/${reference}`).then(ref => {
            var url = this.url(`git/refs/heads/${branch}`);
            return HTTP.patch(url, headers(this), {
                sha: ref.object.sha,
                force: true
            }).then(res => {
                if (res.status === 200) return res.body;
                throw new Error(`unexpected ${res.status} status`);
            });
        });
    },

    /**
     * Merge one or more branches into a base branch.
     * @param {string} base
     * @param {...string} head
     * @returns {Promise}
     */
    merge: function(base, head) {
        var args = Array.prototype.slice.call(arguments),
            url, merge = {},
            commit;

        if (args.length === 0) {
            return Promise.resolve(null);
        } else if (args.length === 1) {
            return this.branch(base);
        } else if (args.length === 2 && head instanceof Array) {
            return this.merge.apply(this, [base].concat(head));
        } else if (args.length === 2) {
            url = this.url("merges");

            merge.base = base;
            merge.head = head;
            merge.commit_message = `JitRub merge ${head} into ${base}`;

            commit = HTTP.post(url, headers(this), merge).then(res => {
                if (res.status === 201) return res.body;
                throw new Error(`unexpected ${res.status} status`);
            });

            return commit.then(commit => {
                return this.updateRef(`heads/${base}`, commit.sha);
            });
        } else return this.merge(base, head).then(() => {
            return this.merge.apply(this, [base].concat(args.slice(2)));
        });
    },

    /**
     * Compare references.
     * @param {string} refa
     * @param {string} refb
     */
    compare: function(refa, refb) {
        var url = this.url(`compare/${refa}...${refb}`);
        return HTTP.get(url, headers(this)).then(res => {
            if (res.status === 200) return res.body;
            throw new Error(`unexpected ${res.status} status`);
        });
    },

    /**
     * Create an advisory lock for a branch with a tag referencing the branch
     * head.  Fails if lock already exists.
     * @param {string} branch
     * @returns {Promise}
     */
    lock: function(branch) {
        var tag = `lock-${branch}`;

        return this.branch(branch).then(b => {
            if (!b) throw new Error(`branch ${branch} not found`);

            return this.createTag(tag, branch, "branch locked by jitrub")
                .catch(err => {
                    throw new LockError(err);
                });
        });
    },

    /**
     * Remove an advisory lock placed on a branch with the .lock() function.
     * @param {string} branch
     * @returns {Promise}
     */
    unlock: function(branch) {
        var ref = `tags/lock-${branch}`;
        return this.deleteRef(ref);
    }
};

define(GitHub, {
    /**
     * GitHub owner/repo.
     * @name GitHub#repo
     * @type {string}
     * @readonly
     */
    repo: {
        configurable: true,
        enumerable: true,
        get: function() {return GitHub$internal.get(this).repo;}
    },

    /**
     * GitHub credentials.
     * @name GitHub#creds
     * @type {Credentials}
     * @readonly
     */
    creds: {
        configurable: true,
        enumerable: true,
        get: function() {return GitHub$internal.get(this).creds;}
    },

    /**
     * Base branch at which to start builds.
     * @name GitHub#base
     * @type {string}
     * @readonly
     */
    base: {
        configurable: true,
        enumerable: true,
        get: function() {return GitHub$internal.get(this).base;}
    },

    /**
     * Build branch which will be set to latest build.
     * @name GitHub#build
     * @type {string}
     * @readonly
     */
    build: {
        configurable: true,
        enumerable: true,
        get: function() {return GitHub$internal.get(this).build;}
    },

    /**
     * GitHub API endpoint for repo.
     * @name GitHub#endpoint
     * @type {string}
     * @readonly
     */
    endpoint: {
        configurable: true,
        enumerable: true,
        get: function() {return `https://api.github.com/repos/${this.repo}`;}
    }
});

module.exports = github;
module.exports.GitHub = GitHub;
