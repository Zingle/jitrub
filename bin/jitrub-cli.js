const parseurl = require("url").parse;
const jitrub = require("../lib/jitrub");
const creds = require("../lib/creds");
const usage = require("./usage");
const keys = Object.keys;

var opts = {},
    args, arg, script,
    url, auth;

args = process.argv.slice(1);
script = args.shift();

while (args.length) switch ((arg = args.shift())) {
    case "--help":
        usage();
        process.exit(0);
    default:
        readjira(args).sync().then(log => {
            var added = keys(log).filter(k => log[k])),
                removed = keys(log).filter(k => !log[k]);

            if (added.length) {
                console.log("added the following branches:");
                added.forEach(branch => console.log(` - ${branch}`));
            }

            if (removed.length) {
                console.log("removed the following branches:");
                removed.forEach(branch => console.log(` - ${branch}`));
            }
        });
        break;
}

function readargs(args) {
    return jitrub(readjira(args), readgithub(args));
}

function readjira(args) {
    var arg = readval(args),
        url = parseurl(arg),
        server, auth, ident, secret, issues;

    switch (url.protocol) {
        case "jira+http": server = "http://"; break;
        case "jira+https": server = "https://"; break;
        default: throw new Error(`${url.protocol} is not valid jira scheme`);
    }

    server = `${server}${url.host}${url.pathname}`;
    auth = (url.auth || ":").split(":");
    ident = auth[0];
    secret = auth[1];
    issues = url.query;

    return jitrub.jira(server, creds(ident, secret), issues));
}

function readgithub(args) {
    var arg = readval(args),
        url = parseurl(arg, true),
        repo, auth, ident, secret, email, base, build;

    if (url.protocol !== "github:") {
        throw new Error(`{url.protocol} is not valid github scheme`);
    }

    repo = `${url.host}${url.path}`;
    auth = (url.auth || ":").split(":");
    ident = auth[0];
    secret = auth[1];
    email = url.query.email;
    base = url.query.base;
    build = url.query.build;

    return jitrub.github(repo, creds(ident, secret, email), base, build);
}

function readval(args) {
    if (!args.length) throw new Error("missing argument");
    return args.shift();
}
