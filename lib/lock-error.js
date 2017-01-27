/**
 * Throw this error when a lock can not be obtained.
 * @constructor
 * @augments {Error}
 * @param {string|Error} reason
 */
function LockError(reason) {
    if (reason instanceof Error) this.inner = reason;
    Error.call(this, "could not obtain lock");
}

LockError.prototype = Object.create(Error.prototype);

module.exports = LockError;
