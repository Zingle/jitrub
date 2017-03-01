#!/usr/bin/env node

const basename = require("path").basename;
const parseurl = require("url").parse;
const creds = require("../lib/creds");
const jitrub = require("../lib/jitrub");
const jira = require("../lib/jira");
const github = require("../lib/github");
const keys = Object.keys;

var opts = process.argv.slice(2),
    opt, args = [],
    verbose = false,
    jiraUri, githubUri;

while (opts.length) switch ((opt = opts.shift())) {
    case "--help":
        usage();
        break;
    case "-v":
    case "--verbose":
        verbose = true;
        break;
    case "-q":
    case "--quiet":
        verbose = false;
        break;
    default:
        args = [opt].concat(opts);
        opts = [];
}

if (args.length < 2) usage(new Error());
if (args.length > 2) usage(new Error());

jiraUri = readarg(args);
githubUri = readarg(args);

if (!verbose) {
    console.log = () => {};
    console.info = () => {};
    console.trace = () => {};
}

createSync(jiraUri, githubUri)().then(buildtag => {
    console.log("tag:", buildtag);
}).catch(fatal);

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

    server = `${server}${uri.host}${uri.pathname || ""}`;
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

    repo = `${uri.host}${uri.pathname}`;
    auth = (uri.auth || ":").split(":");
    ident = auth[0];
    secret = auth[1];
    email = uri.query.email;

    return github(repo, creds(ident, secret, email));
}
