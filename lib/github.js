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
        auth = HTTP.auth(creds.ident, creds.secret),
        ua = HTTP.ua(creds.ident);

    return assign(ua, auth);
}

/**
 * Read response body.
 * @param {object} res
 * @returns {object}
 */
function readbody(res) {
    if (res.status === 200) return res.body;
    if (res.status === 404) return null;
    throw new Error(`unexpected ${res.status} status`);
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
        return HTTP.get(url, headers(this)).then(readbody);
    },

    /**
     * Compare references.
     * @param {string} refa
     * @param {string} refb
     */
    compare: function(refa, refb) {
        var url = this.url(`compare/${refa}...${refb}`);
        return HTTP.get(url, headers(this)).then(readbody);
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
        get: function() {return GitHub$internal.get(this).endpoint;}
    }
});

module.exports = github;
module.exports.GitHub = GitHub;
