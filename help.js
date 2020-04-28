const stream = require('stream');
const Transform = stream.Transform || require('readable-stream').Transform;
const transform = require("./lib/transform");

module.exports.StringTransform = class StringTransform extends Transform {
    constructor(t) {
        super();
        if (typeof t != "function") throw new Error("no function given");
        this.t = t;
    }

    _transform(chunk, enc, cb) {
        if (!this.data) {
            this.data = chunk.toString();
        } else {
            this.data += chunk.toString();
        }
        cb();
    }

    _flush(cb) {
        cb(null, this.t(this.data));
    }
}

module.exports.transformStream = function (mapper) {
    return new StringTransform(mapper);
}

module.exports.minifyCSS = transform.minifyCSS;
module.exports.minifyJS = transform.minifyJS;
module.exports.minifyML = transform.minifyML;
module.exports.convertLess = transform.convertLess;

