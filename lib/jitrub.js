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
        github: github,
        project: ""
    });

    return jitrub;
}

const JitRub = {
    /**
     * Sync GitHub build branch with Jira issue feature branches.
     * @returns {Promise}
     */
    sync: function() {
        return this.jira.issues().then(issues => {
            var branches;
            issues.sort((a,b) => a.key.localeCompare(b.key));
            branches = issues.map(branch => this.github.branch(branch));
            return Promise.all(branches).then(b => b.filter(b => b));
        }).then(features => {
            console.log(features);
        });
    },

    /**
     * Select Jira project from which tickets will be synced.
     * @param {string} projectCode
     */
    selectProject: function(projectCode) {
        projectCode = projectCode ? String(projectCode) : "";
        JitRub$internal.get(this).project = projectCode;
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
        get: function() {return JitRub$internal.get(this).jira;}
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
        get: function() {return JitRub$internal.get(this).github;}
    },

    /**
     * Jira project code from which issues are synced.
     * @name JitRub#project
     * @type {string}
     * @readonly
     */
    project: {
        configurable: true,
        enumerable: true,
        get: function() {return JitRub$internal.get(this).project;}
    }
});

module.exports = jitrub;
module.exports.JitRub = JitRub;
