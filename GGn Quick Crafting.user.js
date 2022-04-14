// ==UserScript==
// @name         GGn Quick Crafter
// @namespace    http://tampermonkey.net/
// @version      2.4.1
// @description  Craft multiple items easier
// @author       KingKrab23
// @author       KSS
// @author       FinalDoom
// @author       GGN community
// @match        https://gazellegames.net/user.php?action=crafting
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==

(async function (window, $, VERSION) {
  ('use strict');

  //
  // #region >>>BEGIN<<< User adjustable variables
  //
  // ONLY ADJUST THESE IF YOU KNOW WHAT YOU'RE DOING
  // Too little of a delay will cause more bugs
  //

  const CRAFT_TIME = 1000;

  //
  // #endregion >>>END<<< user adjustable variables
  //

  //
  // #region >>>BEGIN<<< Rarely updated data
  //
  // Recipes, books, items, etc. that will need to be updated
  // when new recipes are added, but not otherwise
  //

  //
  // #region Ingredients
  //
  // Maps ingredient names to site IDs, for use in crafting URLs
  //
  const ingredients = {
    'glass shards': '01988',
    'test tube': '00125',
    vial: '00124',
    bowl: '00126',
    'pile of sand': '01987',
    'black elder leaves': '00115',
    'black elderberries': '00114',
    'yellow hellebore flower': '00113',
    'upload potion': '00099',
    'purple angelica flowers': '00111',
    'garlic tincture': '00127',
    'download-reduction potion': '00106',
    'head of garlic': '00112',
    'bronze alloy mix': '02225',
    'bronze bar': '02235',
    'impure bronze bar': '02236',
    'iron bar': '02237',
    'steel bar': '02238',
    'gold bar': '02239',
    'mithril bar': '02240',
    'adamantium bar': '02241',
    'quartz bar': '02242',
    'jade bar': '02243',
    'amethyst bar': '02244',
    clay: '02234',
    'iron ore': '02226',
    'lump of coal': '02233',
    'gold ore': '02227',
    'adamantium ore': '02229',
    'mithril ore': '02228',
    'quartz dust': '02230',
    'jade dust': '02231',
    'amethyst dust': '02232',
    'ruby-flecked wheat': '02579',
    'emerald-flecked wheat': '02717',
    'ruby-grained baguette': '02580',
    'emerald-grained baguette': '02718',
    'garlic ruby-baguette': '02581',
    'garlic emerald-baguette': '02719',
    'artisan emerald-baguette': '02720',
    'emerald chip': '02551',
    'ruby chip': '02550',
    'sapphire chip': '02552',
    'carbon-crystalline quartz': '02537',
    'exquisite constellation of emeralds': '02565',
    'exquisite constellation of sapphires': '02564',
    'exquisite constellation of rubies': '02563',
    ruby: '02323',
    sapphire: '02549',
    emerald: '00116',
    'dwarven gem': '02508',
    flux: '02653',
    tongs: '02627',

    // Cards
    Bowser: '02395',
    Goomba: '02396',
    'Koopa Troopa': '02397',
    Luigi: '02391',
    Mario: '02390',
    'Princess Peach': '02392',
    Toad: '02393',
    Wario: '02398',
    Yoshi: '02394',
    'Fire Flower': '02402',
    'Penguin Suit': '02403',
    'Super Mushroom': '02401',
    'Goal Pole': '02404',
    'A Scared Morty': '02377',
    Cake: '02373',
    'Chimera Schematic': '02382',
    'Companion Cube': '02375',
    'Covetor Mining Ship': '02383',
    GLaDOS: '02374',
    'Mr Poopy Butthole': '02379',
    'Nyx class Supercarrier': '02381',
    'Rick Sanchez': '02378',
    'Portal Gun': '02376',
    'Ricks Portal Gun': '02380',
    'Space Wormhole': '02384',
    'Interdimensional Portal': '02385',
    'A Red Hot Flamed': '02359',
    'A Wild Artifaxx': '02358',
    'Alpaca Out of Nowhere!': '02361',
    'lepik le prick': '02368',
    'LinkinsRepeater Bone Hard Card': '02400',
    "MuffledSilence's Headphones": '02388',
    'Neos Ratio Cheats': '02366',
    'Nikos Transformation': '02367',
    "Stump's Banhammer": '02365',
    'The Golden Daedy': '02357',
    'thewhales Kiss': '02364',
    'Ze do Caixao Coffin Joe Card': '02410',
    'Random Staff Card': '02438',
    'The Golden Throne': '02369',
    'Staff Beauty Parlor': '02371',
    'Biggest Banhammer': '02370',
    'Realm of Staff': '02372',

    // Adventure Club
    'glowing leaves': '02844',
    'glowing ash': '02892',
    'condensed light': '02841',
    'bottled ghost': '02842',
    hide: '02816',
    'advanced hide': '02894',
    cloth: '02814',
    scrap: '02813',
    'troll tooth': '02893',

    // Xmas
    'Cyberpunk 2077': '03105',
    'Watch Dogs Legion': '03106',
    'Dirt 5': '03107',
    'Genshin Impact': '03108',
    'Animal Crossing': '03109',
    Gazelle: '03110',
    Mafia: '03111',
    'Red Crewmate Bauble': '03113',
    'Green Crewmate Bauble': '03114',
    'Cyan Crewmate Bauble': '03115',
    'Broken Bauble Fragment': '03119',
    'Wilted Four-Leaves Holly': '03120',
    'pile of snow': '02295',
    snowball: '02296',
    'large snowball': '02305',
    'candy cane': '02297',
    'hot chocolate': '02298',
    'pile of charcoal': '02300',
    carrot: '02306',
    'christmas spices': '02688',
    'old scarf & hat': '02689',
    'Perfect Snowball': '02698',
    Mistletoe: '02699',
    'Santa Suit': '02700',
    'Abominable Santa': '02701',
    'Icy Kisses': '02702',
    'Sexy Santa': '02703',
    'Christmas Cheer': '02704',
    'Gingerbread Kitana': '02969',
    'Gingerbread Marston': '02970',
    'Gingerbread Doomslayer': '02972',
    'Millenium Falcon Gingerbread': '02973',
    'Gingerbread AT Walker': '02974',
    'Mario Christmas': '02975',
    'Baby Yoda With Gingerbread': '02976',
    'snowman cookie': '03313',
    snowflake: '03325',
    'penguin snowglobe': '03326',
    'owl snowglobe': '03327',
    'Santa Claus Is Out There': '03328',
    'Back to the Future': '03329',
    'Big Lebowski': '03330',
    Picard: '03331',
    Braveheart: '03332',
    Indy: '03333',
    Gremlins: '03334',
    'Die Hard': '03335',
    'Jurassic Park': '03336',
    Mando: '03338',
    Doomguy: '03339',
    Grievous: '03340',
    'Have a Breathtaking Christmas': '03341',

    // Birthday
    'lick badge bits': '02826',
    'Ripped Gazelle': '02829',
    'Fancy Gazelle': '02830',
    'Gamer Gazelle': '02831',
    'Future Gazelle': '02833',
    'Alien Gazelle': '02834',
    'Lucky Gazelle': '02835',
    'Supreme Gazelle': '02836',
    'Exodus Truce': '03023',
    'Gazelle Breaking Bad': '03024',
    'A Fair Fight': '03025',
    'Home Sweet Home': '03026',
    'Birthday Battle Kart': '03027',
    'What an Adventure': '03028',
    'After Party': '03029',
    'birthday leaves': '03031',
    'Bill Rizer': '03151',
    'Donkey Kong': '03152',
    'Duck Hunt Dog': '03153',
    'Dr Mario': '03154',
    Pit: '03155',
    'Little Mac': '03156',
    'Mega Man': '03157',
    Link: '03158',
    'Pac-Man': '03159',
    'Samus Aran': '03160',
    'Simon Belmont': '03161',
    Kirby: '03162',
    'Black Mage': '03163',
    'party pipe badge bit': '03166',
    'slice of birthday cake': '03379',
    'golden egg': '03384',

    //Valentine
    'Valentine sugar heart': '03000',
    'Valentine chocolate heart': '03001',
    'Sonic and Amy': '02986',
    'Yoshi and Birdo': '02987',
    'Kirlia and Meloetta': '02988',
    'Aerith and Cloud': '02989',
    'Master Chief and Cortana': '02990',
    'Dom and Maria': '02991',
    'Mr and Mrs Pac Man': '02992',
    'Chainsaw Chess': '02993',
    'Chainsaw Wizard': '02994',
    'Angelise Reiter': '02995',
    'Ivy Valentine': '02996',
    'Jill Valentine': '02997',
    Sophitia: '02998',
    Yennefer: '02999',
    'Valentine rose': '03002',
    'Symbol of love': '03143',
    'Old worn boots': '03144',
    'Cupids magical feather': '03145',
    'rose petals': '03359',

    //Dwarven
    'abandoned dwarven helmet': '03207',
    'abandoned dwarven cuirass': '03208',
    'abandoned dwarven gloves': '03209',
    'abandoned dwarven boots': '03210',
    'abandoned dwarven axe': '03211',
    milk: '03218',
    cherries: '03219',
    grapes: '03220',
    coconuts: '03221',
    marshmallows: '03222',
    'cocoa beans': '03223',
    'vanilla pods': '03224',
    strawberries: '03225',
    cinnamon: '03241',

    //Halloween
    'Ripe Pumpkin': '02589',
    'Rotting Pumpkin': '02590',
    'Carved Pumpkin': '02591',
    'Stormrage Pumpkin': '02592',
    'Russian Pumpkin': '02593',
    'Green Mario Pumpkin': '02594',
    'Lame Pumpkin Trio': '02595',
    'pumpkin badge bits': '02600',
    'Bloody Mario': '02945',
    'Mommys Recipe': '02946',
    'Memory Boost': '02947',
    'Link Was Here': '02948',
    'Gohma Sees You': '02949',
    'Skultilla The Cake Guard': '02950',
    'Who Eats Whom': '02951',
    'cupcake crumbles': '02952',
    Blinky: '03263',
    Clyde: '03265',
    Pinky: '03266',
    Inky: '03267',
    Ghostbusters: '03268',
    Boo: '03269',
    'King Boo': '03270',
    'haunted tombstone shard': '03281',
    snowman: '02307',

    //Bling
    'green onyx gem': '00120',
    'flawless amethyst': '00121',
    'Farores flame': '02153',
    'Nayrus flame': '02154',
    'Dins flame': '02155',
    'irc voice 2w': '00072',
    'irc voice 2w - low cost': '00175',
    'irc voice 8w': '02212',
  };

  const non_ingredients = {
    '2x glass shards': '2436',
    '3x glass shards': '2437',
    'upload potion sampler': '66',
    'small upload potion': '98',
    'large upload potion': '100',
    'download-reduction potion sampler': '104',
    'small download-reduction potion': '105',
    'large download-reduction potion': '107',
    'small luck potion': '2433',
    'large luck potion': '2434',
    'artisan ruby-baguette': '2582',
    'gazellian emerald-baguette': '2721',
    '2x bronze alloy mix': '2666',
    '2x iron ore': '2668',
    '2x gold ore': '2670',
    '2x mithril ore': '2671',
    '2x adamantium ore': '2672',
    '2x quartz dust': '2673',
    '2x jade dust': '2675',
    '2x amethyst dust': '2676',
    'random lvl2 staff card': '2438',
    'Christmas Bauble Badge': '3112',
    'Christmas Impostor Bauble': '3117',
    'lucky four-leaves holly': '3121',
    'peppermint hot chocolate': '2299',
    'hyper realistic eggnog': '2303',
    'cant believe this is cherry': '2822',
    'grape milkshake': '3226',
    'coco-cooler milkshake': '3227',
    'cinnamon milkshake': '3228',
    'rocky road milkshake': '3229',
    'neapolitan milkshake': '3230',
    'special box': '3004',
  };
  //
  // #endregion
  //

  //
  // #region Recipe Book definitions
  //
  // Used to create enable/disable buttons
  // bgcolor and color are also used for the associated recipe buttons
  // Keys must match top-level keys in recipes
  //

  //
  // Other object properties are:
  //  button: the jQuery object referring to the associated button
  //  recipes: an array of associated recipe buttons (jQuery objs)
  //  section: the jQuery object for the element wrapping associated recipe buttons
  //
  const books = GM_getValue('selected_books', {
    Glass: {bgcolor: 'white', color: 'black', disabled: true},
    Potions: {bgcolor: 'green', color: 'white', disabled: false},
    // Luck: {bgcolor: 'blue', color: 'white', disabled: false},
    Food: {bgcolor: 'wheat', color: 'black', disabled: false},
    Dwarven: {bgcolor: 'brown', color: 'beige', disabled: true},
    Material_Bars: {bgcolor: 'purple', color: 'white', disabled: false},
    Armor: {bgcolor: 'darkblue', color: 'white', disabled: true},
    Weapons: {bgcolor: 'darkred', color: 'white', disabled: true},
    Recasting: {bgcolor: 'gray', color: 'white', disabled: true},
    Jewelry: {bgcolor: 'deeppink', color: 'white', disabled: true},
    Bling: {bgcolor: 'gold', color: 'darkgray', disabled: true},
    Trading_Decks: {bgcolor: '#15273F', color: 'white', disabled: true},
    Xmas_Crafting: {bgcolor: 'red', color: 'lightgreen', disabled: true},
    Birthday: {bgcolor: 'dark', color: 'gold', disabled: true},
    Valentines: {bgcolor: 'pink', color: 'deeppink', disabled: true},
    Adventure_Club: {bgcolor: 'yellow', color: 'black', disabled: true},
    Halloween: {bgcolor: 'gray', color: 'black', disabled: true},
  });
  // Migrate old saves
  const oldBooks = GM_getValue('BOOKS_SAVE');
  if (oldBooks && typeof (oldBooks[0] !== 'object')) {
    for (var i = 0; i < oldBooks.length / 2; i++) {
      books[Object.keys(books)[i]].disabled = oldBooks[2 * i + 1] === 0;
    }
    GM_deleteValue('BOOKS_SAVE');
  }
  //
  // #endregion Recipe Book definitions
  //

  //
  // #region Recipe definitions
  //
  // Defines all the recipes with ingredients and results
  //
  // key is the key in the book object above that these recipes belong to
  // value is an array of arrays, where inner arrays define a row of recipe buttons via recipe objects
  //
  // recipe object:
  //  name is the recipe site id
  //  recipe is the recipe, format: ["ingredient1", [slot1, slot2, ...], ... ]       Slots: 0 1 2
  //  result (optional) is the name of the item created by the recipe                       3 4 5
  //    result is used as title of the crafting box, and                                    6 7 8
  //    in dynamic counting (only if it's an ingredient);
  //    not necessary if it's the same as the name
  //    of the recipe, with "_" replaced with " ".
  //

  // relates book object to list(s) of associated recipes' info
  // prettier-ignore
  const recipes = {
    Glass: [
      [
        {name: 'glass_shards_from_sand', recipe: ['pile of sand', [4]], result: 'glass shards'},
        {name: 'glass_shards_from_test_tube', recipe: ['test tube', [4]], result: 'glass shards'},
        {name: 'glass_shards_from_vial', recipe: ['vial', [4]], result: '2x glass shards'},
        {name: 'glass_shards_from_bowl', recipe: ['bowl', [4]], result: '3x glass shards'},
      ],
      [
        {name: 'test_tube', recipe: ['glass shards', [1, 4]]},
        {name: 'vial', recipe: ['glass shards', [1, 3, 4, 6, 7]]},
        {name: 'bowl', recipe: ['glass shards', [0, 1, 2, 3, 5, 6, 7, 8]]},
        {name: 'dust_ore_vial', recipe: ['pile of sand', [4], 'quartz dust', [7]], result: 'vial'},
        {name: 'dust_ore_bowl', recipe: ['pile of sand', [4], 'jade dust', [7]], result: 'bowl'},
      ],
    ],
    Potions: [
      [
        {name: 'upload_potion_sampler', recipe: ['test tube', [4], 'black elderberries', [5], 'black elder leaves', [2]]},
        {name: 'small_upload_potion', recipe: ['vial', [4], 'black elder leaves', [2, 8], 'black elderberries', [5]]},
        {name: 'upload_potion', recipe: ['vial', [4], 'black elder leaves', [0, 2, 3, 6, 8], 'black elderberries', [5]]},
        {name: 'large_upload_potion', recipe: ['bowl', [4], 'upload potion', [3, 5], 'yellow hellebore flower', [1]]},
      ],
      [
        {name: 'download-reduction_potion_sampler', recipe: ['test tube', [4], 'garlic tincture', [5], 'purple angelica flowers', [2]]},
        {name: 'small_download-reduction_potion', recipe: ['vial', [4], 'purple angelica flowers', [2, 8], 'garlic tincture', [5]]},
        {name: 'download-reduction_potion', recipe: ['vial', [4], 'purple angelica flowers', [0, 2, 3, 6, 8], 'garlic tincture', [5]]},
        {name: 'large_download-reduction_potion', recipe: ['bowl', [4], 'download-reduction potion', [3, 5], 'yellow hellebore flower', [1]]},
        {name: 'garlic_tincture', recipe: ['test tube', [4], 'head of garlic', [5]]},
      ],
      [
        {name: 'small_luck_potion', recipe: ['vial', [3], 'black elderberries', [4, 5]]},
        {name: 'large_luck_potion', recipe: ['bowl', [4], 'black elderberries', [0, 1, 2, 3, 5], 'yellow hellebore flower', [7]]},
      ],
    ],
    Food: [
      [
        {name: 'ruby-grained_baguette', recipe: ['ruby-flecked wheat', [4, 5]]},
        {name: 'garlic_ruby-baguette', recipe: ['ruby-grained baguette', [4], 'head of garlic', [3, 5]]},
        {name: 'artisan_ruby-baguette', recipe: ['garlic ruby-baguette', [3], 'yellow hellebore flower', [4, 5]]},
      ],
      [
        {name: 'emerald-grained_baguette', recipe: ['emerald-flecked wheat', [4, 5]]},
        {name: 'garlic_emerald-baguette', recipe: ['emerald-grained baguette', [4], 'head of garlic', [5]]},
        {name: 'artisan_emerald-baguette', recipe: ['garlic emerald-baguette', [3], 'emerald chip', [4], 'yellow hellebore flower', [5]]},
        {name: 'gazellian_emerald-baguette', recipe: ['artisan emerald-baguette', [3], 'emerald chip', [4, 5]]},
      ],
    ],
    Dwarven: [
      [
        {name: 'cant_believe_this_is_cherry', recipe: ['milk', [0], 'pile of snow', [1], 'cherries', [2], 'glass shards', [6, 7, 8]]},
        {name: 'grape_milkshake', recipe: ['milk', [0], 'pile of snow', [1], 'grapes', [2], 'glass shards', [6, 7, 8]]},
        {name: 'coco-cooler_milkshake', recipe: ['milk', [0], 'pile of snow', [1], 'coconuts', [2], 'glass shards', [6, 7, 8]]},
        {name: 'cinnamon_milkshake', recipe: ['milk', [0], 'pile of snow', [1], 'cinnamon', [2], 'glass shards', [6, 7, 8]]},
        {name: 'rocky_road_milkshake', recipe: ['milk', [0], 'pile of snow', [1], 'cocoa beans', [3], 'marshmallows', [4], 'glass shards', [6, 7, 8]]},
        {name: 'neapolitan_milkshake', recipe: ['milk', [0], 'pile of snow', [1], 'cocoa beans', [3], 'vanilla pods', [4], 'strawberries', [5], 'glass shards', [6, 7, 8]]},
      ],
    ],
    Material_Bars: [
      [
        {name: 'impure_bronze_bar', recipe: ['bronze alloy mix', [0], 'clay', [1]]},
        {name: 'bronze_bar', recipe: ['bronze alloy mix', [0, 1]]},
        {name: 'iron_bar', recipe: ['iron ore', [0, 1]], result: 'iron bar'},
        {name: 'steel_bar', recipe: ['iron ore', [0, 1], 'lump of coal', [4]]},
        {name: 'steel_bar_from_iron_bar', recipe: ['iron bar', [1], 'lump of coal', [4]], result: 'steel bar'},
        {name: 'gold_bar', recipe: ['gold ore', [0, 1]]},
        {name: 'mithril_bar', recipe: ['mithril ore', [0, 1]]},
        {name: 'adamantium_bar', recipe: ['adamantium ore', [0, 1]]},
        {name: 'quartz_bar', recipe: ['quartz dust', [0, 1]]},
        {name: 'jade_bar', recipe: ['jade dust', [0, 1]]},
        {name: 'amethyst_bar', recipe: ['amethyst dust', [0, 1]]},
      ],
    ],
    Armor: [
      [
        {name: 'impure_bronze_cuirass', recipe: ['impure bronze bar', [1, 6]]},
        {name: 'bronze_cuirass', recipe: ['bronze bar', [1, 6]]},
        {name: 'iron_cuirass', recipe: ['iron bar', [1, 4, 6, 8]]},
        {name: 'steel_cuirass', recipe: ['steel bar', [1, 4, 6, 8]]},
        {name: 'gold_cuirass', recipe: ['gold bar', [1, 4, 6, 8]]},
        {name: 'mithril_cuirass', recipe: ['mithril bar', [1, 4, 6, 7, 8]]},
        {name: 'adamantium_cuirass', recipe: ['adamantium bar', [1, 4, 6, 7, 8]]},
      ],
      [
        {name: 'quartz_chainmail', recipe: ['quartz bar', [1, 6]]},
        {name: 'jade_chainmail', recipe: ['jade bar', [1, 4, 6, 8]]},
        {name: 'amethyst_chainmail', recipe: ['amethyst bar', [1, 4, 6, 7, 8]]},
      ],
      [
        {name: 'impure_bronze_segmentata', recipe: ['impure bronze bar', [1], 'tongs', [7]]},
        {name: 'bronze_segmentata', recipe: ['bronze bar', [1], 'tongs', [7]]},
        {name: 'iron_segmentata', recipe: ['iron bar', [1, 4], 'tongs', [7]]},
        {name: 'steel_segmentata', recipe: ['steel bar', [1, 4], 'tongs', [7]]},
        {name: 'gold_segmentata', recipe: ['gold bar', [1, 4], 'tongs', [7]]},
        {name: 'mithril_segmentata', recipe: ['mithril bar', [1, 4], 'tongs', [7]]},
        {name: 'adamantium_segmentata', recipe: ['adamantium bar', [1, 4], 'tongs', [7]]},
      ],
      [
        {name: 'quartz_lamellar', recipe: ['quartz bar', [1], 'tongs', [7]]},
        {name: 'jade_lamellar', recipe: ['jade bar', [1, 4], 'tongs', [7]]},
        {name: 'amethyst_lamellar', recipe: ['amethyst bar', [1, 4], 'tongs', [7]]},
      ],
      [
        {name: 'impure_bronze_armguards', recipe: ['impure bronze bar', [1], 'tongs', [6, 8]]},
        {name: 'impure_bronze_power_gloves', recipe: ['impure bronze bar', [1], 'tongs', [5], 'ruby chip', [6]]},
      ],
    ],
    Weapons: [
      [
        {name: 'impure_bronze_claymore', recipe: ['impure bronze bar', [0, 7]]},
        {name: 'bronze_claymore', recipe: ['bronze bar', [0, 7]]},
        {name: 'iron_claymore', recipe: ['iron bar', [0, 2, 4, 7]]},
        {name: 'steel_claymore', recipe: ['steel bar', [0, 2, 4, 7]]},
        {name: 'gold_claymore', recipe: ['gold bar', [0, 2, 4, 7]]},
        {name: 'mithril_claymore', recipe: ['mithril bar', [0, 1, 2, 4, 7]]},
        {name: 'adamantium_claymore', recipe: ['adamantium bar', [0, 1, 2, 4, 7]]},
      ],
      [
        {name: 'quartz_khopesh', recipe: ['quartz bar', [0, 7]]},
        {name: 'jade_khopesh', recipe: ['jade bar', [0, 2, 4, 7]]},
        {name: 'amethyst_khopesh', recipe: ['amethyst bar', [0, 1, 2, 4, 7]]},
      ],
      [
        {name: 'impure_bronze_billhook', recipe: ['tongs', [1], 'impure bronze bar', [7]]},
        {name: 'bronze_billhook', recipe: ['tongs', [1], 'bronze bar', [7]]},
        {name: 'iron_billhook', recipe: ['tongs', [1], 'iron bar', [4, 7]]},
        {name: 'steel_billhook', recipe: ['tongs', [1], 'steel bar', [4, 7]]},
        {name: 'gold_billhook', recipe: ['tongs', [1], 'gold bar', [4, 7]]},
        {name: 'mithril_billhook', recipe: ['tongs', [1], 'mithril bar', [4, 7]]},
        {name: 'adamantium_billhook', recipe: ['tongs', [1], 'adamantium bar', [4, 7]]},
      ],
      [
        {name: 'quartz_guandao', recipe: ['tongs', [1], 'quartz bar', [7]]},
        {name: 'jade_guandao', recipe: ['tongs', [1], 'jade bar', [4, 7]]},
        {name: 'amethyst_guandao', recipe: ['tongs', [1], 'amethyst bar', [4, 7]]},
      ],
    ],
    Recasting: [
      [
        {name: 'impure_bronze_bar_to_ore', recipe: ['impure bronze bar', [4], 'flux', [3, 5]], result: 'bronze alloy mix'},
        {name: 'bronze_bar_to_ore', recipe: ['bronze bar', [4], 'flux', [3, 5]], result: '2x bronze alloy mix'},
        {name: 'iron_bar_to_ore', recipe: ['iron bar', [4], 'flux', [3, 5]], result: '2x iron ore'},
        {name: 'steel_bar_to_ore', recipe: ['steel bar', [4], 'flux', [3, 5]], result: '2x iron ore'},
        {name: 'gold_bar_to_ore', recipe: ['gold bar', [4], 'flux', [3, 5]], result: '2x gold ore'},
        {name: 'mithril_bar_to_ore', recipe: ['mithril bar', [4], 'flux', [3, 5]], result: '2x mithril ore'},
        {name: 'adamantium_bar_to_ore', recipe: ['adamantium bar', [4], 'flux', [3, 5]], result: '2x adamantium ore'},
      ],
      [
        {name: 'quartz_bar_to_dust', recipe: ['quartz bar', [4], 'flux', [3, 5]], result: '2x quartz dust'},
        {name: 'jade_bar_to_dust', recipe: ['jade bar', [4], 'flux', [3, 5]], result: '2x jade dust'},
        {name: 'amethyst_bar_to_dust', recipe: ['amethyst bar', [4], 'flux', [3, 5]], result: '2x amethyst dust'},
        {name: 'downgrade_bronze_bar', recipe: ['bronze bar', [4], 'flux', [7], 'clay', [3, 5]], result: '2x impure bronze bar'},
        {name: 'downgrade_steel_bar', recipe: ['steel bar', [4], 'flux', [7]], result: 'iron bar'},
        {name: 'melt_dwarven_gem', recipe: ['dwarven gem', [4], 'flux', [7]], result: 'pile of sand'},
      ],
    ],
    Jewelry: [
      [
        {name: 'carbon-crystalline_quartz', recipe: ['quartz bar', [4], 'lump of coal', [5]]},
        {name: 'carbon-crystalline_quartz_necklace', recipe: ['carbon-crystalline quartz', [4], 'glass shards', [1]]},
        {name: 'exquisite_constellation_of_emeralds', recipe: ['emerald', [3, 5, 6, 8], 'amethyst bar', [4, 7]]},
        {name: 'exquisite_constellation_of_sapphires', recipe: ['sapphire', [3, 5, 6, 8], 'amethyst bar', [4, 7]]},
        {name: 'exquisite_constellation_of_rubies', recipe: ['ruby', [3, 5, 6, 8], 'amethyst bar', [4, 7]]},
      ],
    ],
    Trading_Decks: [
      [
        {name: 'The_Golden_Throne', recipe: ['A Wild Artifaxx', [3], 'A Red Hot Flamed', [4], 'The Golden Daedy', [5]]},
        {name: 'Biggest_Banhammer', recipe: ["Stump's Banhammer", [3], 'thewhales Kiss', [4], 'Neos Ratio Cheats', [5]]},
        {name: 'Staff_Beauty_Parlor', recipe: ['Alpaca Out of Nowhere!', [3], 'Nikos Transformation', [4], 'lepik le prick', [5]]},
        {name: 'random_lvl2_staff_card', recipe: ['LinkinsRepeater Bone Hard Card', [3], "MuffledSilence's Headphones", [4], 'Ze do Caixao Coffin Joe Card', [5]]},
        {name: 'Realm_of_Staff', recipe: ['The Golden Throne', [3], 'Biggest Banhammer', [4], 'Staff Beauty Parlor', [5]]},
      ],
      [
        {name: 'Portal_Gun', recipe: ['Cake', [3], 'GLaDOS', [4], 'Companion Cube', [5]], result: 'Portal Gun'},
        {name: 'Space_Wormhole', recipe: ['Nyx class Supercarrier', [3], 'Covetor Mining Ship', [4], 'Chimera Schematic', [5]], result: 'Space Wormhole'},
        {name: 'Ricks_Portal_Gun', recipe: ['Rick Sanchez', [3], 'A Scared Morty', [4], 'Mr Poopy Butthole', [5]], result: 'Ricks Portal Gun'},
        {name: 'Interdimensional_Portal', recipe: ['Portal Gun', [3], 'Space Wormhole', [4], 'Ricks Portal Gun', [5]], result: 'Interdimensional Portal'},
      ],
      [
        {name: 'Super_Mushroom', recipe: ['Mario', [3], 'Princess Peach', [4], 'Toad', [5]], result: 'Super Mushroom'},
        {name: 'Fire_Flower', recipe: ['Luigi', [3], 'Koopa Troopa', [4], 'Yoshi', [5]], result: 'Fire Flower'},
        {name: 'Penguin_Suit', recipe: ['Bowser', [3], 'Goomba', [4], 'Wario', [5]], result: 'Penguin Suit'},
        {name: 'Goal_Pole', recipe: ['Super Mushroom', [3], 'Fire Flower', [4], 'Penguin Suit', [5]], result: 'Goal Pole'},
      ],
      [
        {name: 'Random_Lootbox', recipe: ['Realm of Staff', [0], 'Goal Pole', [4], 'Interdimensional Portal', [6]]},
        {name: 'Dins_Lootbox', recipe: ['Realm of Staff', [0, 6], 'Goal Pole', [4]]},
        {name: 'Farores_Lootbox', recipe: ['Goal Pole', [0, 6], 'Realm of Staff', [4]]},
        {name: 'Nayrus_Lootbox', recipe: ['Interdimensional Portal', [0, 6], 'Realm of Staff', [4]]},
      ],
    ],
    Xmas_Crafting: [
      [
        {name: 'Dirt_5', recipe: ['Cyberpunk 2077', [4], 'Watch Dogs Legion', [5]]},
        {name: 'Gazelle', recipe: ['Genshin Impact', [4], 'Animal Crossing', [5]]},
        {name: 'Mafia', recipe: ['Dirt 5', [4], 'Gazelle', [5]]},
        {name: 'Christmas_Bauble_Badge', recipe: ['Broken Bauble Fragment', [1, 2, 4, 5]]},
        {name: 'Christmas_Impostor_Bauble', recipe: ['Red Crewmate Bauble', [3], 'Green Crewmate Bauble', [4], 'Cyan Crewmate Bauble', [5]]},
        {name: 'lucky_four-leaves_holly', recipe: ['Wilted Four-Leaves Holly', [4], 'black elderberries', [2, 5, 8]]},
      ],
      [
        {name: 'snowball', recipe: ['pile of snow', [4, 7]]},
        {name: 'large_snowball', recipe: ['pile of snow', [1, 3, 5, 7], 'snowball', [4]]},
        {name: 'hot_chocolate', recipe: ['christmas spices', [1], 'snowball', [4], 'bowl', [7]]},
        {name: 'peppermint_hot_chocolate', recipe: ['candy cane', [1], 'hot chocolate', [4]]},
        {name: 'hyper_realistic_eggnog', recipe: ['christmas spices', [7], 'snowball', [4], 'bowl', [1]]},
        {name: 'pile_of_charcoal', recipe: ['lump of coal', [1, 3, 4, 5]]},
        {name: 'snowman', recipe: ['carrot', [0], 'old scarf & hat', [1], 'clay', [2], 'snowball', [3], 'large snowball', [4, 7], 'pile of charcoal', [5, 8], 'bowl', [6]]},
      ],
      [
        {name: 'Abominable_Santa', recipe: ['Perfect Snowball', [4], 'Santa Suit', [5]]},
        {name: 'Icy_Kisses', recipe: ['Perfect Snowball', [4], 'Mistletoe', [5]]},
        {name: 'Sexy_Santa', recipe: ['Santa Suit', [4], 'Mistletoe', [5]]},
        {name: 'Christmas_Cheer', recipe: ['Abominable Santa', [3], 'Icy Kisses', [4], 'Sexy Santa', [5]]},
        {name: 'Gingerbread_Doomslayer', recipe: ['Gingerbread Kitana', [4], 'Gingerbread Marston', [5]]},
        {name: 'Mario_Christmas', recipe: ['Millenium Falcon Gingerbread', [4], 'Gingerbread AT Walker', [5]]},
        {name: 'Baby_Yoda_With_Gingerbread', recipe: ['Gingerbread Doomslayer', [4], 'Mario Christmas', [5]]},
      ],
      [
        {name: 'Grievous', recipe: ['Santa Claus Is Out There', [3], 'Back to the Future', [4], 'Gremlins', [5]]},
        {name: 'Mando', recipe: ['Picard', [0], 'Braveheart', [1], 'Indy', [2]]},
        {name: 'Doomguy', recipe: ['Big Lebowski', [6], 'Die Hard', [7], 'Jurassic Park', [8]]},
        {name: 'Have_a_Breathtaking_Christmas', recipe: ['Grievous', [1], 'Mando', [4], 'Doomguy', [7]]},
        {name: 'Young_Snowman', recipe: ['snowman', [4], 'snowman cookie', [1, 3, 5, 7]]},
      ],
    ],
    Birthday: [
      [
        {name: 'Future_Gazelle', recipe: ['Ripped Gazelle', [3], 'Gamer Gazelle', [4]]},
        {name: 'Alien_Gazelle', recipe: ['Ripped Gazelle', [3], 'Fancy Gazelle', [4]]},
        {name: 'Lucky_Gazelle', recipe: ['Fancy Gazelle', [4], 'Gamer Gazelle', [5]]},
        {name: 'Supreme_Gazelle', recipe: ['Future Gazelle', [3], 'Alien Gazelle', [4], 'Lucky Gazelle', [5]]},
        {name: 'birthday_licks_badge_-_9th', recipe: ['lick badge bits', [3, 4, 5, 6, 7, 8]]},
      ],
      [
        {name: 'A_Fair_Fight', recipe: ['Exodus Truce', [4], 'Gazelle Breaking Bad', [5]]},
        {name: 'What_an_Adventure', recipe: ['Home Sweet Home', [4], 'Birthday Battle Kart', [5]]},
        {name: 'After_Party', recipe: ['A Fair Fight', [4], 'What an Adventure', [5]]},
        {name: 'birthday_gazelle_badge_-_10th', recipe: ['birthday leaves', [0, 2, 3, 5, 6, 8]]},
      ],
      [
        {name: 'Dr_Mario', recipe: ['Bill Rizer', [3], 'Donkey Kong', [4], 'Duck Hunt Dog', [5]]},
        {name: 'Link', recipe: ['Pit', [3], 'Little Mac', [4], 'Mega Man', [5]]},
        {name: 'Kirby', recipe: ['Pac-Man', [3], 'Samus Aran', [4], 'Simon Belmont', [5]]},
        {name: 'Black_Mage', recipe: ['Dr Mario', [0], 'Link', [4], 'Kirby', [8]]},
        {name: 'birthday_gazelle_badge_-_11th', recipe: ['party pipe badge bit', [0, 4, 5, 8]]},
      ],
      [
        {name: '12th_birthday_badge', recipe: ['slice of birthday cake', [0, 2, 4, 6, 8]]},
        {name: 'Red_Dragon', recipe: ['Dins flame', [4], 'Who Eats Whom', [0], 'Baby Yoda With Gingerbread', [1], 'After Party', [2], 'Lame Pumpkin Trio', [6], 'Christmas Cheer', [7], 'Supreme Gazelle', [8]]},
        {name: 'Green_Dragon', recipe: ['Farores flame', [4], 'Who Eats Whom', [0], 'Baby Yoda With Gingerbread', [1], 'After Party', [2], 'Lame Pumpkin Trio', [6], 'Christmas Cheer', [7], 'Supreme Gazelle', [8]]},
        {name: 'Blue_Dragon', recipe: ['Nayrus flame', [4], 'Who Eats Whom', [0], 'Baby Yoda With Gingerbread', [1], 'After Party', [2], 'Lame Pumpkin Trio', [6], 'Christmas Cheer', [7], 'Supreme Gazelle', [8]]},
        {name: 'Gold_Dragon', recipe: ['golden egg', [4], 'Who Eats Whom', [0], 'Baby Yoda With Gingerbread', [1], 'After Party', [2], 'Lame Pumpkin Trio', [6], 'Christmas Cheer', [7], 'Supreme Gazelle', [8]]},
      ],
    ],
    Valentines: [
      [
        {name: 'Kirlia_and_Meloetta', recipe: ['Sonic and Amy', [3], 'Valentine sugar heart', [4], 'Yoshi and Birdo', [5]]},
        {name: 'Dom_and_Maria', recipe: ['Aerith and Cloud', [3], 'Valentine sugar heart', [4], 'Master Chief and Cortana', [5]]},
        {name: 'Mr_and_Mrs_Pac_Man', recipe: ['Kirlia and Meloetta', [3], 'Valentine sugar heart', [4], 'Dom and Maria', [5]]},
        {name: 'Angelise_Reiter', recipe: ['Chainsaw Chess', [3], 'Valentine chocolate heart', [4], 'Chainsaw Wizard', [5]]},
        {name: 'Sophitia', recipe: ['Ivy Valentine', [3], 'Valentine chocolate heart', [4], 'Jill Valentine', [5]]},
        {name: 'Yennefer', recipe: ['Angelise Reiter', [3], 'Valentine chocolate heart', [4], 'Sophitia', [5]]},
      ],
      [
        {name: 'vegetal_symbol', recipe: ['Valentine rose', [1, 3, 5, 7]], result: 'Symbol of love'},
        {name: 'mineral_symbol', recipe: ['ruby', [0, 2, 6, 8]], result: 'Symbol of love'},
        {name: 'Cupids_magical_feather', recipe: ['quartz bar', [0, 2], 'jade bar', [1], 'gold ore', [4], 'amethyst dust', [7]]},
        {name: 'Cupids_winged_boots', recipe: ['Symbol of love', [1], 'Old worn boots', [4], 'Cupids magical feather', [6, 8]]},
        {name: 'Valentine_2022_Badge', recipe: ['rose petals', [0, 2, 4, 6, 8]]},
        {name: 'special_box', recipe: ['Mr and Mrs Pac Man', [0], 'Black Mage', [2], 'Yennefer', [6], 'King Boo', [8]]},
      ],
    ],
    Halloween: [
      [
        {name: 'Stormrage_Pumpkin', recipe: ['Rotting Pumpkin', [4], 'Carved Pumpkin', [5]]},
        {name: 'Russian_Pumpkin', recipe: ['Carved Pumpkin', [4], 'Ripe Pumpkin', [5]]},
        {name: 'Green_Mario_Pumpkin', recipe: ['Ripe Pumpkin', [4], 'Rotting Pumpkin', [5]]},
        {name: 'Lame_Pumpkin_Trio', recipe: ['Stormrage Pumpkin', [3], 'Russian Pumpkin', [4], 'Green Mario Pumpkin', [5]]},
        {name: 'Halloween_Pumpkin_Badge', recipe: ['pumpkin badge bits', [3, 4, 5, 6, 7, 8]]},
      ],
      [
        {name: 'Memory_Boost', recipe: ['Bloody Mario', [4], 'Mommys Recipe', [5]]},
        {name: 'Skultilla_The_Cake_Guard', recipe: ['Link Was Here', [4], 'Gohma Sees You', [5]]},
        {name: 'Who_Eats_Whom', recipe: ['Memory Boost', [4], 'Skultilla The Cake Guard', [5]]},
        {name: 'Halloween_Cupcake_Badge', recipe: ['cupcake crumbles', [3, 4, 5, 6, 7, 8]]},
      ],
      [
        {name: 'Ghostbusters', recipe: ['Blinky', [3], 'Clyde', [4]]},
        {name: 'Boo', recipe: ['Pinky', [3], 'Inky', [4]]},
        {name: 'King_Boo', recipe: ['Ghostbusters', [3], 'Boo', [4]]},
        {name: 'Tombstone_Badge', recipe: ['haunted tombstone shard', [0, 1, 2, 6, 7, 8]]},
      ],
    ],
    Adventure_Club: [
      [
        {name: 'regenerate', recipe: ['glowing leaves', [4]]},
        {name: 'hypnosis', recipe: ['glowing leaves', [3, 4, 5]]},
        {name: 'muddle', recipe: ['glowing leaves', [1, 4, 7]]},
        {name: 'parasite', recipe: ['glowing leaves', [0, 1, 2, 6, 7, 8]]},
        {name: 'burst_of_light', recipe: ['condensed light', [4]]},
        {name: 'dark_orb', recipe: ['bottled ghost', [4]]},
        {name: 'burning_ash_cloud', recipe: ['glowing ash', [1, 3, 4, 5, 7]]},
      ],
      [
        {name: '3_backpack_slots', recipe: ['cloth', [4], 'hide', [3, 5]]},
        {name: '4_backpack_slots', recipe: ['cloth', [4], 'hide', [1, 3, 5, 7]]},
        {name: '6_backpack_slots', recipe: ['cloth', [0, 2, 6, 8], 'hide', [1, 3, 5, 7], 'advanced hide', [4]]},
        {name: 'scrappy_gauntlets', recipe: ['scrap', [1, 4, 7]]},
        {name: 'troll_tooth_necklace', recipe: ['scrap', [7], 'hide', [1], 'troll tooth', [3, 4, 5]]},
      ],
    ],
    Bling: [
      [
        {name: 'Unity_Necklace', recipe: ['Dins flame', [0], 'Farores flame', [1], 'Nayrus flame', [2], 'gold bar', [3], 'flawless amethyst', [4], 'jade bar', [5], 'carbon-crystalline quartz', [6, 7, 8]]},
        {name: 'Flame_Badge', recipe: ['Dins flame', [0], 'Farores flame', [7], 'Nayrus flame', [2], 'flawless amethyst', [4]]},
        {name: 'Nayrus_Username', recipe: ['Nayrus flame', [3], 'green onyx gem', [4]]},
        {name: 'Farores_Username', recipe: ['Farores flame', [3], 'green onyx gem', [4]]},
        {name: 'Dins_Username', recipe: ['Dins flame', [3], 'green onyx gem', [4]]},
        {name: 'Dwarven_Discoball', recipe: ['dwarven gem', [0, 1, 2, 3, 4, 5, 6, 7, 8]]},
        {name: 'irc_voice_8w', recipe: ['irc voice 2w', [3, 4, 5]]},
        {name: 'irc_voice_8w_-_low_cost', recipe: ['irc voice 2w - low cost', [1, 3, 4, 5]], result: 'irc voice 8w'},
        {name: 'irc_voice_1y', recipe: ['irc voice 8w', [0, 1, 2, 3, 4, 5], 'sapphire', [7]]},
      ],
    ],
  };
  ///
  // #endregion Recipe definitions
  //
  //
  // #endregion >>>BEGIN<<< Rarely updated data
  //

  //
  // #region Main functions
  //
  const authKey = new URLSearchParams($('link[rel="alternate"]').attr('href')).get('authkey');
  const urlBase = (customRecipe) =>
    `https://gazellegames.net/user.php?action=ajaxtakecraftingresult&recipe=${customRecipe}&auth=${authKey}`;
  const blankSlot = 'EEEEE';
  const slots = new Array(9).fill(blankSlot);

  function reset_slots() {
    slots.fill(blankSlot);
  }

  function getSlots() {
    return slots.join('');
  }

  function titleCaseFromUnderscored(str) {
    return str.replace(/_/g, ' ').replace(/(?:^|\s)\w/g, function (match) {
      return match.toUpperCase();
    });
  }

  //
  // #region Stylesheets
  //
  const styleExtraBookSpace = $(`<style>
.recipe_buttons {
    row-gap: 1rem;
}
</style>`);
  const styleIngredientQuantity = $(`<style>
.ingredient_quantity {
    flex-direction: row;
}
</style>`);
  const styleIngredientQuantitySwap = $(`<style>
.ingredient_quantity {
    flex-direction: row-reverse;
}
</style>`);
  const head = $('head');
  head.append(`<style>
.disabled {
    background-color: #333 !important;
    color: #666 !important;
    pointer-events: none;
}
a.disabled {
    pointer-events: none;
}
.quick_craft_button {
    margin-left: 2rem;
    background-color: orange;
}
.quick_craft_button_confirm {
    background-color: red;
}
.recipe_buttons {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
}
</style>`);
  if (GM_getValue('SEG', false)) {
    head.append(styleExtraBookSpace);
  }
  if (GM_getValue('NHswitch', false)) {
    head.append(styleIngredientQuantitySwap);
  } else {
    head.append(styleIngredientQuantity);
  }
  //
  // #endregion Stylesheets
  //

  //
  // #region Crafting menu and logic
  //

  const gmKeyCurrentCraft = 'current_craft';

  const ingredients_available = [];
  var craftingSubmenu;
  var isCrafting = false;

  var tradeInventory;
  var fetching = false;

  async function get_trade_inv() {
    if (fetching || tradeInventory) {
      while (!tradeInventory) await new Promise((r) => setTimeout(r, 30));
      return tradeInventory;
    } else {
      fetching = true;
      return $.ajax({
        url: 'https://gazellegames.net/user.php?action=trade&userid=0',
        success: function (data) {
          tradeInventory = data;
          return data;
        },
      });
    }
  }

  function take_craft(craft_name) {
    $.get(urlBase(getSlots()), function (data) {
      console.log(data);
      console.log(data.EquipID);

      if (data === '{}' || data.EquipId !== '') {
        window.noty({type: 'success', text: `${craft_name} was crafted successfully.`});
      } else {
        window.noty({type: 'error', text: `${craft_name} failed.`});
        alert(`Crafting failed. Response from server: ${data}`);
      }
    });
  }

  function close_crafting_submenu() {
    if (craftingSubmenu) {
      craftingSubmenu.remove();
      GM_deleteValue(gmKeyCurrentCraft);
    }
  }

  async function open_crafting_submenu(craft_name, recipe, result, purchasable) {
    if (isCrafting) return;

    if (ingredients_available[result] === undefined) {
      if (ingredients[result] !== undefined) {
        ingredients_available[result] =
          $(`#items-wrapper .item[data-item='${ingredients[result]}'] .item_count`).text() ||
          $(`#items-wrapper .item[data-item='${ingredients[result]}']`).length;
      } else if (non_ingredients[result] !== undefined) {
        ingredients_available[result] = (
          (await get_trade_inv()).match(RegExp(`data-item='${non_ingredients[result]}'`, 'g')) || []
        ).length;
      }
    }

    const currentCraft = {available: Number.MAX_SAFE_INTEGER, ingredients: []};
    for (var i = 0; i < recipe.length / 2; ++i) {
      const ingr = recipe[2 * i];
      const qty = recipe[2 * i + 1].length;
      if (ingredients_available[ingr] !== undefined) {
        var onhand = ingredients_available[ingr];
      } else {
        onhand =
          $(`#items-wrapper .item[data-item='${ingredients[ingr]}'] .item_count`).text() ||
          $(`#items-wrapper .item[data-item='${ingredients[ingr]}']`).length;
      }
      ingredients_available[ingr] = onhand;
      const avail = Math.floor(onhand / qty);
      if (avail < currentCraft.available) {
        currentCraft.available = avail;
      }
      currentCraft.ingredients[i] = {
        name: ingr,
        id: ingredients[ingr],
        qty: qty,
        'on hand': onhand,
      };
    }

    const createCraftingActions = (available) => {
      if (available <= 0) {
        return '';
      }
      var craftNumberSelect;

      const doCraft = async () => {
        // Disable crafting buttons and craft switching
        isCrafting = true;
        $('#crafting-submenu button, #crafting-submenu select').prop('disabled', true).addClass('disabled');

        var craftNumber = craftNumberSelect.children('option:selected').val();

        await (async () => {
          for (let i = 0; i < craftNumber; i++) {
            await new Promise((resolve) =>
              setTimeout(function () {
                reset_slots();
                for (var j = 0; j < recipe.length / 2; j++) {
                  var ingr = recipe[2 * j];
                  for (var k = 0; k < recipe[2 * j + 1].length; k++) {
                    slots[recipe[2 * j + 1][k]] = ingredients[ingr];
                    ingredients_available[ingr]--;
                  }
                }
                take_craft(craft_name);
                if (ingredients_available[result] != undefined) {
                  ingredients_available[result]++;
                }
                resolve();
              }, CRAFT_TIME),
            );
          }
          isCrafting = false;
          await open_crafting_submenu(craft_name, recipe, result, purchasable);
        })();
      };

      return $('<div>')
        .css({display: 'flex', flexDirection: 'row', columnGap: '.25rem', alignItems: 'center', alignSelf: 'center'})
        .append(
          (craftNumberSelect = $('<select>').append(
            Array(currentCraft.available)
              .fill()
              .map((_, i) => `<option value="${i + 1}">${i + 1}</option>`),
          )),
        )
        .append($('<button>Craft</button>').click(doCraft))
        .append(
          $('<button class="quick_craft_button">Craft maximum</button>').click(function () {
            if (!$(this).hasClass('quick_craft_button_confirm')) {
              craftNumberSelect.val(currentCraft.available);
              $(this).text('** CONFIRM **').addClass('quick_craft_button_confirm');
            } else {
              $(this).text('-- crafting --');
              doCraft();
            }
          }),
        );
    };

    close_crafting_submenu();
    GM_setValue(gmKeyCurrentCraft, craft_name);

    const createIngredientLine = (ingredient, maxWithPurchase) => {
      const {name: ingredName, 'on hand': qtyOnHand, qty: qtyPerCraft} = ingredient;
      return $('<div>')
        .css({
          // Color ingredients marked purchased
          ...(purchasable.includes(ingredName) ? {color: 'lightGreen'} : {}),
          display: 'flex',
          flexDirection: 'row',
          columnGap: '.25rem',
          alignItems: 'center',
          alignSelf: 'center',
        })
        .append(
          $('<a class="quick_craft_button">$</a>')
            .attr('href', `https://gazellegames.net/shop.php?ItemID=${ingredients[ingredName].replace(/^0+/, '')}`)
            .attr('target', '_blank')
            .css({
              borderRadius: '50%',
              backgroundColor: 'yellow',
              color: 'black',
              cursor: 'pointer',
              padding: '0 .25rem',
            }),
          `${titleCaseFromUnderscored(ingredName)}:`,
          `<div style="display: inline-flex;" class="ingredient_quantity"><span>${qtyOnHand}</span><span>/</span><span>${qtyPerCraft}</span></div>`,
          maxWithPurchase > qtyOnHand / qtyPerCraft
            ? `<span title="Needed for max possible crafts"> (+${maxWithPurchase * qtyPerCraft - qtyOnHand})</span>`
            : '',
        )
        .click(() => {
          if (purchasable.includes(ingredName)) {
            delete purchasable[purchasable.indexOf(ingredName)];
            purchasable = purchasable.flat();
          } else if (purchasable.length < currentCraft.ingredients.length - 1) purchasable.push(ingredName);
          close_crafting_submenu();
          open_crafting_submenu(craft_name, recipe, result, purchasable);
        });
    };

    const maxWithPurchase = purchasable.length
      ? Math.min(
          ...currentCraft.ingredients.map((ingredient) =>
            purchasable.includes(ingredient.name)
              ? Number.MAX_SAFE_INTEGER
              : Math.floor(ingredient['on hand'] / ingredient.qty),
          ),
        )
      : currentCraft.available;

    $('#current_craft_box').append(
      (craftingSubmenu = $('<div id="crafting-submenu">')
        .css({textAlign: 'center', marginBottom: '1rem', display: 'flex', flexDirection: 'column', rowGap: '1rem'})
        .append(
          $('<div>')
            .text(titleCaseFromUnderscored(result))
            .css({marginBottom: '.5rem'})
            .append(
              ingredients_available[result] !== undefined ? ` (${ingredients_available[result]} in inventory)` : '',
            ),
        )
        .append('<div style="margin-bottom: .5rem;">Ingredients:</div>')
        .append(
          $('<div>')
            .css({display: 'flex', flexDirection: 'column'})
            .append(currentCraft.ingredients.map((ingredient) => createIngredientLine(ingredient, maxWithPurchase))),
        )
        .append(
          $(`<span>`)
            .text(`Max available craft(s): ${currentCraft.available}`)
            .css({marginBottom: '1rem'})
            .append(
              currentCraft.available !== maxWithPurchase
                ? $(`<span>`)
                    .text(`(${maxWithPurchase})`)
                    .prop('title', 'Max possible if additional ingredients are purchased')
                    .css({marginLeft: '5px'})
                : '',
              $('<a>')
                .text('?')
                .attr(
                  'title',
                  'Click ingredients to mark as purchasable and calculate +purchase needed and max possible crafted.',
                )
                .wrap('<sup>')
                .parent(),
            ),
        )
        .append(createCraftingActions(currentCraft.available))),
    );
  }
  //
  // #endregion Crafting menu and logic
  //

  //
  // #region Create Recipe Book and Recipe buttons
  //

  var saveDebounce;

  //
  // Creates a Recipe button.
  //
  const createRecipeButton = (book, {name, recipe, result = name.replace(/_/g, ' ')}) => {
    return $(`<button id="${name}">${titleCaseFromUnderscored(name)}</button>`)
      .css({
        backgroundColor: book.bgcolor,
        color: book.color,
        border: '2px solid transparent',
        marginTop: '3px',
        marginRight: '5px',
      })
      .focus(function () {
        document.getElementById(name).style.border = '2px solid red';
      })
      .blur(function () {
        document.getElementById(name).style.border = '2px solid transparent';
      })
      .click(() => open_crafting_submenu(name.replace(/_/g, ' '), recipe, result, []));
  };

  $('#crafting_recipes').before(
    '<div style="clear: both; margin-bottom: 1rem;">',
    $('<div id="quick-crafter">')
      .css({
        display: 'block',
        margin: '0 auto 1rem',
        backgroundColor: 'rgba(19,9,0,.7)',
        padding: '5px',
        width: '100%',
        maxWidth: '1100px',
        minWidth: '200px',
      })
      .append(
        '<div id="current_craft_box">',
        '<p>Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better experience.</p>',
        $('<button class="quick_craft_button">Clear</button>')
          .css({marginBottom: '1rem', backgroundColor: 'red'})
          .click(() => close_crafting_submenu()),
        $('<div>')
          .css({display: 'flex', flexDirection: 'row', columnGap: '.25rem', alignItems: 'center'})
          .append(
            '<span>Click on the buttons below to show or hide crafting categories - </span>',
            $('<button class="quick_craft_button">Hide all</button>')
              .css({backgroundColor: 'red'})
              .click(function () {
                Object.values(books).forEach(({disabled, button}) => {
                  if (!disabled) button.click();
                });
              }),
            $('<button class="quick_craft_button">Show all</button>')
              .css({backgroundColor: 'green'})
              .click(function () {
                Object.values(books).forEach(({disabled, button}) => {
                  if (disabled) button.click();
                });
              }),
            $('<input type="checkbox" class="quick_craft_button">Blank line between books</input>')
              .prop('checked', GM_getValue('SEG', false))
              .change(function () {
                const checked = $(this).prop('checked');
                if (checked) {
                  $('head').append(styleExtraBookSpace);
                } else {
                  styleExtraBookSpace.remove();
                }
                GM_setValue('SEG', checked);
              }),
            $(
              '<input type="checkbox" class="quick_craft_button" title="Switches between needed/have and have/needed">NH switch</input>',
            )
              .prop('checked', GM_getValue('NHswitch', false))
              .change(function () {
                const checked = $(this).prop('checked');
                if (checked) {
                  styleIngredientQuantity.remove();
                  $('head').append(styleIngredientQuantitySwap);
                } else {
                  styleIngredientQuantitySwap.remove();
                  $('head').append(styleIngredientQuantity);
                }
                GM_setValue('NHswitch', checked);
              }),
          ),
      )

      //
      // #region Add "Recipe Book" on/off buttons to DOM
      //
      .append(
        $('<div>')
          .css({marginBottom: '2rem', display: 'flex', flexDirection: 'row', columnGap: '.25rem', alignItems: 'center'})
          .append(
            Object.keys(books).map((name) => {
              const book = books[name];
              const {bgcolor, color, disabled} = book;

              book.button = $(`<button id="${name}" class="qcbutton_book">${name.replace(/_/g, ' ')}</button>`)
                .css({backgroundColor: bgcolor, color: color, opacity: 1})
                .click(function () {
                  if (saveDebounce) window.clearTimeout(saveDebounce);
                  const button = $(this);
                  const disabled = (book.disabled = !book.disabled);
                  button.css('opacity', disabled ? 0.2 : 1);
                  $(book.section).css('display', disabled ? 'none' : '');
                  if (book.hasOwnProperty('recipes'))
                    book.recipes.forEach((elem) => $(elem).prop('disabled', disabled));
                  saveDebounce = window.setTimeout(() => GM_setValue('selected_books', books), 100);
                });
              if (disabled) {
                book.disabled = false;
                book.button.click();
              }
              return book.button;
            }),
          ),
      )
      //
      // #endregion Add "Recipe Book" on/off buttons to DOM
      //

      //
      // #region Add Recipe buttons to DOM
      //
      .append(
        $('<div class="recipe_buttons">').append(
          Object.keys(recipes).map((bookKey) => {
            const book = books[bookKey];
            book.recipes = [];
            book.section = $('<div class="recipe_book_section">')
              .append(
                recipes[bookKey].map((recipeList) => {
                  const subsection = $('<div class="recipe_book_subsection">').append(
                    recipeList.map((recipe) => {
                      const recipeButton = createRecipeButton(book, recipe);
                      book.recipes.push(recipeButton);
                      return recipeButton;
                    }),
                  );
                  return subsection;
                }),
              )
              .css({display: book.disabled ? 'none' : ''});
            return book.section;
          }),
        ),
      )
      //
      // #endregion Add Recipe buttons to DOM
      //

      .append(
        `<p style="float:right;margin-top:-20px;margin-right:5px;">Quick Crafter by <a href="/user.php?id=58819">KingKrab23</a> v<a href="https://github.com/KingKrab23/Quick_Craft/raw/master/GGn%20Quick%20Crafting.user.js">${VERSION}</a></p>`,
      ),
  );

  // Persist selected recipe
  $(`#${GM_getValue(gmKeyCurrentCraft).replace(/ /g, '_')}`).click();
  // Can block, so we prefetch last
  await get_trade_inv();

  //
  // #endregion Create Recipe Book and Recipe buttons
  //

  //
  // #endregion Main functions
  //
})(unsafeWindow || window, (unsafeWindow || window).jQuery, GM_info.script.version);
