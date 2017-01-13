const create = Object.create;
const define = Object.defineProperties;
const JitRub$internal = new WeakMap();

/**
 * Create Jira-GitHub sync.
 * @param {Jira} jira
 * @param {GitHub} github
 * @returns {JitRub}
 */
function jitrub(jira, github) {
    jitrub = create(JitRub);

    JitRub$internal.set(jitrub, {
        jira: jira,
        github: github
    });

    return jitrub;
}

const JitRub = {
    /**
     * Sync feature branches for matching issue statuses.  After successful
     * completion, the 'build' branch will contain the 'base' branch and all
     * matching feature branches.
     * @param {string} base
     * @param {string} build
     * @param {string[]} statuses
     * @returns {Promise}
     */
    sync: fuction(base, build, statuses) {
        var tickets = this.jira.tickets(statuses),

        return Promise.all([this.jira.tickets(statuses)])
    }
};

define(JitRub, {
    /**
     * Jira connection.
     * @name JitRub#jira
     * @type {Jira}
     * @readonly
     */
    jira: {
        configurable: true,
        enumerable: true,
        get: function (return JitRub$internal.get(this).jira;}
    },

    /**
     * GitHub connection.
     * @name JitRub#github
     * @type {GitHub}
     * @readonly
     */
    github: {
        configurable: true,
        enumerable: true,
        get: function (return JitRub$internal.get(this).github;}
    }
});

module.exports = jitrub;
module.exports.JitRub = JitRub;
