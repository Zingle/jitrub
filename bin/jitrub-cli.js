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
        opts.jira = readarg_jira(args);
        opts.github = readarg_github(args);
        opts.base = readarg(args);
        opts.merge = readarg(args);

        url = parseurl(args[0]);
        if (! /^jira(+http)?:$/.test(url.protocol))

        if (url.protocol ===
        auth = url.auth.split(":");
        opts.jira_ident = 
        opts.creds.jira = creds.apply(null, urlparts.auth.split(":"));
        

        break;
}


function readarg(args) {
    if (!args.length) throw new Error("missing argument");
    return args.shift();
}

function readarg_jira(args) {
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
        throw new Error(`expect ${arg} to use Jira scheme (i.e. jira+http://...)`);
    }
}

function readarg_github(args) {
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
        throw new Error(`expect ${arg} to use GitHub scheme (i.e. github://...)`);
    }

}
