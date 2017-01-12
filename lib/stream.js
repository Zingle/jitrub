/**
 * Read and concatenate stream data.
 * @param {Readable} stream
 * @returns {Promise}
 */
function read(stream) {
    return new Promise((resolve, reject) => {
        var data = "";
        stream.on("data", chunk => data+=chunk);
        stream.on("error", reject);
        stream.on("end", () => resolve(data));
    });
}

module.exports = {
    read: read
};
