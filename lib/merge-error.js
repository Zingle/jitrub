/**
 * Throw this error when a merge has a conflict.
 * @constructor
 * @augments {Error}
 * @param {string} base
 * @param {string} head
 * @param {string} email
 */
function MergeError(base, head, email) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name
    this.email = email;
    this.message = `conflict merging ${head} into ${base} (${email})`;
}

MergeError.prototype = Object.create(Error.prototype);
MergeError.prototype.constructor = MergeError;

module.exports = MergeError;
