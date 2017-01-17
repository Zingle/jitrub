const HTTP = require("./http");
const create = Object.create;
const define = Object.defineProperties;
const assign = Object.assign;
const Jira$internal = new WeakMap();

/**
 * Create Jira API object.
 * @param {string} server
 * @param {Credentials} creds
 * @returns {Jira}
 */
function jira(server, creds) {
    var jira = create(Jira);

    Jira$internal.set(jira, {
        server: server,
        creds: creds
    });

    return jira;
}

/**
 * Return HTTP headers to send with Jira API requests.
 * @param {Jira} jira
 * @returns {object}
 */
function headers(jira) {
    var creds = Jira$internal.get(jira).creds,
        auth = HTTP.basic(creds.ident, creds.secret),
        ua = HTTP.ua("curl/faux");

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

const Jira = {
    /**
     * Return full URI for Jira resource URI.
     * @param {string} uri
     * @returns {string}
     */
    url: function(uri) {
        return /^https?:/.test(uri) ? uri : `${this.endpoint}/${uri}`;
    },

    /**
     * Execute JQL search.
     * @param {string} query
     * @returns {Promise}
     */
    jql: function(query) {
        var url = this.url(`search?jql=${query}`),
            head = headers(this);

        return HTTP.get(url, head).then(readbody).then(b => b.issues);
    },

    /**
     * Lookup issues.
     * @param {string} project
     * @param {Set} statuses
     * @returns {Promise}
     */
    issues: function(project, statuses) {
        var query,
            statuses;

        if (!project || !statuses) {
            return Promise.resolve([]);
        }

        statuses = Array.from(statuses).map(s => `"${s}"`).join(",");
        query = `project=${project} and statuses in (${statuses})`;

        return this.jql(query);
    }
};

define(Jira, {
    /**
     * Jira server URL.
     * @name Jira#server
     * @type {string}
     * @readonly
     */
    server: {
        configurable: true,
        enumerable: true,
        get: function() {return Jira$internal.get(this).server;}
    },

    /**
     * Jira credentials.
     * @name Jira#creds
     * @type {Credentials}
     * @readonly
     */
    creds: {
        configurable: true,
        enumerable: true,
        get: function() {return Jira$internal.get(this).creds;}
    },

    /**
     * Jira API endpoint.
     * @name Jira#endpoint
     * @type {string}
     * @readonly
     */
    endpoint: {
        configurable: true,
        enumerable: true,
        get: function() {return `${this.server}/rest/api/2`;}
    }
});

module.exports = jira;
module.exports.Jira = Jira;
