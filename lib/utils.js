//@ts-check
const url = require("url");
const cookie = require("cookie");

const cachedRequests = {}
module.exports.parseRequest = function (request, paramListSeparator) {
    if (cachedRequests[request] && request.c4ched) {
        return cachedRequests[request];
    }
    if ("IncomingMessage" !== request.constructor.name) {
        throw new Error("Wrong argument type.");
    }
    const result = new ParsedRequest();
    result.method = request.method;
    result.headers = request.headers;
    const parsedURL = url.parse(request.url, true)
    result.path = parsedURL.pathname.split("/").filter(p => p);
    result.params = {}
    Object.keys(parsedURL.query).sort()
        .forEach(k => result.params[k] = parseParam(parsedURL.query[k]), paramListSeparator);
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
function parseParam(value, paramListSeparator) {
    if (typeof value !== "string") {
        if (Array.isArray(value)) {
            return value.map(parseParam);
        }
        throw new Error(value + " is not a string.");
    }
    let tmpArray = value.split(paramListSeparator || ",").map(s => s.trim()).filter(s => s);
    if (tmpArray.length > 1) {
        return tmpArray.map(e => parseParam(e, paramListSeparator));
    }
    if (value === "true") {
        return true;
    }
    if (value === "false") {
        return false;
    }
    if (value === "") {
        return null;
    }
    if (value.match(/^-?\d+$/)) {
        return parseInt(value);
    }
    if (value.match(/^-?\d+(\.\d+)?$/)) {
        return parseFloat(value);
    }
    return value;
}