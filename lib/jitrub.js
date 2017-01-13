const create = Object.create;
const define = Object.defineProperties;
const JitRub$internal = new WeakMap();

/**
 * Create Jira-GitHub sync.
 * @returns {JitRub}
 */
function jitrub(jira, github) {
    jitrub = create(JitRub);

    JitRub$internal.set(jitrub, {
        jira: jira,
        github: github
    });
}

const JitRub = {
};

define(JitRub, {
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
    },

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
    }
});

module.exports = jitrub;
module.exports.JitRub = JitRub;
