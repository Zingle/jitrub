jitrub Build Tool
=================
Jira/GitHub feature branch syncing.

```js
const jitrub = require("jitrub");
const github = jitrub.github("github/repo", "github_username", "github_token");
const jira = jitrub.jira("jira_url", "jira_username", "jira_password");
const statuses = ["Resolved", "Approved", "Closed"];
const link = jitrub(jira, github);

link.sync("master", "jitrub", ["Resolved", "Closed"]).then(tagname => {
    console.log("tag:", tagname);
});
```
