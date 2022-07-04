exports.namespace = 'https://gazellegames.net/';
exports.require = [
  'https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js',
  'https://code.jquery.com/jquery-3.6.0.js',
  'https://raw.githubusercontent.com/FinalDoom/Quick_Craft/repair-equipped/recipe_info.js',
];
exports.match = ['https://gazellegames.net/user.php?action=crafting'];
exports.grant = ['GM.getValue', 'GM.setValue', 'GM.deleteValue'];
