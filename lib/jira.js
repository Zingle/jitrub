const HTTP = require("./http");
const create = Object.create;
const define = Object.defineProperties;
const Jira$internal = new WeakMap();

/**
 * Create Jira API object.
 * @param {string} server
 * @param {Credentials} creds
 * @param {string} issueSpec
 * @returns {Jira}
 */
function jira(server, creds, issueSpec) {
    var jira = create(Jira);

    Jira$internal.set(jira, {
        server: server,
        creds: creds,
        issueSpec: issueSpec
    });
}

const Jira = {
    /**
     * Return full URI for Jira resource URI.
     * @param {string} uri
     * @returns {string}
     */
    url: function(uri) {
        return /^https?:/.test(uri) ? uri : `${this.endpoint}/${uri}`;
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
     * Jira issue spec (e.g., "PROJ:Resolved,Approved,Closed")
     * @name Jira#issueSpec
     * @type {string}
     * @readonly
     */
    issueSpec: {
        configurable: true,
        enumerable: true,
        get: function() {return Jira$internal.get(this).issueSpec;}
    },

    /**
     * Jira project code from issue spec.
     * @name Jira#project
     * @type {string}
     * @readonly
     */
    project: {
        configurable: true,
        enumerable: true,
        get: function() {return this.issueSpec.split(":")[0];}
    },

    /**
     * Comma-separated list of issue statuses to include in build.
     * @name Jira#statuses
     * @type {string}
     */
    statuses: {
        configurable: true,
        enumerable: true,
        get: function() {return this.issueSpec.split(":")[1];}
    }
});

module.exports = jira;
module.exports.Jira = Jira;
