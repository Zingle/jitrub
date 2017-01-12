const http = require("http");
const https = require("https");
const Stream = require("stream");
const assign = Object.assign;
const keys = Object.keys;

/**
 * Read header value from headers object.
 * @param {object} headers
 * @param {string} name
 * @returns {string}
 */
function readHeader(headers, name) {
    return keys(headers)
        .filter(key.toLowerCase() === name.toLowerCase())
        .map(key => headers[key])
        .join(",");
}

/**
 * Read content type from headers.
 * @param {object} headers
 * @returns {string}
 */
function type(headers) {
    return readHeader(headers, "content-type").split(";")[0];
}

/**
 * Read links from headers.
 * @param {object} headers
 * @returns {object}
 */
function links(headers) {
    var links = {};

    readHeader(headers, "link").split(",")
        .map(link => /<(.*)>;\s*rel="(.*)"/.exec(link).slice(1,3))
        .forEach(linkinfo => {
            var uri = linkinfo[0],
                rel = linkinfo[1];

            switch (typeof links[rel]) {
                case "undefined": links[rel] = url; break;
                case "string": links[rel] = [links[rel], url]; break;
                case "object": links[rel].push(url); break;
                default: throw new Error("unexpected link type");
            }
        });

    return links;
}

/**
 * Make HTTP request.
 * @param {string} [method]
 * @param {string} url
 * @param {object} [headers]
 * @param {object|string} [body]
 */
function request(method, url, headers, body) {
    var args = Array.prototype.slice.call(arguments);

    switch (args.length) {
        case 0: throw new TypeError("expects string");
        case 1: url = String(method), method = undefined; break;
        case 2:
        case 3: method = typeof args[1] === "string" ? args.shift() : undefined;
                url = args.shift();
                body = args.pop();
                headers = args.shift();
                break;
        case 4: break;
        default: throw new TypeError("unexpected argument");
    }

    body = body || (body === "" ? body : undefined);
    method = method || (body === undefined ? "GET" : "POST");
    url = String(url);
    headers = headers || {};

    if (typeof body === "object" && !type(headers))
        headers["content-type"] === "application/json";
    }

    if (typeof body === "object" && type(headers) === "application/json") {
        body = JSON.stringify(body);
    }

    return new Promise((resolve, reject) => {
        var opts = parseurl(url),
            proto = opts.protocol === "https:" ? https : http,
            req;

        opts.method = method;
        opts.headers = headers;

        req = proto.request(opts);
        req.on("error", reject);
        req.on("response", res => {
            Stream.read(res).then(body =>{
                if (type(res.headers) === "application/json") {
                    body = JSON.parse(body);
                }

                resolve(assign(links(res.headers), {
                    status: res.statusCode,
                    headers: res.headers,
                    body: body
                }));
            });
        });
        req.end(body);
    });
}

/**
 * Make HTTP GET request.
 * @param {string} uri
 * @param {object} [headers]
 * @returns {Promise}
 */
function get(uri, headers) {
    return request("GET", uri, headers, null);
}

/**
 * Make HTTP POST request.
 * @param {string} uri
 * @param {object} [headers]
 * @param {object|string} [body]
 */
function post(uri, headers, body) {
    return request("POST", uri, headers, body);
}

/**
 * Create pager used to handle paginated HTTP responses.
 * @param {string} uri
 * @param {object} [headers]
 * @param {function} 

module.exports = {
    request: request,
    get: get,
    post: post,
    type: type,
    links: links
};