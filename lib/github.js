const HTTP = require("./http");
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
            throw new Error(`unexpected ${ref.status} status`);
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
            if (res.status === 200) return res.body;
            if (res.status === 404) return null;
            throw new Error(`unexpected ${ref.status} status`);
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
            if (res.status === 404) return null;
            throw new Error(`unexpected ${ref.status} status`);
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
            throw new Error(`unexpected ${ref.status} status`);
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
            throw new Error(`unexpected ${ref.status} status`);
        });
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
