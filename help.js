const stream = require('stream');
const Transform = stream.Transform || require('readable-stream').Transform;
const compress = require("./lib/compress");
const transform = require("./lib/transform");

/**
 * returns objects with stream and encoding
 */
module.exports.compressString = compress.compressString;
module.exports.compressFile = compress.compressFile;
module.exports.compressStream = compress.compressStream;

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

/**
 * f
 */
module.exports.Cache = class Cache {
    constructor(settings) {
        settings = settings || {};
        this.map = new Map();
        this.maxSize = settings.maxSize || 20;
        this.expireAfterWrite = settings.expireAfterWrite;
        this.removalListener = settings.removalListener;
        this.lastWriteMap = new Map();
        this.loader = settings.loader;
    }
    asMap() {
        this._removeExpiredKey();
        return new Map(this.map);
    }
    get(key, loader) {
        this._removeExpiredKey(key);
        let val = this.map.get(key);
        const l = loader || this.loader;
        if (l) {
            if (val === undefined) {
                val = l(key);
                this.put(key, val);
            }
            return val;
        } else {
            return val;
        }
    }
    getAllPresent(keys) {
        const res = new Map();
        (Array.isArray(keys) ? keys : [keys])//
            .forEach(k => {
                const val = this.get(k);
                if (val !== undefined) {
                    res.set(k, val);
                }
            });
        return res;
    }
    invalidateAll(keys) {
        if (keys === undefined) {
            this.invalidate(Array.from(this.map.keys()));
        } else {
            this.invalidate(keys);
        }
    }
    invalidate(keys) {
        (Array.isArray(keys) ? keys : [keys]).forEach(k => {
            const val = this.map.get(k);
            if (this.map.delete(k)) {
                this.lastWriteMap.delete(k);
                if (this.removalListener) {
                    this.removalListener(k, val);
                }
            }
        });
    }
    put(key, value) {
        this._removeExpiredKey(key);
        if (this.map.size >= this.maxSize) {
            this.invalidate(this.map.keys().next().value);
        }
        if (this.expireAfterWrite) {
            this.lastWriteMap.set(key, new Date().getTime());
        }
        return this.map.set(key, value);
    }
    putAll(map) {
        map.forEach((v, k) => this.put(k, v));
    }
    size() {
        this._removeExpiredKey();
        return this.map.size;
    }
    _removeExpiredKey(key) {
        if (this.expireAfterWrite) {
            const it = (key ? [key] : Array.from(this.map.keys()));
            this.invalidate(it.filter(k => {
                const l = this.lastWriteMap.get(k);
                if (l === undefined) {
                    return false;
                }
                return (new Date().getTime() - l) > this.expireAfterWrite;
            }));
        }
    }
}
