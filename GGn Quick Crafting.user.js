// ==UserScript==
// @name         GGn Quick Crafter
// @namespace    https://gazellegames.net/
// @version      2.10.6
// @description  Craft multiple items easier including repair equipped
// @author       KingKrab23
// @author       KSS
// @author       FinalDoom
// @author       GGN community
// @match        https://gazellegames.net/user.php?action=crafting
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @require      https://code.jquery.com/jquery-3.6.0.js
// @require      https://raw.githubusercontent.com/FinalDoom/Quick_Craft/repair-equipped/recipe_info.js
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
  const MAX_API_QUERIES_BEFORE_THROTTLE = 5;

  //
  // #endregion >>>END<<< user adjustable variables
  //

  //
  // #region Helper functions
  //
  const gmKeyCurrentCraft = 'current_craft';
  const gmKeyRecipeFilters = 'recipe-filters';
  const gmKeyRecipeSort = 'recipe-sort';
  const gmKeyEquippedRepair = 'repair-equipped';
  const gmKeyRepairThreshold = 'repair-threshold';

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

  // Query the user for an API key. This is only done once, and the result is stored in script storage
  const API_KEY = (function getApiKey() {
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
  })();

  // Execute an API call and also handle throttling to 5 calls per 10 seconds
  async function apiCall(options) {
    while (true) {
      const tenSecondTime = parseInt(window.localStorage.quickCrafterTenSecondTime) || 0;
      const nowTimeBeforeWait = new Date().getTime();
      if (
        (parseInt(window.localStorage.quickCrafterApiRequests) || 0) >= MAX_API_QUERIES_BEFORE_THROTTLE &&
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
    }).then((data) => {
      const status = data.status;
      if (status !== 'success' || !'response' in data) {
        error(`API returned unsuccessful: ${status}`, data);
        return;
      }
      return data.response;
    });
  }

  function resolveNames(...potentialNames) {
    return $('<textarea />')
      .html(potentialNames.find((name) => name))
      .text();
  }

  const recipeToItemsRegex = /.{5}/g;
  const RECIPE_EQUIPMENT_ITEM_REGEX = /(\d{5})z(\d{5,})x/g;
  const DURABILITY_CANCELLED = 'BROKE';
  const DURABILITY_CANCELLED_REGEXP = new RegExp(DURABILITY_CANCELLED, 'g');
  const EQUIP_CANCELLED = 'XXXXX';
  const EQUIP_CANCELLED_REGEXP = new RegExp(EQUIP_CANCELLED, 'g');
  const XP_CANCELLED = 'XPXPX';
  const XP_CANCELLED_REGEX = new RegExp(XP_CANCELLED, 'g');

  function equippableItemId({itemid, id: equipId}) {
    return `${itemid.toString().padStart(5, '0')}z${equipId.toString().padStart(5, '0')}x`;
  }

  const AUTH_KEY = new URLSearchParams($('link[rel="alternate"]').attr('href')).get('authkey');
  const getCraftUrl = (customRecipe) =>
    `https://gazellegames.net/user.php?action=ajaxtakecraftingresult&recipe=${customRecipe}&auth=${AUTH_KEY}`;
  async function takeCraft(recipe) {
    const name = resolveNames(recipe.name, ingredients[recipe.itemId].name);

    const repairThreshold = GM_getValue(gmKeyRepairThreshold, 0);
    const recipeWithEquip = recipe.recipe
      .match(recipeToItemsRegex)
      .map((item) => {
        if (item === blankSlot) return item;
        const equips = equipment.filter(({itemid}) => itemid === parseInt(item));
        // Not an equippable item
        if (!equips.length) return item;

        // Resolve equippable item IDs
        if (!equips.filter(({timeUntilBreak, equipLife}) => timeUntilBreak / equipLife <= repairThreshold).length)
          return DURABILITY_CANCELLED;

        const withoutExperience = equips.filter(({experience}) => !experience);
        if (withoutExperience.length <= 1) {
          // Display a message if the only available item (pet) has experience
          if (!withoutExperience.length) return XP_CANCELLED;
          return equippableItemId(withoutExperience[0]);
        }
        // Sort by timeUtilBreak
        // Prioritize smallest timeUntilBreak
        //   timeUntilBreak not in equip means unworn
        withoutExperience.sort((a, b) => {
          const timeA = 'timeUntilBreak' in a ? a.timeUntilBreak : Number.MAX_SAFE_INTEGER;
          const timeB = 'timeUntilBreak' in b ? b.timeUntilBreak : Number.MAX_SAFE_INTEGER;
          return timeA - timeB;
        });

        // All are unworn, just use first
        if (!('timeUntilBreak' in equips[0])) return equippableItemId(equips[0]);

        // Ask for id preference if more than one matching (eg. rings)
        let chosen;
        do {
          chosen = window.prompt(
            `Multiple potential equipment items available.
Please enter the ID of the equipment you'd like to use to craft (or cancel).

` +
              equips
                .map(
                  ({id, timeUntilBreak, equipped}) =>
                    `${id}: ${equipped ? '(equipped) ' : ''}${(timeUntilBreak / (3600 * 24)).toFixed(2)} days left`,
                )
                .join('\n'),
            equips.map(({id}) => id).join(', '),
          );
          // Cancel/empty
          if (!chosen) chosen = EQUIP_CANCELLED;
          // Make sure a valid ID was entered
          else if (!equips.filter(({id}) => id === parseInt(chosen)).length) chosen = null;
        } while (!chosen);
        if (parseInt(chosen)) return equippableItemId({itemid: item, id: chosen});
        else return chosen;
      })
      .join('');

    if (DURABILITY_CANCELLED_REGEXP.test(recipeWithEquip)) {
      window.noty({type: 'error', text: `${name} requires item with lower durability. Please craft manually.`});
      return false;
    }
    if (XP_CANCELLED_REGEX.test(recipeWithEquip)) {
      window.noty({type: 'error', text: `${name} requires item that has XP. Please craft manually.`});
      return false;
    }
    // Cancelled, stop here
    if (EQUIP_CANCELLED_REGEXP.test(recipeWithEquip)) return false;

    // Unequip equipped item to craft with it
    const equipmentIdsToUnequip = RECIPE_EQUIPMENT_ITEM_REGEX.test(recipeWithEquip)
      ? recipeWithEquip
          .match(RECIPE_EQUIPMENT_ITEM_REGEX)
          .map((match) => RECIPE_EQUIPMENT_ITEM_REGEX.exec(match)[2])
          // Only if it's currently equipped
          .filter((equipid) => equipment.find(({id, equipped}) => equipped && id === parseInt(equipid)))
      : [];
    const unequppedIds = (
      await Promise.all(
        equipmentIdsToUnequip.map((equipid) =>
          apiCall({data: {request: 'items', type: 'unequip', equipid: equipid}}).then((response) => {
            if (response === undefined) console.error(`Failed to unequip ${equipid}`);
            else return equipid;
          }),
        ),
      )
    ).filter((id) => id);

    const status = await $.ajax({
      url: getCraftUrl(recipeWithEquip),
    })
      .then((data) => {
        // We can detect if this is an equipment craft here
        // console.log('Equipment craft', data.EquipID);

        if ($.isEmptyObject(data) || data.EquipId !== '') {
          window.noty({type: 'success', text: `${name} was crafted successfully.`});
          return true;
        } else {
          window.noty({type: 'error', text: `${name} crafting failed.`});
          alert(`Crafting failed. Response from server: ${JSON.stringify(data)}`);
          return false;
        }
      })
      .catch((reason) => {
        window.noty({type: 'error', text: `${name} crafting failed.`});
        alert(`Crafting failed. Response from server: ${JSON.stringify(reason)}`);
        return false;
      });

    // Re-equip unequipped items
    await Promise.all(
      unequppedIds.map((equipid) =>
        apiCall({data: {request: 'items', type: 'equip', equipid: equipid}}).then((response) => {
          if (response === undefined) console.error(`Failed to re-equip ${equipid}`, response);
        }),
      ),
    );

    // TODO inventory can be updated as part of unequip/reequip to fix dirty hack in resolveCraft
    // But doing it here is too soon.. more consolidated data might help.

    return status;
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
  // #region Recipe Book definitions
  //
  // Used to create enable/disable buttons
  // bgcolor and color are also used for the associated recipe buttons
  //
  GM_deleteValue('selected_books');
  const books = {
    Potions: {bgcolor: 'green', color: 'white'},
    Glass: {bgcolor: 'white', color: 'black'},
    'Material Bars': {bgcolor: 'purple', color: 'white'},
    Armor: {bgcolor: 'darkblue', color: 'white'},
    'Xmas Crafting': {bgcolor: 'red', color: 'lightgreen'},
    // Luck: {bgcolor: 'blue', color: 'white'}, // Combined with Potions
    Jewelry: {bgcolor: 'deeppink', color: 'white'},
    Food: {bgcolor: 'wheat', color: 'black'},
    Halloween: {bgcolor: 'gray', color: 'black'},
    'Trading Decks': {bgcolor: '#15273F', color: 'white'},
    Bling: {bgcolor: 'gold', color: 'darkgray'},
    Weapons: {bgcolor: 'darkred', color: 'white'},
    Recasting: {bgcolor: 'gray', color: 'white'},
    'Adventure Club': {bgcolor: 'yellow', color: 'black'},
    Birthday: {bgcolor: 'darkgray', color: 'gold'},
    Pets: {bgcolor: 'brown', color: 'beige'},
    Valentines: {bgcolor: 'pink', color: 'deeppink'},
    //Dwarven: {bgcolor: 'brown', color: 'beige'}, // Combined with Food
  };
  //
  // #endregion Recipe Book definitions
  //

  //
  // #endregion Static site data (generated/api-intense)
  //

  //
  // #region Inventory fetching
  //
  const inventoryAmounts = await (async function getInventoryAmounts() {
    return await apiCall({data: {request: 'items', type: 'inventory'}})
      .then((response) => {
        if (response === undefined) {
          window.noty({type: 'error', text: `Quick Crafting loading inventory failed. Please check logs and reload.`});
          return;
        }
        return Object.fromEntries(
          Object.values(response)
            .map(({itemid, amount}) => [parseInt(itemid), parseInt(amount)])
            .sort(([itemida], [itemidb]) => itemida - itemidb)
            // Combine equipment into single count (equipable items are represented separately as they have state)
            .reduce((all, next) => {
              if (all.length && next[0] === all[all.length - 1][0]) all[all.length - 1][1] += next[1];
              else all.push(next);
              return all;
            }, []),
        );
      })
      .catch((reason) => console.error(reason));
  })();
  if (inventoryAmounts === undefined) return;

  let fetchingEquip = false;
  let equipment;
  async function getEquipment(refetch = false) {
    if (fetchingEquip || (!refetch && equipment)) {
      while (!equipment) await new Promise((r) => setTimeout(r, 30));
      return equipment;
    } else {
      fetching = true;
      await apiCall({data: {request: 'items', type: 'users_equippable'}})
        .then((response) => {
          if (response === undefined) {
            window.noty({
              type: 'error',
              text: `Quick Crafting loading equippable failed. Please check logs and reload.`,
            });
            return;
          }
          equipment = response.map((item) => {
            // Clean up the data.. it's real messy
            if (item.timeUntilBreak === 'Null') {
              delete item.timeUntilBreak;
            }
            ['id', 'itemid', 'experience', 'equippedBefore', 'timeUntilBreak'].forEach(
              (prop) => prop in item && (item[prop] = parseInt(item[prop])),
            );
            if (item.itemid in ingredients) {
              item.equipLife = ingredients[item.itemid].equipLife;
            }
            return item;
          });
        })
        .catch((reason) => console.error(reason));
      if (!equipment) return;
      return await apiCall({data: {request: 'items', type: 'users_equipped'}})
        .then((response) => {
          if (response === undefined) {
            window.noty({
              type: 'warning',
              text: `Quick Crafting loading equipped failed. This should only affect repairs. Check logs and reload to fix.`,
            });
            return;
          }
          response
            .map((item) => {
              // Clean up the data.. it's real messy
              delete item.breakTime;
              ['buffID', 'equipid', 'experience', 'itemid', 'slotid'].forEach(
                (prop) => (item[prop] = parseInt(item[prop])),
              );

              return item;
            })
            .forEach((item) => {
              const equip = equipment.find((equip) => equip.id === item.equipid);
              equip.equipped = true;
              equip.slotId = item.slotid;
            });
          return equipment;
        })
        .catch((reason) => console.error(reason));
    }
  }
  equipment = await getEquipment();

  // Includes equipped items when option is selected.
  let inventoryFull;
  function updateInventory() {
    const repairThreshold = GM_getValue(gmKeyRepairThreshold, 0) / 100;
    inventoryFull = {...inventoryAmounts};
    if (GM_getValue(gmKeyEquippedRepair, false)) {
      // Add equipped to counts
      equipment
        .filter(({equipped}) => equipped)
        // Only if it's broken under the repair threshold
        .filter(({timeUntilBreak, equipLife}) => timeUntilBreak / equipLife <= repairThreshold)
        .forEach(({itemid}) => {
          if (!(itemid in inventoryFull)) inventoryFull[itemid] = 0;
          ++inventoryFull[itemid];
        });
    }
    // Exclude equipment in inventory also if not broken enough
    equipment
      .filter(({equipped}) => !equipped)
      .filter(
        ({timeUntilBreak, equipLife, itemid}) =>
          itemid in inventoryFull && timeUntilBreak / equipLife > repairThreshold,
      )
      .forEach(({itemid}) => --inventoryFull[itemid]);
  }
  updateInventory();
  //
  // #endregion Inventory fetching
  //

  //
  // #region Document building
  //

  //
  // #region Stylesheets
  //
  // TODO extract to external sass/scss
  //
  $('head').append(`<style>
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
.crafting-panel__title-equipped-count {
  color: red;
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
  min-width: 267px;
  margin: 0 4px;
}
.crafting-panel-info__ingredients-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: .5rem;
}
.crafting-panel-info__ingredients-header-text {
  margin: 0;
}
.crafting-panel-info__ingredients-swap {
  flex-grow: 1;
  text-align: right;
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
.crafting-panel-info__ingredient-quantity-on-hand--equipped {
  color: red;
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
}
.crafting-panel-actions__number-select,
.crafting-panel-actions__craft-button {
  flex: 1;
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
.crafting-panel-search__searchbox-wrapper {
  position: relative;
  display: inline-flex;
  flex-grow: 1;
  align-items: center;
  max-width: 412.5px;
}
.crafting-panel-search__searchbox-wrapper span {
  position: absolute;
  display: block;
  right: 3px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  color: #fff;
  background-color: gray;
  opacity: .7;
  font: 13px monospace;
  text-align: center;
  line-height: 1em;
  cursor: pointer;
}
.crafting-panel-search__searchbox {
  flex-grow: 1;
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
}
.crafting-panel-sorts__wrapper {
  flex: 45%;
}
.crafting-panel-settings {
  flex: 55%;
  align-items: end;
}
.crafting-panel-settings input {
  margin: 0;
  margin-left: .5rem;
}
.crafting-panel-settings__repair-row {
  align-items: center;
}
.crafting-panel-settings__repair-threshold {
  background: gray;
  border: 1px solid green;
  border-radius: 3px;
  padding: 1px 4px;
  text-align: center;
  width: 25px;
}
.crafting-panel-settings__repair-threshold input {
  display: none;
}
.crafting-panel-settings__repair-threshold span {
  pointer-events: none;
}
.crafting-panel-sorts {
  display: flex;
  flex-direction: row;
  gap: .5rem;
}
.crafting-panel-sorts__title {
  display: inline-block;
}
.crafting-panel-sorts__select {
  max-width: 140px;
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
.crafting-panel-filters__types-type input,
.recipes__recipe input {
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
.crafting-panel-filters__types-type,
.recipes__recipe {
  border-radius: 3px;
  border: none;
  padding: 2px 5px;
  background: gray;
}
.crafting-panel-search__searchbox {
  padding-right: 18px;
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
.crafting-panel-filters__types-type {
  border: 1px solid transparent;
}
.crafting-panel-filters__types-type--repair {
  border: 1px solid green;
}
.crafting-panel-filters__types-type--downgrade {
  border: 1px solid red;
}
.crafting-panel-filters__types-type--upgrade {
  border: 1px solid purple;
}
.recipe-buttons {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: .25rem;
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
  gap: .25rem;
}
.recipes__recipe {
  border: 2px solid transparent;
}
.recipes__recipe--selected {
  background-image: linear-gradient(rgba(255, 255, 255, 0.4) 0 0);
}
.recipes__recipe--repair {
  border: 2px solid green;
}
.recipes__recipe--downgrade {
  border: 2px solid red;
}
.recipes__recipe--upgrade {
  border: 2px solid purple;
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
  const dataChangeEvent = 'changeData';
  const filterChangeEvent = 'changeFilter';
  const sortChangeEvent = 'changeSort';

  const types = ['Standard', 'Repair', 'Upgrade', 'Downgrade'];
  const initialFilters = GM_getValue(gmKeyRecipeFilters, {
    books: ['Potions', 'Food', 'Material Bars'],
    categories: Array.from(new Set(recipes.map((recipe) => ingredients[recipe.itemId].category))),
    types: [...types],
    craftable: 0,
    search: undefined,
    includeIngredients: true,
  });
  const initialSort = GM_getValue(gmKeyRecipeSort, 'book');
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
    craftingPanelTitle.data({name: undefined, id: 0}).trigger(dataChangeEvent);
    craftingPanelSlots.add(craftingPanelResult).data({id: 0}).trigger(dataChangeEvent);
    craftingPanelRequirement.data({requirement: 0}).trigger(dataChangeEvent);
    craftingIngredients.data({id: 0, count: 0, purchasable: -1}).trigger(dataChangeEvent);
    craftingActionsMenu.data({recipe: undefined});
    craftingInfoActions.data({available: 0, purchasable: -1}).trigger(dataChangeEvent);
    GM_deleteValue(gmKeyCurrentCraft);
  }

  const blankSlot = 'EEEEE';
  function setRecipe() {
    if (isCrafting) return;

    const elem = $(this);
    const {recipe: info} = elem.data();
    const {itemId, name, recipe, requirement} = info;
    const counts = {};
    const resolvedName = resolveNames(name || ingredients[itemId].name);

    GM_setValue(gmKeyCurrentCraft, resolvedName);

    recipeButtons.find('.recipes__recipe--selected').removeClass('recipes__recipe--selected');
    elem.addClass('recipes__recipe--selected');

    craftingPanelTitle.data({name: resolvedName, id: itemId}).trigger(dataChangeEvent);
    craftingPanelResult.data({id: itemId}).trigger(dataChangeEvent);
    craftingPanelRequirement.data({requirement: requirement}).trigger(dataChangeEvent);

    const orderedIngredients = recipe
      .match(recipeToItemsRegex)
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
        purchasable: -1,
      });
    });
    craftingIngredients.removeClass('crafting-panel-info__ingredient--purchasable').trigger(dataChangeEvent);
    craftingActionsMenu.data({recipe: info});

    const available = Math.floor(
      Math.min(
        ...Object.entries(counts)
          .filter(([itemId, _]) => parseInt(itemId))
          .map(([itemId, count]) => (inventoryFull[itemId] || 0) / count),
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
        const {count, id, purchasable} = elem.data();
        elem.data({
          purchasable: ~purchasable
            ? Math.max(maxWithPurchase * count - ((id && inventoryFull[id]) || 0), 0)
            : purchasable,
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

  function resolveCraft(recipe, available) {
    let equipmentCraft = !!equipment.find(({itemid}) => recipe.itemId === itemid);
    recipe.recipe
      .match(recipeToItemsRegex)
      .filter((item) => item !== blankSlot)
      .map((item) => parseInt(item))
      .forEach((item) => {
        // Did we craft equipment?
        equipmentCraft |= !!equipment.find(({itemid}) => item === itemid);

        // Update data on relevant craftingIngredient item if one matches
        const ingredient = craftingIngredients.filter(function () {
          return $(this).data().id === item;
        });
        if (!ingredient.length) return;
        const {count} = ingredient.data();

        // Dirty hack to make repairs behave correctly with updating numbers
        // Just skip the item being repaired / "created"
        if (recipe.type !== 'Repair' || item !== recipe.itemId) {
          ingredient.data({available: --inventoryFull[item]});
          --inventoryAmounts[item];
        }
        available = Math.min(available, Math.floor(inventoryFull[item] / count));
      });
    if (recipe.type !== 'Repair') {
      if (!(recipe.itemId in inventoryFull)) {
        inventoryFull[recipe.itemId] = 0;
      }
      if (!(recipe.itemId in inventoryAmounts)) {
        inventoryAmounts[recipe.itemId] = 0;
      }
      ++inventoryFull[recipe.itemId];
      ++inventoryAmounts[recipe.itemId];
    }

    craftingPanelTitle.add(craftingIngredients).trigger(dataChangeEvent);

    // Update equipment states for ater crafts
    getEquipment(equipmentCraft);
    updatePurchasable();
    return available;
  }

  async function doCraft() {
    // Disable crafting buttons and craft switching
    isCrafting = true;
    craftingActionsMenu.find('button, select').prop('disabled', true).addClass('disabled');

    const craftNumber = craftNumberSelect.children('option:selected').val();
    const {recipe} = craftingActionsMenu.data();

    for (let i = 0; i < craftNumber; i++) {
      await new Promise((resolve) =>
        setTimeout(async function () {
          let available = craftingInfoActions.data().available;
          if (await takeCraft(recipe)) {
            available = resolveCraft(recipe, available);
          }
          // Recalculate available for live display
          craftingInfoActions.data({available: available}).trigger(dataChangeEvent);
          if (recipeButtons.data().filters.craftable) recipeButtons.trigger(filterChangeEvent);
          resolve();
        }, CRAFT_TIME),
      );
    }
    craftingActionsMenu.find('button, select').prop('disabled', false).removeClass('disabled');
    isCrafting = false;
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
                  $('<div class="crafting-panel-info__ingredients-header">').append(
                    '<h3 class="crafting-panel-info__ingredients-header-text">Ingredients:</h3>',
                    $(
                      '<label class="crafting-panel-info__ingredients-swap" title="Switches item counts between needed/have and have/needed">',
                    ).append(
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
                  (craftingAvailability = $(`<span class="crafting-panel-info__availability">`).append(
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
                    $('<div class="crafting-panel-actions__craft-row">').append(
                      (craftNumberSelect = $('<select class="crafting-panel-actions__number-select">')),
                      $('<button class="crafting-panel-actions__craft-button">Craft</button>').click(doCraft),
                    ),
                    $('<button class="crafting-panel-actions__max-craft-button">Craft maximum</button>').click(
                      tryDoMaximumCraft,
                    ),
                  )),
                  $('<button class="crafting-panel-actions__clear-craft-button">Clear</button>').click(
                    resetQuickCraftingMenu,
                  ),
                )),
              ),
              $('<div class="crafting-panel-search crafting-panel__row">').append(
                $('<span class="crafting-panel-search__searchbox-wrapper">').append(
                  $('<input type="text" placeholder="Search..." class="crafting-panel-search__searchbox" />')
                    .val(initialFilters.search)
                    .change(function () {
                      const {filters} = recipeButtons.data();
                      filters.search = $(this).val();
                      recipeButtons.data('filters', filters).trigger(filterChangeEvent);
                    }),
                  $('<span>x</span>').click(function () {
                    $(this).prev('input').val('').trigger('change').focus();
                  }),
                ),
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
                  $('<div class="crafting-panel-settings__repair-row crafting-panel__row">').append(
                    $('<label>').append(
                      'Allow equipped item repair',
                      $('<input type="checkbox" />')
                        .prop('checked', GM_getValue(gmKeyEquippedRepair, false))
                        .change(async function () {
                          const checked = $(this).prop('checked');
                          GM_setValue(gmKeyEquippedRepair, checked);
                          updateInventory();
                          craftingPanelTitle.add(craftingIngredients).trigger(dataChangeEvent);

                          // Just click the selected recipe, because getting all the data to the right places here is a pain
                          $('.recipes__recipe--selected').click();

                          // This might change what's showing on craftable/repair showing
                          const {craftable, types} = recipeButtons.data().filters;
                          if (craftable && types.includes('Repair')) recipeButtons.trigger(filterChangeEvent);
                        }),
                    ),
                    $('<label class="crafting-panel-settings__repair-threshold">')
                      .attr('title', 'Durability required to allow repair crafts (% of total time left)')
                      .append(
                        '<input type="button" />',
                        `<span>${Math.floor(GM_getValue(gmKeyRepairThreshold, 0))}%</span>`,
                      )
                      .click(function (event) {
                        if (event.target !== this) return; // Prevent double execution from span
                        const currentThreshold = GM_getValue(gmKeyRepairThreshold, 0);
                        let newThreshold = currentThreshold + 25;
                        if (newThreshold === 100) newThreshold = 99.9999;
                        if (newThreshold > 100) newThreshold = 0;
                        GM_setValue(gmKeyRepairThreshold, newThreshold);
                        $(this)
                          .find('span')
                          .text(`${newThreshold > 99 ? 99 : newThreshold}%`);
                        updateInventory();
                        craftingPanelTitle.add(craftingIngredients).trigger(dataChangeEvent);

                        // This might change what's showing on craftable/repair showing
                        const {craftable, types} = recipeButtons.data().filters;
                        if (craftable && types.includes('Repair')) recipeButtons.trigger(filterChangeEvent);
                      }),
                  ),
                ),
                $('<div class="crafting-panel-sorts__wrapper">').append(
                  $(`<div class="crafting-panel-sorts">`).append(
                    $('<h3 class="crafting-panel-sorts__title">Sort:</h3>'),
                    $('<select class="crafting-panel-sorts__select">')
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
                  ...Array.from(new Set(recipes.map((recipe) => ingredients[recipe.itemId].category)))
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
                    types.map((type) =>
                      $('<label class="crafting-panel-filters__types-type">')
                        .toggleClass(
                          'crafting-panel-filters__types-type--selected',
                          initialFilters.types.includes(type),
                        )
                        .addClass(() => {
                          switch (type) {
                            case 'Repair':
                              return ['crafting-panel-filters__types-type--repair'];
                            case 'Upgrade':
                              return ['crafting-panel-filters__types-type--upgrade'];
                            case 'Downgrade':
                              return ['crafting-panel-filters__types-type--downgrade'];
                            default:
                              return [];
                          }
                        })
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
            // Make sections to add books to (in filter/sort)
            ...Object.keys(books).map(
              (bookKey) =>
                `<div class="recipe-buttons__book-section recipe-buttons__book-section--${bookKey
                  .toLocaleLowerCase()
                  .replace(/ /g, '-')}">`,
            ),
            // Make books
            ...recipes.map((recipe, i) => {
              const item = ingredients[recipe.itemId];
              const data = {
                book: recipe.book,
                category: item.category,
                gold: item.gold,
                ingredients: recipe.recipe
                  .match(recipeToItemsRegex)
                  .filter((item) => item !== blankSlot)
                  .map((item) => parseInt(item))
                  .reduce((counts, id) => {
                    if (!(id in counts)) counts[id] = 0;
                    counts[id]++;
                    return counts;
                  }, {}),
                purchasable: recipe.recipe
                  .match(recipeToItemsRegex)
                  .filter((item) => item !== blankSlot)
                  .map((item) => parseInt(item))
                  .every((itemId) => ingredients[itemId].infStock),
                order: i,
                recipe: recipe,
                type: recipe.type,
              };
              const book = books[recipe.book];
              const recipeButton = $(
                `<label class="recipes__recipe"><input type="button" />${resolveNames(
                  recipe.name || item.name,
                )}</label>`,
              )
                .data(data)
                .css({
                  backgroundColor: book.bgcolor,
                  color: book.color,
                })
                .click(setRecipe);
              switch (recipe.type) {
                case 'Repair':
                  recipeButton.addClass('recipes__recipe--repair');
                  break;
                case 'Upgrade':
                  recipeButton.addClass('recipes__recipe--upgrade');
                  break;
                case 'Downgrade':
                  recipeButton.addClass('recipes__recipe--downgrade');
                  break;
              }
              return recipeButton;
            }),
          )),
        //
        // #endregion Add Recipe buttons to DOM
        //

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
    .data({name: undefined, id: 0})
    .on(dataChangeEvent, function () {
      const elem = $(this);
      const {name, id} = elem.data();
      const available = inventoryFull[id];
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
    .data({id: 0, count: 0, purchasable: -1})
    .on(dataChangeEvent, function () {
      const elem = $(this);
      const link = elem.find('.crafting-panel-info__ingredient-shop-link');
      const nameNode = elem.find('.crafting-panel-info__ingredient-name');
      const onHand = elem.find('.crafting-panel-info__ingredient-quantity-on-hand');
      const perCraft = elem.find('.crafting-panel-info__ingredient-quantity-per-craft');
      const purchaseWrapper = elem.find('.crafting-panel-info__ingredient-quantity-purchasable');
      const purchaseNeeded = elem.find('.crafting-panel-info__ingredient-quantity-purchasable-value');
      const {id, count, purchasable} = elem.data();
      const available = (id && inventoryFull[id]) || 0;
      const equipped = (id && inventoryFull[id] - (inventoryAmounts[id] || 0)) || 0;
      if (id && count) {
        link
          .attr('href', `https://gazellegames.net/shop.php?ItemID=${id}`)
          .toggleClass('crafting-panel-info__ingredient-shop-link--purchasable', ingredients[id].infStock);
        nameNode.text(`${resolveNames(ingredients[id].name)}:`);
        onHand
          .text(available)
          .toggleClass(
            'crafting-panel-info__ingredient-quantity-on-hand--equipped',
            GM_getValue(gmKeyEquippedRepair, false) && !!equipped,
          );
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
    .on(filterChangeEvent, function () {
      const {filters} = $(this).data();
      const {books, categories, craftable, includeIngredients, search, types} = filters;
      const allIngredients = ingredients;
      $(this)
        .find('.recipes__recipe')
        .each(function () {
          const recipeLabel = $(this);
          const {book, category, ingredients, purchasable, recipe, type} = recipeLabel.data();
          if (
            // Filter on book
            books.includes(book) &&
            // Filter on category
            categories.includes(category) &&
            // Filter on craftable/purchasable
            // --Not craftable
            (!craftable ||
              // --Craftable
              Object.entries(ingredients).every(([id, count]) => inventoryFull[id] >= count) ||
              // --Purchasable (Fall through that also includes craftable)
              (craftable === 2 && purchasable)) &&
            // Filter on type
            types.includes(type) &&
            // Filter by search
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

  // Hook "manual" crafting to also update our data
  let manualCraftRecipe;
  const oldTakeCraftingResult = window.takeCraftingResult;
  const oldCleanupCraftingResult = window.cleanupCraftingResult;

  window.takeCraftingResult = (recipe) => {
    manualCraftRecipe = recipe.replace(RECIPE_EQUIPMENT_ITEM_REGEX, '$1');
    oldTakeCraftingResult(recipe);
  };

  window.cleanupCraftingResult = () => {
    oldCleanupCraftingResult();
    const recipe = recipes.find(({recipe}) => recipe === manualCraftRecipe);
    craftingInfoActions
      .data('available', resolveCraft(recipe, craftingInfoActions.data().available))
      .trigger(dataChangeEvent);
    recipeButtons.trigger(filterChangeEvent);
  };

  // Persist selected recipe
  $('.recipes__recipe')
    .filter(function () {
      return $(this).text() === GM_getValue(gmKeyCurrentCraft);
    })
    .click();
})(unsafeWindow || window, jQuery || (unsafeWindow || window).jQuery, GM_info.script.version);
