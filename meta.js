exports.name = 'GGn Quick Crafter';
exports.namespace = 'https://gazellegames.net/';
exports.require = ['https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js'];
exports.match = ['https://gazellegames.net/user.php?action=crafting'];
exports.grant = ['GM.getValue', 'GM.setValue', 'GM.deleteValue'];
