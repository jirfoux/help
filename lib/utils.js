//@ts-check
const url = require("url");
const cookie = require("cookie");
const qs = require("query-string");
const ip = require("request-ip");

const proxy = (process.env.PROXY || "").toLowerCase() == "true";

const cachedRequests = new Map();
module.exports.parseRequest = function (request) {
    console.log(cachedRequests.size);
    if (cachedRequests.has(request)) {
        return cachedRequests.get(request);
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
    result.ip = proxy ? ip.getClientIp(request) : request.connection.remoteAddress;
    result.host = request.headers.host;
    result.protocol = proxy ? request.headers["x-forwarded-proto"] || (request.connection.encrypted ? "https" : "http") : (request.connection.encrypted ? "https" : "http");
    cachedRequests.set(request, result);
    setTimeout(() => cachedRequests.delete(request), 1000);
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
