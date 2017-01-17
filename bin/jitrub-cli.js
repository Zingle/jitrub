const basename = require("path").basename;
const parseurl = require("url").parse;
const creds = require("../lib/creds");
const jitrub = require("../lib/jitrub");
const jira = require("../lib/jira");
const github = require("../lib/github");
const keys = Object.keys;

var opts = process.argv.slice(2),
    opt, args = [],
    jiraUri, githubUri;

while (opts.length) switch ((opt = opts.shift())) {
    case "--help": usage();
    default:
        args = [opt].concat(opts);
        opts = [];
}

if (args.length < 2) usage(new Error());
if (args.length > 2) usage(new Error());

jiraUri = readarg(args);
githubUri = readarg(args);

createSync(jiraUri, githubUri)().then(log => {
    var added = keys(log).filter(k => log[k]),
        removed = keys(log).filter(k => !log[k]);

    if (added.length) {
        console.log("added the following branches:");
        removed.forEach(branch => console.log(` - ${branch}`));
    }

    if (removed.length) {
        console.log("removed the following branches:");
        removed.forEach(branch => console.log(` - ${branch}`));
    }
});

function fatal(err) {
    console.error(process.env.DEBUG ? err.stack : err.message);
    process.exit(1);
}

function usage(err) {
    var script = basename(process.argv[1]),
        usage;

    usage = `Usage: ${script} <jiracn> <gitcn>`;

    if (err) {
        console.error(usage);
        process.exit(1);
    } else {
        console.log(usage);
        process.exit(0);
    }
}

function readarg(args) {
    if (!args.length) usage(new Error());
    return args.shift();
}

function createSync(jiraUri, githubUri) {
    var jira = createJira(jiraUri),
        github = createGithub(githubUri),
        issueSpec = parseurl(jiraUri).query,
        projectCode = issueSpec.split(":")[0],
        includeStats = issueSpec.split(":")[1].split(","),
        mergeSpec = parseurl(githubUri, true).query,
        baseBranch = mergeSpec.base,
        headBranch = mergeSpec.head,
        jitrubSync;

    jitrubSync = jitrub(jira, github);
    jitrubSync.selectProject(projectCode);
    jitrubSync.selectHead(headBranch);
    jitrubSync.selectBase(baseBranch);
    includeStats.forEach(status => jitrubSync.includeStatus(status));

    return jitrubSync.sync.bind(jitrubSync);
}

function createJira(jiraUri) {
    var uri = parseurl(jiraUri),
        server, auth, ident, secret;

    switch (uri.protocol) {
        case "jira+http:": server = "http://"; break;
        case "jira+https:": server = "https://"; break;
        default: fatal(new Error(`${uri.protocol} is not valid jira schema`));
    }

    server = `${server}${uri.host}`;
    if (uri.pathname) server += uri.pathname;
    auth = (uri.auth || ":").split(":");
    ident = auth[0];
    secret = auth[1];

    return jira(server, creds(ident, secret));
}

function createGithub(githubUri) {
    var uri = parseurl(githubUri, true),
        repo, auth, ident, secret, email;

    if (uri.protocol !== "github:") {
        fatal(new Error(`${uri.protocol} is not valid github scheme`));
    }

    repo = `${uri.host}${uri.path}`;
    auth = (uri.auth || ":").split(":");
    ident = auth[0];
    secret = auth[1];
    email = uri.query.email;

    return github(repo, creds(ident, secret, email));
}
