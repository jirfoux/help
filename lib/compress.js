const zlib = require("zlib");
const fs = require("fs");
const intoStream = require("into-stream");

module.exports.compressString = function (request, message, encodings) {
    return compress(request, intoStream(message), encodings);
}
module.exports.compressFile = function (request, file, encodings) {
    return compress(request, fs.createReadStream(file), encodings);
}
module.exports.compressStream = function (request, stream, encodings) {
    return compress(request, stream, encodings);
}
function compress(request, stream, encodings) {
    const acceptedEncoding = request.headers["accept-encoding"] || "";
    let encoding = undefined;
    function allowed(enc) {
        return encodings === undefined || encodings.includes(enc);
    }
    if (acceptedEncoding.includes("gzip") && allowed("gzip")) {
        stream = stream.pipe(zlib.createGzip());
        encoding = "gzip";
    } else if (acceptedEncoding.includes("deflate") && allowed("deflate")) {
        stream = stream.pipe(zlib.createDeflate());
        encoding = "deflate";
    } else if (acceptedEncoding.includes("br") && allowed("br")) {
        stream = stream.pipe(zlib.createBrotliCompress());
        encoding = "br";
    }
    return { stream: stream, encoding: encoding };
}