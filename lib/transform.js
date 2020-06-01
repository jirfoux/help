const csso = require('csso');
const minify = require('html-minifier').minify;
const terser = require('terser');
const less = require("less");
const uglify = require("uglify-js");

uglify.minify = terser.minify;

module.exports.minifyCSS = function (data) {
  const res = csso.minify(data).css;
  return res ? res : data;
}

module.exports.minifyJS = function (data) {
  const res = terser.minify(data);
  if (res.error) {
    console.log(res.error);
    return data;
  } else {
    return res.code;
  }
}

module.exports.minifyML = function (data) {
  try {
    return minify(data, { collapseWhitespace: true, minifyCSS: true, minifyJS: true, removeComments: true });
  } catch (err) {
    console.log(err);
    return data;
  }
}

module.exports.convertLess = function (data) {
  let res = "";
  less.render(data, (e, d) => {
    if (e) {
      res = data;
    } else {
      res = d.css;
      console.log(d);
    }
  });
  return res;
}