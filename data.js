// Step 0: Copy paste API KEY and apiCall function from main script
// Step 1: Copy paste itemsApiCache and recipesApiCache
// Step 2: Define any new recipes in recipeDefinitions
// Step 3: Run getNewFullRecipeInfo()
// Step 3a: Fix any recipes noted by Recipe not found
// Step 3b: Rerun 2 if fixes were made
// Step 4: Copy "Recipes Api Cache" over recipesApiCache in this script
// Step 5: Run getSparseIngredientsAndRecipes()
// Step 6: Copy resulting Recipes into recipesApiCache
// Step 7: Run findItemProblems()
// Step 7a: Copy any from "Missing" into itemsApiCache
// Step 7b: Resolve any name discrepancies as desired and rerun
// Step 7c: Rerun from 4 if you made changes
// Step 8: ???
// Step 9: Profit

//
// #region Recipe definitions
//

// prettier-ignore
const recipeDefinitions = {
  Glass: [
    [
      {name: 'glass shards from sand', recipe: ['pile of sand', [4]], result: 'glass shards'},
      {name: 'glass shards from test tube', recipe: ['test tube', [4]], result: 'glass shards'},
      {name: 'glass shards from vial', recipe: ['vial', [4]], result: '2x glass shards'},
      {name: 'glass shards from bowl', recipe: ['bowl', [4]], result: '3x glass shards'},
    ],
    [
      {name: 'test tube', recipe: ['glass shards', [1, 4]]},
      {name: 'vial', recipe: ['glass shards', [1, 3, 4, 6, 7]]},
      {name: 'bowl', recipe: ['glass shards', [0, 1, 2, 3, 5, 6, 7, 8]]},
      {name: 'dust ore vial', recipe: ['pile of sand', [4], 'quartz dust', [7]], result: 'vial'},
      {name: 'dust ore bowl', recipe: ['pile of sand', [4], 'jade dust', [7]], result: 'bowl'},
    ],
  ],
  Potions: [
    [
      {name: 'upload potion sampler', recipe: ['test tube', [4], 'black elderberries', [5], 'black elder leaves', [2]]},
      {name: 'small upload potion', recipe: ['vial', [4], 'black elder leaves', [2, 8], 'black elderberries', [5]]},
      {name: 'upload potion', recipe: ['vial', [4], 'black elder leaves', [0, 2, 3, 6, 8], 'black elderberries', [5]]},
      {name: 'large upload potion', recipe: ['bowl', [4], 'upload potion', [3, 5], 'yellow hellebore flower', [1]]},
    ],
    [
      {name: 'download-reduction potion sampler', recipe: ['test tube', [4], 'garlic tincture', [5], 'purple angelica flowers', [2]]},
      {name: 'small download-reduction potion', recipe: ['vial', [4], 'purple angelica flowers', [2, 8], 'garlic tincture', [5]]},
      {name: 'download-reduction potion', recipe: ['vial', [4], 'purple angelica flowers', [0, 2, 3, 6, 8], 'garlic tincture', [5]]},
      {name: 'large download-reduction potion', recipe: ['bowl', [4], 'download-reduction potion', [3, 5], 'yellow hellebore flower', [1]]},
      {name: 'garlic tincture', recipe: ['test tube', [4], 'head of garlic', [5]]},
    ],
    [
      {name: 'small luck potion', recipe: ['vial', [3], 'black elderberries', [4, 5]]},
      {name: 'large luck potion', recipe: ['bowl', [4], 'black elderberries', [0, 1, 2, 3, 5], 'yellow hellebore flower', [7]]},
    ],
  ],
  Food: [
    [
      {name: 'ruby-grained baguette', recipe: ['ruby-flecked wheat', [4, 5]]},
      {name: 'garlic ruby-baguette', recipe: ['ruby-grained baguette', [4], 'head of garlic', [3, 5]]},
      {name: 'artisan ruby-baguette', recipe: ['garlic ruby-baguette', [3], 'yellow hellebore flower', [4, 5]]},
    ],
    [
      {name: 'emerald-grained baguette', recipe: ['emerald-flecked wheat', [4, 5]]},
      {name: 'garlic emerald-baguette', recipe: ['emerald-grained baguette', [4], 'head of garlic', [5]]},
      {name: 'artisan emerald-baguette', recipe: ['garlic emerald-baguette', [3], 'emerald chip', [4], 'yellow hellebore flower', [5]]},
      {name: 'gazellian emerald-baguette', recipe: ['artisan emerald-baguette', [3], 'emerald chip', [4, 5]]},
    ],
    [
      {name: 'cant believe this is cherry', recipe: ['milk', [0], 'pile of snow', [1], 'cherries', [2], 'glass shards', [6, 7, 8]]},
      {name: 'grape milkshake', recipe: ['milk', [0], 'pile of snow', [1], 'grapes', [2], 'glass shards', [6, 7, 8]]},
      {name: 'coco-cooler milkshake', recipe: ['milk', [0], 'pile of snow', [1], 'coconuts', [2], 'glass shards', [6, 7, 8]]},
      {name: 'cinnamon milkshake', recipe: ['milk', [0], 'pile of snow', [1], 'cinnamon', [2], 'glass shards', [6, 7, 8]]},
      {name: 'rocky road milkshake', recipe: ['milk', [0], 'pile of snow', [1], 'cocoa beans', [3], 'marshmallows', [4], 'glass shards', [6, 7, 8]]},
      {name: 'neapolitan milkshake', recipe: ['milk', [0], 'pile of snow', [1], 'cocoa beans', [3], 'vanilla pods', [4], 'strawberries', [5], 'glass shards', [6, 7, 8]]},
    ],
  ],
  Pets: [
    [
      {name: 'bronze dwarf', recipe: ['sand dwarf companion', [4], 'dwarven gem', [5]], result: 'bronze dwarf companion'},
      {name: 'quartz dwarf', recipe: ['sand dwarf companion', [4], 'dwarven gem', [6]], result: 'quartz dwarf companion'},
      {name: 'bronze to iron dwarf', recipe: ['bronze dwarf companion', [4], 'dwarven gem', [5]], result: 'iron dwarf companion'},
      {name: 'quartz to iron dwarf', recipe: ['quartz dwarf companion', [4], 'dwarven gem', [5]], result: 'iron dwarf companion'},
      {name: 'gold dwarf', recipe: ['iron dwarf companion', [4], 'dwarven gem', [5]], result: 'gold dwarf companion'},
      {name: 'jade dwarf', recipe: ['iron dwarf companion', [4], 'dwarven gem', [6]], result: 'jade dwarf companion'},
      {name: 'gold to mithril dwarf', recipe: ['gold dwarf companion', [4], 'dwarven gem', [5]], result: 'mithril dwarf companion'},
      {name: 'jade to mithril dwarf', recipe: ['jade dwarf companion', [4], 'dwarven gem', [5]], result: 'mithril dwarf companion'},
      {name: 'adamantium dwarf', recipe: ['mithril dwarf companion', [4], 'dwarven gem', [5]], result: 'adamantium dwarf companion'},
      {name: 'amethyst dwarf', recipe: ['mithril dwarf companion', [4], 'dwarven gem', [6]], result: 'amethyst dwarf companion'},
      {name: 'green slime', recipe: ['blue irc slime pet', [4, 5]], result: 'green irc slime pet'},
      {name: 'rainbow slime', recipe: ['blue irc slime pet', [0], 'green irc slime pet', [1], 'pile of sand', [7], 'ruby', [8]], result: 'rainbow irc slime pet'},
      {name: 'snowman', recipe: ['carrot', [0], 'old scarf & hat', [1], 'lump of clay', [2], 'snowball', [3], 'large snowball', [4, 7], 'pile of charcoal', [5, 8], 'bowl', [6]]},
      {name: 'young snowman', recipe: ['snowman cookie', [1, 3, 5, 7], 'snowman', [4]]},
      {name: 'frosty snowman', recipe: ['snowflake', [1, 3, 5, 7], 'young snowman', [4]]},
      {name: 'happy snowman', recipe: ['penguin snowglobe', [1, 3, 5, 7], 'owl snowglobe', [0, 2, 6, 8], 'frosty snowman', [4]]},
      {name: 'ghost billie', recipe: ['Lame Pumpkin Trio', [4], 'Interdimensional Portal', [6], 'Goal Pole', [8]]},
      {name: 'ghost billie (gold)', recipe: ['amethyst', [0], 'Lame Pumpkin Trio', [3], 'Christmas Cheer', [4], 'Supreme Gazelle', [5]]},
      {name: 'umaro', recipe: ['Christmas Cheer', [4], 'Interdimensional Portal', [6], 'Goal Pole', [8]]},
      {name: 'golden umaro', recipe: ['amethyst', [1], 'Lame Pumpkin Trio', [3], 'Christmas Cheer', [4], 'Supreme Gazelle', [5]]},
      {name: 'gazelle (pet)', recipe: ['Supreme Gazelle', [4], 'Interdimensional Portal', [6], 'Goal Pole', [8]], result: 'gazelle'},
      {name: '[Au]zelle', recipe: ['amethyst', [2], 'Lame Pumpkin Trio', [3], 'Christmas Cheer', [4], 'Supreme Gazelle', [5]]},
      {name: 'Red Dragon', recipe: ["Din's flame", [4], 'Who Eats Whom', [0], 'Baby Yoda With Gingerbread', [1], 'After Party', [2], 'Lame Pumpkin Trio', [6], 'Christmas Cheer', [7], 'Supreme Gazelle', [8]]},
      {name: 'Green Dragon', recipe: ["Farore's flame", [4], 'Who Eats Whom', [0], 'Baby Yoda With Gingerbread', [1], 'After Party', [2], 'Lame Pumpkin Trio', [6], 'Christmas Cheer', [7], 'Supreme Gazelle', [8]]},
      {name: 'Blue Dragon', recipe: ["Nayru's flame", [4], 'Who Eats Whom', [0], 'Baby Yoda With Gingerbread', [1], 'After Party', [2], 'Lame Pumpkin Trio', [6], 'Christmas Cheer', [7], 'Supreme Gazelle', [8]]},
      {name: 'Gold Dragon', recipe: ['golden egg', [4], 'Who Eats Whom', [0], 'Baby Yoda With Gingerbread', [1], 'After Party', [2], 'Lame Pumpkin Trio', [6], 'Christmas Cheer', [7], 'Supreme Gazelle', [8]]},
    ],
  ],
  'Material Bars': [
    [
      {name: 'impure bronze bar', recipe: ['bronze alloy mix', [0], 'lump of clay', [1]]},
      {name: 'bronze bar', recipe: ['bronze alloy mix', [0, 1]]},
      {name: 'iron bar', recipe: ['iron ore', [0, 1]], result: 'iron bar'},
      {name: 'steel bar', recipe: ['iron ore', [0, 1], 'lump of coal', [4]]},
      {name: 'steel bar from iron bar', recipe: ['iron bar', [1], 'lump of coal', [4]], result: 'steel bar'},
      {name: 'gold bar', recipe: ['gold ore', [0, 1]]},
      {name: 'mithril bar', recipe: ['mithril ore', [0, 1]]},
      {name: 'adamantium bar', recipe: ['adamantium ore', [0, 1]]},
      {name: 'quartz bar', recipe: ['quartz dust', [0, 1]]},
      {name: 'jade bar', recipe: ['jade dust', [0, 1]]},
      {name: 'amethyst bar', recipe: ['amethyst dust', [0, 1]]},
    ],
  ],
  Armor: [
    [
      {name: 'impure bronze cuirass', recipe: ['impure bronze bar', [1, 6]]},
      {name: 'bronze cuirass', recipe: ['bronze bar', [1, 6]]},
      {name: 'iron cuirass', recipe: ['iron bar', [1, 4, 6, 8]]},
      {name: 'steel cuirass', recipe: ['steel bar', [1, 4, 6, 8]]},
      {name: 'gold cuirass', recipe: ['gold bar', [1, 4, 6, 8]]},
      {name: 'mithril cuirass', recipe: ['mithril bar', [1, 4, 6, 7, 8]]},
      {name: 'adamantium cuirass', recipe: ['adamantium bar', [1, 4, 6, 7, 8]]},
    ],
    [
      {name: 'quartz chainmail', recipe: ['quartz bar', [1, 6]]},
      {name: 'jade chainmail', recipe: ['jade bar', [1, 4, 6, 8]]},
      {name: 'amethyst chainmail', recipe: ['amethyst bar', [1, 4, 6, 7, 8]]},
    ],
    [
      {name: 'impure bronze segmentata', recipe: ['impure bronze bar', [1], 'blacksmith tongs', [7]]},
      {name: 'bronze segmentata', recipe: ['bronze bar', [1], 'blacksmith tongs', [7]]},
      {name: 'iron segmentata', recipe: ['iron bar', [1, 4], 'blacksmith tongs', [7]]},
      {name: 'steel segmentata', recipe: ['steel bar', [1, 4], 'blacksmith tongs', [7]]},
      {name: 'gold segmentata', recipe: ['gold bar', [1, 4], 'blacksmith tongs', [7]]},
      {name: 'mithril segmentata', recipe: ['mithril bar', [1, 4], 'blacksmith tongs', [7]]},
      {name: 'adamantium segmentata', recipe: ['adamantium bar', [1, 4], 'blacksmith tongs', [7]]},
    ],
    [
      {name: 'quartz lamellar', recipe: ['quartz bar', [1], 'blacksmith tongs', [7]]},
      {name: 'jade lamellar', recipe: ['jade bar', [1, 4], 'blacksmith tongs', [7]]},
      {name: 'amethyst lamellar', recipe: ['amethyst bar', [1, 4], 'blacksmith tongs', [7]]},
    ],
    [
      {name: 'impure bronze segmentata to cuirass', recipe: ['impure bronze segmentata', [4], 'impure bronze bar', [3]], result: 'impure bronze cuirass'},
      {name: 'bronze segmentata to cuirass', recipe: ['bronze segmentata', [4], 'bronze bar', [3]], result: 'bronze cuirass'},
      {name: 'iron segmentata to cuirass', recipe: ['iron segmentata', [4], 'iron bar', [0, 3]], result: 'iron cuirass'},
      {name: 'steel segmentata to cuirass', recipe: ['steel segmentata', [4], 'steel bar', [0, 3]], result: 'steel cuirass'},
      {name: 'gold segmentata to cuirass', recipe: ['gold segmentata', [4], 'gold bar', [0, 3]], result: 'gold cuirass'},
      {name: 'mithril segmentata to cuirass', recipe: ['mithril segmentata', [4], 'mithril bar', [0, 3, 6]], result: 'mithril cuirass'},
      {name: 'adamantium segmentata to cuirass', recipe: ['adamantium segmentata', [4], 'adamantium bar', [0, 3, 6]], result: 'adamantium cuirass'},
    ],
    [
      {name: 'quartz lamellar to chainmail', recipe: ['quartz lamellar', [4], 'quartz bar', [3]], result: 'quartz chainmail'},
      {name: 'jade lamellar to chainmail', recipe: ['jade lamellar', [4], 'jade bar', [0, 3]], result: 'jade chainmail'},
      {name: 'amethyst lamellar to chainmail', recipe: ['amethyst lamellar', [4], 'amethyst bar', [0, 3, 6]], result: 'amethyst chainmail'},
    ],
    [
      {name: 'impure bronze armguards', recipe: ['impure bronze bar', [1], 'blacksmith tongs', [6, 8]]},
      {name: 'bronze armguards', recipe: ['bronze bar', [1], 'impure bronze armguards', [4], 'blacksmith tongs', [6, 8]]},
      {name: 'iron armguards', recipe: ['iron bar', [1], 'bronze armguards', [4], 'blacksmith tongs', [6, 8]]},
      {name: 'steel armguards', recipe: ['steel bar', [1], 'iron armguards', [4], 'blacksmith tongs', [6, 8]]},
      {name: 'gold armguards', recipe: ['gold bar', [1], 'steel armguards', [4], 'blacksmith tongs', [6, 8]]},
      {name: 'mithril armguards', recipe: ['mithril bar', [1], 'gold armguards', [4], 'blacksmith tongs', [6, 8]]},
      {name: 'adamantium armguards', recipe: ['adamantium bar', [1], 'mithril armguards', [4], 'blacksmith tongs', [6, 8]]},
    ],
    [
      {name: 'impure bronze power gloves', recipe: ['impure bronze bar', [1], 'blacksmith tongs', [5], 'ruby chip', [6]]},
      {name: 'bronze power gloves', recipe: ['bronze bar', [1], 'impure bronze power gloves', [4], 'blacksmith tongs', [5], 'ruby chip', [0, 6]]},
      {name: 'iron power gloves', recipe: ['iron bar', [1], 'bronze power gloves', [4], 'blacksmith tongs', [5], 'ruby chip', [0, 3, 6]]},
      {name: 'steel power gloves', recipe: ['steel bar', [1], 'iron power gloves', [4], 'blacksmith tongs', [5], 'ruby chip', [0, 3, 6, 7]]},
      {name: 'gold power gloves', recipe: ['gold bar', [1, 7], 'steel power gloves', [4], 'blacksmith tongs', [5], 'ruby', [0, 3, 6]]},
      {name: 'mithril power gloves', recipe: ['mithril bar', [1, 7], 'gold power gloves', [4], 'blacksmith tongs', [5], 'ruby', [0, 6]]},
      {name: 'adamantium power gloves', recipe: ['adamantium bar', [1, 7], 'mithril power gloves', [4], 'blacksmith tongs', [5], 'ruby', [0, 6]]},
    ],
    [
      {name: 'repair impure bronze cuirass', recipe: ['impure bronze cuirass', [4], 'impure bronze bar', [3]], result: 'impure bronze cuirass'},
      {name: 'repair bronze cuirass', recipe: ['bronze cuirass', [4], 'bronze bar', [3]], result: 'bronze cuirass'},
      {name: 'repair iron cuirass', recipe: ['iron cuirass', [4], 'iron bar', [0, 3]], result: 'iron cuirass'},
      {name: 'repair steel cuirass', recipe: ['steel cuirass', [4], 'steel bar', [0, 3]], result: 'steel cuirass'},
      {name: 'repair gold cuirass', recipe: ['gold cuirass', [4], 'gold bar', [0, 3]], result: 'gold cuirass'},
      {name: 'repair mithril cuirass', recipe: ['mithril cuirass', [4], 'mithril bar', [0, 3, 6]], result: 'mithril cuirass'},
      {name: 'repair adamantium cuirass', recipe: ['adamantium cuirass', [4], 'adamantium bar', [0, 3, 6]], result: 'adamantium cuirass'},
    ],
    [
      {name: 'repair quartz chainmail', recipe: ['quartz chainmail', [4], 'quartz bar', [3]], result: 'quartz chainmail'},
      {name: 'repair jade chainmail', recipe: ['jade chainmail', [4], 'jade bar', [0, 3]], result: 'jade chainmail'},
      {name: 'repair amethyst chainmail', recipe: ['amethyst chainmail', [4], 'amethyst bar', [0, 3, 6]], result: 'amethyst chainmail'},
    ],
    [
      {name: 'repair mithril armguards', recipe: ['mithril bar', [1], 'mithril armguards', [4]], result: 'mithril armguards'},
      {name: 'repair adamantium armguards', recipe: ['adamantium bar', [1], 'adamantium armguards', [4]], result: 'adamantium armguards'},
      {name: 'repair gold power gloves', recipe: ['ruby', [1], 'gold bar', [7], 'gold power gloves', [4]], result: 'gold power gloves'},
      {name: 'repair mithril power gloves', recipe: ['ruby', [1], 'mithril bar', [7], 'mithril power gloves', [4]], result: 'mithril power gloves'},
      {name: 'repair adamantium power gloves', recipe: ['ruby', [1], 'adamantium bar', [7], 'adamantium power gloves', [4]], result: 'adamantium power gloves'},
    ],
  ],
  Weapons: [
    [
      {name: 'impure bronze claymore', recipe: ['impure bronze bar', [0, 7]]},
      {name: 'bronze claymore', recipe: ['bronze bar', [0, 7]]},
      {name: 'iron claymore', recipe: ['iron bar', [0, 2, 4, 7]]},
      {name: 'steel claymore', recipe: ['steel bar', [0, 2, 4, 7]]},
      {name: 'gold claymore', recipe: ['gold bar', [0, 2, 4, 7]]},
      {name: 'mithril claymore', recipe: ['mithril bar', [0, 1, 2, 4, 7]]},
      {name: 'adamantium claymore', recipe: ['adamantium bar', [0, 1, 2, 4, 7]]},
    ],
    [
      {name: 'quartz khopesh', recipe: ['quartz bar', [0, 7]]},
      {name: 'jade khopesh', recipe: ['jade bar', [0, 2, 4, 7]]},
      {name: 'amethyst khopesh', recipe: ['amethyst bar', [0, 1, 2, 4, 7]]},
    ],
    [
      {name: 'impure bronze billhook', recipe: ['blacksmith tongs', [1], 'impure bronze bar', [7]]},
      {name: 'bronze billhook', recipe: ['blacksmith tongs', [1], 'bronze bar', [7]]},
      {name: 'iron billhook', recipe: ['blacksmith tongs', [1], 'iron bar', [4, 7]]},
      {name: 'steel billhook', recipe: ['blacksmith tongs', [1], 'steel bar', [4, 7]]},
      {name: 'gold billhook', recipe: ['blacksmith tongs', [1], 'gold bar', [4, 7]]},
      {name: 'mithril billhook', recipe: ['blacksmith tongs', [1], 'mithril bar', [4, 7]]},
      {name: 'adamantium billhook', recipe: ['blacksmith tongs', [1], 'adamantium bar', [4, 7]]},
    ],
    [
      {name: 'quartz guandao', recipe: ['blacksmith tongs', [1], 'quartz bar', [7]]},
      {name: 'jade guandao', recipe: ['blacksmith tongs', [1], 'jade bar', [4, 7]]},
      {name: 'amethyst guandao', recipe: ['blacksmith tongs', [1], 'amethyst bar', [4, 7]]},
    ],
    [
      {name: 'impure bronze billhook to claymore', recipe: ['impure bronze billhook', [4], 'impure bronze bar', [3]], result: 'impure bronze claymore'},
      {name: 'bronze billhook to claymore', recipe: ['bronze billhook', [4], 'bronze bar', [3]], result: 'bronze claymore'},
      {name: 'iron billhook to claymore', recipe: ['iron billhook', [4], 'iron bar', [0, 3]], result: 'iron claymore'},
      {name: 'steel billhook to claymore', recipe: ['steel billhook', [4], 'steel bar', [0, 3]], result: 'steel claymore'},
      {name: 'gold billhook to claymore', recipe: ['gold billhook', [4], 'gold bar', [0, 3]], result: 'gold claymore'},
      {name: 'mithril billhook to claymore', recipe: ['mithril billhook', [4], 'mithril bar', [0, 3, 6]], result: 'mithril claymore'},
      {name: 'adamantium billhook to claymore', recipe: ['adamantium billhook', [4], 'adamantium bar', [0, 3, 6]], result: 'adamantium claymore'},
    ],
    [
      {name: 'quartz guandao to khopesh', recipe: ['quartz guandao', [4], 'quartz bar', [3]], result: 'quartz khopesh'},
      {name: 'jade guandao to khopesh', recipe: ['jade guandao', [4], 'jade bar', [0, 3]], result: 'jade khopesh'},
      {name: 'amethyst guandao to khopesh', recipe: ['amethyst guandao', [4], 'amethyst bar', [0, 3, 6]], result: 'amethyst khopesh'},
    ],
    [
      {name: 'repair impure bronze claymore', recipe: ['impure bronze claymore', [4], 'impure bronze bar', [3]], result: 'impure bronze claymore'},
      {name: 'repair bronze claymore', recipe: ['bronze claymore', [4], 'bronze bar', [3]], result: 'bronze claymore'},
      {name: 'repair iron claymore', recipe: ['iron claymore', [4], 'iron bar', [0, 3]], result: 'iron claymore'},
      {name: 'repair steel claymore', recipe: ['steel claymore', [4], 'steel bar', [0, 3]], result: 'steel claymore'},
      {name: 'repair gold claymore', recipe: ['gold claymore', [4], 'gold bar', [0, 3]], result: 'gold claymore'},
      {name: 'repair mithril claymore', recipe: ['mithril claymore', [4], 'mithril bar', [0, 3, 6]], result: 'mithril claymore'},
      {name: 'repair adamantium claymore', recipe: ['adamantium claymore', [4], 'adamantium bar', [0, 3, 6]], result: 'adamantium claymore'},
    ],
    [
      {name: 'repair quartz khopesh', recipe: ['quartz khopesh', [4], 'quartz bar', [3]], result: 'quartz khopesh'},
      {name: 'repair jade khopesh', recipe: ['jade khopesh', [4], 'jade bar', [0, 3]], result: 'jade khopesh'},
      {name: 'repair amethyst khopesh', recipe: ['amethyst khopesh', [4], 'amethyst bar', [0, 3, 6]], result: 'amethyst khopesh'},
    ],
  ],
  Recasting: [
    // Melt
    [
      {name: 'impure bronze bar to ore', recipe: ['impure bronze bar', [4], 'flux', [3, 5]], result: 'bronze alloy mix'},
      {name: 'bronze bar to ore', recipe: ['bronze bar', [4], 'flux', [3, 5]], result: '2x bronze alloy mix'},
      {name: 'iron bar to ore', recipe: ['iron bar', [4], 'flux', [3, 5]], result: '2x iron ore'},
      {name: 'steel bar to ore', recipe: ['steel bar', [4], 'flux', [3, 5]], result: '2x iron ore'},
      {name: 'gold bar to ore', recipe: ['gold bar', [4], 'flux', [3, 5]], result: '2x gold ore'},
      {name: 'mithril bar to ore', recipe: ['mithril bar', [4], 'flux', [3, 5]], result: '2x mithril ore'},
      {name: 'adamantium bar to ore', recipe: ['adamantium bar', [4], 'flux', [3, 5]], result: '2x adamantium ore'},
    ],
    [
      {name: 'quartz bar to dust', recipe: ['quartz bar', [4], 'flux', [3, 5]], result: '2x quartz dust'},
      {name: 'jade bar to dust', recipe: ['jade bar', [4], 'flux', [3, 5]], result: '2x jade dust'},
      {name: 'amethyst bar to dust', recipe: ['amethyst bar', [4], 'flux', [3, 5]], result: '2x amethyst dust'},
      {name: 'downgrade bronze bar', recipe: ['bronze bar', [4], 'flux', [7], 'lump of clay', [3, 5]], result: '2x impure bronze bar'},
      {name: 'downgrade steel bar', recipe: ['steel bar', [4], 'flux', [7]], result: 'iron bar'},
      {name: 'melt dwarven gem', recipe: ['dwarven gem', [4], 'flux', [7]], result: 'pile of sand'},
    ],
    [
      {name: 'impure bronze cuirass to bar', recipe: ['flux', [6, 7, 8], 'impure bronze cuirass', [4]], result: 'impure bronze bar'},
      {name: 'bronze cuirass to bar', recipe: ['flux', [6, 7, 8], 'bronze cuirass', [4]], result: 'bronze bar'},
      {name: 'iron cuirass to bars', recipe: ['flux', [6, 7, 8], 'iron cuirass', [4]], result: 'iron bars x2'},
      {name: 'steel cuirass to bars', recipe: ['flux', [6, 7, 8], 'steel cuirass', [4]], result: 'steel bars x2'},
      {name: 'gold cuirass to bars', recipe: ['flux', [6, 7, 8], 'gold cuirass', [4]], result: 'gold bars x2'},
      {name: 'mithril cuirass to bars', recipe: ['flux', [6, 7, 8], 'mithril cuirass', [4]], result: 'mithril bars x2'},
      {name: 'adamantium cuirass to bars', recipe: ['flux', [6, 7, 8], 'adamantium cuirass', [4]], result: 'adamantium bars x2'},
    ],
    [
      {name: 'impure bronze claymore to bar', recipe: ['flux', [6, 7, 8], 'impure bronze claymore', [4]], result: 'impure bronze bar'},
      {name: 'bronze claymore to bar', recipe: ['flux', [6, 7, 8], 'bronze claymore', [4]], result: 'bronze bar'},
      {name: 'iron claymore to bars', recipe: ['flux', [6, 7, 8], 'iron claymore', [4]], result: 'iron bars x2'},
      {name: 'steel claymore to bars', recipe: ['flux', [6, 7, 8], 'steel claymore', [4]], result: 'steel bars x2'},
      {name: 'gold claymore to bars', recipe: ['flux', [6, 7, 8], 'gold claymore', [4]], result: 'gold bars x2'},
      {name: 'mithril claymore to bars', recipe: ['flux', [6, 7, 8], 'mithril claymore', [4]], result: 'mithril bars x2'},
      {name: 'adamantium claymore to bars', recipe: ['flux', [6, 7, 8], 'adamantium claymore', [4]], result: 'adamantium bars x2'},
    ],
    [
      {name: 'quartz chainmail to bar', recipe: ['flux', [6, 7, 8], 'quartz chainmail', [4]], result: 'quartz bar'},
      {name: 'jade chainmail to bars', recipe: ['flux', [6, 7, 8], 'jade chainmail', [4]], result: 'jade bars x2'},
      {name: 'amethyst chainmail to bars', recipe: ['flux', [6, 7, 8], 'amethyst chainmail', [4]], result: 'amethyst bars x2'},
      {name: 'quartz khopesh to bar', recipe: ['flux', [6, 7, 8], 'quartz khopesh', [4]], result: 'quartz bar'},
      {name: 'jade khopesh to bars', recipe: ['flux', [6, 7, 8], 'jade khopesh', [4]], result: 'jade bars x2'},
      {name: ' amethyst khopesh to bars', recipe: ['flux', [6, 7, 8], 'amethyst khopesh', [4]], result: 'amethyst bars x2'},
    ],
    // Upgrade Armor/Weapons
    [
      {name: 'impure bronze claymore to bronze', recipe: ['flux', [0, 2, 6, 8], 'bronze alloy mix', [3, 5], 'impure bronze claymore', [4]], result: 'bronze claymore'},
      {name: 'impure bronze cuirass to bronze', recipe: ['flux', [0, 2, 6, 8], 'bronze alloy mix', [3, 5], 'impure bronze cuirass', [4]], result: 'bronze cuirass'},
      {name: 'bronze claymore to iron', recipe: ['flux', [0, 2, 6, 8], 'iron bar', [3, 5, 7], 'bronze claymore', [4]], result: 'iron claymore'},
      {name: 'bronze cuirass to iron', recipe: ['flux', [0, 2, 6, 8], 'iron bar', [3, 5, 7], 'bronze cuirass', [4]], result: 'iron cuirass'},
      {name: 'iron claymore to steel', recipe: ['flux', [0, 2, 6, 8], 'lump of coal', [3, 5, 7], 'iron claymore', [4]], result: 'steel claymore'},
      {name: 'iron cuirass to steel', recipe: ['flux', [0, 2, 6, 8], 'lump of coal', [3, 5, 7], 'iron cuirass', [4]], result: 'steel cuirass'},
    ],
    [
      {name: 'steel claymore to gold', recipe: ['flux', [0, 2, 6, 8], 'gold bar', [3, 5, 7], 'steel claymore', [4]], result: 'gold claymore'},
      {name: 'steel cuirass to gold', recipe: ['flux', [0, 2, 6, 8], 'gold bar', [3, 5, 7], 'steel cuirass', [4]], result: 'gold cuirass'},
      {name: 'gold claymore to mithril', recipe: ['flux', [0, 2, 6, 8], 'mithril bar', [1, 3, 5, 7], 'gold claymore', [4]], result: 'mithril claymore'},
      {name: 'gold cuirass to mithril', recipe: ['flux', [0, 2, 6, 8], 'mithril bar', [1, 3, 5, 7], 'gold cuirass', [4]], result: 'mithril cuirass'},
      {name: 'mithril claymore to adamantium', recipe: ['flux', [0, 2, 6, 8], 'adamantium bar', [1, 3, 5, 7], 'mithril claymore', [4]], result: 'adamantium claymore'},
      {name: 'mithril cuirass to adamantium', recipe: ['flux', [0, 2, 6, 8], 'adamantium bar', [1, 3, 5, 7], 'mithril cuirass', [4]], result: 'adamantium cuirass'},
    ],
    [
      {name: 'quartz khopesh to jade', recipe: ['flux', [0, 2, 6, 8], 'jade bar', [3, 5, 7], 'quartz khopesh', [4]], result: 'jade khopesh'},
      {name: 'quartz chainmail to jade', recipe: ['flux', [0, 2, 6, 8], 'jade bar', [3, 5, 7], 'quartz chainmail', [4]], result: 'jade chainmail'},
      {name: 'jade khopesh to amethyst', recipe: ['flux', [0, 2, 6, 8], 'amethyst bar', [1, 3, 5, 7], 'jade khopesh', [4]], result: 'amethyst khopesh'},
      {name: 'jade chainmail to amethyst', recipe: ['flux', [0, 2, 6, 8], 'amethyst bar', [1, 3, 5, 7], 'jade chainmail', [4]], result: 'amethyst chainmail'},
    ],
    // Downgrade
    [
      {name: 'unpower quartz loop of aggression', recipe: ['flux', [1], 'empowered quartz loop of aggression', [4], 'blacksmith tongs', [7]], result: 'quartz loop of aggression'},
      {name: 'unpower quartz loop of fortune', recipe: ['flux', [1], 'empowered quartz loop of fortune', [4], 'blacksmith tongs', [7]], result: 'quartz loop of fortune'},
      {name: 'unpower quartz loop of luck', recipe: ['flux', [1], 'empowered quartz loop of luck', [4], 'blacksmith tongs', [7]], result: 'quartz loop of luck'},
      {name: 'unpower jade loop of aggression', recipe: ['flux', [1], 'empowered jade loop of aggression', [4], 'blacksmith tongs', [7]], result: 'jade loop of aggression'},
      {name: 'unpower jade loop of fortune', recipe: ['flux', [1], 'empowered jade loop of fortune', [4], 'blacksmith tongs', [7]], result: 'jade loop of fortune'},
      {name: 'unpower jade loop of luck', recipe: ['flux', [1], 'empowered jade loop of luck', [4], 'blacksmith tongs', [7]], result: 'jade loop of luck'},
      {name: 'unpower amethyst loop of aggression', recipe: ['flux', [1], 'empowered amethyst loop of aggression', [4], 'blacksmith tongs', [7]], result: 'amethyst loop of aggression'},
      {name: 'unpower amethyst loop of fortune', recipe: ['flux', [1], 'empowered amethyst loop of fortune', [4], 'blacksmith tongs', [7]], result: 'amethyst loop of fortune'},
      {name: 'unpower amethyst loop of luck', recipe: ['flux', [1], 'empowered amethyst loop of luck', [4], 'blacksmith tongs', [7]], result: 'amethyst loop of luck'},
    ],
    [
      {name: 'unpower quartz prism of aggression', recipe: ['flux', [1], 'empowered quartz prism of aggression', [4], 'blacksmith tongs', [7]], result: 'quartz prism of aggression'},
      {name: 'unpower quartz prism of fortune', recipe: ['flux', [1], 'empowered quartz prism of fortune', [4], 'blacksmith tongs', [7]], result: 'quartz prism of fortune'},
      {name: 'unpower quartz prism of luck', recipe: ['flux', [1], 'empowered quartz prism of luck', [4], 'blacksmith tongs', [7]], result: 'quartz prism of luck'},
      {name: 'unpower jade trifocal of aggression', recipe: ['flux', [1], 'empowered jade trifocal of aggression', [4], 'blacksmith tongs', [7]], result: 'jade trifocal of aggression'},
      {name: 'unpower jade trifocal of fortune', recipe: ['flux', [1], 'empowered jade trifocal of fortune', [4], 'blacksmith tongs', [7]], result: 'jade trifocal of fortune'},
      {name: 'unpower jade trifocal of luck', recipe: ['flux', [1], 'empowered jade trifocal of luck', [4], 'blacksmith tongs', [7]], result: 'jade trifocal of luck'},
      {name: 'unpower amethyst totality of aggression', recipe: ['flux', [1], 'empowered amethyst totality of aggression', [4], 'blacksmith tongs', [7]], result: 'amethyst totality of aggression'},
      {name: 'unpower amethyst totality of fortune', recipe: ['flux', [1], 'empowered amethyst totality of fortune', [4], 'blacksmith tongs', [7]], result: 'amethyst totality of fortune'},
      {name: 'unpower amethyst totality of luck', recipe: ['flux', [1], 'empowered amethyst totality of luck', [4], 'blacksmith tongs', [7]], result: 'amethyst totality of luck'},
    ],
    [
      {name: 'impure bronze cuirass to segmentata', recipe: ['flux', [1], 'impure bronze cuirass', [4], 'blacksmith tongs', [7]], result: 'impure bronze segmentata'},
      {name: 'bronze cuirass to segmentata', recipe: ['flux', [1], 'bronze cuirass', [4], 'blacksmith tongs', [7]], result: 'bronze segmentata'},
      {name: 'iron cuirass to segmentata', recipe: ['flux', [1], 'iron cuirass', [4], 'blacksmith tongs', [7]], result: 'iron segmentata'},
      {name: 'steel cuirass to segmentata', recipe: ['flux', [1], 'steel cuirass', [4], 'blacksmith tongs', [7]], result: 'steel segmentata'},
      {name: 'gold cuirass to segmentata', recipe: ['flux', [1], 'gold cuirass', [4], 'blacksmith tongs', [7]], result: 'gold segmentata'},
      {name: 'mithril cuirass to segmentata', recipe: ['flux', [1], 'mithril cuirass', [4], 'blacksmith tongs', [7]], result: 'mithril segmentata'},
      {name: 'adamantium cuirass to segmentata', recipe: ['flux', [1], 'adamantium cuirass', [4], 'blacksmith tongs', [7]], result: 'adamantium segmentata'},
    ],
    [
      {name: 'impure bronze claymore to billhook', recipe: ['flux', [1], 'impure bronze claymore', [4], 'blacksmith tongs', [7]], result: 'impure bronze billhook'},
      {name: 'bronze claymore to billhook', recipe: ['flux', [1], 'bronze claymore', [4], 'blacksmith tongs', [7]], result: 'bronze billhook'},
      {name: 'iron claymore to billhook', recipe: ['flux', [1], 'iron claymore', [4], 'blacksmith tongs', [7]], result: 'iron billhook'},
      {name: 'steel claymore to billhook', recipe: ['flux', [1], 'steel claymore', [4], 'blacksmith tongs', [7]], result: 'steel billhook'},
      {name: 'gold claymore to billhook', recipe: ['flux', [1], 'gold claymore', [4], 'blacksmith tongs', [7]], result: 'gold billhook'},
      {name: 'mithril claymore to billhook', recipe: ['flux', [1], 'mithril claymore', [4], 'blacksmith tongs', [7]], result: 'mithril billhook'},
      {name: 'adamantium claymore to billhook', recipe: ['flux', [1], 'adamantium claymore', [4], 'blacksmith tongs', [7]], result: 'adamantium billhook'},
    ],
    [
      {name: 'quartz chainmail to lamellar', recipe: ['flux', [1], 'quartz chainmail', [4], 'blacksmith tongs', [7]], result: 'quartz lamellar'},
      {name: 'jade chainmail to lamellar', recipe: ['flux', [1], 'jade chainmail', [4], 'blacksmith tongs', [7]], result: 'jade lamellar'},
      {name: 'amethyst chainmail to lamellar', recipe: ['flux', [1], 'amethyst chainmail', [4], 'blacksmith tongs', [7]], result: 'amethyst lamellar'},
      {name: 'quartz khopesh to guandao', recipe: ['flux', [1], 'quartz khopesh', [4], 'blacksmith tongs', [7]], result: 'quartz guandao'},
      {name: 'jade khopesh to guandao', recipe: ['flux', [1], 'jade khopesh', [4], 'blacksmith tongs', [7]], result: 'jade guandao'},
      {name: 'amethyst khopesh to guandao', recipe: ['flux', [1], 'amethyst khopesh', [4], 'blacksmith tongs', [7]], result: 'amethyst guandao'},
      {name: 'mithril armguards to gold', recipe: ['mithril armguards', [4], 'flux', [7]], result: 'gold armguards'},
      {name: 'adamantium armguards to gold', recipe: ['adamantium armguards', [4], 'flux', [7]], result: 'gold armguards'},
    ],
  ],
  Jewelry: [
    [
      {name: 'carbon-crystalline quartz', recipe: ['quartz bar', [4], 'lump of coal', [5]]},
      {name: 'carbon-crystalline quartz necklace', recipe: ['carbon-crystalline quartz', [4], 'glass shards', [1]]},
      {name: 'exquisite constellation of emeralds', recipe: ['emerald', [3, 5, 6, 8], 'amethyst bar', [4, 7]]},
      {name: 'exquisite constellation of sapphires', recipe: ['sapphire', [3, 5, 6, 8], 'amethyst bar', [4, 7]]},
      {name: 'exquisite constellation of rubies', recipe: ['ruby', [3, 5, 6, 8], 'amethyst bar', [4, 7]]},
    ],
    [
      {name: 'quartz prism of aggression', recipe: ['emerald chip', [0, 2, 3, 5, 6, 8], 'quartz bar', [1], 'impure bronze bar', [7], 'carbon-crystalline quartz necklace', [4]]},
      {name: 'quartz prism of fortune', recipe: ['ruby chip', [0, 2, 3, 5, 6, 8], 'quartz bar', [1], 'impure bronze bar', [7], 'carbon-crystalline quartz necklace', [4]]},
      {name: 'quartz prism of luck', recipe: ['sapphire chip', [0, 2, 3, 5, 6, 8], 'quartz bar', [1], 'impure bronze bar', [7], 'carbon-crystalline quartz necklace', [4]]},
      {name: 'quartz loop of aggression', recipe: ['emerald chip', [1], 'silver ring of gazellia', [4], 'quartz bar', [7]]},
      {name: 'quartz loop of fortune', recipe: ['ruby chip', [1], 'silver ring of gazellia', [4], 'quartz bar', [7]]},
      {name: 'quartz loop of luck', recipe: ['sapphire chip', [1], 'silver ring of gazellia', [4], 'quartz bar', [7]]},
    ],
    [
      {name: 'jade trifocal of aggression', recipe: ['jade bar', [0, 1, 2], 'emerald', [3, 5], 'bronze bar', [7], 'carbon-crystalline quartz necklace', [4]]},
      {name: 'jade trifocal of fortune', recipe: ['jade bar', [0, 1, 2], 'ruby', [3, 5], 'bronze bar', [7], 'carbon-crystalline quartz necklace', [4]]},
      {name: 'jade trifocal of luck', recipe: ['jade bar', [0, 1, 2], 'sapphire', [3, 5], 'bronze bar', [7], 'carbon-crystalline quartz necklace', [4]]},
      {name: 'jade loop of aggression', recipe: ['emerald', [1], 'silver ring of gazellia', [4], 'jade bar', [3, 5]]},
      {name: 'jade loop of fortune', recipe: ['ruby', [1], 'silver ring of gazellia', [4], 'jade bar', [3, 5]]},
      {name: 'jade loop of luck', recipe: ['sapphire', [1], 'silver ring of gazellia', [4], 'jade bar', [3, 5]]},
    ],
    [
      {name: 'amethyst totality of aggression', recipe: ['amethyst bar', [0, 1, 2], 'emerald', [3, 5], 'gold bar', [7], 'carbon-crystalline quartz necklace', [4], 'exquisite constellation of emeralds', [6]]},
      {name: 'amethyst totality of fortune', recipe: ['amethyst bar', [0, 1, 2], 'ruby', [3, 5], 'gold bar', [7], 'carbon-crystalline quartz necklace', [4], 'exquisite constellation of rubies', [6]]},
      {name: 'amethyst totality of luck', recipe: ['amethyst bar', [0, 1, 2], 'sapphire', [3, 5], 'gold bar', [7], 'carbon-crystalline quartz necklace', [4], 'exquisite constellation of sapphires', [6]]},
      {name: 'amethyst loop of aggression', recipe: ['emerald', [0, 1, 2], 'silver ring of gazellia', [4], 'amethyst bar', [3, 5, 7]]},
      {name: 'amethyst loop of fortune', recipe: ['ruby', [0, 1, 2], 'silver ring of gazellia', [4], 'amethyst bar', [3, 5, 7]]},
      {name: 'amethyst loop of luck', recipe: ['sapphire', [0, 1, 2], 'silver ring of gazellia', [4], 'amethyst bar', [3, 5, 7]]},
    ],
    [
      {name: 'empowered quartz loop of aggression', recipe: ['quartz loop of aggression', [4], 'quartz bar', [7]]},
      {name: 'empowered quartz loop of fortune', recipe: ['quartz loop of fortune', [4], 'quartz bar', [7]]},
      {name: 'empowered quartz loop of luck', recipe: ['quartz loop of luck', [4], 'quartz bar', [7]]},
      {name: 'empowered jade loop of aggression', recipe: ['jade loop of aggression', [4], 'jade bar', [1, 7]]},
      {name: 'empowered jade loop of fortune', recipe: ['jade loop of fortune', [4], 'jade bar', [1, 7]]},
      {name: 'empowered jade loop of luck', recipe: ['jade loop of luck', [4], 'jade bar', [1, 7]]},
      {name: 'empowered amethyst loop of aggression', recipe: ['amethyst loop of aggression', [4], 'amethyst bar', [1, 5, 7]]},
      {name: 'empowered amethyst loop of fortune', recipe: ['amethyst loop of fortune', [4], 'amethyst bar', [1, 5, 7]]},
      {name: 'empowered amethyst loop of luck', recipe: ['amethyst loop of luck', [4], 'amethyst bar', [1, 5, 7]]},
    ],
    [
      {name: 'empowered quartz prism of aggression', recipe: ['quartz prism of aggression', [4], 'quartz bar', [3, 5]]},
      {name: 'empowered quartz prism of fortune', recipe: ['quartz prism of fortune', [4], 'quartz bar', [3, 5]]},
      {name: 'empowered quartz prism of luck', recipe: ['quartz prism of luck', [4], 'quartz bar', [3, 5]]},
      {name: 'empowered jade trifocal of aggression', recipe: ['jade trifocal of aggression', [4], 'jade bar', [1, 3, 5]]},
      {name: 'empowered jade trifocal of fortune', recipe: ['jade trifocal of fortune', [4], 'jade bar', [1, 3, 5]]},
      {name: 'empowered jade trifocal of luck', recipe: ['jade trifocal of luck', [4], 'jade bar', [1, 3, 5]]},
      {name: 'empowered amethyst totality of aggression', recipe: ['amethyst totality of aggression', [4], 'amethyst bar', [0, 1, 2, 3, 5]]},
      {name: 'empowered amethyst totality of fortune', recipe: ['amethyst totality of fortune', [4], 'amethyst bar', [0, 1, 2, 3, 5]]},
      {name: 'empowered amethyst totality of luck', recipe: ['amethyst totality of luck', [4], 'amethyst bar', [0, 1, 2, 3, 5]]},
    ],
    [
      {name: 'repair quartz loop of aggression', recipe: ['empowered quartz loop of aggression', [4], 'quartz bar', [7]]},
      {name: 'repair quartz loop of fortune', recipe: ['empowered quartz loop of fortune', [4], 'quartz bar', [7]]},
      {name: 'repair quartz loop of luck', recipe: ['empowered quartz loop of luck', [4], 'quartz bar', [7]]},
      {name: 'repair jade loop of aggression', recipe: ['empowered jade loop of aggression', [4], 'jade bar', [1, 7]]},
      {name: 'repair jade loop of fortune', recipe: ['empowered jade loop of fortune', [4], 'jade bar', [1, 7]]},
      {name: 'repair jade loop of luck', recipe: ['empowered jade loop of luck', [4], 'jade bar', [1, 7]]},
      {name: 'repair amethyst loop of aggression', recipe: ['empowered amethyst loop of aggression', [4], 'amethyst bar', [1, 5, 7]]},
      {name: 'repair amethyst loop of fortune', recipe: ['empowered amethyst loop of fortune', [4], 'amethyst bar', [1, 5, 7]]},
      {name: 'repair amethyst loop of luck', recipe: ['empowered amethyst loop of luck', [4], 'amethyst bar', [1, 5, 7]]},
    ],
    [
      {name: 'repair quartz prism of aggression', recipe: ['empowered quartz prism of aggression', [4], 'quartz bar', [3, 5]]},
      {name: 'repair quartz prism of fortune', recipe: ['empowered quartz prism of fortune', [4], 'quartz bar', [3, 5]]},
      {name: 'repair quartz prism of luck', recipe: ['empowered quartz prism of luck', [4], 'quartz bar', [3, 5]]},
      {name: 'repair jade trifocal of aggression', recipe: ['empowered jade trifocal of aggression', [4], 'jade bar', [1, 3, 5]]},
      {name: 'repair jade trifocal of fortune', recipe: ['empowered jade trifocal of fortune', [4], 'jade bar', [1, 3, 5]]},
      {name: 'repair jade trifocal of luck', recipe: ['empowered jade trifocal of luck', [4], 'jade bar', [1, 3, 5]]},
      {name: 'repair amethyst totality of aggression', recipe: ['empowered amethyst totality of aggression', [4], 'amethyst bar', [0, 1, 2, 3, 5]]},
      {name: 'repair amethyst totality of fortune', recipe: ['empowered amethyst totality of fortune', [4], 'amethyst bar', [0, 1, 2, 3, 5]]},
      {name: 'repair amethyst totality of luck', recipe: ['empowered amethyst totality of luck', [4], 'amethyst bar', [0, 1, 2, 3, 5]]},
    ],
  ],
  'Trading Decks': [
    [
      {name: 'The Golden Throne', recipe: ['A Wild Artifaxx', [3], 'A Red Hot Flamed', [4], 'The Golden Daedy', [5]]},
      {name: 'The Biggest Banhammer', recipe: ["Stump's Banhammer", [3], 'thewhales Kiss', [4], 'Neos Ratio Cheats', [5]]},
      {name: 'The Staff Beauty Parlor', recipe: ['Alpaca Out of Nowhere!', [3], 'Nikos Transformation', [4], 'lepik le prick', [5]]},
      {name: 'random lvl2 staff card', recipe: ['LinkinsRepeater Bone Hard Card', [3], "MuffledSilence's Headphones", [4], 'Ze do Caixao Coffin Joe Card', [5]]},
      {name: 'The Realm of Staff', recipe: ['The Golden Throne', [3], 'The Biggest Banhammer', [4], 'The Staff Beauty Parlor', [5]]},
    ],
    [
      {name: 'Portal Gun', recipe: ['Cake', [3], 'GLaDOS', [4], 'Companion Cube', [5]], result: 'Portal Gun'},
      {name: 'Space Wormhole', recipe: ['Nyx class Supercarrier', [3], 'Covetor Mining Ship', [4], 'Chimera Schematic', [5]], result: 'Space Wormhole'},
      {name: 'Ricks Portal Gun', recipe: ['Rick Sanchez', [3], 'A Scared Morty', [4], 'Mr Poopy Butthole', [5]], result: 'Ricks Portal Gun'},
      {name: 'Interdimensional Portal', recipe: ['Portal Gun', [3], 'Space Wormhole', [4], 'Ricks Portal Gun', [5]], result: 'Interdimensional Portal'},
    ],
    [
      {name: 'Super Mushroom', recipe: ['Mario', [3], 'Princess Peach', [4], 'Toad', [5]], result: 'Super Mushroom'},
      {name: 'Fire Flower', recipe: ['Luigi', [3], 'Koopa Troopa', [4], 'Yoshi', [5]], result: 'Fire Flower'},
      {name: 'Penguin Suit', recipe: ['Bowser', [3], 'Goomba', [4], 'Wario', [5]], result: 'Penguin Suit'},
      {name: 'Goal Pole', recipe: ['Super Mushroom', [3], 'Fire Flower', [4], 'Penguin Suit', [5]], result: 'Goal Pole'},
    ],
    [
      {name: 'Random Lootbox', recipe: ['The Realm of Staff', [0], 'Goal Pole', [4], 'Interdimensional Portal', [6]]},
      {name: 'Dins Lootbox', recipe: ['The Realm of Staff', [0, 6], 'Goal Pole', [4]]},
      {name: 'Farores Lootbox', recipe: ['Goal Pole', [0, 6], 'The Realm of Staff', [4]]},
      {name: 'Nayrus Lootbox', recipe: ['Interdimensional Portal', [0, 6], 'The Realm of Staff', [4]]},
    ],
  ],
  'Xmas Crafting': [
    [
      {name: 'Dirt 5', recipe: ['Cyberpunk 2077', [4], 'Watch Dogs Legion', [5]]},
      {name: 'Gazelle', recipe: ['Genshin Impact', [4], 'Animal Crossing', [5]]},
      {name: 'Mafia', recipe: ['Dirt 5', [4], 'Gazelle', [5]]},
      {name: 'Christmas Bauble Badge', recipe: ['Broken Bauble Fragment', [1, 2, 4, 5]]},
      {name: 'Christmas Impostor Bauble', recipe: ['Red Crewmate Bauble', [3], 'Green Crewmate Bauble', [4], 'Cyan Crewmate Bauble', [5]]},
      // TODO Missing imposter bauble badge.. from above w/ chance?
      {name: 'lucky four-leaves holly', recipe: ['Wilted Four-Leaves Holly', [4], 'black elderberries', [2, 5, 8]]},
    ],
    [
      {name: 'snowball', recipe: ['pile of snow', [4, 7]]},
      {name: 'large snowball', recipe: ['pile of snow', [1, 3, 5, 7], 'snowball', [4]]},
      {name: 'hot chocolate', recipe: ['christmas spices', [1], 'snowball', [4], 'bowl', [7]]},
      {name: 'peppermint hot chocolate', recipe: ['candy cane', [1], 'hot chocolate', [4]]},
      {name: 'hyper realistic eggnog', recipe: ['christmas spices', [7], 'snowball', [4], 'bowl', [1]]},
      {name: 'pile of charcoal', recipe: ['lump of coal', [1, 3, 4, 5]]},
    ],
    [
      {name: 'Abominable Santa', recipe: ['Perfect Snowball', [4], 'Santa Suit', [5]]},
      {name: 'Icy Kisses', recipe: ['Perfect Snowball', [4], 'Mistletoe', [5]]},
      {name: 'Sexy Santa', recipe: ['Santa Suit', [4], 'Mistletoe', [5]]},
      {name: 'Christmas Cheer', recipe: ['Abominable Santa', [3], 'Icy Kisses', [4], 'Sexy Santa', [5]]},
      {name: 'Gingerbread Doomslayer', recipe: ['Gingerbread Kitana', [4], 'Gingerbread Marston', [5]]},
      {name: 'Mario Christmas', recipe: ['Millenium Falcon Gingerbread', [4], 'Gingerbread AT Walker', [5]]},
      {name: 'Baby Yoda With Gingerbread', recipe: ['Gingerbread Doomslayer', [4], 'Mario Christmas', [5]]},
    ],
    [
      {name: 'Grievous', recipe: ['Santa Claus Is Out There', [3], 'Back to the Future', [4], 'Gremlins', [5]]},
      {name: 'Mando', recipe: ['Picard', [0], 'Braveheart', [1], 'Indy', [2]]},
      {name: 'Doomguy', recipe: ['Big Lebowski', [6], 'Die Hard', [7], 'Jurassic Park', [8]]},
      {name: 'Have a Breathtaking Christmas', recipe: ['Grievous', [1], 'Mando', [4], 'Doomguy', [7]]},
    ],
  ],
  Birthday: [
    [
      {name: 'Future Gazelle', recipe: ['Ripped Gazelle', [3], 'Gamer Gazelle', [4]]},
      {name: 'Alien Gazelle', recipe: ['Ripped Gazelle', [3], 'Fancy Gazelle', [4]]},
      {name: 'Lucky Gazelle', recipe: ['Fancy Gazelle', [4], 'Gamer Gazelle', [5]]},
      {name: 'Supreme Gazelle', recipe: ['Future Gazelle', [3], 'Alien Gazelle', [4], 'Lucky Gazelle', [5]]},
      {name: 'birthday licks badge - 9th', recipe: ['lick badge bits', [3, 4, 5, 6, 7, 8]]},
    ],
    [
      {name: 'A Fair Fight', recipe: ['Exodus Truce', [4], 'Gazelle Breaking Bad', [5]]},
      {name: 'What an Adventure', recipe: ['Home Sweet Home', [4], 'Birthday Battle Kart', [5]]},
      {name: 'After Party', recipe: ['A Fair Fight', [4], 'What an Adventure', [5]]},
      {name: 'birthday gazelle badge - 10th', recipe: ['birthday leaves 10th', [0, 2, 3, 5, 6, 8]]},
    ],
    [
      {name: 'Dr Mario', recipe: ['Bill Rizer', [3], 'Donkey Kong', [4], 'Duck Hunt Dog', [5]]},
      {name: 'Link', recipe: ['Pit', [3], 'Little Mac', [4], 'Mega Man', [5]]},
      {name: 'Kirby', recipe: ['Pac-Man', [3], 'Samus Aran', [4], 'Simon Belmont', [5]]},
      {name: 'Black Mage', recipe: ['Dr Mario', [0], 'Link', [4], 'Kirby', [8]]},
      {name: 'birthday gazelle badge - 11th', recipe: ['party pipe badge bit', [0, 4, 5, 8]]},
      {name: '12th birthday badge', recipe: ['slice of birthday cake', [0, 2, 4, 6, 8]]},
    ],
  ],
  Valentines: [
    [
      {name: 'Kirlia and Meloetta', recipe: ['Sonic and Amy', [3], 'Valentine sugar heart', [4], 'Yoshi and Birdo', [5]]},
      {name: 'Dom and Maria', recipe: ['Aerith and Cloud', [3], 'Valentine sugar heart', [4], 'Master Chief and Cortana', [5]]},
      {name: 'Mr and Mrs Pac Man', recipe: ['Kirlia and Meloetta', [3], 'Valentine sugar heart', [4], 'Dom and Maria', [5]]},
      {name: 'Angelise Reiter', recipe: ['Chainsaw Chess', [3], 'Valentine chocolate heart', [4], 'Chainsaw Wizard', [5]]},
      {name: 'Sophitia', recipe: ['Ivy Valentine', [3], 'Valentine chocolate heart', [4], 'Jill Valentine', [5]]},
      {name: 'Yennefer', recipe: ['Angelise Reiter', [3], 'Valentine chocolate heart', [4], 'Sophitia', [5]]},
    ],
    [
      {name: 'vegetal symbol', recipe: ['Valentine rose', [1, 3, 5, 7]], result: 'Symbol of love'},
      {name: 'mineral symbol', recipe: ['ruby', [0, 2, 6, 8]], result: 'Symbol of love'},
      {name: 'Cupids magical feather', recipe: ['quartz bar', [0, 2], 'jade bar', [1], 'gold ore', [4], 'amethyst dust', [7]]},
      {name: 'Valentine 2022 Badge', recipe: ['rose petals', [0, 2, 4, 6, 8]]},
      {name: 'special box', recipe: ['Mr and Mrs Pac Man', [0], 'Black Mage', [2], 'Yennefer', [6], 'King Boo', [8]]},
    ],
    // Cupid's Winged Boots
    [
      {name: 'Cupids winged boots', recipe: ['Symbol of love', [1], 'Old worn boots', [4], 'Cupids magical feather', [6, 8]]},
      {name: "cupid's winged boots of aggression", recipe: ['emerald chip', [1], 'Cupids winged boots', [4], 'Cupids magical feather', [7]]},
      {name: "cupid's winged boots of fortune", recipe: ['ruby chip', [1], 'Cupids winged boots', [4], 'Cupids magical feather', [7]]},
      {name: "cupid's winged boots of luck", recipe: ['sapphire chip', [1], 'Cupids winged boots', [4], 'Cupids magical feather', [7]]},
    ],
    [
      {name: "downgrade cupid's winged boots of aggression", recipe: ['flux', [1, 3, 5, 7], "cupid's winged boots of aggression", [4]], result: 'Cupids winged boots'},
      {name: "downgrade cupid's winged boots of fortune", recipe: ['flux', [1, 3, 5, 7], "cupid's winged boots of fortune", [4]], result: 'Cupids winged boots'},
      {name: "downgrade cupid's winged boots of luck", recipe: ['flux', [1, 3, 5, 7], "cupid's winged boots of luck", [4]], result: 'Cupids winged boots'},
    ],
    // Cupid's Wings
    [
      {name: "cupid's gold wings", recipe: ['sapphire', [0, 2], 'gold bar', [6, 8], "cupid's wings", [4]]},
      {name: "cupid's mithril wings", recipe: ['sapphire', [0, 1, 2], 'mithril bar', [6, 7, 8], "cupid's gold wings", [4]]},
      {name: "cupid's adamantium wings", recipe: ['sapphire', [0, 1, 2, 3], 'adamantium bar', [5, 6, 7, 8], "cupid's mithril wings", [4]]},
      {name: "repair cupid's wings", recipe: ['sapphire', [1], "cupid's wings", [4]], result: "cupid's wings"},
      {name: "repair cupid's gold wings", recipe: ['sapphire', [1], 'gold bar', [7], "cupid's gold wings", [4]], result: "cupid's gold wings"},
      {name: "repair cupid's mithril wings", recipe: ['sapphire', [0, 2], 'mithril bar', [7], "cupid's mithril wings", [4]], result: "cupid's mithril wings"},
      {name: "repair cupid's adamantium wings", recipe: ['sapphire', [0, 1, 2], 'adamantium bar', [7], "cupid's adamantium wings", [4]], result: "cupid's adamantium wings"},
    ],
    [
      {name: 'disassembled gold wings', recipe: ['flux', [1], 'blacksmith tongs', [7], "cupid's gold wings", [4]]},
      {name: 'disassembled mithril wings', recipe: ['flux', [0, 2], 'blacksmith tongs', [6, 8], "cupid's mithril wings", [4]]},
      {name: 'disassembled adamantium wings', recipe: ['flux', [0, 1, 2], 'blacksmith tongs', [6, 7, 8], "cupid's adamantium wings", [4]]},
      {name: 'cupids cradle', recipe: ['gods cradle', [4], 'cupids tiara', [5]]},
      {name: "disassembled cupid's cradle", recipe: ['flux', [0, 1, 2, 3], 'blacksmith tongs', [5, 6, 7, 8], 'cupids cradle', [4]]},
    ],
  ],
  Halloween: [
    [
      {name: 'Stormrage Pumpkin', recipe: ['Rotting Pumpkin', [4], 'Carved Pumpkin', [5]]},
      {name: 'Russian Pumpkin', recipe: ['Carved Pumpkin', [4], 'Ripe Pumpkin', [5]]},
      {name: 'Green Mario Pumpkin', recipe: ['Ripe Pumpkin', [4], 'Rotting Pumpkin', [5]]},
      {name: 'Lame Pumpkin Trio', recipe: ['Stormrage Pumpkin', [3], 'Russian Pumpkin', [4], 'Green Mario Pumpkin', [5]]},
      {name: 'Halloween Pumpkin Badge', recipe: ['pumpkin badge bits', [3, 4, 5, 6, 7, 8]]},
    ],
    [
      {name: 'Memory Boost', recipe: ['Bloody Mario', [4], 'Mommys Recipe', [5]]},
      {name: 'Skultilla The Cake Guard', recipe: ['Link Was Here', [4], 'Gohma Sees You', [5]]},
      {name: 'Who Eats Whom', recipe: ['Memory Boost', [4], 'Skultilla The Cake Guard', [5]]},
      {name: 'Halloween Cupcake Badge', recipe: ['cupcake crumbles', [3, 4, 5, 6, 7, 8]]},
    ],
    [
      {name: 'Ghostbusters', recipe: ['Blinky', [3], 'Clyde', [4]]},
      {name: 'Boo', recipe: ['Pinky', [3], 'Inky', [4]]},
      {name: 'King Boo', recipe: ['Ghostbusters', [3], 'Boo', [4]]},
      {name: 'Tombstone Badge', recipe: ['haunted tombstone shard', [0, 1, 2, 6, 7, 8]]},
    ],
  ],
  'Adventure Club': [
    [
      {name: 'regenerate', recipe: ['glowing leaves', [4]]},
      {name: 'hypnosis', recipe: ['glowing leaves', [3, 4, 5]]},
      {name: 'muddle', recipe: ['glowing leaves', [1, 4, 7]]},
      {name: 'parasite', recipe: ['glowing leaves', [0, 1, 2, 6, 7, 8]]},
      {name: 'burst of light', recipe: ['condensed light', [4]]},
      {name: 'dark orb', recipe: ['bottled ghost', [4]]},
      {name: 'burning ash cloud', recipe: ['glowing ash', [1, 3, 4, 5, 7]]},
    ],
    [
      {name: '3 backpack slots', recipe: ['cloth', [4], 'hide', [3, 5]]},
      {name: '4 backpack slots', recipe: ['cloth', [4], 'hide', [1, 3, 5, 7]]},
      {name: '6 backpack slots', recipe: ['cloth', [0, 2, 6, 8], 'hide', [1, 3, 5, 7], 'advanced hide', [4]]},
      {name: 'scrappy gauntlets', recipe: ['scrap', [1, 4, 7]]},
      {name: 'troll tooth necklace', recipe: ['scrap', [7], 'hide', [1], 'troll tooth', [3, 4, 5]]},
    ],
  ],
  Bling: [
    [
      {name: 'Jazzier Pants', recipe: ['Jazz Pants', [4, 5]]},
      {name: 'Disco Pants', recipe: ["Nayru's flame", [1], "Farore's flame", [3], "Din's flame", [5], 'Jazzier Pants', [4]]},
      {name: "Devil's Pantaloons", recipe: ["Nayru's flame", [1], "Farore's flame", [3], "Din's flame", [5], 'Disco Pants', [4]]},
      {name: 'Unity Necklace', recipe: ["Din's flame", [0], "Farore's flame", [1], "Nayru's flame", [2], 'gold bar', [3], 'flawless amethyst', [4], 'jade bar', [5], 'carbon-crystalline quartz', [6, 7, 8]]},
      {name: 'Unity Band', recipe: ["Din's flame", [0], "Farore's flame", [1], "Nayru's flame", [2], 'gold bar', [3], 'silver ring of gazellia', [4], 'jade bar', [5], 'carbon-crystalline quartz', [7], 'amethyst', [6, 8]]},
      {name: "God's Cradle", recipe: ["Din's flame", [0], "Farore's flame", [1], "Nayru's flame", [2], 'carbon-crystalline quartz', [3, 5, 6, 8], 'flawless amethyst', [7], "monarch's crown", [4]]},
      {name: "God's Pennant", recipe: ["Din's flame", [0], "Farore's flame", [1], "Nayru's flame", [2], 'carbon-crystalline quartz', [3, 5, 6, 8], 'flawless amethyst', [7], "lucky deity's wings", [4]]},
      {name: 'Flame Badge', recipe: ["Din's flame", [0], "Farore's flame", [7], "Nayru's flame", [2], 'flawless amethyst', [4]]},
      {name: "Nayru's Username", recipe: ["Nayru's flame", [3], 'green onyx gem', [4]]},
      {name: "Farore's Username", recipe: ["Farore's flame", [3], 'green onyx gem', [4]]},
      {name: "Din's Username", recipe: ["Din's flame", [3], 'green onyx gem', [4]]},
      {name: 'Dwarven Disco Ball', recipe: ['dwarven gem', [0, 1, 2, 3, 4, 5, 6, 7, 8]]},
      {name: 'Dwarven Disco Plate', recipe: ['dwarven gem', [0, 1, 2, 3, 5, 6, 7, 8], 'obsidian plate armor', [4]]},
      {name: 'irc voice 8w', recipe: ['irc voice 2 weeks', [3, 4, 5]]},
      {name: 'irc voice 8w - low cost', recipe: ['irc voice 2 weeks - low cost option', [1, 3, 4, 5]], result: 'irc voice 8 weeks'},
      {name: 'irc voice 1y', recipe: ['irc voice 8 weeks', [0, 1, 2, 3, 4, 5], 'sapphire', [7]]},
    ],
  ],
};
//
// #endregion Recipe definition
//

