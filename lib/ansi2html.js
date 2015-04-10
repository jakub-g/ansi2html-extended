/*jshint multistr: true */
var readline = require('readline');
var EOL = require('os').EOL;
var ansispan2 = require('./ansispan2');

/**
 * Helper for escaping HTML entities; extracted from lodash codebase
 * @param {String} string
 */
function escapeHtml(string) {
    var reUnescapedHtml = /[&<>"'`]/g;
    var reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#96;'
    };
    var escapeHtmlChar = function (chr) {
      return htmlEscapes[chr];
    };
    return (string && reHasUnescapedHtml.test(string)) ?
       string.replace(reUnescapedHtml, escapeHtmlChar) : string;
}

/**
 * Generate HTML header including CSS style with palette
 * @param {Object} palette The following keys are accepted:
 *   fg, fg_{black,red,green,yellow,blue,purple,cyan,white},
 *   bg, bg_{black,red,green,yellow,blue,purple,cyan,white},
 *           black,red,green,yellow,blue,purple,cyan,white
 * Each of them is optional and defaults to its named HTML correspondent
 */
var makeHeader = function (palette) {
    var p = palette || {};
    var str = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>\
    .ansi_bold{font-weight:bold}\
    .ansi_italic{font-style:italic}\
    .ansi_console_snippet{font-family:monospace; white-space: pre; display: block;\
      unicode-bidi: embed; overflow:auto; padding:5px;}';

    str += '\
    .ansi_console_snippet{\
        background-color:'+(p.bg || p.bg_black || p.black || "black")+';\
        color:'           +(p.fg || p.fg_white || p.white || "white")+';\
    }\
    .ansi_fg_black  {color:'+(p.fg_black  || p.black || "black ")+'}\
    .ansi_fg_red    {color:'+(p.fg_red    || p.red   || "red   ")+'}\
    .ansi_fg_green  {color:'+(p.fg_green  || p.green || "green ")+'}\
    .ansi_fg_yellow {color:'+(p.fg_yellow || p.yellow|| "yellow")+'}\
    .ansi_fg_blue   {color:'+(p.fg_blue   || p.blue  || "blue  ")+'}\
    .ansi_fg_purple {color:'+(p.fg_purple || p.purple|| "purple")+'}\
    .ansi_fg_cyan   {color:'+(p.fg_cyan   || p.cyan  || "cyan  ")+'}\
    .ansi_fg_white  {color:'+(p.fg_white  || p.white || "white ")+'}\
    .ansi_bg_black  {background-color:'+(p.bg_black  || p.black || "black ")+'}\
    .ansi_bg_red    {background-color:'+(p.bg_red    || p.red   || "red   ")+'}\
    .ansi_bg_green  {background-color:'+(p.bg_green  || p.green || "green ")+'}\
    .ansi_bg_yellow {background-color:'+(p.bg_yellow || p.yellow|| "yellow")+'}\
    .ansi_bg_blue   {background-color:'+(p.bg_blue   || p.blue  || "blue  ")+'}\
    .ansi_bg_purple {background-color:'+(p.bg_purple || p.purple|| "purple")+'}\
    .ansi_bg_cyan   {background-color:'+(p.bg_cyan   || p.cyan  || "cyan  ")+'}\
    .ansi_bg_white  {background-color:'+(p.bg_white  || p.white || "white ")+'}\
    ';

    str += '</style></head><body>' + EOL;
    return str;
};

var headerLocal = '<span class="ansi_console_snippet">';
var footerLocal = '</span>';
var footer = '</body></html>';

/**
 * Internal method which escapes HTML entities if requested, and converts shell escape codes
 * to HTML `<span class=...>` markers
 * @param {String} inputString
 * @param {Object} options
 * @return {String}
 */
function processString (inputString, options) {
    inputString = options.escapeHtml ? escapeHtml(inputString) : inputString;
    var str = ansispan2(inputString);
    while (true) {
        var openSpanCount = (str.match(/<span/g) || []).length;
        var closeSpanCount = (str.match(/<\/span/g) || []).length;
        if (openSpanCount >= closeSpanCount) {
            break;
        }
        // we may have some extra closing escape sequence that doesn't really close anything
        // especially on end of line but not only
        var underReplace = '<\/span>';
        var idx = str.lastIndexOf(underReplace);
        if (idx > -1) {
            str = str.substring(0, idx) + str.substring(idx + underReplace.length);
        }
    }
    return str;
}

/**
 * Helper to normalize config options
 * @param {Object} options, defaults to { standalone: true, escapeHtml: true, palette: defaultPalette }
 * @return {Object}
 */
function processOptions (options) {
    options = options || {};
    if (typeof options.escapeHtml === "undefined") {
        options.escapeHtml = true;
    }
    if (typeof options.wrapped === "undefined") {
        options.wrapped = options.standalone;
    }

    if (!options.standalone && options.palette) {
        console.error('[ansi2html] options.standalone == false; palette will be ignored');
    }
    return options;
}

/**
 * Convert the text from `inputStream` and output it to `outputStream`
 * @param {Object} options
 * @param {Stream} inputStream defaults to STDIN
 * @param {Stream} outputStream defaults to STDOUT
 */
function ansi2html_stream (options, inputStream, outputStream) {
    inputStream = inputStream || process.stdin;
    outputStream = outputStream || process.stdout;

    function write(str) { outputStream.write(str); }
    var input = readline.createInterface({
      input: inputStream,
      output: outputStream
    });

    if (typeof options.standalone === "undefined") {
        options.standalone = true;
    }
    /////////////////////////////////////////////

    options = processOptions(options);
    if (options.standalone) write(makeHeader(options.palette));
    if (options.wrapped)    write(headerLocal);
    input.on('line', function(line){
        write(processString(line, options) + EOL);
    });
    input.on('close', function() {
        if (options.wrapped)    write(footerLocal);
        if (options.standalone) write(footer);
    });
}

/**
 * Convert the text from `inputString` and return it
 * @param {Object} options
 * @return {String}
 */
function ansi2html_string (options, inputString) {
    if (arguments.length < 2) {
       // support a2h(inputString) format
       inputString = options;
       options = {};
    }

    var out = "";
    function write(str) { out += str; }

    if (typeof options.standalone === "undefined") {
        options.standalone = false;
    }
    /////////////////////////////////////////////

    options = processOptions(options);
    if (options.standalone) write(makeHeader(options.palette));
    if (options.wrapped)    write(headerLocal);
    write(processString(inputString, options));
    if (options.wrapped)    write(footerLocal);
    if (options.standalone) write(footer);

    return out;
}

module.exports = {
    fromStream: ansi2html_stream,
    fromString: ansi2html_string,
    ansispan2: ansispan2
};
