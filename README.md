# ansi2html-extended
 [![Build Status](https://secure.travis-ci.org/jakub-g/ansi2html-extended.png?branch=master)](http://travis-ci.org/jakub-g/ansi2html-extended)

 [![Get it on npm](https://nodei.co/npm/ansi2html-extended.png?compact=true)](https://www.npmjs.org/package/ansi2html-extended)

**Note that this module is a work in progress. It may contain bugs and not work cross-platform.**

This module, written in JavaScript, is an extended fork of [https://github.com/mmalecki/ansispan](ansispan).
It converts an input string with ANSI escape codes (for colored console output etc.) into its
HTML equivalent. It can be used either as a nodejs module, or as a command-line utility.

Unlike original module, this module wraps text with `<span>`s with defined CSS classes,
instead of hardcoded inline CSS strings.

Apart from that, it allows to:

- output either standalone HTML file, or just an HTML chunk
- pre-process the text by escaping HTML special characters

Tested on Windows (Git Bash / MINGW).

It requires nodejs and npm. If you don't have node, grab it at [nodejs.org](https://nodejs.org).
Node installer bundles npm (node package manager).

Tested on nodejs 0.10.

## API

##### `a2h.fromStream(cfg, inputStream, outputStream)`

Read text from `inputStream` and write HTML to `outputStream`.

##### `a2h.fromStream(cfg)`

Read text from `stdin` and write HTML to `stdout`.

##### `a2h.fromString(string)`
##### `a2h.fromString(cfg, string)`

Read input text String `string` and return HTML as `String`


## Configuration

##### `cfg.standalone` Boolean (default: `true` when input is stream, `false` when input is string)

If `true`, output will be a valid HTML file, and it will contain color palette in the `<head>`,
as a `style` tag. Otherwise, only a HTML chunk will be generated.

##### `cfg.wrapped` Boolean (defaults to value of `cfg.standalone`)

Whether to wrap the passed string in `<span class="ansi_console_snippet"></span>`.

##### `cfg.escapeHtml` Boolean (default: `true`)

Whether HTML entities in input string should be escaped (`&` -> `&amp;` etc.).

##### `cfg.palette` Object (optional)

This allows you to override the default colors.

By default, it is assumed that console is `white` text on `black` background, and HTML
named colors are used for escape codes, i.e. ANSI 34 and 44 will use HTML `blue` color.

You can override each of the colors by passing any of the following keys:
`black`, `white`, `red`, `green`, `blue`, `yellow`, `purple`, `cyan`.

You can also override each of them *separately for foreground and background* using
`fg_black`, `bg_black` and so on.

You can override default colors of the console by either overriding `black` and `white`,
or directly via `bg` and `fg`.

Example:

```js
    palette: {
        bg: '#222222',
        fg: '#eeeeee',
        fg_red:'#ff0000',
        bg_red:'#dd0000',
        green: '#00cc3e'
    }
```

## Usage as a nodejs module

```sh
$ npm install --save-dev ansi2html-extended
```

```js
var a2h = require('ansi2html-extended');
var cfg = {
    standalone: true,
    palette: {
        black: '#222222',
        white: '#eeeeee'
    }
}

// read text from stdin and output HTML to stdout
a2h.fromStream(cfg);

// you can also just pass a string and get a string returned
a2h.fromString("[33mcommit d0fb3a8a5487559e8a2d76735f04b5a02b242838[m")
// returns `<span class="ansi_fg_yellow">commit d0fb3a8a5487559e8a2d76735f04b5a02b242838</span>`

// you can pass cfg as a first parameter too
a2h.fromString({
  wrapped: true
}, "[33mcommit d0fb3a8a5487559e8a2d76735f04b5a02b242838[m")
// returns `<span class="ansi_console_snippet"><span class="ansi_fg_yellow">commit d0fb3a8a5487559e8a2d76735f04b5a02b242838</span></span>`

```


## Usage from command line

```sh
# this will create two symlinks in PATH: `ansi2html` and `a2h`
$ npm install -g ansi2html-extended

# Ask git for colored summary of last commit, and pipe it to a2h
# This prints to stdout by default
# Note we explicitly ask for --color; git disables colors when piping
$ git show --stat --color | a2h

# It will be more interesting when we save it to a file...
$ git show --stat --color | a2h > examples/git-show-stat.html
$ firefox examples/git-show-stat.html
```

See the live rendered [`examples/git-show-stat.html`](https://rawgit.com/jakub-g/ansi2html-extended/master/examples/git-show-stat.html)

The following options are used when `a2h` is invoked from command line:

```js
{
    standalone: true,
    escapeHtml: true,
    palette: {
        black: '#222222',
        white: '#eeeeee',
        red:   '#dd0000',
        green: '#00cc3e',
        blue:  '#0099ff',
        yellow:'#eeee00',
        purple:'#bb00bb',
        cyan:  '#eeeeee'
    }
}
```

## License

MIT © [Jakub Gieryluk](http://jakub-g.github.io)
