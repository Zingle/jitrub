const HTTP = require("./http");
const create = Object.create;
const Jira$internal = new WeakMap();

/**
 * Connection to Jira.
 * @param {string} url
 * @param {Credentials} creds
 * @returns {Jira}
 */
function jira(url, creds) {
    var jira = create(Jira);

    Jira$internal.set(jira, {
        url: url,
        creds: creds
    });
}

const Jira = {
};

Object.defineProperties(Jira, {
    /**
     * Jira server URL.
     * @name Jira#url
     * @type {string}
     * @readonly
     */
    url: {
        configurable: true,
        enumerable: true,
        get: function() {return Jira$internal.get(this).url;}
    }

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
    }
});

module.exports = jira;
module.exports.Jira = Jira;
