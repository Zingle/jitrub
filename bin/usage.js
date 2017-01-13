/**
 * Print usage.
 * @param {string} script
 */
function usage() {
    var usage;

    usage  = `Usage: ${script} <jiracn> <gitcn> <base> <merge> [<status> ...]`;
    console.log(usage);
}

module.exports = usage;
