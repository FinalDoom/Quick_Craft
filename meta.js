exports = {
  namespace: 'https://gazellegames.net/',
  require: [
    'https://code.jquery.com/jquery-3.6.0.js',
    'https://raw.githubusercontent.com/FinalDoom/Quick_Craft/repair-equipped/recipe_info.js',
  ],
  match: ['https://gazellegames.net/user.php?action=crafting'],
  grant: ['GM.getValue', 'GM.setValue', 'GM.deleteValue'],
};