//
// #region Update and processing logic
//

async function recipeStringToFullInfo(recipe) {
  return await apiCall({data: {request: 'items', type: 'crafting_result', recipe: recipe}}).then((response) => {
    return {
      ...response,
      recipe: recipe,
    };
  });
}
function resolveName(name) {
  return $('<textarea />').html(name).text().trim();
}
const itemIdStringCache = Object.fromEntries(
  itemsApiCache.map((item) => [
    resolveName(item.name.toLocaleLowerCase())
      .normalize('NFD')
      //.replace(/\p{Diacritic}/gu, '')
      .replace(/[^\w\s]/g, '')
      .toLocaleLowerCase(),
    parseInt(item.id).toString().padStart(5, '0'),
  ]),
);
async function findItemIdString(itemName) {
  if (itemName in itemIdStringCache) return [itemIdStringCache[itemName]];
  return await apiCall({data: {request: 'items', type: 'search', search: itemName}}).then((ids) => {
    if (ids.length > 1) {
      itemIdStringCache[itemName] = parseInt(prompt(`Choose an ID for ${itemName}`, ids.join(', ')))
        .toString()
        .padStart(5, '0');
      return [itemIdStringCache[itemName]];
    } else {
      if (ids.length === 1) {
        itemIdStringCache[itemName] = parseInt(ids[0]).toString().padStart(5, '0');
      }
      return ids.map((id) => parseInt(id).toString().padStart(5, '0'));
    }
  });
}
async function getNewFullRecipeInfo() {
  const existingRecipeStrings = Object.values(recipesApiCache)
    .flat()
    .map((recipe) => recipe.recipe);
  window.existingRecipeStrings = existingRecipeStrings;
  for (let [book, recipeArray] of Object.entries(recipeDefinitions)) {
    if (!(book in recipesApiCache)) recipesApiCache[book] = [];
    const orderedRecipes = [];
    for (let recipes of recipeArray) {
      for (let {recipe} of recipes) {
        const slots = new Array(9).fill('EEEEE');
        for (let j = 0; j < recipe.length / 2; j++) {
          let ingr = recipe[2 * j];
          for (let k = 0; k < recipe[2 * j + 1].length; k++) {
            if (ingr in itemIdStringCache) slots[recipe[2 * j + 1][k]] = itemIdStringCache[ingr];
            else {
              const potentialIds = await findItemIdString(
                ingr
                  .normalize('NFD')
                  //.replace(/\p{Diacritic}/gu, '')
                  .replace(/[^\w\s]/g, '')
                  .toLocaleLowerCase(),
              );
              if (potentialIds.length) {
                slots[recipe[2 * j + 1][k]] = potentialIds[0];
              } else {
                console.log('No item found for', ingr);
                slots.length = 0;
              }
            }
          }
        }
        const recipeString = slots.join('');
        if (recipeString && !existingRecipeStrings.includes(recipeString)) {
          const fullRecipe = await recipeStringToFullInfo(recipeString);
          if (!fullRecipe)
            console.log(
              'No recipe found',
              book,
              recipeArray.indexOf(recipes),
              recipes.findIndex((info) => info.recipe === recipe),
              recipe,
            );
          else orderedRecipes.push(fullRecipe);
        } else if (recipeString) {
          orderedRecipes.push(
            recipesApiCache[book][recipesApiCache[book].findIndex(({recipe}) => recipe === recipeString)],
          );
        }
      }
    }
    recipesApiCache[book] = orderedRecipes;
  }
  console.log('Recipes API Cache', recipesApiCache);
}

