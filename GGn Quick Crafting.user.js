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
// @require      https://code.jquery.com/jquery-3.6.0.min.js
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
  const TEN_SECOND_DELAY_MILLIS = 11000;

  // Query the user for an API key. This is only done once, and the result is stored in script storage
  function getApiKey() {
    const key = GM_getValue('forumgames_apikey');
    if (!key) {
      const input = window.prompt(`Please input your GGn API key.
  If you don't have one, please generate one from your Edit Profile page: https://gazellegames.net/user.php?action=edit.
  The API key must have "Items" permission

  Please disable this userscript until you have one as this prompt will continue to show until you enter one in.`);
      const trimmed = input.trim();

      if (/[a-f0-9]{64}/.test(trimmed)) {
        GM_setValue('forumgames_apikey', trimmed);
        return trimmed;
      }
    }

    return key;
  }

  const API_KEY = getApiKey();

  // Execute an API call and also handle throttling to 5 calls per 10 seconds
  async function apiCall(options) {
    while (true) {
      const tenSecondTime = parseInt(window.localStorage.quickCrafterTenSecondTime) || 0;
      const nowTimeBeforeWait = new Date().getTime();
      if (
        (parseInt(window.localStorage.quickCrafterApiRequests) || 0) >= 5 &&
        nowTimeBeforeWait - tenSecondTime < TEN_SECOND_DELAY_MILLIS
      ) {
        log(
          `Waiting ${((TEN_SECOND_DELAY_MILLIS - (nowTimeBeforeWait - tenSecondTime)) / 1000).toFixed(
            1,
          )} seconds for more API calls.`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, TEN_SECOND_DELAY_MILLIS - (nowTimeBeforeWait - tenSecondTime)),
        );
      } else {
        break;
      }
    }
    const nowTime = new Date().getTime();
    if (nowTime - (parseInt(window.localStorage.quickCrafterTenSecondTime) || 0) > TEN_SECOND_DELAY_MILLIS) {
      window.localStorage.quickCrafterTenSecondTime = nowTime;
      window.localStorage.quickCrafterApiRequests = 0;
    }
    window.localStorage.quickCrafterApiRequests = parseInt(window.localStorage.quickCrafterApiRequests) + 1;
    debug('API call', options.data);
    return $.ajax({
      ...options,
      method: 'GET',
      url: '/api.php',
      headers: {'X-API-Key': API_KEY},
    });
  }

  function logToConsole(logMethod, ...args) {
    const resolvedArgs = args.map((arg) => (typeof arg === 'function' ? arg() : arg));
    logMethod(...resolvedArgs);
  }

  const SCRIPT_START = new Date();
  function timing(message, ...args) {
    // logToConsole(console.debug, () => `[GGn Quick Crafting] (${new Date() - SCRIPT_START}) ${message}`, ...args);
  }

  function debug(message, ...args) {
    //logToConsole(console.debug, `[GGn Quick Crafting] ${message}`, ...args);
  }

  function log(message, ...args) {
    logToConsole(console.log, `[GGn Quick Crafting] ${message}`, ...args);
  }

  function error(message, ...args) {
    logToConsole(console.error, `[GGn Quick Crafting] ${message}`, ...args);
  }

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
  // Maps ingredient IDs to partial info about them from API
  //
  // prettier-ignore
  const ingredients = {
    66: {name: 'Upload Potion Sampler', image: 'static/common/items/Items/Potions/sample_green.png'},
    72: {name: 'IRC Voice (2 Weeks)', image: 'static/common/items/Items/Buff/irc_voice_cheap.png'},
    98: {name: 'Small Upload Potion', image: 'static/common/items/Items/Potions/small_green.png'},
    99: {name: 'Upload Potion', image: 'static/common/items/Items/Potions/green.png'},
    100: {name: 'Large Upload Potion', image: 'static/common/items/Items/Potions/large_green.png'},
    104: {name: 'Download-Reduction Potion Sampler', image: 'static/common/items/Items/Potions/sample_red.png'},
    105: {name: 'Small Download-Reduction Potion', image: 'static/common/items/Items/Potions/small_red.png'},
    106: {name: 'Download-Reduction Potion', image: 'static/common/items/Items/Potions/red.png'},
    107: {name: 'Large Download-Reduction Potion', image: 'static/common/items/Items/Potions/large_red.png'},
    111: {name: 'Purple Angelica Flowers', image: 'static/common/items/Items/Plants/angelica_flowers.png'},
    112: {name: 'Head of Garlic', image: 'static/common/items/Items/Plants/garlic.png'},
    113: {name: 'Yellow Hellebore Flower', image: 'static/common/items/Items/Plants/hellebore_flower.png'},
    114: {name: 'Black Elderberries', image: 'static/common/items/Items/Plants/black_elder_berries.png'},
    115: {name: 'Black Elder Leaves', image: 'static/common/items/Items/Plants/black_elder_leaves.png'},
    116: {name: 'Emerald', image: 'static/common/items/Items/Gems/emerald.png'},
    120: {name: 'Green Onyx Gem', image: 'static/common/items/Items/Gems/green_onyx.png'},
    121: {name: 'Flawless Amethyst', image: 'static/common/items/Items/Gems/flawless_amethyst.png'},
    124: {name: 'Vial', image: 'static/common/items/Items/Vials/vial.png'},
    125: {name: 'Test Tube', image: 'static/common/items/Items/Vials/test_tube.png'},
    126: {name: 'Bowl', image: 'static/common/items/Items/Vials/bowl.png'},
    127: {name: 'Garlic Tincture', image: 'static/common/items/Items/Plants/garlic_tincture.png'},
    175: {name: 'IRC Voice (2 Weeks) - Low Cost Option', image: 'static/common/items/Items/Buff/irc_voice_cheap.png'},
    1987: {name: 'Pile of Sand', image: 'static/common/items/Items/Vials/sand.png'},
    1988: {name: 'Glass Shards', image: 'static/common/items/Items/Vials/shards.png'},
    2153: {name: 'Farore&#39;s Flame', image: 'static/common/items/Items/Bling/flame_green.png'},
    2154: {name: 'Nayru&#39;s Flame', image: 'static/common/items/Items/Bling/flame_blue.png'},
    2155: {name: 'Din&#39;s Flame', image: 'static/common/items/Items/Bling/flame_red.png'},
    2212: {name: 'IRC Voice (8 Weeks)', image: 'static/common/items/Items/Buff/irc_voice_cheap.png'},
    2225: {name: 'Bronze Alloy Mix', image: 'static/common/items/Items/Ore/bronze.png'},
    2226: {name: 'Iron Ore', image: 'static/common/items/Items/Ore/iron.png'},
    2227: {name: 'Gold Ore', image: 'static/common/items/Items/Ore/gold.png'},
    2228: {name: 'Mithril Ore', image: 'static/common/items/Items/Ore/mithril.png'},
    2229: {name: 'Adamantium Ore', image: 'static/common/items/Items/Ore/adamantium.png'},
    2230: {name: 'Quartz Dust', image: 'static/common/items/Items/Ore/quartz.png'},
    2231: {name: 'Jade Dust', image: 'static/common/items/Items/Ore/jade.png'},
    2232: {name: 'Amethyst Dust', image: 'static/common/items/Items/Ore/amethyst.png'},
    2233: {name: 'Lump of Coal', image: 'static/common/items/Items/Ore/coal.png'},
    2234: {name: 'Lump of Clay', image: 'static/common/items/Items/Ore/clay.png'},
    2235: {name: 'Bronze Bar', image: 'static/common/items/Items/Ore/bronze_bar.png'},
    2236: {name: 'Impure Bronze Bar', image: 'static/common/items/Items/Ore/impure_bronze_bar.png'},
    2237: {name: 'Iron Bar', image: 'static/common/items/Items/Ore/iron_bar.png'},
    2238: {name: 'Steel Bar', image: 'static/common/items/Items/Ore/steel_bar.png'},
    2239: {name: 'Gold Bar', image: 'static/common/items/Items/Ore/gold_bar.png'},
    2240: {name: 'Mithril Bar', image: 'static/common/items/Items/Ore/mithril_bar.png'},
    2241: {name: 'Adamantium Bar', image: 'static/common/items/Items/Ore/adamantium_bar.png'},
    2242: {name: 'Quartz Bar', image: 'static/common/items/Items/Ore/quartz_bar.png'},
    2243: {name: 'Jade Bar', image: 'static/common/items/Items/Ore/jade_bar.png'},
    2244: {name: 'Amethyst Bar', image: 'static/common/items/Items/Ore/amethyst_bar.png'},
    2261: {name: 'Impure Bronze Cuirass', image: 'static/common/items/Cover/Body Armor/Impure_Bronze_Cuirass.png'},
    2262: {name: 'Bronze Cuirass', image: 'https://ptpimg.me/3mf3lw.png'},
    2263: {name: 'Iron Cuirass', image: 'static/common/items/Cover/Body Armor/Iron_Cuirass.png'},
    2264: {name: 'Steel Cuirass', image: 'static/common/items/Cover/Body Armor/Steel_Cuirass.png'},
    2265: {name: 'Gold Cuirass', image: 'static/common/items/Cover/Body Armor/Gold_Cuirass.png'},
    2266: {name: 'Mithril Cuirass', image: 'static/common/items/Cover/Body Armor/Mithril_Cuirass.png'},
    2267: {name: 'Adamantium Cuirass', image: 'static/common/items/Cover/Body Armor/Adamantium_Cuirass.png'},
    2268: {name: 'Quartz Chainmail', image: 'static/common/items/Cover/Body Armor/Quartz_Chainmail.png'},
    2269: {name: 'Jade Chainmail', image: 'static/common/items/Cover/Body Armor/Jade_Chainmail.png'},
    2270: {name: 'Amethyst Chainmail', image: 'static/common/items/Cover/Body Armor/Amethyst_Chainmail.png'},
    2295: {name: 'Pile of Snow', image: 'static/common/items/Items/Christmas/snow.png'},
    2296: {name: 'Snowball', image: 'static/common/items/Items/Christmas/snowball_small.png'},
    2297: {name: 'Candy Cane', image: 'static/common/items/Items/Christmas/candycane.png'},
    2298: {name: 'Hot Chocolate', image: 'static/common/items/Items/Christmas/hotchoc.png'},
    2299: {name: 'Peppermint Hot Chocolate', image: 'static/common/items/Items/Christmas/peremint_hotchoc.png'},
    2300: {name: 'Pile of Charcoal', image: 'static/common/items/Items/Christmas/charcoal.png'},
    2303: {name: 'Hyper Realistic Eggnog', image: 'static/common/items/Items/Christmas/eggnog.png'},
    2305: {name: 'Large Snowball', image: 'static/common/items/Items/Christmas/snowball.png'},
    2306: {name: 'Carrot', image: 'static/common/items/Items/Christmas/carrot.png'},
    2307: {name: 'Snowman', image: 'static/common/items/Items/Christmas/snowman.png'},
    2323: {name: 'Ruby', image: 'static/common/items/Items/Gems/ruby.png'},
    2357: {name: 'The Golden Daedy', image: 'static/common/items/Items/Card/Staff_The_Golden_Daedy.png'},
    2358: {name: 'A Wild Artifaxx', image: 'static/common/items/Items/Card/Staff_A_Wild_Artifaxx.png'},
    2359: {name: 'A Red Hot Flamed', image: 'static/common/items/Items/Card/Staff_A_Red_Hot_Flamed.png'},
    2361: {name: 'Alpaca Out of Nowhere!', image: 'static/common/items/Items/Card/Staff_Alpaca_Out_of_Nowhere.png'},
    2364: {name: 'thewhale&#39;s Kiss', image: 'static/common/items/Items/Card/Staff_thewhales_Kiss.png'},
    2365: {name: 'Stump&#39;s Banhammer', image: 'static/common/items/Items/Card/Staff_Stumps_Banhammer.png'},
    2366: {name: 'Neo&#39;s Ratio Cheats', image: 'static/common/items/Items/Card/Staff_Neos_Ratio_Cheats.png'},
    2367: {name: 'Niko&#39;s Transformation', image: 'static/common/items/Items/Card/Staff_Nikos_Transformation.png'},
    2368: {name: 'lepik le prick', image: 'static/common/items/Items/Card/Staff_lepik_le_prick.png'},
    2369: {name: 'The Golden Throne', image: 'static/common/items/Items/Card/Staff_The_Golden_Throne.png'},
    2370: {name: 'The Biggest Banhammer', image: 'static/common/items/Items/Card/Staff_The_Biggest_Banhammer.png'},
    2371: {name: 'The Staff Beauty Parlor', image: 'static/common/items/Items/Card/Staff_The_Staff_Beauty_Parlor.png'},
    2372: {name: 'The Realm of Staff', image: 'static/common/items/Items/Card/Staff_The_Realm_of_Staff.png'},
    2373: {name: 'Cake', image: 'static/common/items/Items/Card/Portal_Cake.png'},
    2374: {name: 'GLaDOS', image: 'static/common/items/Items/Card/Portal_GLaDOS.png'},
    2375: {name: 'Companion Cube', image: 'static/common/items/Items/Card/Portal_Companion_Cube.png'},
    2376: {name: 'Portal Gun', image: 'static/common/items/Items/Card/Portal_Portal_Gun.png'},
    2377: {name: 'A Scared Morty', image: 'static/common/items/Items/Card/Portal_A_Scared_Morty.png'},
    2378: {name: 'Rick Sanchez', image: 'static/common/items/Items/Card/Portal_Rick_Sanchez.png'},
    2379: {name: 'Mr. Poopy Butthole', image: 'static/common/items/Items/Card/Portal_Mr_Poopy_Butthole.png'},
    2380: {name: 'Rick&#39;s Portal Gun', image: 'static/common/items/Items/Card/Portal_Ricks_Portal_Gun.png'},
    2381: {name: 'Nyx class Supercarrier', image: 'static/common/items/Items/Card/Portal_Nyx_class_Supercarrier.png'},
    2382: {name: 'Chimera Schematic', image: 'static/common/items/Items/Card/Portal_Chimera_Schematic.png'},
    2383: {name: 'Covetor Mining Ship', image: 'static/common/items/Items/Card/Portal_Covetor_Mining_Ship.png'},
    2384: {name: 'Space Wormhole', image: 'static/common/items/Items/Card/Portal_Space_Wormhole.png'},
    2385: {name: 'Interdimensional Portal', image: 'static/common/items/Items/Card/Portal_Interdimensional_Portal.png'},
    2388: {name: 'MuffledSilence&#39;s Headphones', image: 'static/common/items/Items/Card/Staff_MuffledSilences_Headphones.png'},
    2390: {name: 'Mario', image: 'static/common/items/Items/Card/Mario_Mario.png'},
    2391: {name: 'Luigi', image: 'static/common/items/Items/Card/Mario_Luigi.png'},
    2392: {name: 'Princess Peach', image: 'static/common/items/Items/Card/Mario_Princess_Peach.png'},
    2393: {name: 'Toad', image: 'static/common/items/Items/Card/Mario_Toad.png'},
    2394: {name: 'Yoshi', image: 'static/common/items/Items/Card/Mario_Yoshi.png'},
    2395: {name: 'Bowser', image: 'static/common/items/Items/Card/Mario_Bowser.png'},
    2396: {name: 'Goomba', image: 'static/common/items/Items/Card/Mario_Goomba.png'},
    2397: {name: 'Koopa Troopa', image: 'static/common/items/Items/Card/Mario_Koopa_Troopa.png'},
    2398: {name: 'Wario', image: 'static/common/items/Items/Card/Mario_Wario.png'},
    2400: {name: 'LinkinsRepeater Bone Hard Card', image: 'static/common/items/Items/Card/Staff_LinkinsRepeater_Bone_Hard_Card.png'},
    2401: {name: 'Super Mushroom', image: 'static/common/items/Items/Card/Mario_Super_Mushroom.png'},
    2402: {name: 'Fire Flower', image: 'static/common/items/Items/Card/Mario_Fire_Flower.png'},
    2403: {name: 'Penguin Suit', image: 'static/common/items/Items/Card/Mario_Penguin_Suit.png'},
    2404: {name: 'Goal Pole', image: 'static/common/items/Items/Card/Mario_Goal_Pole.png'},
    2410: {name: 'Z&eacute; do Caix&atilde;o Coffin Joe Card', image: 'static/common/items/Items/Card/Staff_Ze_do_Caixao_Coffin_Joe_Card.png'},
    2421: {name: 'Din&#39;s Lootbox', image: 'static/common/items/Items/Pack/Dins_Lootbox.png'},
    2433: {name: 'Small Luck Potion', image: 'static/common/items/Items/Potions/small_purple.png'},
    2434: {name: 'Large Luck Potion', image: 'static/common/items/Items/Potions/large_purple.png'},
    2436: {name: 'Glass Shards x2', image: 'static/common/items/Items/Vials/shards.png'},
    2437: {name: 'Glass Shards x3', image: 'static/common/items/Items/Vials/shards.png'},
    2438: {name: 'Random Lvl2 Staff Card', image: 'static/common/items/Items/Pack/Random_Lvl2_Staff_Card.png'},
    2465: {name: 'Farore&#39;s Lootbox', image: 'static/common/items/Items/Pack/Farores_Lootbox.png'},
    2466: {name: 'Nayru&#39;s Lootbox', image: 'static/common/items/Items/Pack/Nayrus_Lootbox.png'},
    2468: {name: 'Random Lootbox (Din, Farore, or Nayru)', image: 'static/common/items/Items/Pack/Random_Lootbox.png'},
    2508: {name: 'Dwarven Gem', image: 'static/common/items/Items/Gems/dwarven_gem.png'},
    2537: {name: 'Carbon-Crystalline Quartz', image: 'static/common/items/Items/Gems/carbonquartz.png'},
    2538: {name: 'Carbon-Crystalline Quartz Necklace', image: 'static/common/items/Cover/Jewelry/crystalline.png'},
    2539: {name: 'Silver Ring of Gazellia', image: 'static/common/items/Cover/Jewelry/silvering.png'},
    2549: {name: 'Sapphire', image: 'static/common/items/Items/Gems/sapphire.png'},
    2550: {name: 'Ruby Chip', image: 'static/common/items/Items/Gems/chip_ruby.png'},
    2551: {name: 'Emerald Chip', image: 'static/common/items/Items/Gems/chip_emerald.png'},
    2552: {name: 'Sapphire Chip', image: 'static/common/items/Items/Gems/chip_sapphire.png'},
    2554: {name: 'Unity Flame Necklet', image: 'static/common/items/Cover/Jewelry/unityneck.png'},
    2563: {name: 'Exquisite Constellation of Rubies', image: 'static/common/items/Items/Jewelry/constellation_ruby.png'},
    2564: {name: 'Exquisite Constellation of Sapphires', image: 'static/common/items/Items/Jewelry/constellation_sapphire.png'},
    2565: {name: 'Exquisite Constellation of Emeralds', image: 'static/common/items/Items/Jewelry/constellation_emerald.png'},
    2579: {name: 'Ruby-Flecked Wheat', image: 'static/common/items/Items/Food/wheat_ruby.png'},
    2580: {name: 'Ruby-Grained Baguette', image: 'static/common/items/Items/Food/baguette_ruby.png'},
    2581: {name: 'Garlic Ruby-Baguette', image: 'static/common/items/Items/Food/garlic_ruby.png'},
    2582: {name: 'Artisan Ruby-Baguette', image: 'static/common/items/Items/Food/artisan_ruby.png'},
    2584: {name: 'Unity Flame Band', image: 'static/common/items/Cover/Jewelry/unityring.png'},
    2585: {name: 'Amethyst', image: 'static/common/items/Items/Gems/amethyst.png'},
    2589: {name: 'Ripe Pumpkin', image: 'static/common/items/Items/Card/Halloween_Ripe_Pumpkin.png'},
    2590: {name: 'Rotting Pumpkin', image: 'static/common/items/Items/Card/Halloween_Rotting_Pumpkin.png'},
    2591: {name: 'Carved Pumpkin', image: 'static/common/items/Items/Card/Halloween_Carved_Pumpkin.png'},
    2592: {name: 'Stormrage Pumpkin', image: 'static/common/items/Items/Card/Halloween_Stormrage_Pumpkin.png'},
    2593: {name: 'Russian Pumpkin', image: 'static/common/items/Items/Card/Halloween_Russian_Pumpkin.png'},
    2594: {name: 'Green Mario Pumpkin', image: 'static/common/items/Items/Card/Halloween_Green_Mario_Pumpkin.png'},
    2595: {name: 'Lame Pumpkin Trio', image: 'static/common/items/Items/Card/Halloween_Lame_Pumpkin_Trio.png'},
    2600: {name: 'Pumpkin Badge Bits', image: 'static/common/items/Items/Halloween/pumpkin_bits.png'},
    2601: {name: 'Halloween Pumpkin Badge', image: 'static/common/items/Items/Badges/Halloween_Pumpkin_Badge.png'},
    2627: {name: 'Blacksmith Tongs', image: 'static/common/items/Items/Recast/blacksmith_tongs.png'},
    2639: {name: 'Dwarven Disco Ball', image: 'static/common/items/Cover/Clothing/disco_ball.png'},
    2641: {name: 'Impure Bronze Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Impure_Bronze_Claymore.png'},
    2642: {name: 'Bronze Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Bronze_Claymore.png'},
    2643: {name: 'Iron Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Iron_Claymore.png'},
    2644: {name: 'Steel Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Steel_Claymore.png'},
    2645: {name: 'Gold Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Gold_Claymore.png'},
    2646: {name: 'Mithril Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Mithril_Claymore.png'},
    2647: {name: 'Adamantium Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Adamantium_Claymore.png'},
    2648: {name: 'Quartz Khopesh', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Quartz_Khopesh.png'},
    2649: {name: 'Jade Khopesh', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Jade_Khopesh.png'},
    2650: {name: 'Amethyst Khopesh', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Amethyst_Khopesh.png'},
    2653: {name: 'Flux', image: 'static/common/items/Items/Recast/flux.png'},
    2656: {name: 'Impure Bronze Bar x2', image: 'static/common/items/Items/Ore/impure_bronze_bar.png'},
    2666: {name: 'Bronze Alloy Mix x2', image: 'static/common/items/Items/Ore/bronze.png'},
    2668: {name: 'Iron Ore x2', image: 'static/common/items/Items/Ore/iron.png'},
    2670: {name: 'Gold Ore x2', image: 'static/common/items/Items/Ore/gold.png'},
    2671: {name: 'Mithril Ore x2', image: 'static/common/items/Items/Ore/mithril.png'},
    2672: {name: 'Adamantium Ore x2', image: 'static/common/items/Items/Ore/adamantium.png'},
    2673: {name: 'Quartz Dust x2', image: 'static/common/items/Items/Ore/quartz.png'},
    2675: {name: 'Jade Dust x2', image: 'static/common/items/Items/Ore/jade.png'},
    2676: {name: 'Amethyst Dust x2', image: 'static/common/items/Items/Ore/amethyst.png'},
    2688: {name: 'Christmas Spices', image: 'static/common/items/Items/Christmas/spices.png'},
    2689: {name: 'Old Scarf &amp; Hat', image: 'static/common/items/Items/Christmas/hatscarf.png'},
    2698: {name: 'Perfect Snowball', image: 'static/common/items/Items/Card/Christmas_Perfect_Snowball.png'},
    2699: {name: 'Mistletoe', image: 'static/common/items/Items/Card/Christmas_Mistletoe.png'},
    2700: {name: 'Santa Suit', image: 'static/common/items/Items/Card/Christmas_Santa_Suit.png'},
    2701: {name: 'Abominable Santa', image: 'static/common/items/Items/Card/Christmas_Abominable_Santa.png'},
    2702: {name: 'Icy Kisses', image: 'static/common/items/Items/Card/Christmas_Icy_Kisses.png'},
    2703: {name: 'Sexy Santa', image: 'static/common/items/Items/Card/Christmas_Sexy_Santa.png'},
    2704: {name: 'Christmas Cheer', image: 'static/common/items/Items/Card/Christmas_Christmas_Cheer.png'},
    2717: {name: 'Emerald-Flecked Wheat', image: 'static/common/items/Items/Food/wheat_emerald.png'},
    2718: {name: 'Emerald-Grained Baguette', image: 'static/common/items/Items/Food/bagette_emerald.png'},
    2719: {name: 'Garlic Emerald-Baguette', image: 'static/common/items/Items/Food/garlic_emerald.png'},
    2720: {name: 'Artisan Emerald-Baguette', image: 'static/common/items/Items/Food/artisan_emerald.png'},
    2721: {name: 'Gazellian Emerald-Baguette', image: 'static/common/items/Items/Food/gazellian_emerald.png'},
    2761: {name: 'Impure Bronze Segmentata', image: 'static/common/items/Cover/Body Armor/Impure_Bronze_Segmentata.png'},
    2762: {name: 'Bronze Segmentata', image: 'static/common/items/Cover/Body Armor/Bronze_Segmentata.png'},
    2763: {name: 'Iron Segmentata', image: 'static/common/items/Cover/Body Armor/Iron_Segmentata.png'},
    2764: {name: 'Steel Segmentata', image: 'static/common/items/Cover/Body Armor/Steel_Segmentata.png'},
    2765: {name: 'Gold Segmentata', image: 'static/common/items/Cover/Body Armor/Gold_Segmentata.png'},
    2766: {name: 'Mithril Segmentata', image: 'static/common/items/Cover/Body Armor/Mithril_Segmentata.png'},
    2767: {name: 'Adamantium Segmentata', image: 'static/common/items/Cover/Body Armor/Adamantium_Segmentata.png'},
    2772: {name: 'Regenerate', image: 'static/common/items/Items/AdventureClub/attack_meditation.png'},
    2774: {name: 'Hypnosis', image: 'static/common/items/Items/AdventureClub/attack_hypnosis.png'},
    2775: {name: 'Muddle', image: 'static/common/items/Items/AdventureClub/attack_muddle.png'},
    2776: {name: 'Parasite', image: 'static/common/items/Items/AdventureClub/attack_parasite.png'},
    2801: {name: '3 Backpack Slots', image: 'static/common/items/Items/AdventureClub/backpack_3.png'},
    2802: {name: '4 Backpack Slots', image: 'static/common/items/Items/AdventureClub/backpack_4.png'},
    2803: {name: '6 Backpack Slots', image: 'static/common/items/Items/AdventureClub/backpack_6.png'},
    2813: {name: 'Scrap', image: 'static/common/items/Items/AdventureClub/craft_scrap.png'},
    2814: {name: 'Cloth', image: 'static/common/items/Items/AdventureClub/craft_cloth.png'},
    2816: {name: 'Hide', image: 'static/common/items/Items/AdventureClub/craft_hide.png'},
    2822: {name: 'Can&#39;t Believe This Is Cherry', image: 'static/common/items/Items/Birthday/chakefhake.png'},
    2825: {name: '9th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/9th_Birthday_Badge.png'},
    2826: {name: 'Lick Badge Bits', image: 'static/common/items/Items/Birthday/licks_bits.png'},
    2829: {name: 'Ripped Gazelle', image: 'static/common/items/Items/Card/Birthday_Ripped_Gazelle.png'},
    2830: {name: 'Fancy Gazelle', image: 'static/common/items/Items/Card/Birthday_Fancy_Gazelle.png'},
    2831: {name: 'Gamer Gazelle', image: 'static/common/items/Items/Card/Birthday_Gamer_Gazelle.png'},
    2833: {name: 'Future Gazelle', image: 'static/common/items/Items/Card/Birthday_Future_Gazelle.png'},
    2834: {name: 'Alien Gazelle', image: 'static/common/items/Items/Card/Birthday_Alien_Gazelle.png'},
    2835: {name: 'Lucky Gazelle', image: 'static/common/items/Items/Card/Birthday_Lucky_Gazelle.png'},
    2836: {name: 'Supreme Gazelle', image: 'static/common/items/Items/Card/Birthday_Supreme_Gazelle.png'},
    2841: {name: 'Condensed Light', image: 'static/common/items/Items/AdventureClub/craft_light.png'},
    2842: {name: 'Bottled Ghost', image: 'static/common/items/Items/AdventureClub/craft_bottle_ghost.png.png'},
    2844: {name: 'Glowing Leaves', image: 'static/common/items/Items/AdventureClub/craft_glowing_leaves.png.png'},
    2845: {name: 'Dark Orb', image: 'static/common/items/Items/AdventureClub/attack_darkorb.png'},
    2846: {name: 'Burst of Light', image: 'static/common/items/Items/AdventureClub/attack_burstlight.png'},
    2847: {name: 'Scrappy Gauntlets', image: 'static/common/items/Cover/AdventureClub/scrappy_gauntlets.png'},
    2849: {name: 'Quartz Lamellar', image: 'static/common/items/Cover/Body Armor/Quartz_Lamellar.png'},
    2850: {name: 'Jade Lamellar', image: 'static/common/items/Cover/Body Armor/Jade_Lamellar.png'},
    2851: {name: 'Amethyst Lamellar', image: 'static/common/items/Cover/Body Armor/Amethyst_Lamellar.png'},
    2852: {name: 'Impure Bronze Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Impure_Bronze_Billhook.png'},
    2853: {name: 'Bronze Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Bronze_Billhook.png'},
    2854: {name: 'Iron Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Iron_Billhook.png'},
    2855: {name: 'Steel Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Steel_Billhook.png'},
    2856: {name: 'Gold Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Gold_Billhook.png'},
    2857: {name: 'Mithril Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Mithril_Billhook.png'},
    2858: {name: 'Adamantium Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Adamantium_Billhook.png'},
    2859: {name: 'Quartz Guandao', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Quartz_Guandao.png'},
    2860: {name: 'Jade Guandao', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Jade_Guandao.png'},
    2861: {name: 'Amethyst Guandao', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Amethyst_Guandao.png'},
    2862: {name: 'Impure Bronze Armguards', image: 'static/common/items/Cover/Arm Armor/Impure_Bronze_Armguards.png'},
    2892: {name: 'Glowing Ash', image: 'https://ptpimg.me/3i2xd1.png'},
    2893: {name: 'Troll Tooth', image: 'https://ptpimg.me/mrr24x.png'},
    2894: {name: 'Advanced Hide', image: 'https://ptpimg.me/1d6926.png'},
    2900: {name: 'Burning Ash Cloud', image: 'https://ptpimg.me/n7900m.png'},
    2901: {name: 'Troll Tooth Necklace', image: 'https://ptpimg.me/480516.png'},
    2908: {name: 'Impure Bronze Power Gloves', image: 'https://ptpimg.me/9d1e15.png'},
    2915: {name: 'Flame Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Flame_Badge.png'},
    2930: {name: 'Nayru&#39;s Username', image: 'static/common/items/Items/Username/Nayru.png'},
    2931: {name: 'Farore&#39;s Username', image: 'static/common/items/Items/Username/Farore.png'},
    2932: {name: 'Din&#39;s Username', image: 'static/common/items/Items/Username/Din.png'},
    2945: {name: 'Bloody Mario', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Bloody_Mario.png'},
    2946: {name: 'Mommy&#39;s Recipe', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Mommys_Recipe.png'},
    2947: {name: 'Memory Boost', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Memory_Boost.png'},
    2948: {name: 'Link was here!', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Link_was_here.png'},
    2949: {name: 'Gohma Sees You', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Gohma_sees_you.png'},
    2950: {name: 'Skultilla the Cake Guard', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Skultilla_the_cake_guard.png'},
    2951: {name: 'Who eats whom?', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Who_eats_whom.png'},
    2952: {name: 'Cupcake Crumbles', image: 'https://ptpimg.me/ckw9ad.png'},
    2953: {name: 'Halloween Cupcake Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Halloween_Cupcake_Badge.png'},
    2969: {name: 'Gingerbread Kitana', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Kitana.png'},
    2970: {name: 'Gingerbread Marston', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Marston.png'},
    2972: {name: 'Gingerbread Doomslayer', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Doomslayer.png'},
    2973: {name: 'Millenium Falcon Gingerbread', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Millenium_Falcon.png'},
    2974: {name: 'Gingerbread AT Walker', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_AT_Walker.png'},
    2975: {name: 'Mario Christmas', image: 'static/common/items/Items/Card/9th_Christmas_Mario_Christmas.png'},
    2976: {name: 'Baby Yoda with Gingerbread', image: 'static/common/items/Items/Card/9th_Christmas_Baby_Yoda.png'},
    2986: {name: 'Sonic and Amy', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Sonic_and_Amy.png'},
    2987: {name: 'Yoshi and Birdo', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Yoshi_and_Birdo.png'},
    2988: {name: 'Kirlia and Meloetta', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Kirlia_and_Meloetta.png'},
    2989: {name: 'Aerith and Cloud', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Aerith_and_Cloud.png'},
    2990: {name: 'Master Chief and Cortana', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Master_Chief_and_Cortana.png'},
    2991: {name: 'Dom and Maria', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Master_Dom_and_Maria.png'},
    2992: {name: 'Mr. and Mrs. Pac Man', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Master_Mr_and_Mrs_Pac_Man.png'},
    2993: {name: 'Chainsaw Chess', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Chainsaw_Chess.png'},
    2994: {name: 'Chainsaw Wizard', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Chainsaw_Wizard.png'},
    2995: {name: 'Angelise Reiter', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Angelise_Reiter.png'},
    2996: {name: 'Ivy Valentine', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Ivy_Valentine.png'},
    2997: {name: 'Jill Valentine', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Jill_Valentine.png'},
    2998: {name: 'Sophitia', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Sophitia.png'},
    2999: {name: 'Yennefer', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Yennefer.png'},
    3000: {name: 'Valentine Sugar Heart', image: 'https://ptpimg.me/82osc2.png'},
    3001: {name: 'Valentine Chocolate Heart', image: 'https://ptpimg.me/gg9293.png'},
    3002: {name: 'Valentine Rose', image: 'https://ptpimg.me/o6mt84.png'},
    3004: {name: 'Special Box', image: 'static/common/items/Items/Valentine2022/special_box.png'},
    3023: {name: 'Exodus Truce', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Exodus_Truce.png'},
    3024: {name: 'Gazelle Breaking Bad', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Gazelle_Breaking_Bad.png'},
    3025: {name: 'A Fair Fight', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_A_Fair_Fight.png'},
    3026: {name: 'Home Sweet Home', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Home_Sweet_Home.png'},
    3027: {name: 'Birthday Battle Kart', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Birthday_Battle_Kart.png'},
    3028: {name: 'What an Adventure', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_What_an_Adventure.png'},
    3029: {name: 'After Party', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_After_Party.png'},
    3031: {name: 'Birthday Leaves (10th)', image: 'https://ptpimg.me/744jj8.png'},
    3032: {name: '10th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/10th_Birthday_Badge.png'},
    3105: {name: 'Cyberpunk 2077', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Cyberpunk_2077.png'},
    3106: {name: 'Watch Dogs Legion', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Watch_Dogs_Legion.png'},
    3107: {name: 'Dirt 5', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Dirt_5.png'},
    3108: {name: 'Genshin Impact', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Genshin_Impact.png'},
    3109: {name: 'Animal Crossing', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Animal_Crossing.png'},
    3110: {name: 'Gazelle', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Gazelle.png'},
    3111: {name: 'Mafia', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Mafia.png'},
    3112: {name: 'Christmas Bauble Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Bauble_Badge.png'},
    3113: {name: 'Red Crewmate Bauble', image: 'https://ptpimg.me/43o3rh.png'},
    3114: {name: 'Green Crewmate Bauble', image: 'https://ptpimg.me/sm003l.png'},
    3115: {name: 'Cyan Crewmate Bauble', image: 'https://ptpimg.me/r85pwu.png'},
    3117: {name: 'Christmas Impostor Bauble?', image: 'https://ptpimg.me/455r6g.png'},
    3119: {name: 'Broken Bauble Fragment', image: 'https://ptpimg.me/w3544e.png'},
    3120: {name: 'Wilted Four-Leaves Holly', image: 'https://ptpimg.me/nsth09.png'},
    3121: {name: 'Lucky Four-Leaves Holly', image: 'https://ptpimg.me/136074.png'},
    3136: {name: 'Cupid&#39;s Winged Boots', image: 'https://ptpimg.me/vlk630.png'},
    3143: {name: 'Symbol of Love', image: 'https://ptpimg.me/cf9vfc.png'},
    3144: {name: 'Old Worn Boots', image: 'https://ptpimg.me/66unrh.png'},
    3145: {name: 'Cupid&#39;s Magical Feather', image: 'https://ptpimg.me/004ho6.png'},
    3151: {name: 'Bill Rizer', image: 'static/common/items/Items/Card/11th_Birthday_Bill_Rizer.png'},
    3152: {name: 'Donkey Kong', image: 'static/common/items/Items/Card/11th_Birthday_Donkey_Kong.png'},
    3153: {name: 'Duck Hunt Dog', image: 'static/common/items/Items/Card/11th_Birthday_Duck_Hunt_Dog.png'},
    3154: {name: 'Dr. Mario', image: 'static/common/items/Items/Card/11th_Birthday_Dr_Mario.png'},
    3155: {name: 'Pit', image: 'static/common/items/Items/Card/11th_Birthday_Pit.png'},
    3156: {name: 'Little Mac', image: 'static/common/items/Items/Card/11th_Birthday_Little_Mac.png'},
    3157: {name: 'Mega Man', image: 'static/common/items/Items/Card/11th_Birthday_Mega_Man.png'},
    3158: {name: 'Link', image: 'static/common/items/Items/Card/11th_Birthday_Link.png'},
    3159: {name: 'Pac-Man', image: 'static/common/items/Items/Card/11th_Birthday_Pac_Man.png'},
    3160: {name: 'Samus Aran', image: 'static/common/items/Items/Card/11th_Birthday_Samus_Aran.png'},
    3161: {name: 'Simon Belmont', image: 'static/common/items/Items/Card/11th_Birthday_Simon_Belmont.png'},
    3162: {name: 'Kirby', image: 'static/common/items/Items/Card/11th_Birthday_Kirby.png'},
    3163: {name: 'Black Mage', image: 'static/common/items/Items/Card/11th_Birthday_Black_Mage.png'},
    3165: {name: '11th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/11th_Birthday_Badge.png'},
    3166: {name: 'Party Pipe Badge Bit', image: 'https://ptpimg.me/r6vdr3.png'},
    3207: {name: 'Abandoned Dwarven Helmet', image: 'https://ptpimg.me/ux20da.png'},
    3208: {name: 'Abandoned Dwarven Cuirass', image: 'https://ptpimg.me/b70787.png'},
    3209: {name: 'Abandoned Dwarven Gloves', image: 'https://ptpimg.me/o9z2fd.png'},
    3210: {name: 'Abandoned Dwarven Boots', image: 'https://ptpimg.me/mgztcw.png'},
    3211: {name: 'Abandoned Dwarven Axe', image: 'https://ptpimg.me/v7vtxy.png'},
    3218: {name: 'Milk', image: 'https://ptpimg.me/raa068.png'},
    3219: {name: 'Cherries', image: 'https://ptpimg.me/x02af9.png'},
    3220: {name: 'Grapes', image: 'https://ptpimg.me/351721.png'},
    3221: {name: 'Coconuts', image: 'https://ptpimg.me/9c121y.png'},
    3222: {name: 'Marshmallows', image: 'https://ptpimg.me/6tl43k.png'},
    3223: {name: 'Cocoa beans', image: 'https://ptpimg.me/8h05tu.png'},
    3224: {name: 'Vanilla Pods', image: 'https://ptpimg.me/7c4us8.png'},
    3225: {name: 'Strawberries', image: 'https://ptpimg.me/gp622c.png'},
    3226: {name: '&quot;Grape&quot; Milkshake', image: 'static/common/items/Items/Birthday/grapeshake.png'},
    3227: {name: ' Coco-Cooler Milkshake', image: 'static/common/items/Items/Birthday/coconutshake.png'},
    3228: {name: 'Cinnamon Milkshake', image: 'https://ptpimg.me/kl097r.png'},
    3229: {name: 'Rocky Road Milkshake', image: 'https://ptpimg.me/q8634k.png'},
    3230: {name: 'Neapolitan Milkshake', image: 'https://ptpimg.me/fr7433.png'},
    3241: {name: 'Cinnamon', image: 'https://ptpimg.me/tol70u.png'},
    3263: {name: 'Blinky', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Blinky.png'},
    3264: {name: 'Halloween Tombstone Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Halloween2021_Thombstone_Badge.png'},
    3265: {name: 'Clyde', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Clyde.png'},
    3266: {name: 'Pinky', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Pinky.png'},
    3267: {name: 'Inky', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Inky.png'},
    3268: {name: 'Ghostbusters', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Ghostbusters.png'},
    3269: {name: 'Boo', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Boo.png'},
    3270: {name: 'King Boo', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_King_Boo.png'},
    3281: {name: 'Haunted Tombstone Shard', image: 'https://gazellegames.net/static/common/items/Items/Halloween2021/Haunted_Tombstone_Shard.png'},
    3313: {name: 'Snowman Cookie', image: 'static/common/items/Items/Christmas2021/Christmas2021_Snowman_Cookie.png'},
    3322: {name: 'Young Snowman', image: 'static/common/items/Items/Christmas2021/Christmas2021_Young_Snowman.png'},
    3325: {name: 'Snowflake', image: 'static/common/items/Items/Christmas2021/Christmas2021_Snowflake.png'},
    3326: {name: 'Penguin Snowglobe', image: 'static/common/items/Items/Christmas2021/Christmas2021_Penguin_Snowglobe.png'},
    3327: {name: 'Owl Snowglobe', image: 'static/common/items/Items/Christmas2021/Christmas2021_Owl_Snowglobe.png'},
    3328: {name: 'Santa Claus Is Out There', image: 'static/common/items/Items/Card/Christmas2021_Santa_Claus_Is_Out_There.png'},
    3329: {name: 'Back to the Future', image: 'static/common/items/Items/Card/Christmas2021_Back_to_the_Future.png'},
    3330: {name: 'Big Lebowski', image: 'static/common/items/Items/Card/Christmas2021_Big_Lebowski.png'},
    3331: {name: 'Picard', image: 'static/common/items/Items/Card/Christmas2021_Picard.png'},
    3332: {name: 'Braveheart', image: 'static/common/items/Items/Card/Christmas2021_Braveheart.png'},
    3333: {name: 'Indy', image: 'static/common/items/Items/Card/Christmas2021_Indy.png'},
    3334: {name: 'Gremlins', image: 'static/common/items/Items/Card/Christmas2021_Gremlins.png'},
    3335: {name: 'Die Hard', image: 'static/common/items/Items/Card/Christmas2021_Die_Hard.png'},
    3336: {name: 'Jurassic Park', image: 'static/common/items/Items/Card/Christmas2021_Jurassic_Park.png'},
    3338: {name: 'Mando', image: 'static/common/items/Items/Card/Christmas2021_Mando.png'},
    3339: {name: 'Doomguy ', image: 'static/common/items/Items/Card/Christmas2021_Doomguy.png'},
    3340: {name: 'Grievous', image: 'static/common/items/Items/Card/Christmas2021_Grievous.png'},
    3341: {name: 'Have a Breathtaking Christmas', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2021_Have_a_Breathtaking_Christmas.png'},
    3358: {name: 'Valentine&#39;s Day 2022 Badge', image: 'static/common/items/Items/Valentine2022/valentines_badge_shop.png'},
    3359: {name: 'Rose Petals', image: 'static/common/items/Items/Valentine2022/rose_petals.png'},
    3368: {name: 'IRC Voice (1 Year)', image: 'static/common/items/Items/Buff/irc_voice_cheap.png'},
    3369: {name: 'Red Dragon', image: 'https://ptpimg.me/01y295.png'},
    3370: {name: 'Blue Dragon', image: 'https://ptpimg.me/g1t9wq.png'},
    3371: {name: 'Green Dragon', image: 'https://ptpimg.me/eb6p8q.png'},
    3373: {name: 'Gold Dragon', image: 'https://ptpimg.me/39xam3.png'},
    3378: {name: '12th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/12th_Birthday_Badge.png'},
    3379: {name: 'Slice of Birthday Cake', image: 'https://ptpimg.me/880dpt.png'},
    3384: {name: 'Golden Egg', image: 'https://ptpimg.me/vg48o6.png'},
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
    for (let i = 0; i < oldBooks.length / 2; i++) {
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
  // value is an array of recipes associated with the key book
  //
  // recipe object:
  //    See https://gazellegames.net/wiki.php?action=article&id=401#_2452401087 for details
  //  name (optional) is the recipe display name. Item's name (via itemId) is used if omitted
  //
  // prettier-ignore
  const recipes = {
    Glass: [
      {itemId: 1988, recipe: 'EEEEEEEEEEEEEEEEEEEE01987EEEEEEEEEEEEEEEEEEEE', requirement: 1, name: 'Glass Shards From Sand'},
      {itemId: 1988, recipe: 'EEEEEEEEEEEEEEEEEEEE00125EEEEEEEEEEEEEEEEEEEE', requirement: '', name: 'Glass Shards From Test Tube'},
      {itemId: 2436, recipe: 'EEEEEEEEEEEEEEEEEEEE00124EEEEEEEEEEEEEEEEEEEE', requirement: '', name: 'Glass Shards From Vial'},
      {itemId: 2437, recipe: 'EEEEEEEEEEEEEEEEEEEE00126EEEEEEEEEEEEEEEEEEEE', requirement: '', name: 'Glass Shards From Bowl'},
      {itemId: 125, recipe: 'EEEEE01988EEEEEEEEEE01988EEEEEEEEEEEEEEEEEEEE', requirement: 1},
      {itemId: 124, recipe: 'EEEEE01988EEEEE0198801988EEEEE0198801988EEEEE', requirement: 1},
      {itemId: 126, recipe: '01988019880198801988EEEEE01988019880198801988', requirement: 1},
      {itemId: 124, recipe: 'EEEEEEEEEEEEEEEEEEEE01987EEEEEEEEEE02230EEEEE', requirement: 1, name: 'Dust Ore Vial'},
      {itemId: 126, recipe: 'EEEEEEEEEEEEEEEEEEEE01987EEEEEEEEEE02231EEEEE', requirement: 1, name: 'Dust Ore Bowl'},
    ],
    Potions: [
      {itemId: 66, recipe: 'EEEEEEEEEE00115EEEEE0012500114EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 98, recipe: 'EEEEEEEEEE00115EEEEE0012400114EEEEEEEEEE00115', requirement: ''},
      {itemId: 99, recipe: '00115EEEEE0011500115001240011400115EEEEE00115', requirement: ''},
      {itemId: 100, recipe: 'EEEEE00113EEEEE000990012600099EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 104, recipe: 'EEEEEEEEEE00111EEEEE0012500127EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 105, recipe: 'EEEEEEEEEE00111EEEEE0012400127EEEEEEEEEE00111', requirement: ''},
      {itemId: 106, recipe: '00111EEEEE0011100111001240012700111EEEEE00111', requirement: ''},
      {itemId: 107, recipe: 'EEEEE00113EEEEE001060012600106EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 127, recipe: 'EEEEEEEEEEEEEEEEEEEE0012500112EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2433, recipe: 'EEEEEEEEEEEEEEE001240011400114EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2434, recipe: '001140011400114001140012600114EEEEE00113EEEEE', requirement: ''},
    ],
    Food: [
      {itemId: 2580, recipe: 'EEEEEEEEEEEEEEEEEEEE0257902579EEEEEEEEEEEEEEE', requirement: 3},
      {itemId: 2581, recipe: 'EEEEEEEEEEEEEEE001120258000112EEEEEEEEEEEEEEE', requirement: 3},
      {itemId: 2582, recipe: 'EEEEEEEEEEEEEEE025810011300113EEEEEEEEEEEEEEE', requirement: 3},
      {itemId: 2718, recipe: 'EEEEEEEEEEEEEEEEEEEE0271702717EEEEEEEEEEEEEEE', requirement: 3},
      {itemId: 2719, recipe: 'EEEEEEEEEEEEEEEEEEEE0271800112EEEEEEEEEEEEEEE', requirement: 3},
      {itemId: 2720, recipe: 'EEEEEEEEEEEEEEE027190255100113EEEEEEEEEEEEEEE', requirement: 3},
      {itemId: 2721, recipe: 'EEEEEEEEEEEEEEE027200255102551EEEEEEEEEEEEEEE', requirement: 3},
    ],
    Dwarven: [
      {itemId: 2822, recipe: '032180229503219EEEEEEEEEEEEEEE019880198801988', requirement: '', name: 'Cant Believe This Is Cherry'},
      {itemId: 3226, recipe: '032180229503220EEEEEEEEEEEEEEE019880198801988', requirement: '', name: 'Grape Milkshake'},
      {itemId: 3227, recipe: '032180229503221EEEEEEEEEEEEEEE019880198801988', requirement: '', name: 'Coco-Cooler Milkshake'},
      {itemId: 3228, recipe: '032180229503241EEEEEEEEEEEEEEE019880198801988', requirement: ''},
      {itemId: 3229, recipe: '0321802295EEEEE0322303222EEEEE019880198801988', requirement: ''},
      {itemId: 3230, recipe: '0321802295EEEEE032230322403225019880198801988', requirement: ''},
    ],
    Material_Bars: [
      {itemId: 2236, recipe: '0222502234EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', requirement: 1},
      {itemId: 2235, recipe: '0222502225EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', requirement: 1},
      {itemId: 2237, recipe: '0222602226EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', requirement: 1},
      {itemId: 2238, recipe: '0222602226EEEEEEEEEE02233EEEEEEEEEEEEEEEEEEEE', requirement: 1},
      {itemId: 2238, recipe: 'EEEEE02237EEEEEEEEEE02233EEEEEEEEEEEEEEEEEEEE', requirement: 1, name: 'Steel Bar From Iron Bar'},
      {itemId: 2239, recipe: '0222702227EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', requirement: 1},
      {itemId: 2240, recipe: '0222802228EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', requirement: 1},
      {itemId: 2241, recipe: '0222902229EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', requirement: 1},
      {itemId: 2242, recipe: '0223002230EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', requirement: 1},
      {itemId: 2243, recipe: '0223102231EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', requirement: 1},
      {itemId: 2244, recipe: '0223202232EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', requirement: 1},
    ],
    Armor: [
      {itemId: 2261, recipe: 'EEEEE02236EEEEEEEEEEEEEEEEEEEE02236EEEEEEEEEE', requirement: 1},
      {itemId: 2262, recipe: 'EEEEE02235EEEEEEEEEEEEEEEEEEEE02235EEEEEEEEEE', requirement: 1},
      {itemId: 2263, recipe: 'EEEEE02237EEEEEEEEEE02237EEEEE02237EEEEE02237', requirement: 1},
      {itemId: 2264, recipe: 'EEEEE02238EEEEEEEEEE02238EEEEE02238EEEEE02238', requirement: 1},
      {itemId: 2265, recipe: 'EEEEE02239EEEEEEEEEE02239EEEEE02239EEEEE02239', requirement: 1},
      {itemId: 2266, recipe: 'EEEEE02240EEEEEEEEEE02240EEEEE022400224002240', requirement: 1},
      {itemId: 2267, recipe: 'EEEEE02241EEEEEEEEEE02241EEEEE022410224102241', requirement: 1},
      {itemId: 2268, recipe: 'EEEEE02242EEEEEEEEEEEEEEEEEEEE02242EEEEEEEEEE', requirement: 1},
      {itemId: 2269, recipe: 'EEEEE02243EEEEEEEEEE02243EEEEE02243EEEEE02243', requirement: 1},
      {itemId: 2270, recipe: 'EEEEE02244EEEEEEEEEE02244EEEEE022440224402244', requirement: 1},
      {itemId: 2761, recipe: 'EEEEE02236EEEEEEEEEEEEEEEEEEEEEEEEE02627EEEEE', requirement: 1},
      {itemId: 2762, recipe: 'EEEEE02235EEEEEEEEEEEEEEEEEEEEEEEEE02627EEEEE', requirement: 1},
      {itemId: 2763, recipe: 'EEEEE02237EEEEEEEEEE02237EEEEEEEEEE02627EEEEE', requirement: 1},
      {itemId: 2764, recipe: 'EEEEE02238EEEEEEEEEE02238EEEEEEEEEE02627EEEEE', requirement: 1},
      {itemId: 2765, recipe: 'EEEEE02239EEEEEEEEEE02239EEEEEEEEEE02627EEEEE', requirement: 1},
      {itemId: 2766, recipe: 'EEEEE02240EEEEEEEEEE02240EEEEEEEEEE02627EEEEE', requirement: 1},
      {itemId: 2767, recipe: 'EEEEE02241EEEEEEEEEE02241EEEEEEEEEE02627EEEEE', requirement: 1},
      {itemId: 2849, recipe: 'EEEEE02242EEEEEEEEEEEEEEEEEEEEEEEEE02627EEEEE', requirement: 1},
      {itemId: 2850, recipe: 'EEEEE02243EEEEEEEEEE02243EEEEEEEEEE02627EEEEE', requirement: 1},
      {itemId: 2851, recipe: 'EEEEE02244EEEEEEEEEE02244EEEEEEEEEE02627EEEEE', requirement: 1},
      {itemId: 2862, recipe: 'EEEEE02236EEEEEEEEEEEEEEEEEEEE02627EEEEE02627', requirement: 1},
      {itemId: 2908, recipe: 'EEEEE02236EEEEEEEEEEEEEEE0262702550EEEEEEEEEE', requirement: 1},
    ],
    Weapons: [
      {itemId: 2641, recipe: '02236EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE02236EEEEE', requirement: 1},
      {itemId: 2642, recipe: '02235EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE02235EEEEE', requirement: 1},
      {itemId: 2643, recipe: '02237EEEEE02237EEEEE02237EEEEEEEEEE02237EEEEE', requirement: 1},
      {itemId: 2644, recipe: '02238EEEEE02238EEEEE02238EEEEEEEEEE02238EEEEE', requirement: 1},
      {itemId: 2645, recipe: '02239EEEEE02239EEEEE02239EEEEEEEEEE02239EEEEE', requirement: 1},
      {itemId: 2646, recipe: '022400224002240EEEEE02240EEEEEEEEEE02240EEEEE', requirement: 1},
      {itemId: 2647, recipe: '022410224102241EEEEE02241EEEEEEEEEE02241EEEEE', requirement: 1},
      {itemId: 2648, recipe: '02242EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE02242EEEEE', requirement: 1},
      {itemId: 2649, recipe: '02243EEEEE02243EEEEE02243EEEEEEEEEE02243EEEEE', requirement: 1},
      {itemId: 2650, recipe: '022440224402244EEEEE02244EEEEEEEEEE02244EEEEE', requirement: 1},
      {itemId: 2852, recipe: 'EEEEE02627EEEEEEEEEEEEEEEEEEEEEEEEE02236EEEEE', requirement: 1},
      {itemId: 2853, recipe: 'EEEEE02627EEEEEEEEEEEEEEEEEEEEEEEEE02235EEEEE', requirement: 1},
      {itemId: 2854, recipe: 'EEEEE02627EEEEEEEEEE02237EEEEEEEEEE02237EEEEE', requirement: 1},
      {itemId: 2855, recipe: 'EEEEE02627EEEEEEEEEE02238EEEEEEEEEE02238EEEEE', requirement: 1},
      {itemId: 2856, recipe: 'EEEEE02627EEEEEEEEEE02239EEEEEEEEEE02239EEEEE', requirement: 1},
      {itemId: 2857, recipe: 'EEEEE02627EEEEEEEEEE02240EEEEEEEEEE02240EEEEE', requirement: 1},
      {itemId: 2858, recipe: 'EEEEE02627EEEEEEEEEE02241EEEEEEEEEE02241EEEEE', requirement: 1},
      {itemId: 2859, recipe: 'EEEEE02627EEEEEEEEEEEEEEEEEEEEEEEEE02242EEEEE', requirement: 1},
      {itemId: 2860, recipe: 'EEEEE02627EEEEEEEEEE02243EEEEEEEEEE02243EEEEE', requirement: 1},
      {itemId: 2861, recipe: 'EEEEE02627EEEEEEEEEE02244EEEEEEEEEE02244EEEEE', requirement: 1},
    ],
    Recasting: [
      {itemId: 2225, recipe: 'EEEEEEEEEEEEEEE026530223602653EEEEEEEEEEEEEEE', requirement: 1, name: 'Impure Bronze Bar To Ore'},
      {itemId: 2666, recipe: 'EEEEEEEEEEEEEEE026530223502653EEEEEEEEEEEEEEE', requirement: 1, name: 'Bronze Bar To Ore'},
      {itemId: 2668, recipe: 'EEEEEEEEEEEEEEE026530223702653EEEEEEEEEEEEEEE', requirement: 1, name: 'Iron Bar To Ore'},
      {itemId: 2668, recipe: 'EEEEEEEEEEEEEEE026530223802653EEEEEEEEEEEEEEE', requirement: 1, name: 'Steel Bar To Ore'},
      {itemId: 2670, recipe: 'EEEEEEEEEEEEEEE026530223902653EEEEEEEEEEEEEEE', requirement: 1, name: 'Gold Bar To Ore'},
      {itemId: 2671, recipe: 'EEEEEEEEEEEEEEE026530224002653EEEEEEEEEEEEEEE', requirement: 1, name: 'Mithril Bar To Ore'},
      {itemId: 2672, recipe: 'EEEEEEEEEEEEEEE026530224102653EEEEEEEEEEEEEEE', requirement: 1, name: 'Adamantium Bar To Ore'},
      {itemId: 2673, recipe: 'EEEEEEEEEEEEEEE026530224202653EEEEEEEEEEEEEEE', requirement: 1, name: 'Quartz Bar To Dust'},
      {itemId: 2675, recipe: 'EEEEEEEEEEEEEEE026530224302653EEEEEEEEEEEEEEE', requirement: 1, name: 'Jade Bar To Dust'},
      {itemId: 2676, recipe: 'EEEEEEEEEEEEEEE026530224402653EEEEEEEEEEEEEEE', requirement: 1, name: 'Amethyst Bar To Dust'},
      {itemId: 2656, recipe: 'EEEEEEEEEEEEEEE022340223502234EEEEE02653EEEEE', requirement: 1, name: 'Downgrade Bronze Bar'},
      {itemId: 2237, recipe: 'EEEEEEEEEEEEEEEEEEEE02238EEEEEEEEEE02653EEEEE', requirement: 1, name: 'Downgrade Steel Bar'},
      {itemId: 1987, recipe: 'EEEEEEEEEEEEEEEEEEEE02508EEEEEEEEEE02653EEEEE', requirement: 1, name: 'Melt Dwarven Gem'},
    ],
    Jewelry: [
      {itemId: 2537, recipe: 'EEEEEEEEEEEEEEEEEEEE0224202233EEEEEEEEEEEEEEE', requirement: 2},
      {itemId: 2538, recipe: 'EEEEE01988EEEEEEEEEE02537EEEEEEEEEEEEEEEEEEEE', requirement: 2},
      {itemId: 2565, recipe: 'EEEEEEEEEEEEEEE001160224400116001160224400116', requirement: 2},
      {itemId: 2564, recipe: 'EEEEEEEEEEEEEEE025490224402549025490224402549', requirement: 2},
      {itemId: 2563, recipe: 'EEEEEEEEEEEEEEE023230224402323023230224402323', requirement: 2},
    ],
    Trading_Decks: [
      {itemId: 2369, recipe: 'EEEEEEEEEEEEEEE023580235902357EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2370, recipe: 'EEEEEEEEEEEEEEE023650236402366EEEEEEEEEEEEEEE', requirement: '', name: 'Biggest Banhammer'},
      {itemId: 2371, recipe: 'EEEEEEEEEEEEEEE023610236702368EEEEEEEEEEEEEEE', requirement: '', name: 'Staff Beauty Parlor'},
      {itemId: 2438, recipe: 'EEEEEEEEEEEEEEE024000238802410EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2372, recipe: 'EEEEEEEEEEEEEEE023690237002371EEEEEEEEEEEEEEE', requirement: '', name: 'Realm of Staff'},
      {itemId: 2376, recipe: 'EEEEEEEEEEEEEEE023730237402375EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2384, recipe: 'EEEEEEEEEEEEEEE023810238302382EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2380, recipe: 'EEEEEEEEEEEEEEE023780237702379EEEEEEEEEEEEEEE', requirement: '', name: 'Ricks Portal Gun'},
      {itemId: 2385, recipe: 'EEEEEEEEEEEEEEE023760238402380EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2401, recipe: 'EEEEEEEEEEEEEEE023900239202393EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2402, recipe: 'EEEEEEEEEEEEEEE023910239702394EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2403, recipe: 'EEEEEEEEEEEEEEE023950239602398EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2404, recipe: 'EEEEEEEEEEEEEEE024010240202403EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2468, recipe: '02372EEEEEEEEEEEEEEE02404EEEEE02385EEEEEEEEEE', requirement: 2, name: 'Random Lootbox'},
      {itemId: 2421, recipe: '02372EEEEEEEEEEEEEEE02404EEEEE02372EEEEEEEEEE', requirement: 2, name: 'Dins Lootbox'},
      {itemId: 2465, recipe: '02404EEEEEEEEEEEEEEE02372EEEEE02404EEEEEEEEEE', requirement: 2, name: 'Farores Lootbox'},
      {itemId: 2466, recipe: '02385EEEEEEEEEEEEEEE02372EEEEE02385EEEEEEEEEE', requirement: 2, name: 'Nayrus Lootbox'},
    ],
    Xmas_Crafting: [
      {itemId: 3107, recipe: 'EEEEEEEEEEEEEEEEEEEE0310503106EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3110, recipe: 'EEEEEEEEEEEEEEEEEEEE0310803109EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3111, recipe: 'EEEEEEEEEEEEEEEEEEEE0310703110EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3112, recipe: 'EEEEE0311903119EEEEE0311903119EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3117, recipe: 'EEEEEEEEEEEEEEE031130311403115EEEEEEEEEEEEEEE', requirement: '', name: 'Christmas Impostor Bauble'},
      {itemId: 3121, recipe: 'EEEEEEEEEE00114EEEEE0312000114EEEEEEEEEE00114', requirement: 2},
      {itemId: 2296, recipe: 'EEEEEEEEEEEEEEEEEEEE02295EEEEEEEEEE02295EEEEE', requirement: ''},
      {itemId: 2305, recipe: 'EEEEE02295EEEEE022950229602295EEEEE02295EEEEE', requirement: ''},
      {itemId: 2298, recipe: 'EEEEE02688EEEEEEEEEE02296EEEEEEEEEE00126EEEEE', requirement: ''},
      {itemId: 2299, recipe: 'EEEEE02297EEEEEEEEEE02298EEEEEEEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2303, recipe: 'EEEEE00126EEEEEEEEEE02296EEEEEEEEEE02688EEEEE', requirement: ''},
      {itemId: 2300, recipe: 'EEEEE02233EEEEE022330223302233EEEEEEEEEEEEEEE', requirement: 2},
      {itemId: 2307, recipe: '023060268902234022960230502300001260230502300', requirement: ''},
      {itemId: 2701, recipe: 'EEEEEEEEEEEEEEEEEEEE0269802700EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2702, recipe: 'EEEEEEEEEEEEEEEEEEEE0269802699EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2703, recipe: 'EEEEEEEEEEEEEEEEEEEE0270002699EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2704, recipe: 'EEEEEEEEEEEEEEE027010270202703EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2972, recipe: 'EEEEEEEEEEEEEEEEEEEE0296902970EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2975, recipe: 'EEEEEEEEEEEEEEEEEEEE0297302974EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2976, recipe: 'EEEEEEEEEEEEEEEEEEEE0297202975EEEEEEEEEEEEEEE', requirement: '', name: 'Baby Yoda With Gingerbread'},
      {itemId: 3340, recipe: 'EEEEEEEEEEEEEEE033280332903334EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3338, recipe: '033310333203333EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3339, recipe: 'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE033300333503336', requirement: '', name: 'Doomguy'},
      {itemId: 3341, recipe: 'EEEEE03340EEEEEEEEEE03338EEEEEEEEEE03339EEEEE', requirement: ''},
      {itemId: 3322, recipe: 'EEEEE03313EEEEE033130230703313EEEEE03313EEEEE', requirement: ''},
    ],
    Birthday: [
      {itemId: 2833, recipe: 'EEEEEEEEEEEEEEE0282902831EEEEEEEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2834, recipe: 'EEEEEEEEEEEEEEE0282902830EEEEEEEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2835, recipe: 'EEEEEEEEEEEEEEEEEEEE0283002831EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2836, recipe: 'EEEEEEEEEEEEEEE028330283402835EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2825, recipe: 'EEEEEEEEEEEEEEE028260282602826028260282602826', requirement: '', name: 'Birthday Licks Badge - 9th'},
      {itemId: 3025, recipe: 'EEEEEEEEEEEEEEEEEEEE0302303024EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3028, recipe: 'EEEEEEEEEEEEEEEEEEEE0302603027EEEEEEEEEEEEEEE', requirement: '', name: 'What An Adventure'},
      {itemId: 3029, recipe: 'EEEEEEEEEEEEEEEEEEEE0302503028EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3032, recipe: '03031EEEEE0303103031EEEEE0303103031EEEEE03031', requirement: '', name: 'Birthday Gazelle Badge - 10th'},
      {itemId: 3154, recipe: 'EEEEEEEEEEEEEEE031510315203153EEEEEEEEEEEEEEE', requirement: '', name: 'Dr Mario'},
      {itemId: 3158, recipe: 'EEEEEEEEEEEEEEE031550315603157EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3162, recipe: 'EEEEEEEEEEEEEEE031590316003161EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3163, recipe: '03154EEEEEEEEEEEEEEE03158EEEEEEEEEEEEEEE03162', requirement: ''},
      {itemId: 3165, recipe: '03166EEEEEEEEEEEEEEE0316603166EEEEEEEEEE03166', requirement: '', name: 'Birthday Gazelle Badge - 11th'},
      {itemId: 3378, recipe: '03379EEEEE03379EEEEE03379EEEEE03379EEEEE03379', requirement: ''},
      {itemId: 3369, recipe: '029510297603029EEEEE02155EEEEE025950270402836', requirement: 2},
      {itemId: 3371, recipe: '029510297603029EEEEE02153EEEEE025950270402836', requirement: 2},
      {itemId: 3370, recipe: '029510297603029EEEEE02154EEEEE025950270402836', requirement: 2},
      {itemId: 3373, recipe: '029510297603029EEEEE03384EEEEE025950270402836', requirement: 2},
    ],
    Valentines: [
      {itemId: 2988, recipe: 'EEEEEEEEEEEEEEE029860300002987EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2991, recipe: 'EEEEEEEEEEEEEEE029890300002990EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2992, recipe: 'EEEEEEEEEEEEEEE029880300002991EEEEEEEEEEEEEEE', requirement: '', name: 'Mr and Mrs Pac Man'},
      {itemId: 2995, recipe: 'EEEEEEEEEEEEEEE029930300102994EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2998, recipe: 'EEEEEEEEEEEEEEE029960300102997EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2999, recipe: 'EEEEEEEEEEEEEEE029950300102998EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3143, recipe: 'EEEEE03002EEEEE03002EEEEE03002EEEEE03002EEEEE', requirement: '', name: 'Vegetal Symbol'},
      {itemId: 3143, recipe: '02323EEEEE02323EEEEEEEEEEEEEEE02323EEEEE02323', requirement: 2, name: 'Mineral Symbol'},
      {itemId: 3145, recipe: '022420224302242EEEEE02227EEEEEEEEEE02232EEEEE', requirement: 2, name: 'Cupids Magical Feather'},
      {itemId: 3136, recipe: 'EEEEE03143EEEEEEEEEE03144EEEEE03145EEEEE03145', requirement: 2, name: 'Valentine 2022 Badge'},
      {itemId: 3358, recipe: '03359EEEEE03359EEEEE03359EEEEE03359EEEEE03359', requirement: '', name: 'Special Box'},
      {itemId: 3004, recipe: '02992EEEEE03163EEEEEEEEEEEEEEE02999EEEEE03270', requirement: '', name: 'Cupids Winged Boots'},
    ],
    Halloween: [
      {itemId: 2592, recipe: 'EEEEEEEEEEEEEEEEEEEE0259002591EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2593, recipe: 'EEEEEEEEEEEEEEEEEEEE0259102589EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2594, recipe: 'EEEEEEEEEEEEEEEEEEEE0258902590EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2595, recipe: 'EEEEEEEEEEEEEEE025920259302594EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2601, recipe: 'EEEEEEEEEEEEEEE026000260002600026000260002600', requirement: ''},
      {itemId: 2947, recipe: 'EEEEEEEEEEEEEEEEEEEE0294502946EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2950, recipe: 'EEEEEEEEEEEEEEEEEEEE0294802949EEEEEEEEEEEEEEE', requirement: '', name: 'Skultilla The Cake Guard'},
      {itemId: 2951, recipe: 'EEEEEEEEEEEEEEEEEEEE0294702950EEEEEEEEEEEEEEE', requirement: '', name: 'Who Eats Whom'},
      {itemId: 2953, recipe: 'EEEEEEEEEEEEEEE029520295202952029520295202952', requirement: ''},
      {itemId: 3268, recipe: 'EEEEEEEEEEEEEEE0326303265EEEEEEEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3269, recipe: 'EEEEEEEEEEEEEEE0326603267EEEEEEEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3270, recipe: 'EEEEEEEEEEEEEEE0326803269EEEEEEEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 3264, recipe: '032810328103281EEEEEEEEEEEEEEE032810328103281', requirement: '', name: 'Tombstone Badge'},
    ],
    Adventure_Club: [
      {itemId: 2772, recipe: 'EEEEEEEEEEEEEEEEEEEE02844EEEEEEEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2774, recipe: 'EEEEEEEEEEEEEEE028440284402844EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2775, recipe: 'EEEEE02844EEEEEEEEEE02844EEEEEEEEEE02844EEEEE', requirement: ''},
      {itemId: 2776, recipe: '028440284402844EEEEEEEEEEEEEEE028440284402844', requirement: ''},
      {itemId: 2846, recipe: 'EEEEEEEEEEEEEEEEEEEE02841EEEEEEEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2845, recipe: 'EEEEEEEEEEEEEEEEEEEE02842EEEEEEEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2900, recipe: 'EEEEE02892EEEEE028920289202892EEEEE02892EEEEE', requirement: ''},
      {itemId: 2801, recipe: 'EEEEEEEEEEEEEEE028160281402816EEEEEEEEEEEEEEE', requirement: ''},
      {itemId: 2802, recipe: 'EEEEE02816EEEEE028160281402816EEEEE02816EEEEE', requirement: ''},
      {itemId: 2803, recipe: '028140281602814028160289402816028140281602814', requirement: ''},
      {itemId: 2847, recipe: 'EEEEE02813EEEEEEEEEE02813EEEEEEEEEE02813EEEEE', requirement: ''},
      {itemId: 2901, recipe: 'EEEEE02816EEEEE028930289302893EEEEE02813EEEEE', requirement: ''},
    ],
    Bling: [
      {itemId: 2554, recipe: '021550215302154022390012102243025370253702537', requirement: 2, name: 'Unity Necklace'},
      {itemId: 2584, recipe: '021550215302154022390253902243025850253702585', requirement: 2, name: 'Unity Band'},
      {itemId: 2915, recipe: '02155EEEEE02154EEEEE00121EEEEEEEEEE02153EEEEE', requirement: 2},
      {itemId: 2930, recipe: 'EEEEEEEEEEEEEEE0215400120EEEEEEEEEEEEEEEEEEEE', requirement: 2, name: 'Nayrus Username'},
      {itemId: 2931, recipe: 'EEEEEEEEEEEEEEE0215300120EEEEEEEEEEEEEEEEEEEE', requirement: 2, name: 'Farores Username'},
      {itemId: 2932, recipe: 'EEEEEEEEEEEEEEE0215500120EEEEEEEEEEEEEEEEEEEE', requirement: 2, name: 'Dins Username'},
      {itemId: 2639, recipe: '025080250802508025080250802508025080250802508', requirement: 2, name: 'Dwarven Discoball'},
      {itemId: 2212, recipe: 'EEEEEEEEEEEEEEE000720007200072EEEEEEEEEEEEEEE', requirement: 2, name: 'Irc Voice 8w'},
      {itemId: 2212, recipe: 'EEEEE00175EEEEE001750017500175EEEEEEEEEEEEEEE', requirement: 2, name: 'Irc Voice 8w - Low Cost'},
      {itemId: 3368, recipe: '022120221202212022120221202212EEEEE02549EEEEE', requirement: 2, name: 'Irc Voice 1y'},
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

  let craftingSubmenu;
  let isCrafting = false;

  let inventoryAmounts;
  let fetching = false;

  async function getInventoryAmounts() {
    if (fetching || inventoryAmounts) {
      while (!inventoryAmounts) await new Promise((r) => setTimeout(r, 30));
      return inventoryAmounts;
    } else {
      fetching = true;
      return await apiCall({data: {request: 'items', type: 'inventory'}})
        .then((data) => {
          const status = data.status;
          if (status !== 'success' || !'response' in data) {
            error(`API returned unsuccessful: ${status}`, data);
            page = -1;
            return;
          }
          inventoryAmounts = Object.fromEntries(
            Object.values(data.response).map((item) => [item.itemid, parseInt(item.amount)]),
          );
          return inventoryAmounts;
        })
        .catch((reason) => console.error(reason));
    }
  }

  function take_craft(recipe) {
    const name = recipe.name || ingredients[recipe.itemId].name;
    $.get(urlBase(recipe.recipe), function (data) {
      console.log(data);
      console.log(data.EquipID);

      if (data === '{}' || data.EquipId !== '') {
        window.noty({type: 'success', text: `${name} was crafted successfully.`});
      } else {
        window.noty({type: 'error', text: `${name} failed.`});
        alert(`Crafting failed. Response from server: ${data}`);
      }
    });
  }

  function close_crafting_submenu() {
    if (craftingSubmenu) {
      craftingSubmenu.empty();
      GM_deleteValue(gmKeyCurrentCraft);
    }
  }

  async function open_crafting_submenu(recipe, purchasable) {
    if (isCrafting) return;

    const inventory = await getInventoryAmounts();
    const currentCraft = {
      recipe: recipe,
      name: recipe.name || ingredients[recipe.itemId].name,
      ingredients: recipe.recipe.match(/.{5}/g).reduce((ingredients, item, slot) => {
        if (item !== blankSlot) {
          const itemId = parseInt(item);
          if (itemId in ingredients) {
            ++ingredients[itemId].perCraft;
            ingredients[itemId].slots.push(slot);
          } else {
            ingredients[itemId] = {perCraft: 1, onHand: inventory[itemId] || 0, slots: [slot]};
          }
        }
        return ingredients;
      }, {}),
    };
    currentCraft.available = Math.floor(
      Math.min(...Object.values(currentCraft.ingredients).map(({onHand, perCraft}) => (onHand || 0) / perCraft)),
    );
    currentCraft.maxWithPurchase =
      Math.floor(
        Math.min(
          ...Object.entries(currentCraft.ingredients)
            .filter(([id, _]) => !purchasable.includes(id))
            .map(([_, {onHand, perCraft}]) => (onHand || 0) / perCraft),
        ),
      ) || currentCraft.available;

    const createCraftingActions = (recipe) => {
      if (currentCraft.available <= 0) {
        return '';
      }
      let craftNumberSelect;

      const doCraft = async () => {
        // Disable crafting buttons and craft switching
        isCrafting = true;
        $('#crafting-submenu button, #crafting-submenu select').prop('disabled', true).addClass('disabled');

        let craftNumber = craftNumberSelect.children('option:selected').val();

        await (async () => {
          for (let i = 0; i < craftNumber; i++) {
            await new Promise((resolve) =>
              setTimeout(function () {
                Object.entries(currentCraft.ingredients).forEach(([id, {perCraft}]) => (inventory[id] -= perCraft));
                take_craft(recipe);
                if (recipe.itemId in inventory) {
                  inventory[recipe.itemId]++;
                } else {
                  inventory[recipe.itemId] = 1;
                }
                resolve();
              }, CRAFT_TIME),
            );
          }
          isCrafting = false;
          await open_crafting_submenu(recipe, purchasable);
        })();
      };

      return $('<div>')
        .css({
          display: 'flex',
          flexDirection: 'row',
          columnGap: '.25rem',
          alignItems: 'center',
          alignSelf: 'center',
        })
        .append(
          (craftNumberSelect = $('<select>').append(
            Array(currentCraft.available)
              .fill()
              .map((_, i) => `<option value="${i + 1}">${i + 1}</option>`),
          )),
          $('<button>Craft</button>').click(doCraft),
        )
        .add(
          $('<button class="quick_craft_button">Craft maximum</button>')
            .css({width: '100%', marginLeft: 0})
            .click(function () {
              if (!$(this).hasClass('quick_craft_button_confirm')) {
                craftNumberSelect.val(currentCraft.available);
                $(this).text('** CONFIRM **').addClass('quick_craft_button_confirm');
              } else {
                $(this).text('-- Crafting --');
                doCraft();
              }
            }),
        );
    };

    close_crafting_submenu();
    GM_setValue(gmKeyCurrentCraft, recipe.name || ingredients[recipe.itemId].name);

    const createIngredientLine = (ingredientId) => {
      const {onHand, perCraft} = currentCraft.ingredients[ingredientId];
      return $('<div>')
        .css({
          // Color ingredients marked purchased
          ...(purchasable.includes(ingredientId) ? {color: 'lightGreen'} : {}),
          display: 'flex',
          flexDirection: 'row',
          columnGap: '.25rem',
          alignItems: 'center',
          alignSelf: 'center',
        })
        .append(
          $('<a>')
            .text('$')
            .attr('href', `https://gazellegames.net/shop.php?ItemID=${ingredientId}`)
            .attr('target', '_blank')
            .css({
              borderRadius: '50%',
              backgroundColor: 'yellow',
              color: 'black',
              cursor: 'pointer',
              padding: '0 .25rem',
            }),
          `${ingredients[ingredientId].name}:`,
          `<div style="display: inline-flex;" class="ingredient_quantity"><span>${onHand}</span><span>/</span><span>${perCraft}</span></div>`,
          currentCraft.maxWithPurchase > onHand / perCraft
            ? `<span title="Needed for max possible crafts"> (+${
                currentCraft.maxWithPurchase * perCraft - onHand
              })</span>`
            : '',
        )
        .click(() => {
          if (purchasable.includes(ingredientId)) {
            delete purchasable[purchasable.indexOf(ingredientId)];
            purchasable = purchasable.flat();
          } else if (purchasable.length < Object.values(currentCraft.ingredients).length - 1) {
            purchasable.push(ingredientId);
          }
          close_crafting_submenu();
          open_crafting_submenu(recipe, purchasable);
        });
    };

    craftingSubmenu = $('#current_craft_box')
      .css({
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      })
      .append(
        $('<h3 id="crafting-panel-title">')
          .text(titleCaseFromUnderscored(recipe.name || ingredients[recipe.itemId].name))
          .css({
            marginBottom: '.5rem',
            marginTop: 0,
            ...$('.item:first').css(['text-shadow', 'font-weight', 'color']),
          })
          .append(recipe.itemId in inventory ? ` (${inventory[recipe.itemId]} in inventory)` : ''),
        $('<div id="crafting-panel-row">')
          .css({display: 'flex', flexDirection: 'row', gap: '1rem'})
          .append(
            $('<div>')
              .css({height: '277.5px', width: '412.5px'})
              .append(
                $('<div id="crafting-panel">')
                  .css({
                    background: `url('/static/styles/game_room/images/shop/crafting_panel.jpg')`,
                    height: '370px',
                    width: '550px',
                    position: 'relative',
                    transform: 'scale(0.75)', // TODO use scale factor against height width of this and parent
                    transformOrigin: 'top left',
                  })
                  .append(
                    ...new Array(9).fill(null).map((_, i) =>
                      $(`<div id="craft-slot-${i}">`)
                        .css({
                          position: 'absolute',
                          width: '106px', // TODO pull widths and margins from existing UI/style
                          height: '106px',
                          left: `${13 + (i % 3) * 119}px`,
                          top: `${13 + Math.floor(i / 3) * 119}px`,
                          background: 'transparent',
                        })
                        .data({id: 0}),
                    ),
                    $('<div id="craft-slot-result">')
                      .css({
                        position: 'absolute',
                        width: '106px', // TODO pull widths and margins from existing UI/style
                        height: '106px',
                        left: `${13 + 2 * 119 + 180}px`,
                        top: `${13 + 119}px`,
                        background: 'transparent',
                      })
                      .data({id: 0}),
                    $('<div id="craft-slot-requirement">')
                      .css({
                        position: 'absolute',
                        width: '106px', // TODO pull widths and margins from existing UI/style
                        height: '106px',
                        left: `${13 + 2 * 119 + 180}px`,
                        top: `${13 + 2 * 119}px`,
                        background: 'transparent',
                      })
                      .data({requirement: 0}),
                  ),
              ),
            $('<div id="crafting-ingredients">')
              .css({display: 'flex', flexDirection: 'column', gap: '0.25rem'})
              .append(
                '<div style="margin-bottom: .5rem;">Ingredients:</div>',
                ...new Array(9).fill(null).map((_, i) => $(`<div id="craft-ingredient-${i}">`).data({id: 0, count: 0})),
                $(`<span>`)
                  .text(`Max available craft(s): ${currentCraft.available}`)
                  .css({marginBottom: '1rem'})
                  .append(
                    currentCraft.available !== currentCraft.maxWithPurchase
                      ? $(`<span>`)
                          .text(`(${currentCraft.maxWithPurchase})`)
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
                $('<div id="crafting-submenu">')
                  .css({
                    textAlign: 'center',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  })
                  .append(createCraftingActions(recipe)),
              ),
          ),
      );
    Object.keys(currentCraft.ingredients).forEach((ingredientId, i) => {
      $(`#craft-ingredient-${i}`).html(createIngredientLine(ingredientId));
      currentCraft.ingredients[ingredientId].slots.forEach((slot) =>
        $(`#craft-slot-${slot}`).css({
          background: `url('${ingredients[ingredientId].image}')`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }),
      );
    });
    $('#craft-slot-result').css({
      background: `url('${ingredients[recipe.itemId].image}')`,
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
    });
    console.log(recipe);
    if (recipe.requirement)
      $('#craft-slot-requirement').css({
        background: $(`#${recipe.requirement === 3 ? 'campfire' : recipe.requirement === 1 ? 'forge' : 'enchanting'}`)
          .css('background')
          .replace('..', `/static/styles/${$('link[rel="stylesheet"][title]').attr('title')}`),
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
      });
  }
  //
  // #endregion Crafting menu and logic
  //

  //
  // #region Create Recipe Book and Recipe buttons
  //

  let saveDebounce;

  //
  // Creates a Recipe button.
  //
  const createRecipeButton = (book, recipe) => {
    return $(`<button>${recipe.name || ingredients[recipe.itemId].name}</button>`)
      .css({
        backgroundColor: book.bgcolor,
        color: book.color,
        border: '2px solid transparent',
        marginTop: '3px',
        marginRight: '5px',
      })
      .focus(function () {
        $(this).css({border: '2px solid red'});
      })
      .blur(function () {
        $(this).css({border: '2px solid transparent'});
      })
      .click(() => open_crafting_submenu(recipe, []));
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
                recipes[bookKey].map((recipe) => {
                  const recipeButton = createRecipeButton(book, recipe);
                  book.recipes.push(recipeButton);
                  return recipeButton;
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
  $('button')
    .filter(function () {
      return $(this).text() === GM_getValue(gmKeyCurrentCraft);
    })
    .click();
  // Can block, so we prefetch last
  await getInventoryAmounts();

  //
  // #endregion Create Recipe Book and Recipe buttons
  //

  //
  // #endregion Main functions
  //
})(unsafeWindow || window, jQuery || (unsafeWindow || window).jQuery, GM_info.script.version);
