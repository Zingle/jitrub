jitrub Build Tool
=================
Jira/GitHub feature branch syncing.

```js
const jitrub = require("jitrub");
const github = jitrub.github("github/repo", "github_username", "github_token");
const jira = jitrub.jira("jira_url", "jira_username", "jira_password");
const statuses = ["Resolved", "Approved", "Closed"];
const branchBase = "master";
const branchBuild = "jira";
const sync = jitrub(jira, github, statuses, branchBase, branchBuild);

sync().then(changelog => {
    console.log("the following branches were added:");
    Object.keys(changelog).filter(branch => changelog[branch] === true).forEach(branch => {
        console.log(` - ${branch}`);
    });

    console.log("the following branches were removed:");
    Object.keys(changelog).filter(branch => changelog[branch] === false).forEach(branch => {
        console.log(` - ${branch}`);
    });
});

sync("FOO-234").then(result => {
    if (result === true) console.log("branch added");
    if (result === false) console.log("branch removed");
    if (result === null) console.log("branch already synced");
});
```
