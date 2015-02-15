// fork of https://github.com/mmalecki/ansispan (MIT-licensed)
// the changes are:
// - one global regex pass instead of one-per-color
// - output appropriately named CSS classes (ansi_bg_* / ansi_fg_*)
//   instead of hardcoded inline CSS
// - output 'ansi_bold' and 'ansi_italic' CSS classes instead of `<b>` / `<i>`

var ansispan = function (str) {

    //
    // `\033[Xm` == `\033[0;Xm` sets foreground color to `X`.
    //
    str = str.replace(
      /(\033\[(\d+)(;\d+)?m)/gm,
      function(match, fullMatch, m1, m2) {
        var fgColor = m1;
        var bgColor = m2;

        var newStr = '<span class="';
        if (fgColor && ansispan.foregroundColors[fgColor]) {
            newStr += 'ansi_fg_' + ansispan.foregroundColors[fgColor];
        }
        if (bgColor) {
            bgColor = bgColor.substr(1); // remove leading ;
            if (ansispan.backgroundColors[bgColor]) {
                newStr += ' ansi_bg_' + ansispan.backgroundColors[bgColor];
            }
        }
        newStr += '">';
        return newStr;
      }
    );

  //
  // `\033[1m` enables bold font, `\033[22m` disables it
  //
  str = str.replace(/\033\[1m/g, '<span class="ansi_bold">').replace(/\033\[22m/g, '</span>');

  //
  // `\033[3m` enables italics font, `\033[23m` disables it
  //
  str = str.replace(/\033\[3m/g, '<span class="ansi_italic">').replace(/\033\[23m/g, '</span>');

  str = str.replace(/\033\[m/g, '</span>');
  str = str.replace(/\033\[0m/g, '</span>');
  return str.replace(/\033\[39m/g, '</span>');
};

ansispan.foregroundColors = {
  '30': 'black',
  '31': 'red',
  '32': 'green',
  '33': 'yellow',
  '34': 'blue',
  '35': 'purple',
  '36': 'cyan',
  '37': 'white'
};

ansispan.backgroundColors = {
  '40': 'black',
  '41': 'red',
  '42': 'green',
  '43': 'yellow',
  '44': 'blue',
  '45': 'purple',
  '46': 'cyan',
  '47': 'white'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ansispan;
}
