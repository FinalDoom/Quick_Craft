// ==UserScript==
// @name         GGn Quick Crafter
// @namespace    http://tampermonkey.net/
// @version      2.7.0
// @description  Craft multiple items easier
// @author       KingKrab23
// @author       KSS
// @author       FinalDoom
// @author       GGN community
// @match        https://gazellegames.net/user.php?action=crafting
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @require      https://code.jquery.com/jquery-3.6.0.js
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

  //
  // #endregion >>>END<<< user adjustable variables
  //

  //
  // #region Helper functions
  //

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
  await getInventoryAmounts();

  function resolveNames(...potentialNames) {
    return $('<textarea />')
      .html(potentialNames.find((name) => name))
      .text();
  }

  async function takeCraft(recipe) {
    const name = resolveNames(recipe.name, ingredients[recipe.itemId].name);
    return await apiCall({
      data: {request: 'items', type: 'crafting_result', action: 'take', recipe: recipe.recipe},
    }).then((data) => {
      const status = data.status;
      if (status !== 'success' || !'response' in data) {
        window.noty({type: 'error', text: `${name} crafting failed.`});
        alert(`Crafting failed. Response from server: ${data}`);
        return false;
      } else {
        window.noty({type: 'success', text: `${name} was crafted successfully.`});
        return true;
      }
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

  function chunkArray(chunkSize) {
    return (resultArray, item, index) => {
      const chunkIndex = Math.floor(index / chunkSize);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []; // start a new chunk
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    };
  }

  //
  // #endregion Helper functions
  //

  //
  // #region Static site data (generated/api-intense)
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
    66: {name: 'Upload Potion Sampler', image: 'static/common/items/Items/Potions/sample_green.png', category: 'Stat potions', gold: '2500', infStock: true},
    72: {name: 'IRC Voice (2 Weeks)', image: 'static/common/items/Items/Buff/irc_voice_cheap.png', category: 'IRC customizations', gold: '10000', infStock: true},
    98: {name: 'Small Upload Potion', image: 'static/common/items/Items/Potions/small_green.png', category: 'Stat potions', gold: '5000', infStock: true},
    99: {name: 'Upload Potion', image: 'static/common/items/Items/Potions/green.png', category: 'Stat potions', gold: '10000', infStock: true},
    100: {name: 'Large Upload Potion', image: 'static/common/items/Items/Potions/large_green.png', category: 'Stat potions', gold: '25000', infStock: true},
    104: {name: 'Download-Reduction Potion Sampler', image: 'static/common/items/Items/Potions/sample_red.png', category: 'Stat potions', gold: '3000', infStock: true},
    105: {name: 'Small Download-Reduction Potion', image: 'static/common/items/Items/Potions/small_red.png', category: 'Stat potions', gold: '6000', infStock: true},
    106: {name: 'Download-Reduction Potion', image: 'static/common/items/Items/Potions/red.png', category: 'Stat potions', gold: '12000', infStock: true},
    107: {name: 'Large Download-Reduction Potion', image: 'static/common/items/Items/Potions/large_red.png', category: 'Stat potions', gold: '30000', infStock: true},
    111: {name: 'Purple Angelica Flowers', image: 'static/common/items/Items/Plants/angelica_flowers.png', category: 'Crafting Materials', gold: '2000', infStock: true},
    112: {name: 'Head of Garlic', image: 'static/common/items/Items/Plants/garlic.png', category: 'Crafting Materials', gold: '1000', infStock: false},
    113: {name: 'Yellow Hellebore Flower', image: 'static/common/items/Items/Plants/hellebore_flower.png', category: 'Crafting Materials', gold: '2500', infStock: true},
    114: {name: 'Black Elderberries', image: 'static/common/items/Items/Plants/black_elder_berries.png', category: 'Crafting Materials', gold: '2000', infStock: true},
    115: {name: 'Black Elder Leaves', image: 'static/common/items/Items/Plants/black_elder_leaves.png', category: 'Crafting Materials', gold: '1600', infStock: true},
    116: {name: 'Emerald', image: 'static/common/items/Items/Gems/emerald.png', category: 'Crafting Materials', gold: '10000', infStock: true},
    120: {name: 'Green Onyx Gem', image: 'static/common/items/Items/Gems/green_onyx.png', category: 'Crafting Materials', gold: '20000', infStock: true},
    121: {name: 'Flawless Amethyst', image: 'static/common/items/Items/Gems/flawless_amethyst.png', category: 'Crafting Materials', gold: '200000', infStock: true},
    124: {name: 'Vial', image: 'static/common/items/Items/Vials/vial.png', category: 'Crafting Materials', gold: '1000', infStock: true},
    125: {name: 'Test Tube', image: 'static/common/items/Items/Vials/test_tube.png', category: 'Crafting Materials', gold: '400', infStock: true},
    126: {name: 'Bowl', image: 'static/common/items/Items/Vials/bowl.png', category: 'Crafting Materials', gold: '1500', infStock: true},
    127: {name: 'Garlic Tincture', image: 'static/common/items/Items/Plants/garlic_tincture.png', category: 'Crafting Materials', gold: '2000', infStock: true},
    175: {name: 'IRC Voice (2 Weeks) - Low Cost Option', image: 'static/common/items/Items/Buff/irc_voice_cheap.png', category: 'IRC customizations', gold: '5000', infStock: true},
    1987: {name: 'Pile of Sand', image: 'static/common/items/Items/Vials/sand.png', category: 'Crafting Materials', gold: '250', infStock: true},
    1988: {name: 'Glass Shards', image: 'static/common/items/Items/Vials/shards.png', category: 'Crafting Materials', gold: '275', infStock: true},
    2153: {name: 'Farore&#39;s Flame', image: 'static/common/items/Items/Bling/flame_green.png', category: 'Crafting Materials', gold: '150000', infStock: false},
    2154: {name: 'Nayru&#39;s Flame', image: 'static/common/items/Items/Bling/flame_blue.png', category: 'Crafting Materials', gold: '150000', infStock: false},
    2155: {name: 'Din&#39;s Flame', image: 'static/common/items/Items/Bling/flame_red.png', category: 'Crafting Materials', gold: '150000', infStock: false},
    2212: {name: 'IRC Voice (8 Weeks)', image: 'static/common/items/Items/Buff/irc_voice_cheap.png', category: 'IRC customizations', gold: '20000', infStock: true},
    2225: {name: 'Bronze Alloy Mix', image: 'static/common/items/Items/Ore/bronze.png', category: 'Crafting Materials', gold: '1000', infStock: false},
    2226: {name: 'Iron Ore', image: 'static/common/items/Items/Ore/iron.png', category: 'Crafting Materials', gold: '2000', infStock: false},
    2227: {name: 'Gold Ore', image: 'static/common/items/Items/Ore/gold.png', category: 'Crafting Materials', gold: '3500', infStock: false},
    2228: {name: 'Mithril Ore', image: 'static/common/items/Items/Ore/mithril.png', category: 'Crafting Materials', gold: '5500', infStock: false},
    2229: {name: 'Adamantium Ore', image: 'static/common/items/Items/Ore/adamantium.png', category: 'Crafting Materials', gold: '16000', infStock: false},
    2230: {name: 'Quartz Dust', image: 'static/common/items/Items/Ore/quartz.png', category: 'Crafting Materials', gold: '1250', infStock: false},
    2231: {name: 'Jade Dust', image: 'static/common/items/Items/Ore/jade.png', category: 'Crafting Materials', gold: '2500', infStock: false},
    2232: {name: 'Amethyst Dust', image: 'static/common/items/Items/Ore/amethyst.png', category: 'Crafting Materials', gold: '8000', infStock: false},
    2233: {name: 'Lump of Coal', image: 'static/common/items/Items/Ore/coal.png', category: 'Crafting Materials', gold: '1250', infStock: true},
    2234: {name: 'Lump of Clay', image: 'static/common/items/Items/Ore/clay.png', category: 'Crafting Materials', gold: '150', infStock: true},
    2235: {name: 'Bronze Bar', image: 'static/common/items/Items/Ore/bronze_bar.png', category: 'Crafting Materials', gold: '2000', infStock: false},
    2236: {name: 'Impure Bronze Bar', image: 'static/common/items/Items/Ore/impure_bronze_bar.png', category: 'Crafting Materials', gold: '1150', infStock: false},
    2237: {name: 'Iron Bar', image: 'static/common/items/Items/Ore/iron_bar.png', category: 'Crafting Materials', gold: '4000', infStock: false},
    2238: {name: 'Steel Bar', image: 'static/common/items/Items/Ore/steel_bar.png', category: 'Crafting Materials', gold: '4500', infStock: false},
    2239: {name: 'Gold Bar', image: 'static/common/items/Items/Ore/gold_bar.png', category: 'Crafting Materials', gold: '7000', infStock: false},
    2240: {name: 'Mithril Bar', image: 'static/common/items/Items/Ore/mithril_bar.png', category: 'Crafting Materials', gold: '11000', infStock: false},
    2241: {name: 'Adamantium Bar', image: 'static/common/items/Items/Ore/adamantium_bar.png', category: 'Crafting Materials', gold: '32000', infStock: false},
    2242: {name: 'Quartz Bar', image: 'static/common/items/Items/Ore/quartz_bar.png', category: 'Crafting Materials', gold: '2500', infStock: false},
    2243: {name: 'Jade Bar', image: 'static/common/items/Items/Ore/jade_bar.png', category: 'Crafting Materials', gold: '5000', infStock: false},
    2244: {name: 'Amethyst Bar', image: 'static/common/items/Items/Ore/amethyst_bar.png', category: 'Crafting Materials', gold: '16000', infStock: false},
    2261: {name: 'Impure Bronze Cuirass', image: 'static/common/items/Cover/Body Armor/Impure_Bronze_Cuirass.png', category: 'Equipment', gold: '2300', infStock: false},
    2262: {name: 'Bronze Cuirass', image: 'https://ptpimg.me/3mf3lw.png', category: 'Equipment', gold: '4000', infStock: false},
    2263: {name: 'Iron Cuirass', image: 'static/common/items/Cover/Body Armor/Iron_Cuirass.png', category: 'Equipment', gold: '16000', infStock: false},
    2264: {name: 'Steel Cuirass', image: 'static/common/items/Cover/Body Armor/Steel_Cuirass.png', category: 'Equipment', gold: '18000', infStock: false},
    2265: {name: 'Gold Cuirass', image: 'static/common/items/Cover/Body Armor/Gold_Cuirass.png', category: 'Equipment', gold: '28000', infStock: false},
    2266: {name: 'Mithril Cuirass', image: 'static/common/items/Cover/Body Armor/Mithril_Cuirass.png', category: 'Equipment', gold: '55000', infStock: false},
    2267: {name: 'Adamantium Cuirass', image: 'static/common/items/Cover/Body Armor/Adamantium_Cuirass.png', category: 'Equipment', gold: '160000', infStock: false},
    2268: {name: 'Quartz Chainmail', image: 'static/common/items/Cover/Body Armor/Quartz_Chainmail.png', category: 'Equipment', gold: '5000', infStock: false},
    2269: {name: 'Jade Chainmail', image: 'static/common/items/Cover/Body Armor/Jade_Chainmail.png', category: 'Equipment', gold: '20000', infStock: false},
    2270: {name: 'Amethyst Chainmail', image: 'static/common/items/Cover/Body Armor/Amethyst_Chainmail.png', category: 'Equipment', gold: '80000', infStock: false},
    2295: {name: 'Pile of Snow', image: 'static/common/items/Items/Christmas/snow.png', category: 'Crafting Materials', gold: '700', infStock: true},
    2296: {name: 'Snowball', image: 'static/common/items/Items/Christmas/snowball_small.png', category: 'Crafting Materials', gold: '1400', infStock: false},
    2297: {name: 'Candy Cane', image: 'static/common/items/Items/Christmas/candycane.png', category: 'Crafting Materials', gold: '1000', infStock: true},
    2298: {name: 'Hot Chocolate', image: 'static/common/items/Items/Christmas/hotchoc.png', category: 'Stat potions', gold: '5500', infStock: false},
    2299: {name: 'Peppermint Hot Chocolate', image: 'static/common/items/Items/Christmas/peremint_hotchoc.png', category: 'Stat potions', gold: '6500', infStock: false},
    2300: {name: 'Pile of Charcoal', image: 'static/common/items/Items/Christmas/charcoal.png', category: 'Crafting Materials', gold: '5000', infStock: true},
    2303: {name: 'Hyper Realistic Eggnog', image: 'static/common/items/Items/Christmas/eggnog.png', category: 'Stat potions', gold: '5500', infStock: false},
    2305: {name: 'Large Snowball', image: 'static/common/items/Items/Christmas/snowball.png', category: 'Crafting Materials', gold: '4200', infStock: false},
    2306: {name: 'Carrot', image: 'static/common/items/Items/Christmas/carrot.png', category: 'Crafting Materials', gold: '3500', infStock: true},
    2307: {name: 'Snowman', image: 'static/common/items/Items/Christmas/snowman.png', category: 'Stat potions', gold: '27500', infStock: false},
    2323: {name: 'Ruby', image: 'static/common/items/Items/Gems/ruby.png', category: 'Crafting Materials', gold: '25000', infStock: true},
    2357: {name: 'The Golden Daedy', image: 'static/common/items/Items/Card/Staff_The_Golden_Daedy.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2358: {name: 'A Wild Artifaxx', image: 'static/common/items/Items/Card/Staff_A_Wild_Artifaxx.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2359: {name: 'A Red Hot Flamed', image: 'static/common/items/Items/Card/Staff_A_Red_Hot_Flamed.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2361: {name: 'Alpaca Out of Nowhere!', image: 'static/common/items/Items/Card/Staff_Alpaca_Out_of_Nowhere.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2364: {name: 'thewhale&#39;s Kiss', image: 'static/common/items/Items/Card/Staff_thewhales_Kiss.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2365: {name: 'Stump&#39;s Banhammer', image: 'static/common/items/Items/Card/Staff_Stumps_Banhammer.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2366: {name: 'Neo&#39;s Ratio Cheats', image: 'static/common/items/Items/Card/Staff_Neos_Ratio_Cheats.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2367: {name: 'Niko&#39;s Transformation', image: 'static/common/items/Items/Card/Staff_Nikos_Transformation.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2368: {name: 'lepik le prick', image: 'static/common/items/Items/Card/Staff_lepik_le_prick.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2369: {name: 'The Golden Throne', image: 'static/common/items/Items/Card/Staff_The_Golden_Throne.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2370: {name: 'The Biggest Banhammer', image: 'static/common/items/Items/Card/Staff_The_Biggest_Banhammer.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2371: {name: 'The Staff Beauty Parlor', image: 'static/common/items/Items/Card/Staff_The_Staff_Beauty_Parlor.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2372: {name: 'The Realm of Staff', image: 'static/common/items/Items/Card/Staff_The_Realm_of_Staff.png', category: 'Trading Cards', gold: '35000', infStock: false},
    2373: {name: 'Cake', image: 'static/common/items/Items/Card/Portal_Cake.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2374: {name: 'GLaDOS', image: 'static/common/items/Items/Card/Portal_GLaDOS.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2375: {name: 'Companion Cube', image: 'static/common/items/Items/Card/Portal_Companion_Cube.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2376: {name: 'Portal Gun', image: 'static/common/items/Items/Card/Portal_Portal_Gun.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2377: {name: 'A Scared Morty', image: 'static/common/items/Items/Card/Portal_A_Scared_Morty.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2378: {name: 'Rick Sanchez', image: 'static/common/items/Items/Card/Portal_Rick_Sanchez.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2379: {name: 'Mr. Poopy Butthole', image: 'static/common/items/Items/Card/Portal_Mr_Poopy_Butthole.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2380: {name: 'Rick&#39;s Portal Gun', image: 'static/common/items/Items/Card/Portal_Ricks_Portal_Gun.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2381: {name: 'Nyx class Supercarrier', image: 'static/common/items/Items/Card/Portal_Nyx_class_Supercarrier.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2382: {name: 'Chimera Schematic', image: 'static/common/items/Items/Card/Portal_Chimera_Schematic.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2383: {name: 'Covetor Mining Ship', image: 'static/common/items/Items/Card/Portal_Covetor_Mining_Ship.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2384: {name: 'Space Wormhole', image: 'static/common/items/Items/Card/Portal_Space_Wormhole.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2385: {name: 'Interdimensional Portal', image: 'static/common/items/Items/Card/Portal_Interdimensional_Portal.png', category: 'Trading Cards', gold: '35000', infStock: false},
    2388: {name: 'MuffledSilence&#39;s Headphones', image: 'static/common/items/Items/Card/Staff_MuffledSilences_Headphones.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2390: {name: 'Mario', image: 'static/common/items/Items/Card/Mario_Mario.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2391: {name: 'Luigi', image: 'static/common/items/Items/Card/Mario_Luigi.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2392: {name: 'Princess Peach', image: 'static/common/items/Items/Card/Mario_Princess_Peach.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2393: {name: 'Toad', image: 'static/common/items/Items/Card/Mario_Toad.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2394: {name: 'Yoshi', image: 'static/common/items/Items/Card/Mario_Yoshi.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2395: {name: 'Bowser', image: 'static/common/items/Items/Card/Mario_Bowser.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2396: {name: 'Goomba', image: 'static/common/items/Items/Card/Mario_Goomba.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2397: {name: 'Koopa Troopa', image: 'static/common/items/Items/Card/Mario_Koopa_Troopa.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2398: {name: 'Wario', image: 'static/common/items/Items/Card/Mario_Wario.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2400: {name: 'LinkinsRepeater Bone Hard Card', image: 'static/common/items/Items/Card/Staff_LinkinsRepeater_Bone_Hard_Card.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2401: {name: 'Super Mushroom', image: 'static/common/items/Items/Card/Mario_Super_Mushroom.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2402: {name: 'Fire Flower', image: 'static/common/items/Items/Card/Mario_Fire_Flower.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2403: {name: 'Penguin Suit', image: 'static/common/items/Items/Card/Mario_Penguin_Suit.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2404: {name: 'Goal Pole', image: 'static/common/items/Items/Card/Mario_Goal_Pole.png', category: 'Trading Cards', gold: '35000', infStock: false},
    2410: {name: 'Z&eacute; do Caix&atilde;o Coffin Joe Card', image: 'static/common/items/Items/Card/Staff_Ze_do_Caixao_Coffin_Joe_Card.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2421: {name: 'Din&#39;s Lootbox', image: 'static/common/items/Items/Pack/Dins_Lootbox.png', category: 'Special Items', gold: '150000', infStock: false},
    2433: {name: 'Small Luck Potion', image: 'static/common/items/Items/Potions/small_purple.png', category: 'Buffs', gold: '5000', infStock: false},
    2434: {name: 'Large Luck Potion', image: 'static/common/items/Items/Potions/large_purple.png', category: 'Buffs', gold: '14000', infStock: false},
    2436: {name: 'Glass Shards x2', image: 'static/common/items/Items/Vials/shards.png', category: 'Crafting Materials', gold: '550', infStock: true},
    2437: {name: 'Glass Shards x3', image: 'static/common/items/Items/Vials/shards.png', category: 'Crafting Materials', gold: '825', infStock: true},
    2438: {name: 'Random Lvl2 Staff Card', image: 'static/common/items/Items/Pack/Random_Lvl2_Staff_Card.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2465: {name: 'Farore&#39;s Lootbox', image: 'static/common/items/Items/Pack/Farores_Lootbox.png', category: 'Special Items', gold: '150000', infStock: false},
    2466: {name: 'Nayru&#39;s Lootbox', image: 'static/common/items/Items/Pack/Nayrus_Lootbox.png', category: 'Special Items', gold: '150000', infStock: false},
    2468: {name: 'Random Lootbox (Din, Farore, or Nayru)', image: 'static/common/items/Items/Pack/Random_Lootbox.png', category: 'Special Items', gold: '150000', infStock: false},
    2508: {name: 'Dwarven Gem', image: 'static/common/items/Items/Gems/dwarven_gem.png', category: 'Crafting Materials', gold: '100000', infStock: false},
    2537: {name: 'Carbon-Crystalline Quartz', image: 'static/common/items/Items/Gems/carbonquartz.png', category: 'Crafting Materials', gold: '3750', infStock: false},
    2538: {name: 'Carbon-Crystalline Quartz Necklace', image: 'static/common/items/Cover/Jewelry/crystalline.png', category: 'Equipment', gold: '4000', infStock: false},
    2539: {name: 'Silver Ring of Gazellia', image: 'static/common/items/Cover/Jewelry/silvering.png', category: 'Equipment', gold: '1000', infStock: true},
    2549: {name: 'Sapphire', image: 'static/common/items/Items/Gems/sapphire.png', category: 'Crafting Materials', gold: '6000', infStock: true},
    2550: {name: 'Ruby Chip', image: 'static/common/items/Items/Gems/chip_ruby.png', category: 'Crafting Materials', gold: '2500', infStock: true},
    2551: {name: 'Emerald Chip', image: 'static/common/items/Items/Gems/chip_emerald.png', category: 'Crafting Materials', gold: '1000', infStock: true},
    2554: {name: 'Unity Flame Necklet', image: 'static/common/items/Cover/Jewelry/unityneck.png', category: 'Equipment', gold: '1000000', infStock: false},
    2563: {name: 'Exquisite Constellation of Rubies', image: 'static/common/items/Items/Jewelry/constellation_ruby.png', category: 'Crafting Materials', gold: '120000', infStock: false},
    2564: {name: 'Exquisite Constellation of Sapphires', image: 'static/common/items/Items/Jewelry/constellation_sapphire.png', category: 'Crafting Materials', gold: '44000', infStock: false},
    2565: {name: 'Exquisite Constellation of Emeralds', image: 'static/common/items/Items/Jewelry/constellation_emerald.png', category: 'Crafting Materials', gold: '60000', infStock: false},
    2579: {name: 'Ruby-Flecked Wheat', image: 'static/common/items/Items/Food/wheat_ruby.png', category: 'Crafting Materials', gold: '1200', infStock: false},
    2580: {name: 'Ruby-Grained Baguette', image: 'static/common/items/Items/Food/baguette_ruby.png', category: 'Buffs', gold: '2400', infStock: false},
    2581: {name: 'Garlic Ruby-Baguette', image: 'static/common/items/Items/Food/garlic_ruby.png', category: 'Buffs', gold: '4500', infStock: false},
    2582: {name: 'Artisan Ruby-Baguette', image: 'static/common/items/Items/Food/artisan_ruby.png', category: 'Buffs', gold: '9500', infStock: false},
    2584: {name: 'Unity Flame Band', image: 'static/common/items/Cover/Jewelry/unityring.png', category: 'Equipment', gold: '850000', infStock: false},
    2585: {name: 'Amethyst', image: 'static/common/items/Items/Gems/amethyst.png', category: 'Crafting Materials', gold: '30000', infStock: true},
    2589: {name: 'Ripe Pumpkin', image: 'static/common/items/Items/Card/Halloween_Ripe_Pumpkin.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2590: {name: 'Rotting Pumpkin', image: 'static/common/items/Items/Card/Halloween_Rotting_Pumpkin.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2591: {name: 'Carved Pumpkin', image: 'static/common/items/Items/Card/Halloween_Carved_Pumpkin.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2592: {name: 'Stormrage Pumpkin', image: 'static/common/items/Items/Card/Halloween_Stormrage_Pumpkin.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2593: {name: 'Russian Pumpkin', image: 'static/common/items/Items/Card/Halloween_Russian_Pumpkin.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2594: {name: 'Green Mario Pumpkin', image: 'static/common/items/Items/Card/Halloween_Green_Mario_Pumpkin.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2595: {name: 'Lame Pumpkin Trio', image: 'static/common/items/Items/Card/Halloween_Lame_Pumpkin_Trio.png', category: 'Trading Cards', gold: '35000', infStock: false},
    2600: {name: 'Pumpkin Badge Bits', image: 'static/common/items/Items/Halloween/pumpkin_bits.png', category: 'Stat potions', gold: '2250', infStock: false},
    2601: {name: 'Halloween Pumpkin Badge', image: 'static/common/items/Items/Badges/Halloween_Pumpkin_Badge.png', category: 'User badges', gold: '13500', infStock: false},
    2627: {name: 'Blacksmith Tongs', image: 'static/common/items/Items/Recast/blacksmith_tongs.png', category: 'Crafting Materials', gold: '50', infStock: true},
    2639: {name: 'Dwarven Disco Ball', image: 'static/common/items/Cover/Clothing/disco_ball.png', category: 'Equipment', gold: '900000', infStock: false},
    2641: {name: 'Impure Bronze Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Impure_Bronze_Claymore.png', category: 'Equipment', gold: '2300', infStock: false},
    2642: {name: 'Bronze Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Bronze_Claymore.png', category: 'Equipment', gold: '4000', infStock: false},
    2643: {name: 'Iron Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Iron_Claymore.png', category: 'Equipment', gold: '16000', infStock: false},
    2644: {name: 'Steel Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Steel_Claymore.png', category: 'Equipment', gold: '18000', infStock: false},
    2645: {name: 'Gold Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Gold_Claymore.png', category: 'Equipment', gold: '28000', infStock: false},
    2646: {name: 'Mithril Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Mithril_Claymore.png', category: 'Equipment', gold: '55000', infStock: false},
    2647: {name: 'Adamantium Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Adamantium_Claymore.png', category: 'Equipment', gold: '160000', infStock: false},
    2648: {name: 'Quartz Khopesh', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Quartz_Khopesh.png', category: 'Equipment', gold: '5000', infStock: false},
    2649: {name: 'Jade Khopesh', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Jade_Khopesh.png', category: 'Equipment', gold: '20000', infStock: false},
    2650: {name: 'Amethyst Khopesh', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Amethyst_Khopesh.png', category: 'Equipment', gold: '80000', infStock: false},
    2653: {name: 'Flux', image: 'static/common/items/Items/Recast/flux.png', category: 'Crafting Materials', gold: '50', infStock: true},
    2656: {name: 'Impure Bronze Bar x2', image: 'static/common/items/Items/Ore/impure_bronze_bar.png', category: 'Crafting Materials', gold: '2500', infStock: false},
    2666: {name: 'Bronze Alloy Mix x2', image: 'static/common/items/Items/Ore/bronze.png', category: 'Crafting Materials', gold: '2000', infStock: false},
    2668: {name: 'Iron Ore x2', image: 'static/common/items/Items/Ore/iron.png', category: 'Crafting Materials', gold: '4000', infStock: false},
    2670: {name: 'Gold Ore x2', image: 'static/common/items/Items/Ore/gold.png', category: 'Crafting Materials', gold: '7000', infStock: false},
    2671: {name: 'Mithril Ore x2', image: 'static/common/items/Items/Ore/mithril.png', category: 'Crafting Materials', gold: '11000', infStock: false},
    2672: {name: 'Adamantium Ore x2', image: 'static/common/items/Items/Ore/adamantium.png', category: 'Crafting Materials', gold: '32000', infStock: false},
    2673: {name: 'Quartz Dust x2', image: 'static/common/items/Items/Ore/quartz.png', category: 'Crafting Materials', gold: '2000', infStock: false},
    2675: {name: 'Jade Dust x2', image: 'static/common/items/Items/Ore/jade.png', category: 'Crafting Materials', gold: '4000', infStock: false},
    2676: {name: 'Amethyst Dust x2', image: 'static/common/items/Items/Ore/amethyst.png', category: 'Crafting Materials', gold: '16000', infStock: false},
    2688: {name: 'Christmas Spices', image: 'static/common/items/Items/Christmas/spices.png', category: 'Crafting Materials', gold: '2600', infStock: true},
    2689: {name: 'Old Scarf &amp; Hat', image: 'static/common/items/Items/Christmas/hatscarf.png', category: 'Crafting Materials', gold: '2500', infStock: true},
    2698: {name: 'Perfect Snowball', image: 'static/common/items/Items/Card/Christmas_Perfect_Snowball.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2699: {name: 'Mistletoe', image: 'static/common/items/Items/Card/Christmas_Mistletoe.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2700: {name: 'Santa Suit', image: 'static/common/items/Items/Card/Christmas_Santa_Suit.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2701: {name: 'Abominable Santa', image: 'static/common/items/Items/Card/Christmas_Abominable_Santa.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2702: {name: 'Icy Kisses', image: 'static/common/items/Items/Card/Christmas_Icy_Kisses.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2703: {name: 'Sexy Santa', image: 'static/common/items/Items/Card/Christmas_Sexy_Santa.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2704: {name: 'Christmas Cheer', image: 'static/common/items/Items/Card/Christmas_Christmas_Cheer.png', category: 'Trading Cards', gold: '35000', infStock: false},
    2717: {name: 'Emerald-Flecked Wheat', image: 'static/common/items/Items/Food/wheat_emerald.png', category: 'Crafting Materials', gold: '600', infStock: false},
    2718: {name: 'Emerald-Grained Baguette', image: 'static/common/items/Items/Food/bagette_emerald.png', category: 'Buffs', gold: '1200', infStock: false},
    2719: {name: 'Garlic Emerald-Baguette', image: 'static/common/items/Items/Food/garlic_emerald.png', category: 'Buffs', gold: '2500', infStock: false},
    2720: {name: 'Artisan Emerald-Baguette', image: 'static/common/items/Items/Food/artisan_emerald.png', category: 'Buffs', gold: '6000', infStock: false},
    2721: {name: 'Gazellian Emerald-Baguette', image: 'static/common/items/Items/Food/gazellian_emerald.png', category: 'Buffs', gold: '8000', infStock: false},
    2761: {name: 'Impure Bronze Segmentata', image: 'static/common/items/Cover/Body Armor/Impure_Bronze_Segmentata.png', category: 'Equipment', gold: '1150', infStock: false},
    2762: {name: 'Bronze Segmentata', image: 'static/common/items/Cover/Body Armor/Bronze_Segmentata.png', category: 'Equipment', gold: '2000', infStock: false},
    2763: {name: 'Iron Segmentata', image: 'static/common/items/Cover/Body Armor/Iron_Segmentata.png', category: 'Equipment', gold: '8000', infStock: false},
    2764: {name: 'Steel Segmentata', image: 'static/common/items/Cover/Body Armor/Steel_Segmentata.png', category: 'Equipment', gold: '9000', infStock: false},
    2765: {name: 'Gold Segmentata', image: 'static/common/items/Cover/Body Armor/Gold_Segmentata.png', category: 'Equipment', gold: '14000', infStock: false},
    2766: {name: 'Mithril Segmentata', image: 'static/common/items/Cover/Body Armor/Mithril_Segmentata.png', category: 'Equipment', gold: '22000', infStock: false},
    2767: {name: 'Adamantium Segmentata', image: 'static/common/items/Cover/Body Armor/Adamantium_Segmentata.png', category: 'Equipment', gold: '64000', infStock: false},
    2772: {name: 'Regenerate', image: 'static/common/items/Items/AdventureClub/attack_meditation.png', category: 'Attacks', gold: '200', infStock: false},
    2774: {name: 'Hypnosis', image: 'static/common/items/Items/AdventureClub/attack_hypnosis.png', category: 'Attacks', gold: '250', infStock: false},
    2775: {name: 'Muddle', image: 'static/common/items/Items/AdventureClub/attack_muddle.png', category: 'Attacks', gold: '250', infStock: false},
    2776: {name: 'Parasite', image: 'static/common/items/Items/AdventureClub/attack_parasite.png', category: 'Attacks', gold: '800', infStock: false},
    2801: {name: '3 Backpack Slots', image: 'static/common/items/Items/AdventureClub/backpack_3.png', category: 'Backpack (IRC)', gold: '300', infStock: false},
    2802: {name: '4 Backpack Slots', image: 'static/common/items/Items/AdventureClub/backpack_4.png', category: 'Backpack (IRC)', gold: '400', infStock: false},
    2803: {name: '6 Backpack Slots', image: 'static/common/items/Items/AdventureClub/backpack_6.png', category: 'Backpack (IRC)', gold: '600', infStock: false},
    2813: {name: 'Scrap', image: 'static/common/items/Items/AdventureClub/craft_scrap.png', category: 'Items', gold: '500', infStock: false},
    2814: {name: 'Cloth', image: 'static/common/items/Items/AdventureClub/craft_cloth.png', category: 'Items', gold: '500', infStock: false},
    2816: {name: 'Hide', image: 'static/common/items/Items/AdventureClub/craft_hide.png', category: 'Items', gold: '500', infStock: false},
    2822: {name: 'Can&#39;t Believe This Is Cherry', image: 'static/common/items/Items/Birthday/chakefhake.png', category: 'Buffs', gold: '8000', infStock: false},
    2825: {name: '9th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/9th_Birthday_Badge.png', category: 'User badges', gold: '13500', infStock: false},
    2826: {name: 'Lick Badge Bits', image: 'static/common/items/Items/Birthday/licks_bits.png', category: 'Stat potions', gold: '2250', infStock: false},
    2829: {name: 'Ripped Gazelle', image: 'static/common/items/Items/Card/Birthday_Ripped_Gazelle.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2830: {name: 'Fancy Gazelle', image: 'static/common/items/Items/Card/Birthday_Fancy_Gazelle.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2831: {name: 'Gamer Gazelle', image: 'static/common/items/Items/Card/Birthday_Gamer_Gazelle.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2833: {name: 'Future Gazelle', image: 'static/common/items/Items/Card/Birthday_Future_Gazelle.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2834: {name: 'Alien Gazelle', image: 'static/common/items/Items/Card/Birthday_Alien_Gazelle.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2835: {name: 'Lucky Gazelle', image: 'static/common/items/Items/Card/Birthday_Lucky_Gazelle.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2836: {name: 'Supreme Gazelle', image: 'static/common/items/Items/Card/Birthday_Supreme_Gazelle.png', category: 'Trading Cards', gold: '35000', infStock: false},
    2841: {name: 'Condensed Light', image: 'static/common/items/Items/AdventureClub/craft_light.png', category: 'Items', gold: '500', infStock: false},
    2842: {name: 'Bottled Ghost', image: 'static/common/items/Items/AdventureClub/craft_bottle_ghost.png.png', category: 'Items', gold: '500', infStock: false},
    2844: {name: 'Glowing Leaves', image: 'static/common/items/Items/AdventureClub/craft_glowing_leaves.png.png', category: 'Items', gold: '50', infStock: false},
    2845: {name: 'Dark Orb', image: 'static/common/items/Items/AdventureClub/attack_darkorb.png', category: 'Attacks', gold: '5000', infStock: false},
    2846: {name: 'Burst of Light', image: 'static/common/items/Items/AdventureClub/attack_burstlight.png', category: 'Attacks', gold: '5000', infStock: false},
    2847: {name: 'Scrappy Gauntlets', image: 'static/common/items/Cover/AdventureClub/scrappy_gauntlets.png', category: 'Items', gold: '2500', infStock: false},
    2849: {name: 'Quartz Lamellar', image: 'static/common/items/Cover/Body Armor/Quartz_Lamellar.png', category: 'Equipment', gold: '2500', infStock: false},
    2850: {name: 'Jade Lamellar', image: 'static/common/items/Cover/Body Armor/Jade_Lamellar.png', category: 'Equipment', gold: '10000', infStock: false},
    2851: {name: 'Amethyst Lamellar', image: 'static/common/items/Cover/Body Armor/Amethyst_Lamellar.png', category: 'Equipment', gold: '32000', infStock: false},
    2852: {name: 'Impure Bronze Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Impure_Bronze_Billhook.png', category: 'Equipment', gold: '1150', infStock: false},
    2853: {name: 'Bronze Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Bronze_Billhook.png', category: 'Equipment', gold: '2000', infStock: false},
    2854: {name: 'Iron Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Iron_Billhook.png', category: 'Equipment', gold: '8000', infStock: false},
    2855: {name: 'Steel Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Steel_Billhook.png', category: 'Equipment', gold: '9000', infStock: false},
    2856: {name: 'Gold Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Gold_Billhook.png', category: 'Equipment', gold: '14000', infStock: false},
    2857: {name: 'Mithril Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Mithril_Billhook.png', category: 'Equipment', gold: '22000', infStock: false},
    2858: {name: 'Adamantium Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Adamantium_Billhook.png', category: 'Equipment', gold: '64000', infStock: false},
    2859: {name: 'Quartz Guandao', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Quartz_Guandao.png', category: 'Equipment', gold: '2500', infStock: false},
    2860: {name: 'Jade Guandao', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Jade_Guandao.png', category: 'Equipment', gold: '10000', infStock: false},
    2861: {name: 'Amethyst Guandao', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Amethyst_Guandao.png', category: 'Equipment', gold: '32000', infStock: false},
    2862: {name: 'Impure Bronze Armguards', image: 'static/common/items/Cover/Arm Armor/Impure_Bronze_Armguards.png', category: 'Equipment', gold: '1250', infStock: false},
    2892: {name: 'Glowing Ash', image: 'https://ptpimg.me/3i2xd1.png', category: 'Items', gold: '50', infStock: false},
    2893: {name: 'Troll Tooth', image: 'https://ptpimg.me/mrr24x.png', category: 'Items', gold: '50', infStock: false},
    2894: {name: 'Advanced Hide', image: 'https://ptpimg.me/1d6926.png', category: 'Items', gold: '50', infStock: false},
    2900: {name: 'Burning Ash Cloud', image: 'https://ptpimg.me/n7900m.png', category: 'Attacks', gold: '7500', infStock: false},
    2901: {name: 'Troll Tooth Necklace', image: 'https://ptpimg.me/480516.png', category: 'Items', gold: '3500', infStock: false},
    2908: {name: 'Impure Bronze Power Gloves', image: 'https://ptpimg.me/9d1e15.png', category: 'Equipment', gold: '4000', infStock: false},
    2915: {name: 'Flame Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Flame_Badge.png', category: 'User badges', gold: '1000000', infStock: false},
    2930: {name: 'Nayru&#39;s Username', image: 'static/common/items/Items/Username/Nayru.png', category: 'Username customizations', gold: '270000', infStock: false},
    2931: {name: 'Farore&#39;s Username', image: 'static/common/items/Items/Username/Farore.png', category: 'Username customizations', gold: '270000', infStock: false},
    2932: {name: 'Din&#39;s Username', image: 'static/common/items/Items/Username/Din.png', category: 'Username customizations', gold: '270000', infStock: false},
    2945: {name: 'Bloody Mario', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Bloody_Mario.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2946: {name: 'Mommy&#39;s Recipe', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Mommys_Recipe.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2947: {name: 'Memory Boost', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Memory_Boost.png', category: 'Trading Cards', gold: '6660', infStock: false},
    2948: {name: 'Link was here!', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Link_was_here.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2949: {name: 'Gohma Sees You', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Gohma_sees_you.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2950: {name: 'Skultilla the Cake Guard', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Skultilla_the_cake_guard.png', category: 'Trading Cards', gold: '6660', infStock: false},
    2951: {name: 'Who eats whom?', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Who_eats_whom.png', category: 'Trading Cards', gold: '15000', infStock: false},
    2952: {name: 'Cupcake Crumbles', image: 'https://ptpimg.me/ckw9ad.png', category: 'Crafting Materials', gold: '2250', infStock: false},
    2953: {name: 'Halloween Cupcake Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Halloween_Cupcake_Badge.png', category: 'User badges', gold: '13500', infStock: false},
    2969: {name: 'Gingerbread Kitana', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Kitana.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2970: {name: 'Gingerbread Marston', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Marston.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2972: {name: 'Gingerbread Doomslayer', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Doomslayer.png', category: 'Trading Cards', gold: '6500', infStock: false},
    2973: {name: 'Millenium Falcon Gingerbread', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Millenium_Falcon.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2974: {name: 'Gingerbread AT Walker', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_AT_Walker.png', category: 'Trading Cards', gold: '3000', infStock: false},
    2975: {name: 'Mario Christmas', image: 'static/common/items/Items/Card/9th_Christmas_Mario_Christmas.png', category: 'Trading Cards', gold: '6500', infStock: false},
    2976: {name: 'Baby Yoda with Gingerbread', image: 'static/common/items/Items/Card/9th_Christmas_Baby_Yoda.png', category: 'Trading Cards', gold: '14000', infStock: false},
    2986: {name: 'Sonic and Amy', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Sonic_and_Amy.png', category: 'Trading Cards', gold: '2000', infStock: false},
    2987: {name: 'Yoshi and Birdo', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Yoshi_and_Birdo.png', category: 'Trading Cards', gold: '2000', infStock: false},
    2988: {name: 'Kirlia and Meloetta', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Kirlia_and_Meloetta.png', category: 'Trading Cards', gold: '4500', infStock: false},
    2989: {name: 'Aerith and Cloud', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Aerith_and_Cloud.png', category: 'Trading Cards', gold: '2000', infStock: false},
    2990: {name: 'Master Chief and Cortana', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Master_Chief_and_Cortana.png', category: 'Trading Cards', gold: '2000', infStock: false},
    2991: {name: 'Dom and Maria', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Master_Dom_and_Maria.png', category: 'Trading Cards', gold: '4500', infStock: false},
    2992: {name: 'Mr. and Mrs. Pac Man', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Master_Mr_and_Mrs_Pac_Man.png', category: 'Trading Cards', gold: '10000', infStock: false},
    2993: {name: 'Chainsaw Chess', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Chainsaw_Chess.png', category: 'Trading Cards', gold: '2000', infStock: false},
    2994: {name: 'Chainsaw Wizard', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Chainsaw_Wizard.png', category: 'Trading Cards', gold: '2000', infStock: false},
    2995: {name: 'Angelise Reiter', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Angelise_Reiter.png', category: 'Trading Cards', gold: '4500', infStock: false},
    2996: {name: 'Ivy Valentine', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Ivy_Valentine.png', category: 'Trading Cards', gold: '2000', infStock: false},
    2997: {name: 'Jill Valentine', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Jill_Valentine.png', category: 'Trading Cards', gold: '2000', infStock: false},
    2998: {name: 'Sophitia', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Sophitia.png', category: 'Trading Cards', gold: '4500', infStock: false},
    2999: {name: 'Yennefer', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Yennefer.png', category: 'Trading Cards', gold: '10000', infStock: false},
    3000: {name: 'Valentine Sugar Heart', image: 'https://ptpimg.me/82osc2.png', category: 'Stat potions', gold: '500', infStock: false},
    3001: {name: 'Valentine Chocolate Heart', image: 'https://ptpimg.me/gg9293.png', category: 'Stat potions', gold: '500', infStock: false},
    3002: {name: 'Valentine Rose', image: 'https://ptpimg.me/o6mt84.png', category: 'Buffs', gold: '5000', infStock: false},
    3004: {name: 'Special Box', image: 'static/common/items/Items/Valentine2022/special_box.png', category: 'Special Items', gold: '300000', infStock: false},
    3023: {name: 'Exodus Truce', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Exodus_Truce.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3024: {name: 'Gazelle Breaking Bad', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Gazelle_Breaking_Bad.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3025: {name: 'A Fair Fight', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_A_Fair_Fight.png', category: 'Trading Cards', gold: '6500', infStock: false},
    3026: {name: 'Home Sweet Home', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Home_Sweet_Home.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3027: {name: 'Birthday Battle Kart', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Birthday_Battle_Kart.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3028: {name: 'What an Adventure', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_What_an_Adventure.png', category: 'Trading Cards', gold: '6500', infStock: false},
    3029: {name: 'After Party', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_After_Party.png', category: 'Trading Cards', gold: '15000', infStock: false},
    3031: {name: 'Birthday Leaves (10th)', image: 'https://ptpimg.me/744jj8.png', category: 'Stat potions', gold: '2250', infStock: false},
    3032: {name: '10th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/10th_Birthday_Badge.png', category: 'User badges', gold: '13500', infStock: false},
    3105: {name: 'Cyberpunk 2077', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Cyberpunk_2077.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3106: {name: 'Watch Dogs Legion', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Watch_Dogs_Legion.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3107: {name: 'Dirt 5', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Dirt_5.png', category: 'Trading Cards', gold: '6000', infStock: false},
    3108: {name: 'Genshin Impact', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Genshin_Impact.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3109: {name: 'Animal Crossing', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Animal_Crossing.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3110: {name: 'Gazelle', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Gazelle.png', category: 'Trading Cards', gold: '6000', infStock: false},
    3111: {name: 'Mafia', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Mafia.png', category: 'Trading Cards', gold: '15000', infStock: false},
    3112: {name: 'Christmas Bauble Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Bauble_Badge.png', category: 'User badges', gold: '8000', infStock: false},
    3113: {name: 'Red Crewmate Bauble', image: 'https://ptpimg.me/43o3rh.png', category: 'Crafting Materials', gold: '5000', infStock: false},
    3114: {name: 'Green Crewmate Bauble', image: 'https://ptpimg.me/sm003l.png', category: 'Crafting Materials', gold: '5001', infStock: false},
    3115: {name: 'Cyan Crewmate Bauble', image: 'https://ptpimg.me/r85pwu.png', category: 'Crafting Materials', gold: '5000', infStock: false},
    3117: {name: 'Christmas Impostor Bauble?', image: 'https://ptpimg.me/455r6g.png', category: 'Special Items', gold: '10000', infStock: false},
    3119: {name: 'Broken Bauble Fragment', image: 'https://ptpimg.me/w3544e.png', category: 'Crafting Materials', gold: '2250', infStock: false},
    3120: {name: 'Wilted Four-Leaves Holly', image: 'https://ptpimg.me/nsth09.png', category: 'Crafting Materials', gold: '2250', infStock: false},
    3121: {name: 'Lucky Four-Leaves Holly', image: 'https://ptpimg.me/136074.png', category: 'Buffs', gold: '8000', infStock: false},
    3136: {name: 'Cupid&#39;s Winged Boots', image: 'https://ptpimg.me/vlk630.png', category: 'Equipment', gold: '160000', infStock: false},
    3143: {name: 'Symbol of Love', image: 'https://ptpimg.me/cf9vfc.png', category: 'Crafting Materials', gold: '100000', infStock: false},
    3144: {name: 'Old Worn Boots', image: 'https://ptpimg.me/66unrh.png', category: 'Crafting Materials', gold: '10000', infStock: true},
    3145: {name: 'Cupid&#39;s Magical Feather', image: 'https://ptpimg.me/004ho6.png', category: 'Crafting Materials', gold: '21500', infStock: false},
    3151: {name: 'Bill Rizer', image: 'static/common/items/Items/Card/11th_Birthday_Bill_Rizer.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3152: {name: 'Donkey Kong', image: 'static/common/items/Items/Card/11th_Birthday_Donkey_Kong.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3153: {name: 'Duck Hunt Dog', image: 'static/common/items/Items/Card/11th_Birthday_Duck_Hunt_Dog.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3154: {name: 'Dr. Mario', image: 'static/common/items/Items/Card/11th_Birthday_Dr_Mario.png', category: 'Trading Cards', gold: '10000', infStock: false},
    3155: {name: 'Pit', image: 'static/common/items/Items/Card/11th_Birthday_Pit.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3156: {name: 'Little Mac', image: 'static/common/items/Items/Card/11th_Birthday_Little_Mac.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3157: {name: 'Mega Man', image: 'static/common/items/Items/Card/11th_Birthday_Mega_Man.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3158: {name: 'Link', image: 'static/common/items/Items/Card/11th_Birthday_Link.png', category: 'Trading Cards', gold: '10000', infStock: false},
    3159: {name: 'Pac-Man', image: 'static/common/items/Items/Card/11th_Birthday_Pac_Man.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3160: {name: 'Samus Aran', image: 'static/common/items/Items/Card/11th_Birthday_Samus_Aran.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3161: {name: 'Simon Belmont', image: 'static/common/items/Items/Card/11th_Birthday_Simon_Belmont.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3162: {name: 'Kirby', image: 'static/common/items/Items/Card/11th_Birthday_Kirby.png', category: 'Trading Cards', gold: '10000', infStock: false},
    3163: {name: 'Black Mage', image: 'static/common/items/Items/Card/11th_Birthday_Black_Mage.png', category: 'Trading Cards', gold: '35000', infStock: false},
    3165: {name: '11th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/11th_Birthday_Badge.png', category: 'User badges', gold: '13500', infStock: false},
    3166: {name: 'Party Pipe Badge Bit', image: 'https://ptpimg.me/r6vdr3.png', category: 'Crafting Materials', gold: '2250', infStock: false},
    3218: {name: 'Milk', image: 'https://ptpimg.me/raa068.png', category: 'Crafting Materials', gold: '3000', infStock: false},
    3219: {name: 'Cherries', image: 'https://ptpimg.me/x02af9.png', category: 'Crafting Materials', gold: '3000', infStock: false},
    3220: {name: 'Grapes', image: 'https://ptpimg.me/351721.png', category: 'Crafting Materials', gold: '3000', infStock: false},
    3221: {name: 'Coconuts', image: 'https://ptpimg.me/9c121y.png', category: 'Crafting Materials', gold: '3000', infStock: false},
    3222: {name: 'Marshmallows', image: 'https://ptpimg.me/6tl43k.png', category: 'Crafting Materials', gold: '3000', infStock: false},
    3223: {name: 'Cocoa beans', image: 'https://ptpimg.me/8h05tu.png', category: 'Crafting Materials', gold: '3000', infStock: false},
    3224: {name: 'Vanilla Pods', image: 'https://ptpimg.me/7c4us8.png', category: 'Crafting Materials', gold: '3000', infStock: false},
    3225: {name: 'Strawberries', image: 'https://ptpimg.me/gp622c.png', category: 'Crafting Materials', gold: '3000', infStock: false},
    3226: {name: '&quot;Grape&quot; Milkshake', image: 'static/common/items/Items/Birthday/grapeshake.png', category: 'Buffs', gold: 0, infStock: false},
    3227: {name: ' Coco-Cooler Milkshake', image: 'static/common/items/Items/Birthday/coconutshake.png', category: 'Buffs', gold: '8000', infStock: false},
    3228: {name: 'Cinnamon Milkshake', image: 'https://ptpimg.me/kl097r.png', category: 'Buffs', gold: '8000', infStock: false},
    3229: {name: 'Rocky Road Milkshake', image: 'https://ptpimg.me/q8634k.png', category: 'Buffs', gold: '11000', infStock: false},
    3230: {name: 'Neapolitan Milkshake', image: 'https://ptpimg.me/fr7433.png', category: 'Buffs', gold: '14000', infStock: false},
    3241: {name: 'Cinnamon', image: 'https://ptpimg.me/tol70u.png', category: 'Crafting Materials', gold: '3000', infStock: false},
    3263: {name: 'Blinky', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Blinky.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3264: {name: 'Halloween Tombstone Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Halloween2021_Thombstone_Badge.png', category: 'User badges', gold: '15000', infStock: false},
    3265: {name: 'Clyde', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Clyde.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3266: {name: 'Pinky', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Pinky.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3267: {name: 'Inky', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Inky.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3268: {name: 'Ghostbusters', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Ghostbusters.png', category: 'Trading Cards', gold: '6500', infStock: false},
    3269: {name: 'Boo', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Boo.png', category: 'Trading Cards', gold: '6500', infStock: false},
    3270: {name: 'King Boo', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_King_Boo.png', category: 'Trading Cards', gold: '15000', infStock: false},
    3281: {name: 'Haunted Tombstone Shard', image: 'https://gazellegames.net/static/common/items/Items/Halloween2021/Haunted_Tombstone_Shard.png', category: 'Special Items', gold: '2500', infStock: false},
    3313: {name: 'Snowman Cookie', image: 'static/common/items/Items/Christmas2021/Christmas2021_Snowman_Cookie.png', category: 'Stat potions', gold: '650', infStock: false},
    3322: {name: 'Young Snowman', image: 'static/common/items/Items/Christmas2021/Christmas2021_Young_Snowman.png', category: 'Equipment', gold: '35000', infStock: false},
    3328: {name: 'Santa Claus Is Out There', image: 'static/common/items/Items/Card/Christmas2021_Santa_Claus_Is_Out_There.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3329: {name: 'Back to the Future', image: 'static/common/items/Items/Card/Christmas2021_Back_to_the_Future.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3330: {name: 'Big Lebowski', image: 'static/common/items/Items/Card/Christmas2021_Big_Lebowski.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3331: {name: 'Picard', image: 'static/common/items/Items/Card/Christmas2021_Picard.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3332: {name: 'Braveheart', image: 'static/common/items/Items/Card/Christmas2021_Braveheart.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3333: {name: 'Indy', image: 'static/common/items/Items/Card/Christmas2021_Indy.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3334: {name: 'Gremlins', image: 'static/common/items/Items/Card/Christmas2021_Gremlins.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3335: {name: 'Die Hard', image: 'static/common/items/Items/Card/Christmas2021_Die_Hard.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3336: {name: 'Jurassic Park', image: 'static/common/items/Items/Card/Christmas2021_Jurassic_Park.png', category: 'Trading Cards', gold: '3000', infStock: false},
    3338: {name: 'Mando', image: 'static/common/items/Items/Card/Christmas2021_Mando.png', category: 'Trading Cards', gold: '10000', infStock: false},
    3339: {name: 'Doomguy ', image: 'static/common/items/Items/Card/Christmas2021_Doomguy.png', category: 'Trading Cards', gold: '10000', infStock: false},
    3340: {name: 'Grievous', image: 'static/common/items/Items/Card/Christmas2021_Grievous.png', category: 'Trading Cards', gold: '10000', infStock: false},
    3341: {name: 'Have a Breathtaking Christmas', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2021_Have_a_Breathtaking_Christmas.png', category: 'Trading Cards', gold: '35000', infStock: false},
    3358: {name: 'Valentine&#39;s Day 2022 Badge', image: 'static/common/items/Items/Valentine2022/valentines_badge_shop.png', category: 'User badges', gold: '15000', infStock: false},
    3359: {name: 'Rose Petals', image: 'static/common/items/Items/Valentine2022/rose_petals.png', category: 'Crafting Materials', gold: '3750', infStock: false},
    3368: {name: 'IRC Voice (1 Year)', image: 'static/common/items/Items/Buff/irc_voice_cheap.png', category: 'IRC customizations', gold: '130000', infStock: true},
    3369: {name: 'Red Dragon', image: 'https://ptpimg.me/01y295.png', category: 'Equipment', gold: '500000', infStock: false},
    3370: {name: 'Blue Dragon', image: 'https://ptpimg.me/g1t9wq.png', category: 'Equipment', gold: '500000', infStock: false},
    3371: {name: 'Green Dragon', image: 'https://ptpimg.me/eb6p8q.png', category: 'Equipment', gold: '500000', infStock: false},
    3373: {name: 'Gold Dragon', image: 'https://ptpimg.me/39xam3.png', category: 'Equipment', gold: '1000000', infStock: false},
    3378: {name: '12th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/12th_Birthday_Badge.png', category: 'User badges', gold: '15000', infStock: false},
    3379: {name: 'Slice of Birthday Cake', image: 'https://ptpimg.me/880dpt.png', category: 'Crafting Materials', gold: '3000', infStock: false},
    3384: {name: 'Golden Egg', image: 'https://ptpimg.me/vg48o6.png', category: 'Crafting Materials', gold: '1000000', infStock: true},
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
  GM_deleteValue('selected_books');
  const books = {
    Glass: {bgcolor: 'white', color: 'black'},
    Potions: {bgcolor: 'green', color: 'white'},
    // Luck: {bgcolor: 'blue', color: 'white'},
    Food: {bgcolor: 'wheat', color: 'black'},
    Dwarven: {bgcolor: 'brown', color: 'beige'},
    'Material Bars': {bgcolor: 'purple', color: 'white'},
    Armor: {bgcolor: 'darkblue', color: 'white'},
    Weapons: {bgcolor: 'darkred', color: 'white'},
    Recasting: {bgcolor: 'gray', color: 'white'},
    Jewelry: {bgcolor: 'deeppink', color: 'white'},
    Bling: {bgcolor: 'gold', color: 'darkgray'},
    'Trading Decks': {bgcolor: '#15273F', color: 'white'},
    'Xmas Crafting': {bgcolor: 'red', color: 'lightgreen'},
    Birthday: {bgcolor: 'darkgray', color: 'gold'},
    Valentines: {bgcolor: 'pink', color: 'deeppink'},
    'Adventure Club': {bgcolor: 'yellow', color: 'black'},
    Halloween: {bgcolor: 'gray', color: 'black'},
  };
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
    'Material Bars': [
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
    'Trading Decks': [
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
    'Xmas Crafting': [
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
    'Adventure Club': [
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
  // #endregion Static site data (generated/api-intense)
  //

  //
  // #region Document building
  //

  //
  // #region Stylesheets
  //
  const head = $('head');
  head.append(`<style>
.crafting-clear {
  clear: both;
  margin-bottom: 1rem
}
.crafting-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.crafting-panel__main {
  display: flex;
  flex-direction: row;
  gap: .125rem;
}
.crafting-panel__title {
  margin-bottom: .5rem;
  margin-top: 0;
}
.crafting-panel__column {
  display: flex;
  flex-direction: column;
}
.crafting-panel__row {
  display: flex;
  flex-direction: row;
  gap: .25rem;
}
/* Scale factor times size of grid, grid size from #slots_panel */
.crafting-panel-grid__wrapper {
  height: 277.5px;
  width: 412.5px;
  min-width: 412.5px;
  flex: 0;
}
/* TODO use scale factor against height width of this and parent */
.crafting-panel-grid__main {
  background: url('/static/styles/game_room/images/shop/crafting_panel.jpg');
  height: 370px;
  width: 550px;
  position: relative;
  transform: scale(0.75);
  transform-origin: top left;
}
.crafting-panel-grid__slot,
.crafting-panel-grid__result,
.crafting-panel-grid__requirement {
  position: absolute;
  background: transparent;
}
.crafting-panel-info-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 275px;
}
.crafting-panel-info__ingredients-header {
  margin-bottom: .5rem;
}
.crafting-panel-info__ingredient-row {
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  align-items: center;
  align-self: left;
}
.crafting-panel-info__ingredient-shop-link {
  border-radius: 50%;
  background-color: orange;
  color: black;
  padding: 0 0.25rem;
}
.crafting-panel-info__ingredient-shop-link--purchasable {
  background-color: green;
}
.crafting-panel-info__ingredient {
  display: flex;
  flex-direction: row;
  column-gap: 0.25rem;
  align-items: center;
  align-self: left;
}
.crafting-panel-info__ingredient-quantity {
  display: flex;
}
.crafting-panel-info__ingredient-quantity:not(.crafting-panel-info__ingredient-quantity--swapped) {
  flex-direction: row;
}
.crafting-panel-info__ingredient-quantity--swapped {
  flex-direction: row-reverse;
}
.crafting-panel-info__availability {
  margin-bottom: 1rem;
}
.crafting-panel-info__ingredient--purchasable,
.crafting-panel-info__available-with-purchase--purchasable {
  color: lightGreen;
}
.crafting-panel-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
  margin-bottom: 1rem;
}
.crafting-panel-actions__craft-row {
  display: flex;
  flex-direction: row;
  gap: .25rem;
  align-items: center;
  align-self: center;
}
.crafting-panel-actions__max-craft-button {
  width: 100%;
  margin-left: 0;
  background-color: orange;
}
.crafting-panel-actions__max-craft-button--confirm {
  background-color: red;
}
.crafting-panel-actions__clear-craft-button {
  width: 100%;
  margin-top: 1rem;
  background-color: red;
}
.crafting-panel-search {
  margin-top: .25rem;
}
.crafting-panel-search__searchbox {
  flex-grow: 1;
  max-width: 402.5px;
}
.crafting-panel-search__include-ingredients {

}
.crafting-panel-actions__clear input {
  display: none;
}
.crafting-panel-options,
.crafting-panel-filters {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: .5rem;
  margin-bottom: .125rem;
}
.crafting-panel-settings-sorts {
  display: flex;
  flex-direction: row-reverse;
  gap: .5rem;
}
.crafting-panel-sorts__wrapper {
  gap: .25rem;
}
.crafting-panel-sorts__wrapper,
.crafting-panel-settings {
  display: flex;
  flex-direction: column;
  flex: 50%;
}
.crafting-panel-settings {
  align-items: end;
}
.crafting-panel-settings input {
  margin: 0;
  margin-left: .5rem;
}
.crafting-panel-sorts {
  display: flex;
  flex-direction: row;
}
.crafting-panel-sorts__title {
  display: inline-block;
}
.crafting-panel-sorts__title,
.crafting-panel-filters__title,
.crafting-panel-filters__books-title,
.crafting-panel-filters__categories-title,
.crafting-panel-filters__types-title {
  margin: 0;
  flex: 1;
}
.crafting-panel-filters__books,
.crafting-panel-filters__categories,
.crafting-panel-filters__types {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}
.crafting-panel-filters__craftable,
.crafting-panel-filters__books-row,
.crafting-panel-filters__categories-row,
.crafting-panel-filters__types-row {
  display: flex;
  flex-direction: row;
  gap: .25rem;
  flex: 1;
}
.crafting-panel-filters__craftable-option,
.crafting-panel-filters__books-button,
.crafting-panel-filters__categories-category,
.crafting-panel-filters__types-type {
  flex: 1;
  opacity: 0.4;
}
.crafting-panel-filters__craftable-option--selected,
.crafting-panel-filters__books-show,
.crafting-panel-filters__books-hide,
.crafting-panel-filters__books-button--selected,
.crafting-panel-filters__categories-all,
.crafting-panel-filters__categories-none,
.crafting-panel-filters__categories-category--selected,
.crafting-panel-filters__types-all,
.crafting-panel-filters__types-none,
.crafting-panel-filters__types-type--selected {
  flex: 1;
  opacity: 1;
}
.crafting-panel-filters__craftable input,
.crafting-panel-filters__books-button input,
.crafting-panel-filters__books-show input,
.crafting-panel-filters__books-hide input,
.crafting-panel-filters__categories-all input,
.crafting-panel-filters__categories-none input,
.crafting-panel-filters__categories-category input,
.crafting-panel-filters__types-all input,
.crafting-panel-filters__types-none input,
.crafting-panel-filters__types-type input {
  display: none;
}
.crafting-panel-search__searchbox,
.crafting-panel-actions__clear,
.crafting-panel-filters__craftable-option,
.crafting-panel-filters__books-button,
.crafting-panel-filters__books-show,
.crafting-panel-filters__books-hide,
.crafting-panel-filters__categories-all,
.crafting-panel-filters__categories-none,
.crafting-panel-filters__categories-category,
.crafting-panel-filters__types-all,
.crafting-panel-filters__types-none,
.crafting-panel-filters__types-type {
  border-radius: 3px;
  border: none;
  padding: 2px 5px;
  background: gray;
}
.crafting-panel-filters__books-show,
.crafting-panel-filters__categories-all,
.crafting-panel-filters__types-all {
  background-color: green;
}
.crafting-panel-filters__books-hide,
.crafting-panel-filters__categories-none,
.crafting-panel-filters__types-none {
  background-color: red;
}
.recipes__recipe {
  border: 2px solid transparent;
  margin-top: 3px;
  margin-right: 5px;
}
.recipes__recipe:focus {
  border: 2px solid red;
}
.recipe-buttons {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.recipe-buttons--book-sort {
  flex-direction: column;
}
.recipe-buttons--book-sort.recipe-buttons--extra-space {
  gap: 1rem;
}
.recipe-buttons__book-section {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}


.disabled {
  background-color: #333 !important;
  color: #666 !important;
  pointer-events: none;
}
a.disabled {
  pointer-events: none;
}
</style>`);
  //
  // #endregion Stylesheets
  //

  //
  // #region DOM functions
  //
  const gmKeyCurrentCraft = 'current_craft';
  const dataChangeEvent = 'changeData';
  const filterChangeEvent = 'changeFilter';
  const sortChangeEvent = 'changeSort';
  const gmKeyRecipeFilters = 'recipe-filters';
  const gmKeyRecipeSort = 'recipe-sort';

  const initialFilters = GM_getValue(gmKeyRecipeFilters, {
    books: ['Potions', 'Food', 'Material Bars'],
    categories: Array.from(
      new Set(
        Object.values(recipes).flatMap((recipes) => recipes.map((recipe) => ingredients[recipe.itemId].category)),
      ),
    ),
    types: [],
    craftable: 0,
    search: undefined,
    includeIngredients: true,
  });
  const initialSort = GM_getValue(gmKeyRecipeSort, 'books');
  const sorts = {
    alpha: 'Alphabetical',
    gold: 'Gold Value',
    book: 'Book Order',
    'book-alpha': 'Books / Alphabetical',
    'book-gold': 'Books / Gold',
  };

  let isCrafting;
  let craftingPanelTitle;
  let craftingPanelSlots;
  let craftingPanelResult;
  let craftingPanelRequirement;
  let craftingIngredients;
  let craftingInfoActions;
  let craftingAvailability;
  let craftingActionsMenu;
  let craftNumberSelect;
  let recipeButtons;

  function resetQuickCraftingMenu() {
    // set all the IDs to 0/reset
    craftingPanelTitle.data({name: undefined, available: 0}).trigger(dataChangeEvent);
    craftingPanelSlots.add(craftingPanelResult).data({id: 0}).trigger(dataChangeEvent);
    craftingPanelRequirement.data({requirement: 0}).trigger(dataChangeEvent);
    craftingIngredients.data({id: 0, count: 0, available: 0, purchasable: -1}).trigger(dataChangeEvent);
    craftingInfoActions.data({available: 0, purchasable: -1}).trigger(dataChangeEvent);
    GM_deleteValue(gmKeyCurrentCraft);
  }

  const blankSlot = 'EEEEE';
  async function setRecipe() {
    if (isCrafting) return;

    const {recipe: info} = $(this).data();
    const inventory = await getInventoryAmounts();
    const {itemId, name, recipe, requirement} = info;
    const counts = {};
    const resolvedName = resolveNames(name || ingredients[itemId].name);

    GM_setValue(gmKeyCurrentCraft, resolvedName);

    craftingPanelTitle.data({name: resolvedName, available: inventory[itemId] || 0}).trigger(dataChangeEvent);
    craftingPanelResult.data({id: itemId}).trigger(dataChangeEvent);
    craftingPanelRequirement.data({requirement: requirement}).trigger(dataChangeEvent);

    const orderedIngredients = recipe
      .match(/.{5}/g)
      .map((item, i) => {
        const itemId = item === blankSlot ? 0 : parseInt(item);
        craftingPanelSlots.eq(i).data({id: itemId});
        if (!(itemId in counts)) {
          counts[itemId] = 1;
          return itemId;
        } else {
          counts[itemId]++;
        }
      })
      .filter((itemId) => itemId);
    craftingPanelSlots.trigger(dataChangeEvent);

    orderedIngredients.length = 9;
    Array.from(orderedIngredients).forEach((itemId, i) => {
      craftingIngredients.eq(i).data({
        id: itemId || 0,
        count: (itemId && counts[itemId]) || 0,
        available: (itemId && inventory[itemId]) || 0,
        purchasable: -1,
      });
    });
    craftingIngredients.removeClass('crafting-panel-info__ingredient--purchasable').trigger(dataChangeEvent);

    const available = Math.floor(
      Math.min(
        ...Object.entries(counts)
          .filter(([itemId, _]) => parseInt(itemId))
          .map(([itemId, count]) => (inventory[itemId] || 0) / count),
      ),
    );
    craftingInfoActions.data({available: available, purchasable: -1}).trigger(dataChangeEvent);
  }
  // TODO just centralize the data.. passing it all over the place is kinda dumb

  function updatePurchasable() {
    const validIngredientsData = craftingIngredients
      .map(function () {
        return $(this).data();
      })
      .toArray()
      .filter(({id}) => id);
    const nonPurchasableIngredientData = validIngredientsData.filter(({purchasable}) => !~purchasable);

    const maxWithPurchase =
      // -1 if nothing is purchasable
      nonPurchasableIngredientData.length === validIngredientsData.length
        ? -1
        : Math.floor(Math.min(...nonPurchasableIngredientData.map(({available, count}) => (available || 0) / count)));
    craftingInfoActions.data({purchasable: maxWithPurchase}).trigger(dataChangeEvent);

    craftingIngredients
      .each(function () {
        const elem = $(this);
        const {count, available, purchasable} = elem.data();
        elem.data({
          purchasable: ~purchasable ? Math.max(maxWithPurchase * count - available, 0) : purchasable,
        });
      })
      .trigger(dataChangeEvent);
  }

  function togglePurchasable() {
    const elem = $(this);
    // -1 means not purchasable, else number to purchase (before clicked)
    const {purchasable: beforeClickPurchasable} = elem.data();
    const afterClickPurchasable = !~beforeClickPurchasable;

    const filledIngredients = craftingIngredients
      .map(function () {
        return $(this).data();
      })
      .toArray()
      .filter(({id}) => id);
    const purchasableIngredients = filledIngredients.filter(({purchasable}) => ~purchasable).length;
    // Only allow selecting n-1 as purchasable if we're marking something purchasable
    if (afterClickPurchasable && filledIngredients.length - 1 <= purchasableIngredients) return;

    // Set now for max calculations
    elem.data({purchasable: afterClickPurchasable ? 0 : -1});
    elem.toggleClass('crafting-panel-info__ingredient--purchasable', afterClickPurchasable);

    updatePurchasable();
  }

  async function doCraft() {
    // Disable crafting buttons and craft switching
    isCrafting = true;
    craftingActionsMenu.find('button, select').prop('disabled', true).addClass('disabled');

    const craftNumber = craftNumberSelect.children('option:selected').val();
    const {recipe} = craftingActionsMenu.data();

    await (async () => {
      for (let i = 0; i < craftNumber; i++) {
        await new Promise((resolve) =>
          setTimeout(async function () {
            let available = craftingInfoActions.data().available;
            if (await takeCraft(recipe)) {
              craftingIngredients.each((_, elem) => {
                const ingredient = $(elem);
                const {id, count} = ingredient.data();
                if (id) {
                  ingredient.data({available: (inventory[id] -= count)}).trigger(dataChangeEvent);
                  available = Math.min(available, Math.floor(inventory[id] / count));
                }
              });
              if (!(recipe.itemId in inventory)) {
                inventory[recipe.itemId] = 0;
              }
              // Set in inventory and on title
              craftingPanelTitle.data({available: ++inventory[recipe.itemId]}).trigger(dataChangeEvent);
              updatePurchasable();
            }
            // Recalculate available for live display
            craftingInfoActions.data({available: available}).trigger(dataChangeEvent);
            resolve();
          }, CRAFT_TIME),
        );
      }
      craftingActionsMenu.find('button, select').prop('disabled', false).removeClass('disabled');
      isCrafting = false;
    })();
  }

  async function tryDoMaximumCraft() {
    if (!$(this).hasClass('crafting-panel-actions__max-craft-button--confirm')) {
      craftNumberSelect.val(craftingInfoActions.data().available);
      $(this).text('** CONFIRM **').addClass('crafting-panel-actions__max-craft-button--confirm');
    } else {
      $(this).text('-- Crafting --');
      await doCraft();
      $(this).removeClass('crafting-panel-actions__max-craft-button--confirm').text('Craft maximum');
    }
  }
  //
  // #endregion DOM functions
  //

  //
  // #region DOM population
  //
  $('#crafting_recipes').before(
    // float separator/spacer
    $('<div class="crafting-clear">'),
    // main quick craft box
    $('<div class="quick-crafter">')
      .css(
        $('#crafting_recipes').css([
          'display',
          'margin',
          'backgroundColor',
          'padding',
          'width',
          'maxWidth',
          'minWidth',
        ]),
      )
      .append(
        //
        // #region Selected craft display
        //
        (currentCraftBox = $('<div class="crafting-panel">').append(
          $('<div class="crafting-panel__main">').append(
            $('<div class="crafting-panel__column">').append(
              (craftingPanelTitle = $('<h3 class="crafting-panel__title">').css(
                $('.item:first').css(['text-shadow', 'font-weight', 'color']),
              )),
              $('<div class="crafting-panel__row">').append(
                //
                // #region Crafting grid display
                //
                $('<div class="crafting-panel-grid__wrapper">').append(
                  $('<div class="crafting-panel-grid__main">').append(
                    ...(craftingPanelSlots = $(
                      Array.from(new Array(9)).map(
                        (_, i) =>
                          $('<div class="crafting-panel-grid__slot">').css({
                            width: '106px', // TODO pull widths and positions from existing UI/style (widths/margins)
                            height: '106px',
                            left: `${13 + (i % 3) * 119}px`,
                            top: `${13 + Math.floor(i / 3) * 119}px`,
                          })[0],
                      ),
                    )).toArray(),
                    (craftingPanelResult = $('<div class="crafting-panel-grid__result">').css({
                      width: '106px', // TODO pull widths and margins from existing UI/style
                      height: '106px',
                      left: `${13 + 2 * 119 + 180}px`,
                      top: `${13 + 119}px`,
                    })),
                    (craftingPanelRequirement = $('<div class="crafting-panel-grid__requirement">').css({
                      width: '106px', // TODO pull widths and margins from existing UI/style
                      height: '106px',
                      left: `${13 + 2 * 119 + 180}px`,
                      top: `${13 + 2 * 119}px`,
                    })),
                  ),
                ),
                //
                // #endregion Crafting grid display
                //
                //
                // #region Crafting text/actions display
                //
                (craftingInfoActions = $('<div class="crafting-panel-info-actions">').append(
                  '<div class="crafting-panel-info__ingredients-header">Ingredients:</div>',
                  ...(craftingIngredients = $(
                    Array.from(new Array(9)).map(() => $(`<div class="crafting-panel-info__ingredient-row">`)[0]),
                  )
                    .append(
                      $('<a class="crafting-panel-info__ingredient-shop-link">')
                        .text('$')
                        .attr('target', '_blank')
                        .click((event) => event.stopPropagation()),
                      $('<span class="crafting-panel-info__ingredient-name"></span>'),
                      $('<div class="crafting-panel-info__ingredient-quantity">')
                        .toggleClass(
                          'crafting-panel-info__ingredient-quantity--swapped',
                          GM_getValue('NHswitch', false),
                        )
                        .append(
                          '<span class="crafting-panel-info__ingredient-quantity-per-craft"></span>',
                          '/',
                          '<span class="crafting-panel-info__ingredient-quantity-on-hand"></span>',
                        ),
                      $(
                        '<span title="Needed for max possible crafts" class="crafting-panel-info__ingredient-quantity-purchasable">',
                      ).append(
                        ' (+',
                        '<span class="crafting-panel-info__ingredient-quantity-purchasable-value"></span>',
                        ')',
                      ),
                    )
                    .click(togglePurchasable)).toArray(),
                  (craftingAvailability = $(`<span id="crafting-panel-info__availability">`).append(
                    `Max available craft(s): <span class="crafting-panel-info__available"></span>`,
                    $(
                      `<span class="crafting-panel-info__available-with-purchase crafting-panel-info__available-with-purchase--purchasable">`,
                    ).prop('title', 'Max possible if additional ingredients are purchased'),
                    $('<sup><a>?</a></sup>').attr(
                      'title',
                      'Click ingredients to mark as purchasable and calculate +purchase needed and max possible crafted.',
                    ),
                  )),
                  (craftingActionsMenu = $('<div class="crafting-panel-actions">').append(
                    $('<div id="crafting-panel-actions__craft-row">').append(
                      (craftNumberSelect = $('<select class="crafting-panel-actions__number-select">')),
                      $('<button class="crafting-panel-actions__craft-button">Craft</button>').click(doCraft),
                    ),
                    $('<button class="crafting-panel-actions__max-craft-button">Craft maximum</button>').click(
                      tryDoMaximumCraft,
                    ),
                  )),
                  $('<button class="crafting-panel-actions__clear-craft-button">Clear</button>').click(() =>
                    resetQuickCraftingMenu(),
                  ),
                )),
              ),
              $('<div class="crafting-panel-search crafting-panel__row">').append(
                $('<input type="text" placeholder="Search" class="crafting-panel-search__searchbox" />')
                  .val(initialFilters.search)
                  .change(function () {
                    const {filters} = recipeButtons.data();
                    filters.search = $(this).val();
                    recipeButtons.data('filters', filters).trigger(filterChangeEvent);
                  }),
                $('<label class="crafting-panel-search__include-ingredients">').append(
                  'Include ingredients',
                  $('<input type="checkbox" />')
                    .attr('checked', initialFilters.includeIngredients)
                    .change(function () {
                      const {filters} = recipeButtons.data();
                      filters.includeIngredients = $(this).prop('checked');
                      recipeButtons.data('filters', filters).trigger(filterChangeEvent);
                    }),
                ),
              ),
            ),
            //
            // #endregion Crafting text/actions display
            //
            //
            // #region Settings and recipe filters
            //
            $('<div class="crafting-panel-options">').append(
              $('<div class="crafting-panel-settings-sorts">').append(
                $('<div class="crafting-panel-settings">').append(
                  $('<label>').append(
                    'Blank line between books',
                    $('<input type="checkbox" />')
                      .prop('checked', GM_getValue('SEG', false))
                      .change(function () {
                        const checked = $(this).prop('checked');
                        recipeButtons.toggleClass('recipe-buttons--extra-space', checked);
                        GM_setValue('SEG', checked);
                      }),
                  ),
                  $('<label title="Switches item counts between needed/have and have/needed">').append(
                    'N/H switch',
                    $('<input type="checkbox" />')
                      .prop('checked', GM_getValue('NHswitch', false))
                      .change(function () {
                        const checked = $(this).prop('checked');
                        $('.crafting-panel-info__ingredient-quantity').toggleClass(
                          'crafting-panel-info__ingredient-quantity--swapped',
                          checked,
                        );
                        GM_setValue('NHswitch', checked);
                      }),
                  ),
                ),
                $('<div class="crafting-panel-sorts__wrapper">').append(
                  $(`<div class="crafting-panel-sorts">`).append(
                    $('<h3 class="crafting-panel-sorts__title">Sort:</h3>'),
                    $('<select>')
                      .append(
                        Object.entries(sorts).map(
                          ([value, text]) =>
                            $(`<option value="${value}">${text}</option>`).attr('selected', initialSort === value)[0],
                        ),
                      )
                      .change(function () {
                        recipeButtons.data('sort', $(this).find('option:selected').val()).trigger(sortChangeEvent);
                      }),
                  ),
                  $('<h3 class="crafting-panel-filters__title">Filters:</h3>'),
                ),
              ),
              $(`<div class="crafting-panel-filters">`).append(
                //
                // #region Add craftable/purchasable filter buttons to DOM
                //
                $('<div class="crafting-panel-filters__craftable">').append(
                  ...$([
                    $(
                      '<label class="crafting-panel-filters__craftable-option"><input type="radio" name="craftable" value="0">All</label>',
                    )[0],
                    $(
                      '<label class="crafting-panel-filters__craftable-option"><input type="radio" name="craftable" value="1">Craftable</label>',
                    )[0],
                    $(
                      '<label class="crafting-panel-filters__craftable-option"><input type="radio" name="craftable" value="2">With Purchase</label>',
                    )[0],
                  ])
                    .find('input')
                    .attr('checked', function () {
                      const checked = parseInt($(this).val()) === initialFilters.craftable;
                      $(this).parent().toggleClass('crafting-panel-filters__craftable-option--selected', checked);
                      return checked;
                    })
                    .change(function () {
                      const elem = $(this);
                      elem
                        .parent()
                        .toggleClass('crafting-panel-filters__craftable-option--selected', elem.prop('checked'))
                        .siblings()
                        .toggleClass('crafting-panel-filters__craftable-option--selected', !elem.prop('checked'));
                      const {filters} = recipeButtons.data();
                      filters.craftable = parseInt(elem.val());
                      recipeButtons.data('filters', filters).trigger(filterChangeEvent);
                    })
                    .end()
                    .toArray(),
                ),
                //
                // #endregion Add craftable/purchasable filter buttons to DOM
                //
                //
                // #region Add "Recipe Book" on/off buttons to DOM
                //
                $('<div class="crafting-panel-filters__books">').append(
                  $('<div class="crafting-panel-filters__books-row">').append(
                    '<h3 class="crafting-panel-filters__books-title">Books</h3>',
                    $(
                      '<label class="crafting-panel-filters__books-show"><input type="button" />Show all</label>',
                    ).click(() => $('.crafting-panel-filters__books-button input').prop('checked', true).change()),
                    $(
                      '<label class="crafting-panel-filters__books-hide"><input type="button" />Hide all</label>',
                    ).click(() => $('.crafting-panel-filters__books-button input').prop('checked', false).change()),
                  ),
                  ...Object.keys(books)
                    .map(
                      (name) =>
                        $(`<label class="crafting-panel-filters__books-button">`)
                          .toggleClass(
                            'crafting-panel-filters__books-button--selected',
                            initialFilters.books.includes(name),
                          )
                          .append(
                            $('<input type="checkbox" />')
                              .attr('checked', initialFilters.books.includes(name))
                              .change(function () {
                                const {filters} = recipeButtons.data();
                                const isChecked = $(this).prop('checked');
                                if (
                                  $(this).parent().hasClass('crafting-panel-filters__books-button--selected') ===
                                  isChecked
                                )
                                  return;

                                $(this)
                                  .parent()
                                  .toggleClass('crafting-panel-filters__books-button--selected', isChecked);
                                if (isChecked) filters.books.push(name);
                                else filters.books.splice(filters.books.indexOf(name), 1);
                                recipeButtons.data('filters', filters).trigger(filterChangeEvent);
                              }),
                            name,
                          )
                          .css({
                            backgroundColor: books[name].bgcolor,
                            color: books[name].color,
                          })[0],
                    )
                    .reduce(chunkArray(4), [])
                    .map((bookSet) => $('<div class="crafting-panel-filters__books-row">').append(bookSet)),
                ),
                //
                // #endregion Add "Recipe Book" on/off buttons to DOM
                //
                //
                // #region Add category on/off buttons to DOM
                //
                $('<div class="crafting-panel-filters__categories">').append(
                  $('<div class="crafting-panel-filters__categories-row">').append(
                    '<h3 class="crafting-panel-filters__categories-title">Categories</h3>',
                    $('<label class="crafting-panel-filters__categories-all"><input type="button">All</label>').click(
                      () => $('.crafting-panel-filters__categories-category input').prop('checked', true).change(),
                    ),
                    $('<label class="crafting-panel-filters__categories-none"><input type="button">None</label>').click(
                      () => $('.crafting-panel-filters__categories-category input').prop('checked', false).change(),
                    ),
                  ),
                  ...Array.from(
                    new Set(
                      Object.values(recipes).flatMap((recipes) =>
                        recipes.map((recipe) => ingredients[recipe.itemId].category),
                      ),
                    ),
                  )
                    .sort()
                    .map((category) =>
                      $('<label class="crafting-panel-filters__categories-category">')
                        .toggleClass(
                          'crafting-panel-filters__categories-category--selected',
                          initialFilters.categories.includes(category),
                        )
                        .append(
                          $('<input type="checkbox" />')
                            .attr('checked', initialFilters.categories.includes(category))
                            .change(function () {
                              const {filters} = recipeButtons.data();
                              const isChecked = $(this).prop('checked');
                              if (
                                $(this).parent().hasClass('crafting-panel-filters__categories-category--selected') ===
                                isChecked
                              )
                                return;

                              $(this)
                                .parent()
                                .toggleClass('crafting-panel-filters__categories-category--selected', isChecked);
                              if (isChecked) filters.categories.push(category);
                              else filters.categories.splice(filters.categories.indexOf(category), 1);
                              recipeButtons.data('filters', filters).trigger(filterChangeEvent);
                            }),
                          // Shorten longer category names
                          category
                            .replace('Materials', 'Mats')
                            .replace('Username customizations', 'Usernames')
                            .replace('customizations', 'cust.'),
                        ),
                    )
                    .reduce(chunkArray(4), [])
                    .map((categorySet) =>
                      $('<div class="crafting-panel-filters__categories-row">').append(categorySet),
                    ),
                ),
                //
                // #endregion Add category on/off buttons to DOM
                //
                //
                // #region Add type on/off buttons to DOM
                //
                // TODO implement types actually
                $('<div class="crafting-panel-filters__types">').append(
                  $('<div class="crafting-panel-filters__types-row">').append(
                    '<h3 class="crafting-panel-filters__types-title">Types</h3>',
                    $('<label class="crafting-panel-filters__types-all"><input type="button">All</label>').click(() =>
                      $('.crafting-panel-filters__types-type input').prop('checked', true).change(),
                    ),
                    $('<label class="crafting-panel-filters__types-none"><input type="button">None</label>').click(() =>
                      $('.crafting-panel-filters__types-type input').prop('checked', false).change(),
                    ),
                  ),
                  $('<div class="crafting-panel-filters__types-row">').append(
                    ['Standard', 'Repair', 'Upgrade', 'Downgrade'].map((type) =>
                      $('<label class="crafting-panel-filters__types-type">')
                        .toggleClass(
                          'crafting-panel-filters__types-type--selected',
                          initialFilters.types.includes(type),
                        )
                        .append(
                          $('<input type="checkbox" />')
                            .attr('checked', initialFilters.types.includes(type))
                            .change(function () {
                              const {filters} = recipeButtons.data();
                              const isChecked = $(this).prop('checked');
                              if (
                                $(this).parent().hasClass('crafting-panel-filters__types-type--selected') === isChecked
                              )
                                return;

                              $(this).parent().toggleClass('crafting-panel-filters__types-type--selected', isChecked);
                              if (isChecked) filters.types.push(type);
                              else filters.types.splice(filters.types.indexOf(type), 1);
                              recipeButtons.data('filters', filters).trigger(filterChangeEvent);
                            }),
                          type,
                        ),
                    ),
                  ),
                ),
              ),
              //
              // #endregion Add type on/off buttons to DOM
              //
            ),
            //
            // #endregion Settings and recipe filters
            //
          ),
        )),
        //
        // #endregion Selected craft display
        //

        //
        // #region Add Recipe buttons to DOM
        //
        (recipeButtons = $('<div class="recipe-buttons recipe-buttons--book-sort">')
          .toggleClass('recipe-buttons--extra-space', GM_getValue('SEG', false))
          .append(
            Object.keys(recipes).map((bookKey) => {
              const book = books[bookKey];
              book.recipes = [];
              book.section = $(
                `<div class="recipe-buttons__book-section recipe-buttons__book-section--${bookKey
                  .toLocaleLowerCase()
                  .replace(/ /g, '-')}">`,
              )
                .append(
                  recipes[bookKey].map((recipe, i) => {
                    const item = ingredients[recipe.itemId];
                    const data = {
                      book: bookKey,
                      category: item.category,
                      gold: item.gold,
                      ingredients: recipe.recipe
                        .match(/.{5}/g)
                        .filter((item) => item !== blankSlot)
                        .map((item) => parseInt(item))
                        .reduce((counts, id) => {
                          if (!(id in counts)) counts[id] = 0;
                          counts[id]++;
                          return counts;
                        }, {}),
                      purchasable: recipe.recipe
                        .match(/.{5}/g)
                        .filter((item) => item !== blankSlot)
                        .map((item) => parseInt(item))
                        .every((itemId) => ingredients[itemId].infStock),
                      order: i,
                      recipe: recipe,
                      type: 'unknown',
                    };
                    const recipeButton = $(
                      `<button class="recipes__recipe" />${resolveNames(recipe.name || item.name)}</button>`,
                    )
                      .data(data)
                      .css({
                        backgroundColor: book.bgcolor,
                        color: book.color,
                      })
                      .click(setRecipe);
                    book.recipes.push(recipeButton);
                    return recipeButton;
                  }),
                )
                .css({display: book.disabled ? 'none' : ''});
              return book.section;
            }),
          )),
        //
        // #endregion Add Recipe buttons to DOM
        //

        '<p>Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better experience.</p>', // TODO remove this after implementing "normal" crafting hook
        `<p style="float:right;margin-top:-20px;margin-right:5px;">Quick Crafter by <a href="/user.php?id=58819">KingKrab23</a> v<a href="https://github.com/KingKrab23/Quick_Craft/raw/master/GGn%20Quick%20Crafting.user.js">${VERSION}</a></p>`,
      ),
  );
  //
  // #endregion DOM population
  //

  //
  // #region DOM Data and Mutation observers
  //
  craftingPanelTitle
    .data({name: undefined, available: 0})
    .on(dataChangeEvent, function () {
      const elem = $(this);
      const {name, available} = elem.data();
      if (name) {
        elem.text(`${name}${available ? ' (' + available + ' in inventory)' : ''}`).css('visible', '');
      } else elem.html('&nbsp;').css('visible', 'hidden');
    })
    .trigger(dataChangeEvent);

  craftingPanelSlots
    .data({id: 0})
    .on(dataChangeEvent, function () {
      const elem = $(this);
      const {id} = elem.data();
      if (id) {
        elem.css({
          background: `transparent url('${ingredients[id].image}') no-repeat center center`,
          backgroundSize: 'contain',
        });
      } else elem.css({background: 'transparent'});
    })
    .trigger(dataChangeEvent);

  craftingPanelResult
    .data({id: 0})
    .on(dataChangeEvent, function () {
      const elem = $(this);
      const {id} = elem.data();
      if (id) {
        elem.css({
          background: `transparent url('${ingredients[id].image}') no-repeat center center`,
          backgroundSize: 'contain',
        });
      } else elem.css({background: 'transparent'});
    })
    .trigger(dataChangeEvent);

  craftingPanelRequirement.data({requirement: 0}).on(dataChangeEvent, function () {
    const elem = $(this);
    const {requirement} = elem.data();
    if (requirement) {
      // TODO a better way to get these images
      const requirementSymbolId = `#${requirement === 1 ? 'forge' : requirement === 2 ? 'enchanting' : 'campfire'}`;
      const requirementImage = $(requirementSymbolId)
        .css('background')
        .match(/url\((['"])([^\1]+)\1\)/)[2]
        .replace('..', `/static/styles/${$('link[rel="stylesheet"][title]').attr('title')}`);
      elem.css({
        background: `transparent url('${requirementImage}') no-repeat center center`,
        backgroundSize: 'contain',
      });
    } else elem.css({background: 'transparent'});
  });

  craftingIngredients
    .data({id: 0, count: 0, available: 0, purchasable: -1})
    .on(dataChangeEvent, function () {
      const elem = $(this);
      const link = elem.find('.crafting-panel-info__ingredient-shop-link');
      const nameNode = elem.find('.crafting-panel-info__ingredient-name');
      const onHand = elem.find('.crafting-panel-info__ingredient-quantity-on-hand');
      const perCraft = elem.find('.crafting-panel-info__ingredient-quantity-per-craft');
      const purchaseWrapper = elem.find('.crafting-panel-info__ingredient-quantity-purchasable');
      const purchaseNeeded = elem.find('.crafting-panel-info__ingredient-quantity-purchasable-value');
      const {id, count, available, purchasable} = elem.data();
      if (id && count) {
        link
          .attr('href', `https://gazellegames.net/shop.php?ItemID=${id}`)
          .toggleClass('crafting-panel-info__ingredient-shop-link--purchasable', ingredients[id].infStock);
        nameNode.text(`${resolveNames(ingredients[id].name)}:`);
        onHand.text(available);
        perCraft.text(count);
        purchaseNeeded.text(~purchasable ? purchasable : undefined);
        if (!~purchasable) purchaseWrapper.hide();
        else purchaseWrapper.show();
        elem.show();
        $('.crafting-panel-grid__wrapper').add(craftingInfoActions).css('visibility', '');
      } else {
        elem.hide();
        if (!craftingPanelResult.data().id) {
          $('.crafting-panel-grid__wrapper').add(craftingInfoActions).css('visibility', 'hidden');
        }
      }
    })
    .trigger(dataChangeEvent);

  craftingInfoActions
    .data({available: 0, purchasable: 0})
    .on(dataChangeEvent, function () {
      const elem = $(this);
      const availableNode = craftingAvailability.find('.crafting-panel-info__available');
      const purchasableNode = craftingAvailability.find('.crafting-panel-info__available-with-purchase');
      const {available, purchasable} = elem.data();
      availableNode.text(available);
      if (available) {
        craftNumberSelect.empty().append(
          Array(available)
            .fill()
            .map((_, i) => `<option value="${i + 1}">${i + 1}</option>`),
        );
        craftingActionsMenu.show();
      } else craftingActionsMenu.hide();

      if (~purchasable) purchasableNode.text(` (${purchasable})`).show();
      else purchasableNode.hide();
    })
    .trigger(dataChangeEvent);

  recipeButtons
    .data({sort: initialSort, filters: initialFilters})
    .on(sortChangeEvent, function () {
      const {sort} = $(this).data();
      const recipes = $(this).find('.recipes__recipe');
      recipes.sort((a, b) => {
        const aElem = $(a);
        const bElem = $(b);
        const {book: aBook, gold: aGold, order: aOrder} = aElem.data();
        const {book: bBook, gold: bGold, order: bOrder} = bElem.data();
        const bookKeys = Object.keys(books);
        const aBookIndex = bookKeys.indexOf(aBook);
        const bBookIndex = bookKeys.indexOf(bBook);

        recipeButtons.toggleClass('recipe-buttons--book-sort', sort.includes('book'));

        // Sort by book order, then secondary (in-book if no other) order
        if (sort.includes('book') && aBook !== bBook) return aBookIndex - bBookIndex;
        // Also put in book row separators
        if (sort.includes('alpha')) return aElem.text().localeCompare(bElem.text());
        else if (sort.includes('gold')) return aGold - bGold;
        else return aOrder - bOrder;
      });
      if (sort.includes('book')) {
        recipes.each(function () {
          const elem = $(this);
          elem.appendTo(`.recipe-buttons__book-section--${elem.data().book.toLocaleLowerCase().replace(/ /g, '-')}`);
        });
      } else $(this).append(recipes);
      GM_setValue(gmKeyRecipeSort, sort);
    })
    .on(filterChangeEvent, async function () {
      const {filters} = $(this).data();
      const {books, categories, craftable, includeIngredients, search, types} = filters;
      const inventory = await getInventoryAmounts();
      const allIngredients = ingredients;
      $(this)
        .find('.recipes__recipe')
        .each(function () {
          const recipeLabel = $(this);
          const {book, category, ingredients, purchasable, recipe, type} = recipeLabel.data();
          if (
            books.includes(book) &&
            categories.includes(category) &&
            (!craftable ||
              Object.entries(ingredients).every(([id, count]) => inventory[id] >= count) ||
              (craftable === 2 && purchasable)) &&
            //types.includes(type) && // TODO implement
            (!search ||
              allIngredients[recipe.itemId].name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
              (includeIngredients &&
                Object.keys(ingredients).some((id) =>
                  allIngredients[id].name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
                )))
          )
            $(`.recipe-buttons__book-section--${book.toLocaleLowerCase().replace(/ /g, '-')}`)
              .add(recipeLabel)
              .show();
          else recipeLabel.hide();
        });
      $('.recipe-buttons__book-section').each(function () {
        const elem = $(this);
        if (!elem.find('.recipes__recipe:visible').length) elem.hide();
      });
      GM_setValue(gmKeyRecipeFilters, filters);
    })
    .trigger(sortChangeEvent)
    .trigger(filterChangeEvent);
  //
  // #endregion DOM Data and Mutation observers
  //

  //
  // #endregion Document building
  //

  // Persist selected recipe
  $('.recipes__recipe')
    .filter(function () {
      return $(this).text() === GM_getValue(gmKeyCurrentCraft);
    })
    .click();
})(unsafeWindow || window, jQuery || (unsafeWindow || window).jQuery, GM_info.script.version);
