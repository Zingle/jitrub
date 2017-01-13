const parseurl = require("url").parse;
const jitrub = require("../lib/jitrub");
const creds = require("../lib/creds");
const usage = require("./usage");

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
        opts.jira = readjira(args);
        opts.github = readgithub(args);
        opts.base = readval(args);
        opts.merge = readval(args);
        if (args.length) throw new Error(`unexpected argument ${args[0]}`);
        break;
}


jr = jitrub(jitrub.jira(opts.jira.endpoint))

function createSync(opts) {
    var jopts = opts.jira,
        gopts = opts.githube,
        jcreds = creds(jopts.ident, jopts.secret),
        gcreds = creds(gopts.ident, gopts.secret, gopts.email),
        jira = jitrub.jira(jopts.endpoint, jcreds),
        github = jitrub.github(gopts.repo, gopts.creds);
}

function readval(args) {
    if (!args.length) throw new Error("missing argument");
    return args.shift();
}

function readjira(args) {
    var arg = readarg(args),
        url = parseurl(arg),
        opts = {}, m;

    if ((m = /^jira+(https?):$/.exec(url.protocol))) {
        opts.endpoint = `${m[1]}://${url.host}${url.pathname}`;
        opts.ident = url.auth ? url.auth.split(":")[0] : undefined;
        opts.secret = url.auth ? url.auth.split(":")[1] : undefined;
        opts.include = opts.query ? opts.query.split(",") : [];
        return opts;
    } else {
        throw new Error(`invalid Jira connection URI: ${arg}`);
    }
}

function readgithub(args) {
    var arg = readarg(args),
        url = parseurl(arg, true),
        opts = {}, m;

    if (url.protocol === "github:") {
        opts.repo = `${url.host}${url.path}`;
        opts.ident = url.auth ? url.auth.split(":")[0] : undefined;
        opts.secret = url.auth ? url.auth.split(":")[1] : undefined;
        opts.email = url.query.email;
        return opts;
    } else {
        throw new Error(`invalid GitHub connection URI: ${arg}`);
    }
}
