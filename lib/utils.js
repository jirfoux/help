//@ts-check
const url = require("url");
const cookie = require("cookie");
const qs = require("query-string");

const cachedRequests = {}
module.exports.parseRequest = function (request) {
    if (cachedRequests[request] && request.c4ched) {
        return cachedRequests[request];
    }
    if ("IncomingMessage" !== request.constructor.name) {
        throw new Error("Wrong argument type.");
    }
    const result = new ParsedRequest();
    result.method = request.method;
    result.headers = request.headers;
    const parsedURL = url.parse(request.url)
    result.path = parsedURL.pathname.split("/").filter(p => p);
    result.params = qs.parse(parsedURL.query, { parseBooleans: true, parseNumbers: true })
    result.cookies = request.headers.cookie ? cookie.parse(request.headers.cookie) : {};
    result.ip = request.connection.remoteAddress;
    result.host = request.headers.host;
    result.protocol = request.connection.encrypted ? "https" : "http";
    request.c4ched = true
    cachedRequests[request] = result;
    setTimeout(() => { delete cachedRequests[request] }, 1000);
    return result;

}
class ParsedRequest {
    method;
    headers;
    path;
    params;
    cookies;
    ip;
    host;
    protocol;
}
