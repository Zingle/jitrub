const create = Object.create;
const define = Object.defineProperties;
const freeze = Object.freeze;
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
        project: "",
        base: "master",
        head: "jitrub",
        statuses: new Set()
    });

    return jitrub;
}

const JitRub = {
    /**
     * Sync GitHub build branch with Jira issue feature branches.
     * @returns {Promise}
     */
    sync: function() {
        var project = this.project,
            statuses = this.statuses;

        return this.jira.issues(project, statuses).then(issues => {
            var branches;

            issues = issues.map(issue => issue.key);
            issues.sort();
            branches = issues.map(issue => this.github.branch(issue));

            return this.github.branch(this.base).then(base => {
                if (!base) throw new Error(`no '${this.base}' base branch`);
                return Promise.all(branches).then(branches => {
                    return [base].concat(branches.filter(b => b));
                });
            });
        }).then(features => {
            var log = {}, i;
            features.forEach(branch => log[branch.name] = true);
            return log;
        });
    },

    /**
     * Select Jira project from which tickets will be synced.
     * @param {string} projectCode
     */
    selectProject: function(projectCode) {
        projectCode = projectCode ? String(projectCode) : "";
        JitRub$internal.get(this).project = projectCode;
    },

    /**
     * Select base branch to start with when merging features into the head
     * branch.
     * @param {string} baseBranch
     */
    selectBase: function(baseBranch) {
        baseBranch = baseBranch ? String(baseBranch) : "";
        JitRub$internal.get(this).base = baseBranch;
    },

    /**
     * Select head branch to merge features into.
     * @param {string} headBranch
     */
    selectHead: function(headBranch) {
        headBranch = headBranch ? String(headBranch) : "";
        JitRub$internal.get(this).head = headBranch;
    },

    /**
     * Include features with specified issue status.
     * @param {string} status
     */
    includeStatus: function(status) {
        JitRub$internal.get(this).statuses.add(status);
    },

    /**
     * Exclude features with specified issue status.
     * @param {string} status
     */
    excludeStatus: function(status) {
        JitRub$internal.get(this).statuses.delete(status);
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
    },

    /**
     * Base branch to start with for merging features.
     * @name JitRub#base
     * @type {string}
     * @readonly
     */
    base: {
        configurable: true,
        enumerable: true,
        get: function() {return JitRub$internal.get(this).base;}
    },

    /**
     * Head branch to which base and features are merged.
     * @name JitRub#head
     * @type {string}
     * @readonly
     */
    head: {
        configurable: true,
        enumerable: true,
        get: function() {return JitRub$internal.get(this).head;}
    },

    /**
     * Return immutable set of issue statuses to include when merging
     * features.
     * @name JitRub#statuses
     * @type {Set}
     * @readonly
     */
    statuses: {
        configurable: true,
        enumerable: true,
        get: function() {
            return freeze(new Set(JitRub$internal.get(this).statuses));
        }
    }
});

module.exports = jitrub;
module.exports.JitRub = JitRub;
