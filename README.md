jitrub Build Tool
=================
Jira/GitHub feature branch syncing.

```js
const jitrub = require("jitrub");
const github = jitrub.github("github/repo", "github_username", "github_token");
const jira = jitrub.jira("jira_url", "jira_username", "jira_password");
const statuses = ["Resolved", "Approved", "Closed"];
const link = jitrub(jira, github);

link.sync("master", "jitrub", ["Resolved", "Approved", "Closed"]).then(log => {
    console.log("the following branches were added:");
    Object.keys(log).filter(b => log[b]).forEach(branch => {
        console.log(` - ${branch}`);
    });

    console.log("the following branches were removed:");
    Object.keys(log).filter(b => !log[b]).forEach(branch => {
        console.log(` - ${branch}`);
    });
});
```
