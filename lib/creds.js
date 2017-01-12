const freeze = Object.freeze;

/**
 * Create authentication credentials.
 * @param {string} ident
 * @param {string} secret
 * @param {string} [email]
 * @returns {Credentials}
 */
function creds(ident, secret, email) {
    return freeze({
        ident: String(ident),
        secret: String(secret),
        email: email ? String(email) : undefined
    });
}

module.exports = creds;
