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
     * Sync GitHub build branch with Jira issue feature branches.
     * @returns {Promise}
     */
    sync: fuction() {
        return this.jira.issues().then(issues => {
            var branches;
            issues.sort((a,b) => a.key.localeCompare(b.key));
            branches = issues.map(branch => this.github.branch(branch));
            return Promise.all(branches).then(b => b.filter(b => b));
        }).then(features) => {
            
        });
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