const types = ['Standard', 'Repair', 'Upgrade', 'Downgrade'];
const upgrades = {Segmentata: 'Cuirass', Lamellar: 'Chainmail', Billhook: 'Claymore', Guandao: 'Khopesh'};
const metalTiers = ['Impure Bronze', 'Bronze', 'Iron', 'Steel', 'Gold', 'Mithril', 'Adamantium'];
const magicTiers = ['Quartz', 'Jade', 'Amethyst'];
function isUpgrade(ingredient, result) {
  let match;
  // Pet upgrades to higher tiers
  return (
    ((match = ingredient.match(/(Dwarf Companion|Slime|Snowman)$/)) && result.endsWith(match[1])) ||
    // Jewelry Upgrades
    result === 'Empowered ' + ingredient ||
    // Armor, Weapon type upgrades
    result ===
      Object.entries(upgrades).reduce(
        (ingredient, [base, upgraded]) => ingredient.replace(base, upgraded),
        ingredient,
      ) ||
    // Armor, Weapon material upgrades
    result ===
      metalTiers.reduce(
        (upgraded, tier, i) =>
          upgraded === ingredient && i <= metalTiers.length - 2 ? upgraded.replace(tier, metalTiers[i + 1]) : upgraded,
        ingredient,
      ) ||
    result ===
      magicTiers.reduce(
        (upgraded, tier, i) =>
          upgraded === ingredient && i <= magicTiers.length - 2 ? upgraded.replace(tier, magicTiers[i + 1]) : upgraded,
        ingredient,
      ) ||
    // Discount pants
    result.replace('Pantaloons', 'Pants').endsWith('Pants') ||
    // Cupid's Wings (metal tier handled above) and Cupids Winged Boots
    (result === "Cupid's Gold Wings" && ingredient === "Cupid's Wings") ||
    ((match = result.match(/(Cupid's Winged Boots) of (?:Aggression|Fortune|Luck)/)) && match[1] === ingredient) ||
    // Gods Items (special cases)
    result === "God's Cradle" ||
    result === "God's Pennant"
  );
}
function getRecipeType(recipe) {
  const ingredients = recipe.recipe.match(/.{5}/g).map((item) => (item === 'EEEEE' ? 0 : parseInt(item)));
  const result = parseInt(recipe.ID);
  if (ingredients[4] === result) return types[1]; // Repair slot 4 matches result
  else if (
    ingredients[4] in window.items &&
    result in window.items &&
    isUpgrade(window.items[ingredients[4]].name, window.items[result].name)
  )
    return types[2];
  else if (ingredients.includes(2653)) return types[3]; // Flux === Downgrade
  else return types[0];
}
function titleCase(str) {
  return str
    .replace(/(?:^|\s|-)\w/g, function (match) {
      return match.toUpperCase();
    })
    .replace(' And ', ' and ')
    .replace(' Of ', ' of ')
    .replace(' A ', ' a ')
    .replace(' With ', ' with ')
    .replace(' The ', ' the ');
}

function getSparseIngredientsAndRecipes() {
  const recipeItems = Array.from(
    new Set(
      Object.values(recipesApiCache).flatMap((bookRecipes) =>
        bookRecipes.flatMap((recipe) =>
          [
            parseInt(recipe.ID),
            recipe.recipe
              .match(/.{5}/g)
              .filter((item) => item !== 'EEEEE')
              .map((item) => parseInt(item)),
          ].flat(),
        ),
      ),
    ),
  );
  window.items = Object.fromEntries(
    Object.values(itemsApiCache)
      .filter((ingred) => {
        // Log unused items if you want
        if (!recipeItems.includes(parseInt(ingred.id))) false && console.log('dropping', ingred);
        return recipeItems.includes(parseInt(ingred.id));
      })
      .map((ingred) => {
        const life =
          'equipLife' in ingred
            ? {
                equipLife: ingred.equipLife * 3600, // hours to seconds
              }
            : {};
        return [
          parseInt(ingred.id),
          {
            name: resolveName(ingred.name),
            image: ingred.image,
            category: ingred.category,
            gold: ingred.gold,
            // stock: ingred.stock,
            infStock: ingred.infStock,
            ...life,
            // description: ingred.description,
          },
        ];
      }),
  );
  console.log('Items', window.items);
  window.recipes = Object.keys(recipesApiCache).flatMap((book) =>
    recipesApiCache[book].flatMap((recipe, i) => {
      const recipeListList = recipeDefinitions[book];
      let j = 0;
      while (i >= recipeListList[j].length) {
        i -= recipeListList[j].length;
        ++j;
      }
      // console.log(book, j, i, recipe, recipeListList[j][i]);
      const name = titleCase(recipeListList[j][i].name);
      const nameEx =
        !(parseInt(recipe.ID) in window.items) ||
        name
          .normalize('NFD')
          //.replace(/\p{Diacritic}/gu, '')
          .replace(/[^\w\s]/g, '')
          .toLocaleLowerCase() ===
          resolveName(window.items[recipe.ID].name)
            .normalize('NFD')
            //.replace(/\p{Diacritic}/gu, '')
            .replace(/[^\w\s]/g, '')
            .toLocaleLowerCase()
          ? {}
          : {name: name};
      const requirement = recipe.Requirement ? {requirement: recipe.Requirement} : {};
      return {
        itemId: parseInt(recipe.ID),
        recipe: recipe.recipe,
        book: book,
        type: getRecipeType(recipe),
        ...requirement,
        ...nameEx,
      };
    }),
  );
  console.log('Recipes', window.recipes);
}

async function getMissingItemInfo(missing) {
  return await apiCall({
    data: {
      request: 'items',
      itemids:
        '[' +
        missing
          .map((item) => parseInt(item))
          .filter((item) => item)
          .join(',') +
        ']',
    },
  });
}
async function findItemProblems() {
  const missing = [];
  const nonMatching = [];
  const nameToRecipes = {};
  window.recipes.forEach((recipe) => {
    if (!(recipe.itemId in window.items)) {
      missing.push(recipe.itemId);
    } else {
      if (!((recipe.name || resolveName(window.items[recipe.itemId].name)) in nameToRecipes))
        nameToRecipes[recipe.name || resolveName(window.items[recipe.itemId].name)] = [];
      nameToRecipes[recipe.name || resolveName(window.items[recipe.itemId].name)].push(recipe);
      if (recipe.name && recipe.name !== resolveName(window.items[recipe.itemId].name))
        nonMatching.push(`${recipe.itemId} "${recipe.name}" "${resolveName(window.items[recipe.itemId].name)}"`);
    }
    missing.push(
      ...Array.from(new Set(recipe.recipe.match(/.{5}/g).filter((item) => item !== 'EEEEE')))
        .filter((item) => !missing.includes(parseInt(item)) && !(parseInt(item) in window.items))
        .map((item) => parseInt(item)),
    );
  });
  const uniqueMissing = Array.from(new Set(missing));
  const missingInfo = await getMissingItemInfo(uniqueMissing);
  missingInfo.forEach((item, i) => (uniqueMissing[i] = item));
  console.log('Missing Items', uniqueMissing);
  console.log('Nonmatching names (recipe vs item)', nonMatching);
  console.log(
    'Recipes with duplicate names',
    Object.values(nameToRecipes)
      .filter((recipes) => recipes.length > 1)
      .map((recipes) => {
        recipes.forEach((recipe) => (recipe.duplicated = true));
        return recipes;
      })
      .flat(),
  );
}

//
// #endregion Update and processing logic
//

await getNewFullRecipeInfo();
getSparseIngredientsAndRecipes();
await findItemProblems();
