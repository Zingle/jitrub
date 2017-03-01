/**
 * Throw this error when a lock can not be obtained.
 * @constructor
 * @augments {Error}
 * @param {string|Error} reason
 */
function LockError(reason) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = "could not obtain lock";
    if (reason instanceof Error) this.inner = reason;
}

LockError.prototype = Object.create(Error.prototype);
LockError.prototype.constructor = LockError;

module.exports = LockError;
