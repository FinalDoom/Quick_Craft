// ==UserScript==
// @name         GGn Quick Crafter
// @namespace    http://tampermonkey.net/
// @version      2.2.2.k3
// @description  Craft multiple items easier
// @author       KingKrab23 with help from the community
// @match        https://gazellegames.net/user.php?action=crafting
// @grant        none
// ==/UserScript==

const VERSION = '2.2.2.k3';

/* >>>BEGIN<<< User adjustable variables
 * ONLY ADJUST THESE IF YOU KNOW WHAT YOU'RE DOING
 * Too little of a delay will cause more bugs */

const BUTTON_LOCKOUT_DELAY = 1000;
const CRAFT_TIME = 1000;
const GRAB_TIME = 1;
const NEXT_CRAFT_TIME = 1;

// Set which recipe categories are shown by default (1 = shown, 0 = hidden)
// 0 only works for Glass and Recast at the moment, still have to rewrite the other buttons

var DEFAULT = {};
DEFAULT.TEST = 1
DEFAULT.Glass = 0
DEFAULT.Basic_Stats = 1
DEFAULT.Material_Bars = 1
DEFAULT.Luck = 1
DEFAULT.Food = 1
DEFAULT.Jewelry = 0
DEFAULT.Recast = 0
DEFAULT.Staff_Cards = 0
DEFAULT.Portal_Cards = 0
DEFAULT.Mario_Cards = 0

/* >>>END<<< user adjustable variables */

var blankSlot = "EEEEE";
var slots = [];
slots[0] = blankSlot;
slots[1] = blankSlot;
slots[2] = blankSlot;
slots[3] = blankSlot;
slots[4] = blankSlot;
slots[5] = blankSlot;
slots[6] = blankSlot;
slots[7] = blankSlot;
slots[8] = blankSlot;

function getUrlVars(url) {
    var vars = {};
    var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function getSlots() {
    var combinedSlots = "";

    var i = 0;
    for (i = 0; i < slots.length; i++)
        combinedSlots += slots[i];

    return combinedSlots;
}

var authKey = getUrlVars(document.getElementsByTagName('link')[4].href).authkey;
var urlBase = "https://gazellegames.net/user.php?action=ajaxtakecraftingresult&recipe=CUSTOMRECIPE&auth=" + authKey;

/* Used for dynamic button lockouts (i.e.: multicraft) */
var next_button_lockout_delay = BUTTON_LOCKOUT_DELAY;

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.disabled { background-color: #333 !important; color: #666 !important; }';
document.getElementsByTagName('head')[0].appendChild(style);

function getElement(itemId) {
    return "#items-wrapper .item[data-item='" + itemId + "']";
}

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
}

var ingredients = {};
ingredients["glass shards"] = "01988";
ingredients["test tube"] = "00125";
ingredients["vial"] = "00124";
ingredients["bowl"] = "00126";
ingredients["pile of sand"] = "01987";
ingredients["black elder leaves"] = "00115";
ingredients["black elderberries"] = "00114";
ingredients["yellow hellebore flower"] = "00113";
ingredients["upload potion"] = "00099";
ingredients["purple angelica flowers"] = "00111";
ingredients["garlic tincture"] = "00127";
ingredients["download-reduction potion"] = "00106";
ingredients["head of garlic"] = "00112";
ingredients["bronze alloy mix"] = "02225";
ingredients["clay"] = "02234";
ingredients["iron ore"] = "02226";
ingredients["lump of coal"] = "02233";
ingredients["iron bar"] = "02237";
ingredients["gold ore"] = "02227";
ingredients["adamantium ore"] = "02229";
ingredients["mithril ore"] = "02228";
ingredients["quartz dust"] = "02230";
ingredients["jade dust"] = "02231";
ingredients["amethyst dust"] = "02232";
ingredients["ruby-flecked wheat"] = "02579";
ingredients["emerald-flecked wheat"] = "02717";
ingredients["ruby-grained baguette"] = "02580";
ingredients["emerald-grained baguette"] = "02718";
ingredients["garlic ruby-baguette"] = "02581";
ingredients["garlic emerald-baguette"] = "02719";
ingredients["artisan emerald-baguette"] = "02720";
ingredients["emerald chip"] = "02551";
ingredients["quartz bar"] = "02242";
ingredients["carbon-crystalline quartz"] = "02537";
ingredients["ruby"] = "02323";
ingredients["sapphire"] = "02549";
ingredients["emerald"] = "00116";
ingredients["amethyst bar"] = "02244";
ingredients["dwarven gem"] = "02508";
ingredients["flux"] = "02653";

// Cards
ingredients["Bowser"] = "02395";
ingredients["Goomba"] = "02396";
ingredients["Koopa Troopa"] = "02397";
ingredients["Luigi"] = "02391";
ingredients["Mario"] = "02390";
ingredients["Princess Peach"] = "02392";
ingredients["Toad"] = "02393";
ingredients["Wario"] = "02398";
ingredients["Yoshi"] = "02394";
ingredients["Fire Flower"] = "02402";
ingredients["Penguin Suit"] = "02403";
ingredients["Super Mushroom"] = "02401";
ingredients["Goal Pole"] = "02404";
ingredients["A Scared Morty"] = "02377";
ingredients["Cake"] = "02373";
ingredients["Chimera Schematic"] = "02382";
ingredients["Companion Cube"] = "02375";
ingredients["Covetor Mining Ship"] = "02383";
ingredients["GLaDOS"] = "02374";
ingredients["Mr Poopy Butthole"] = "02379";
ingredients["Nyx class Supercarrier"] = "02381";
ingredients["Rick Sanchez"] = "02378";
ingredients["Portal Gun"] = "02376";
ingredients["Ricks Portal Gun"] = "02380";
ingredients["Space Wormhole"] = "02384";
ingredients["Interdimensional Portal"] = "02385";
ingredients["A Red Hot Flamed"] = "02359";
ingredients["A Wild Artifaxx"] = "02358";
ingredients["Alpaca Out of Nowhere!"] = "02361";
ingredients["lepik le prick"] = "02368";
ingredients["LinkinsRepeater Bone Hard Card"] = "02400";
ingredients["MuffledSilence's Headphones"] = "02388";
ingredients["Neos Ratio Cheats"] = "02366";
ingredients["Nikos Transformation"] = "02367";
ingredients["Stump's Banhammer"] = "02365";
ingredients["The Golden Daedy"] = "02357";
ingredients["thewhales Kiss"] = "02364";
ingredients["Ze do Caixao Coffin Joe Card"] = "02410";
ingredients["Random Staff Card"] = "02438";
ingredients["The Golden Throne"] = "02369";
ingredients["Staff Beauty Parlor"] = "02371";
ingredients["Biggest Banhammer"] = "02370";
ingredients["Realm of Staff"] = "02372";

var onHand = {}; // .item_count").text()
function build_on_hand() {
    onHand["glass shards"] = $("#items-wrapper .item[data-item=" + ingredients["glass shards"] + "] .item_count").text();
    if (onHand["glass shards"] === "") { onHand["glass shards"] = $("#items-wrapper .item[data-item=" + ingredients["glass shards"] + "]").length; }

    onHand["test tube"] = $("#items-wrapper .item[data-item=" + ingredients["test tube"] + "] .item_count").text();
    if (onHand["test tube"] === "") { onHand["test tube"] = $("#items-wrapper .item[data-item=" + ingredients["test tube"] + "]").length; }

    onHand["vial"] = $("#items-wrapper .item[data-item=" + ingredients["vial"] + "] .item_count").text();
    if (onHand["vial"] === "") { onHand["vial"] = $("#items-wrapper .item[data-item=" + ingredients["vial"] + "]").length; }

    onHand["bowl"] = $("#items-wrapper .item[data-item=" + ingredients["bowl"] + "] .item_count").text();
    if (onHand["bowl"] === "") { onHand["bowl"] = $("#items-wrapper .item[data-item=" + ingredients["bowl"] + "]").length; }

    onHand["pile of sand"] = $("#items-wrapper .item[data-item=" + ingredients["pile of sand"] + "] .item_count").text();
    if (onHand["pile of sand"] === "") { onHand["pile of sand"] = $("#items-wrapper .item[data-item=" + ingredients["pile of sand"] + "]").length; }

    onHand["black elder leaves"] = $("#items-wrapper .item[data-item=" + ingredients["black elder leaves"] + "] .item_count").text();
    if (onHand["black elder leaves"] === "") { onHand["black elder leaves"] = $("#items-wrapper .item[data-item=" + ingredients["black elder leaves"] + "]").length; }

    onHand["black elderberries"] = $("#items-wrapper .item[data-item=" + ingredients["black elderberries"] + "] .item_count").text();
    if (onHand["black elderberries"] === "") { onHand["black elderberries"] = $("#items-wrapper .item[data-item=" + ingredients["black elderberries"] + "]").length; }

    onHand["yellow hellebore flower"] = $("#items-wrapper .item[data-item=" + ingredients["yellow hellebore flower"] + "] .item_count").text();
    if (onHand["yellow hellebore flower"] === "") { onHand["yellow hellebore flower"] = $("#items-wrapper .item[data-item=" + ingredients["yellow hellebore flower"] + "]").length; }

    onHand["upload potion"] = $("#items-wrapper .item[data-item=" + ingredients["upload potion"] + "] .item_count").text();
    if (onHand["upload potion"] === "") { onHand["upload potion"] = $("#items-wrapper .item[data-item=" + ingredients["upload potion"] + "]").length; }

    onHand["purple angelica flowers"] = $("#items-wrapper .item[data-item=" + ingredients["purple angelica flowers"] + "] .item_count").text();
    if (onHand["purple angelica flowers"] === "") { onHand["purple angelica flowers"] = $("#items-wrapper .item[data-item=" + ingredients["purple angelica flowers"] + "]").length; }

    onHand["garlic tincture"] = $("#items-wrapper .item[data-item=" + ingredients["garlic tincture"] + "] .item_count").text();
    if (onHand["garlic tincture"] === "") { onHand["garlic tincture"] = $("#items-wrapper .item[data-item=" + ingredients["garlic tincture"] + "]").length; }

    onHand["download-reduction potion"] = $("#items-wrapper .item[data-item=" + ingredients["download-reduction potion"] + "] .item_count").text();
    if (onHand["download-reduction potion"] === "") { onHand["download-reduction potion"] = $("#items-wrapper .item[data-item=" + ingredients["download-reduction potion"] + "]").length; }

    onHand["head of garlic"] = $("#items-wrapper .item[data-item=" + ingredients["head of garlic"] + "] .item_count").text();
    if (onHand["head of garlic"] === "") { onHand["head of garlic"] = $("#items-wrapper .item[data-item=" + ingredients["head of garlic"] + "]").length; }

    onHand["bronze alloy mix"] = $("#items-wrapper .item[data-item=" + ingredients["bronze alloy mix"] + "] .item_count").text();
    if (onHand["bronze alloy mix"] === "") { onHand["bronze alloy mix"] = $("#items-wrapper .item[data-item=" + ingredients["bronze alloy mix"] + "]").length; }

    onHand["clay"] = $("#items-wrapper .item[data-item=" + ingredients["clay"] + "] .item_count").text();
    if (onHand["clay"] === "") { onHand["clay"] = $("#items-wrapper .item[data-item=" + ingredients["clay"] + "]").length; }

    onHand["iron ore"] = $("#items-wrapper .item[data-item=" + ingredients["iron ore"] + "] .item_count").text();
    if (onHand["iron ore"] === "") { onHand["iron ore"] = $("#items-wrapper .item[data-item=" + ingredients["iron ore"] + "]").length; }

    onHand["lump of coal"] = $("#items-wrapper .item[data-item=" + ingredients["lump of coal"] + "] .item_count").text();
    if (onHand["lump of coal"] === "") { onHand["lump of coal"] = $("#items-wrapper .item[data-item=" + ingredients["lump of coal"] + "]").length; }

    onHand["iron bar"] = $("#items-wrapper .item[data-item=" + ingredients["iron bar"] + "] .item_count").text();
    if (onHand["iron bar"] === "") { onHand["iron bar"] = $("#items-wrapper .item[data-item=" + ingredients["iron bar"] + "]").length; }

    onHand["gold ore"] = $("#items-wrapper .item[data-item=" + ingredients["gold ore"] + "] .item_count").text();
    if (onHand["gold ore"] === "") { onHand["gold ore"] = $("#items-wrapper .item[data-item=" + ingredients["gold ore"] + "]").length; }

    onHand["adamantium ore"] = $("#items-wrapper .item[data-item=" + ingredients["adamantium ore"] + "] .item_count").text();
    if (onHand["adamantium ore"] === "") { onHand["adamantium ore"] = $("#items-wrapper .item[data-item=" + ingredients["adamantium ore"] + "]").length; }

    onHand["mithril ore"] = $("#items-wrapper .item[data-item=" + ingredients["mithril ore"] + "] .item_count").text();
    if (onHand["mithril ore"] === "") { onHand["mithril ore"] = $("#items-wrapper .item[data-item=" + ingredients["mithril ore"] + "]").length; }

    onHand["quartz dust"] = $("#items-wrapper .item[data-item=" + ingredients["quartz dust"] + "] .item_count").text();
    if (onHand["quartz dust"] === "") { onHand["quartz dust"] = $("#items-wrapper .item[data-item=" + ingredients["quartz dust"] + "]").length; }

    onHand["jade dust"] = $("#items-wrapper .item[data-item=" + ingredients["jade dust"] + "] .item_count").text();
    if (onHand["jade dust"] === "") { onHand["jade dust"] = $("#items-wrapper .item[data-item=" + ingredients["jade dust"] + "]").length; }

    onHand["amethyst dust"] = $("#items-wrapper .item[data-item=" + ingredients["amethyst dust"] + "] .item_count").text();
    if (onHand["amethyst dust"] === "") { onHand["amethyst dust"] = $("#items-wrapper .item[data-item=" + ingredients["amethyst dust"] + "]").length; }

    onHand["ruby-flecked wheat"] = $("#items-wrapper .item[data-item=" + ingredients["ruby-flecked wheat"] + "] .item_count").text();
    if (onHand["ruby-flecked wheat"] === "") { onHand["ruby-flecked wheat"] = $("#items-wrapper .item[data-item=" + ingredients["ruby-flecked wheat"] + "]").length; }

    onHand["emerald-flecked wheat"] = $("#items-wrapper .item[data-item=" + ingredients["emerald-flecked wheat"] + "] .item_count").text();
    if (onHand["emerald-flecked wheat"] === "") { onHand["emerald-flecked wheat"] = $("#items-wrapper .item[data-item=" + ingredients["emerald-flecked wheat"] + "]").length; }

    onHand["ruby-grained baguette"] = $("#items-wrapper .item[data-item=" + ingredients["ruby-grained baguette"] + "] .item_count").text();
    if (onHand["ruby-grained baguette"] === "") { onHand["ruby-grained baguette"] = $("#items-wrapper .item[data-item=" + ingredients["ruby-grained baguette"] + "]").length; }

    onHand["emerald-grained baguette"] = $("#items-wrapper .item[data-item=" + ingredients["emerald-grained baguette"] + "] .item_count").text();
    if (onHand["emerald-grained baguette"] === "") { onHand["emerald-grained baguette"] = $("#items-wrapper .item[data-item=" + ingredients["emerald-grained baguette"] + "]").length; }

    onHand["garlic ruby-baguette"] = $("#items-wrapper .item[data-item=" + ingredients["garlic ruby-baguette"] + "] .item_count").text();
    if (onHand["garlic ruby-baguette"] === "") { onHand["garlic ruby-baguette"] = $("#items-wrapper .item[data-item=" + ingredients["garlic ruby-baguette"] + "]").length; }

    onHand["garlic emerald-baguette"] = $("#items-wrapper .item[data-item=" + ingredients["garlic emerald-baguette"] + "] .item_count").text();
    if (onHand["garlic emerald-baguette"] === "") { onHand["garlic emerald-baguette"] = $("#items-wrapper .item[data-item=" + ingredients["garlic emerald-baguette"] + "]").length; }

    onHand["artisan emerald-baguette"] = $("#items-wrapper .item[data-item=" + ingredients["artisan emerald-baguette"] + "] .item_count").text();
    if (onHand["artisan emerald-baguette"] === "") { onHand["artisan emerald-baguette"] = $("#items-wrapper .item[data-item=" + ingredients["artisan emerald-baguette"] + "]").length; }

    onHand["emerald chip"] = $("#items-wrapper .item[data-item=" + ingredients["emerald chip"] + "] .item_count").text();
    if (onHand["emerald chip"] === "") { onHand["emerald chip"] = $("#items-wrapper .item[data-item=" + ingredients["emerald chip"] + "]").length; }

    onHand["quartz bar"] = $("#items-wrapper .item[data-item=" + ingredients["quartz bar"] + "] .item_count").text();
    if (onHand["quartz bar"] === "") { onHand["quartz bar"] = $("#items-wrapper .item[data-item=" + ingredients["quartz bar"] + "]").length; }

    onHand["carbon-crystalline quartz"] = $("#items-wrapper .item[data-item=" + ingredients["carbon-crystalline quartz"] + "] .item_count").text();
    if (onHand["carbon-crystalline quartz"] === "") { onHand["carbon-crystalline quartz"] = $("#items-wrapper .item[data-item=" + ingredients["carbon-crystalline quartz"] + "]").length; }

    onHand["ruby"] = $("#items-wrapper .item[data-item=" + ingredients["ruby"] + "] .item_count").text();
    if (onHand["ruby"] === "") { onHand["ruby"] = $("#items-wrapper .item[data-item=" + ingredients["ruby"] + "]").length; }

    onHand["sapphire"] = $("#items-wrapper .item[data-item=" + ingredients["sapphire"] + "] .item_count").text();
    if (onHand["sapphire"] === "") { onHand["sapphire"] = $("#items-wrapper .item[data-item=" + ingredients["sapphire"] + "]").length; }

    onHand["emerald"] = $("#items-wrapper .item[data-item=" + ingredients["emerald"] + "] .item_count").text();
    if (onHand["emerald"] === "") { onHand["emerald"] = $("#items-wrapper .item[data-item=" + ingredients["emerald"] + "]").length; }

    onHand["amethyst bar"] = $("#items-wrapper .item[data-item=" + ingredients["amethyst bar"] + "] .item_count").text();
    if (onHand["amethyst bar"] === "") { onHand["amethyst bar"] = $("#items-wrapper .item[data-item=" + ingredients["amethyst bar"] + "]").length; }

    onHand["flux"] = $("#items-wrapper .item[data-item=" + ingredients["flux"] + "] .item_count").text();
    if (onHand["flux"] === "") { onHand["flux"] = $("#items-wrapper .item[data-item=" + ingredients["flux"] + "]").length; }

    onHand["dwarven gem"] = $("#items-wrapper .item[data-item=" + ingredients["dwarven gem"] + "] .item_count").text();
    if (onHand["dwarven gem"] === "") { onHand["dwarven gem"] = $("#items-wrapper .item[data-item=" + ingredients["dwarven gem"] + "]").length; }

    // Cards
    onHand["Bowser"] = $("#items-wrapper .item[data-item=" + ingredients["Bowser"] + "] .item_count").text();
    if (onHand["Bowser"] === "") { onHand["Bowser"] = $("#items-wrapper .item[data-item=" + ingredients["Bowser"] + "]").length}

    onHand["Goomba"] = $("#items-wrapper .item[data-item=" + ingredients["Goomba"] + "] .item_count").text();
    if (onHand["Goomba"] === "") { onHand["Goomba"] = $("#items-wrapper .item[data-item=" + ingredients["Goomba"] + "]").length}

    onHand["Koopa Troopa"] = $("#items-wrapper .item[data-item=" + ingredients["Koopa Troopa"] + "] .item_count").text();
    if (onHand["Koopa Troopa"] === "") { onHand["Koopa Troopa"] = $("#items-wrapper .item[data-item=" + ingredients["Koopa Troopa"] + "]").length}

    onHand["Luigi"] = $("#items-wrapper .item[data-item=" + ingredients["Luigi"] + "] .item_count").text();
    if (onHand["Luigi"] === "") { onHand["Luigi"] = $("#items-wrapper .item[data-item=" + ingredients["Luigi"] + "]").length}

    onHand["Mario"] = $("#items-wrapper .item[data-item=" + ingredients["Mario"] + "] .item_count").text();
    if (onHand["Mario"] === "") { onHand["Mario"] = $("#items-wrapper .item[data-item=" + ingredients["Mario"] + "]").length}

    onHand["Princess Peach"] = $("#items-wrapper .item[data-item=" + ingredients["Princess Peach"] + "] .item_count").text();
    if (onHand["Princess Peach"] === "") { onHand["Princess Peach"] = $("#items-wrapper .item[data-item=" + ingredients["Princess Peach"] + "]").length}

    onHand["Toad"] = $("#items-wrapper .item[data-item=" + ingredients["Toad"] + "] .item_count").text();
    if (onHand["Toad"] === "") { onHand["Toad"] = $("#items-wrapper .item[data-item=" + ingredients["Toad"] + "]").length}

    onHand["Wario"] = $("#items-wrapper .item[data-item=" + ingredients["Wario"] + "] .item_count").text();
    if (onHand["Wario"] === "") { onHand["Wario"] = $("#items-wrapper .item[data-item=" + ingredients["Wario"] + "]").length}

    onHand["Yoshi"] = $("#items-wrapper .item[data-item=" + ingredients["Yoshi"] + "] .item_count").text();
    if (onHand["Yoshi"] === "") { onHand["Yoshi"] = $("#items-wrapper .item[data-item=" + ingredients["Yoshi"] + "]").length}

    onHand["Fire Flower"] = $("#items-wrapper .item[data-item=" + ingredients["Fire Flower"] + "] .item_count").text();
    if (onHand["Fire Flower"] === "") { onHand["Fire Flower"] = $("#items-wrapper .item[data-item=" + ingredients["Fire Flower"] + "]").length}

    onHand["Penguin Suit"] = $("#items-wrapper .item[data-item=" + ingredients["Penguin Suit"] + "] .item_count").text();
    if (onHand["Penguin Suit"] === "") { onHand["Penguin Suit"] = $("#items-wrapper .item[data-item=" + ingredients["Penguin Suit"] + "]").length}

    onHand["Super Mushroom"] = $("#items-wrapper .item[data-item=" + ingredients["Super Mushroom"] + "] .item_count").text();
    if (onHand["Super Mushroom"] === "") { onHand["Super Mushroom"] = $("#items-wrapper .item[data-item=" + ingredients["Super Mushroom"] + "]").length}

    onHand["Goal Pole"] = $("#items-wrapper .item[data-item=" + ingredients["Goal Pole"] + "] .item_count").text();
    if (onHand["Goal Pole"] === "") { onHand["Goal Pole"] = $("#items-wrapper .item[data-item=" + ingredients["Goal Pole"] + "]").length}

    onHand["A Scared Morty"] = $("#items-wrapper .item[data-item=" + ingredients["A Scared Morty"] + "] .item_count").text();
    if (onHand["A Scared Morty"] === "") { onHand["A Scared Morty"] = $("#items-wrapper .item[data-item=" + ingredients["A Scared Morty"] + "]").length}

    onHand["Cake"] = $("#items-wrapper .item[data-item=" + ingredients["Cake"] + "] .item_count").text();
    if (onHand["Cake"] === "") { onHand["Cake"] = $("#items-wrapper .item[data-item=" + ingredients["Cake"] + "]").length}

    onHand["Chimera Schematic"] = $("#items-wrapper .item[data-item=" + ingredients["Chimera Schematic"] + "] .item_count").text();
    if (onHand["Chimera Schematic"] === "") { onHand["Chimera Schematic"] = $("#items-wrapper .item[data-item=" + ingredients["Chimera Schematic"] + "]").length}

    onHand["Companion Cube"] = $("#items-wrapper .item[data-item=" + ingredients["Companion Cube"] + "] .item_count").text();
    if (onHand["Companion Cube"] === "") { onHand["Companion Cube"] = $("#items-wrapper .item[data-item=" + ingredients["Companion Cube"] + "]").length}

    onHand["Covetor Mining Ship"] = $("#items-wrapper .item[data-item=" + ingredients["Covetor Mining Ship"] + "] .item_count").text();
    if (onHand["Covetor Mining Ship"] === "") { onHand["Covetor Mining Ship"] = $("#items-wrapper .item[data-item=" + ingredients["Covetor Mining Ship"] + "]").length}

    onHand["GLaDOS"] = $("#items-wrapper .item[data-item=" + ingredients["GLaDOS"] + "] .item_count").text();
    if (onHand["GLaDOS"] === "") { onHand["GLaDOS"] = $("#items-wrapper .item[data-item=" + ingredients["GLaDOS"] + "]").length}

    onHand["Mr Poopy Butthole"] = $("#items-wrapper .item[data-item=" + ingredients["Mr Poopy Butthole"] + "] .item_count").text();
    if (onHand["Mr Poopy Butthole"] === "") { onHand["Mr Poopy Butthole"] = $("#items-wrapper .item[data-item=" + ingredients["Mr Poopy Butthole"] + "]").length}

    onHand["Nyx class Supercarrier"] = $("#items-wrapper .item[data-item=" + ingredients["Nyx class Supercarrier"] + "] .item_count").text();
    if (onHand["Nyx class Supercarrier"] === "") { onHand["Nyx class Supercarrier"] = $("#items-wrapper .item[data-item=" + ingredients["Nyx class Supercarrier"] + "]").length}

    onHand["Rick Sanchez"] = $("#items-wrapper .item[data-item=" + ingredients["Rick Sanchez"] + "] .item_count").text();
    if (onHand["Rick Sanchez"] === "") { onHand["Rick Sanchez"] = $("#items-wrapper .item[data-item=" + ingredients["Rick Sanchez"] + "]").length}

    onHand["Portal Gun"] = $("#items-wrapper .item[data-item=" + ingredients["Portal Gun"] + "] .item_count").text();
    if (onHand["Portal Gun"] === "") { onHand["Portal Gun"] = $("#items-wrapper .item[data-item=" + ingredients["Portal Gun"] + "]").length}

    onHand["Ricks Portal Gun"] = $("#items-wrapper .item[data-item=" + ingredients["Ricks Portal Gun"] + "] .item_count").text();
    if (onHand["Ricks Portal Gun"] === "") { onHand["Ricks Portal Gun"] = $("#items-wrapper .item[data-item=" + ingredients["Ricks Portal Gun"] + "]").length}

    onHand["Space Wormhole"] = $("#items-wrapper .item[data-item=" + ingredients["Space Wormhole"] + "] .item_count").text();
    if (onHand["Space Wormhole"] === "") { onHand["Space Wormhole"] = $("#items-wrapper .item[data-item=" + ingredients["Space Wormhole"] + "]").length}

    onHand["Interdimensional Portal"] = $("#items-wrapper .item[data-item=" + ingredients["Interdimensional Portal"] + "] .item_count").text();
    if (onHand["Interdimensional Portal"] === "") { onHand["Interdimensional Portal"] = $("#items-wrapper .item[data-item=" + ingredients["Interdimensional Portal"] + "]").length}

    onHand["A Red Hot Flamed"] = $("#items-wrapper .item[data-item=" + ingredients["A Red Hot Flamed"] + "] .item_count").text();
    if (onHand["A Red Hot Flamed"] === "") { onHand["A Red Hot Flamed"] = $("#items-wrapper .item[data-item=" + ingredients["A Red Hot Flamed"] + "]").length}

    onHand["A Wild Artifaxx"] = $("#items-wrapper .item[data-item=" + ingredients["A Wild Artifaxx"] + "] .item_count").text();
    if (onHand["A Wild Artifaxx"] === "") { onHand["A Wild Artifaxx"] = $("#items-wrapper .item[data-item=" + ingredients["A Wild Artifaxx"] + "]").length}

    onHand["Alpaca Out of Nowhere!"] = $("#items-wrapper .item[data-item=" + ingredients["Alpaca Out of Nowhere!"] + "] .item_count").text();
    if (onHand["Alpaca Out of Nowhere!"] === "") { onHand["Alpaca Out of Nowhere!"] = $("#items-wrapper .item[data-item=" + ingredients["Alpaca Out of Nowhere!"] + "]").length}

    onHand["lepik le prick"] = $("#items-wrapper .item[data-item=" + ingredients["lepik le prick"] + "] .item_count").text();
    if (onHand["lepik le prick"] === "") { onHand["lepik le prick"] = $("#items-wrapper .item[data-item=" + ingredients["lepik le prick"] + "]").length}

    onHand["LinkinsRepeater Bone Hard Card"] = $("#items-wrapper .item[data-item=" + ingredients["LinkinsRepeater Bone Hard Card"] + "] .item_count").text();
    if (onHand["LinkinsRepeater Bone Hard Card"] === "") { onHand["LinkinsRepeater Bone Hard Card"] = $("#items-wrapper .item[data-item=" + ingredients["LinkinsRepeater Bone Hard Card"] + "]").length}

    onHand["MuffledSilence's Headphones"] = $("#items-wrapper .item[data-item=" + ingredients["MuffledSilence's Headphones"] + "] .item_count").text();
    if (onHand["MuffledSilence's Headphones"] === "") { onHand["MuffledSilence's Headphones"] = $("#items-wrapper .item[data-item=" + ingredients["MuffledSilence's Headphones"] + "]").length}

    onHand["Neos Ratio Cheats"] = $("#items-wrapper .item[data-item=" + ingredients["Neos Ratio Cheats"] + "] .item_count").text();
    if (onHand["Neos Ratio Cheats"] === "") { onHand["Neos Ratio Cheats"] = $("#items-wrapper .item[data-item=" + ingredients["Neos Ratio Cheats"] + "]").length}

    onHand["Nikos Transformation"] = $("#items-wrapper .item[data-item=" + ingredients["Nikos Transformation"] + "] .item_count").text();
    if (onHand["Nikos Transformation"] === "") { onHand["Nikos Transformation"] = $("#items-wrapper .item[data-item=" + ingredients["Nikos Transformation"] + "]").length}

    onHand["Stump's Banhammer"] = $("#items-wrapper .item[data-item=" + ingredients["Stump's Banhammer"] + "] .item_count").text();
    if (onHand["Stump's Banhammer"] === "") { onHand["Stump's Banhammer"] = $("#items-wrapper .item[data-item=" + ingredients["Stump's Banhammer"] + "]").length}

    onHand["The Golden Daedy"] = $("#items-wrapper .item[data-item=" + ingredients["The Golden Daedy"] + "] .item_count").text();
    if (onHand["The Golden Daedy"] === "") { onHand["The Golden Daedy"] = $("#items-wrapper .item[data-item=" + ingredients["The Golden Daedy"] + "]").length}

    onHand["thewhales Kiss"] = $("#items-wrapper .item[data-item=" + ingredients["thewhales Kiss"] + "] .item_count").text();
    if (onHand["thewhales Kiss"] === "") { onHand["thewhales Kiss"] = $("#items-wrapper .item[data-item=" + ingredients["thewhales Kiss"] + "]").length}

    onHand["Ze do Caixao Coffin Joe Card"] = $("#items-wrapper .item[data-item=" + ingredients["Ze do Caixao Coffin Joe Card"] + "] .item_count").text();
    if (onHand["Ze do Caixao Coffin Joe Card"] === "") { onHand["Ze do Caixao Coffin Joe Card"] = $("#items-wrapper .item[data-item=" + ingredients["Ze do Caixao Coffin Joe Card"] + "]").length}

    onHand["Random Staff Card"] = $("#items-wrapper .item[data-item=" + ingredients["Random Staff Card"] + "] .item_count").text();
    if (onHand["Random Staff Card"] === "") { onHand["Random Staff Card"] = $("#items-wrapper .item[data-item=" + ingredients["Random Staff Card"] + "]").length}

    onHand["The Golden Throne"] = $("#items-wrapper .item[data-item=" + ingredients["The Golden Throne"] + "] .item_count").text();
    if (onHand["The Golden Throne"] === "") { onHand["The Golden Throne"] = $("#items-wrapper .item[data-item=" + ingredients["The Golden Throne"] + "]").length}

    onHand["Staff Beauty Parlor"] = $("#items-wrapper .item[data-item=" + ingredients["Staff Beauty Parlor"] + "] .item_count").text();
    if (onHand["Staff Beauty Parlor"] === "") { onHand["Staff Beauty Parlor"] = $("#items-wrapper .item[data-item=" + ingredients["Staff Beauty Parlor"] + "]").length}

    onHand["Biggest Banhammer"] = $("#items-wrapper .item[data-item=" + ingredients["Biggest Banhammer"] + "] .item_count").text();
    if (onHand["Biggest Banhammer"] === "") { onHand["Biggest Banhammer"] = $("#items-wrapper .item[data-item=" + ingredients["Biggest Banhammer"] + "]").length}

    onHand["Realm of Staff"] = $("#items-wrapper .item[data-item=" + ingredients["Realm of Staff"] + "] .item_count").text();
    if (onHand["Realm of Staff"] === "") { onHand["Realm of Staff"] = $("#items-wrapper .item[data-item=" + ingredients["Realm of Staff"] + "]").length}
}

var craftList = {};

function build_craft_list() {
    craftList = {};

    craftList["glass shards from test tube"] = {};
    craftList["glass shards from test tube"].ingredients = [ { name: "test tube", id: ingredients["test tube"], qty: 1, "on hand": onHand["test tube"] } ];
    craftList["glass shards from test tube"].icon = "http://test.test";
    craftList["glass shards from test tube"].available = onHand["test tube"];

    craftList["glass shards from sand"] = {};
    craftList["glass shards from sand"].ingredients = [ { name: "pile of sand", id: ingredients["pile of sand"], qty: 1, "on hand": onHand["pile of sand"] } ];
    craftList["glass shards from sand"].icon = "http://test.test";
    craftList["glass shards from sand"].available = onHand["pile of sand"];

    craftList["test tube"] = {};
    craftList["test tube"].ingredients = [ { name: "glass shards", id: ingredients["glass shards"], qty: 2, "on hand": onHand["glass shards"] } ];
    craftList["test tube"].icon = "http://test.test";
    craftList["test tube"].available = Math.floor(onHand["glass shards"] / 2);

    craftList["vial"] = {};
    craftList["vial"].ingredients = [ { name: "glass shards", id: ingredients["glass shards"], qty: 5, "on hand": onHand["glass shards"] } ];
    craftList["vial"].icon = "http://test.test";
    craftList["vial"].available = Math.floor(onHand["glass shards"] / 5);

    craftList["bowl"] = {};
    craftList["bowl"].ingredients = [ { name: "glass shards", id: ingredients["glass shards"], qty: 8, "on hand": onHand["glass shards"] } ];
    craftList["bowl"].icon = "http://test.test";
    craftList["bowl"].available = Math.floor(onHand["glass shards"] / 8);

    craftList["dust ore vial"] = {};
    craftList["dust ore vial"].ingredients = [
        { name: "pile of sand", id: ingredients["pile of sand"], qty: 1, "on hand": onHand["pile of sand"] },
        { name: "quartz dust", id: ingredients["quartz dust"], qty: 1, "on hand": onHand["quartz dust"] }
    ];
    craftList["dust ore vial"].icon = "http://test.test";
    craftList["dust ore vial"].available = Math.min(onHand["pile of sand"]
                                                                , onHand["quartz dust"]);

    craftList["dust ore bowl"] = {};
    craftList["dust ore bowl"].ingredients = [
        { name: "pile of sand", id: ingredients["pile of sand"], qty: 1, "on hand": onHand["pile of sand"] },
        { name: "jade dust", id: ingredients["jade dust"], qty: 1, "on hand": onHand["jade dust"] }
    ];
    craftList["dust ore bowl"].icon = "http://test.test";
    craftList["dust ore bowl"].available = Math.min(onHand["pile of sand"]
                                                                , onHand["jade dust"]);

    craftList["upload potion sampler"] = {};
    craftList["upload potion sampler"].ingredients = [
        { name: "test tube", id: ingredients["test tube"], qty: 1, "on hand": onHand["test tube"] },
        { name: "black elder leaves", id: ingredients["black elder leaves"], qty: 1, "on hand": onHand["black elder leaves"] },
        { name: "black elderberries", id: ingredients["black elderberries"], qty: 1, "on hand": onHand["black elderberries"] }
    ];
    craftList["upload potion sampler"].icon = "http://test.test";
    craftList["upload potion sampler"].available = Math.min(onHand["black elder leaves"]
                                                            , onHand["test tube"]
                                                            , onHand["black elderberries"]);

    craftList["small upload potion"] = {};
    craftList["small upload potion"].ingredients = [
        { name: "vial", id: ingredients["vial"], qty: 1, "on hand": onHand["vial"] },
        { name: "black elder leaves", id: ingredients["black elder leaves"], qty: 2, "on hand": onHand["black elder leaves"] },
        { name: "black elderberries", id: ingredients["black elderberries"], qty: 1, "on hand": onHand["black elderberries"] }
    ];
    craftList["small upload potion"].icon = "http://test.test";
    craftList["small upload potion"].available = Math.min(Math.floor(onHand["black elder leaves"] / 2)
                                                          , onHand["vial"]
                                                          , onHand["black elderberries"]);

    craftList["upload potion"] = {};
    craftList["upload potion"].ingredients = [
        { name: "vial", id: ingredients["vial"], qty: 1, "on hand": onHand["vial"] },
        { name: "black elder leaves", id: ingredients["black elder leaves"], qty: 5, "on hand": onHand["black elder leaves"] },
        { name: "black elderberries", id: ingredients["black elderberries"], qty: 1, "on hand": onHand["black elderberries"] }
    ];
    craftList["upload potion"].icon = "http://test.test";
    craftList["upload potion"].available = Math.min(Math.floor(onHand["black elder leaves"] / 5)
                                                    , onHand["black elderberries"]
                                                    , onHand["vial"]);

    craftList["large upload potion"] = {};
    craftList["large upload potion"].ingredients = [
        { name: "bowl", id: ingredients["bowl"], qty: 1, "on hand": onHand["bowl"] },
        { name: "upload potion", id: ingredients["upload potion"], qty: 2, "on hand": onHand["upload potion"] },
        { name: "yellow hellebore flower", id: ingredients["yellow hellebore flower"], qty: 1, "on hand": onHand["yellow hellebore flower"] }
    ];
    craftList["large upload potion"].icon = "http://test.test";
    craftList["large upload potion"].available = Math.min(Math.floor(onHand["upload potion"] / 2)
                                                          , onHand["bowl"]
                                                          , onHand["yellow hellebore flower"]);

    craftList["download-reduction potion sampler"] = {};
    craftList["download-reduction potion sampler"].ingredients = [
        { name: "test tube", id: ingredients["test tube"], qty: 1, "on hand": onHand["test tube"] },
        { name: "purple angelica flowers", id: ingredients["purple angelica flowers"], qty: 1, "on hand": onHand["purple angelica flowers"] },
        { name: "garlic tincture", id: ingredients["garlic tincture"], qty: 1, "on hand": onHand["garlic tincture"] }
    ];
    craftList["download-reduction potion sampler"].icon = "http://test.test";
    craftList["download-reduction potion sampler"].available = Math.min(onHand["test tube"]
                                                                        , onHand["purple angelica flowers"]
                                                                        , onHand["garlic tincture"]);

    craftList["small download-reduction potion"] = {};
    craftList["small download-reduction potion"].ingredients = [
        { name: "vial", id: ingredients["vial"], qty: 1, "on hand": onHand["vial"] },
        { name: "purple angelica flowers", id: ingredients["purple angelica flowers"], qty: 2, "on hand": onHand["purple angelica flowers"] },
        { name: "garlic tincture", id: ingredients["garlic tincture"], qty: 1, "on hand": onHand["garlic tincture"] }
    ];
    craftList["small download-reduction potion"].icon = "http://test.test";
    craftList["small download-reduction potion"].available = Math.min(Math.floor(onHand["purple angelica flowers"] / 2)
                                                                      , onHand["vial"]
                                                                      , onHand["garlic tincture"]);

    craftList["download-reduction potion"] = {};
    craftList["download-reduction potion"].ingredients = [
        { name: "vial", id: ingredients["vial"], qty: 1, "on hand": onHand["vial"] },
        { name: "purple angelica flowers", id: ingredients["purple angelica flowers"], qty: 5, "on hand": onHand["purple angelica flowers"] },
        { name: "garlic tincture", id: ingredients["garlic tincture"], qty: 1, "on hand": onHand["garlic tincture"] }
    ];
    craftList["download-reduction potion"].icon = "http://test.test";
    craftList["download-reduction potion"].available = Math.min(Math.floor(onHand["purple angelica flowers"] / 5)
                                                                , onHand["vial"]
                                                                , onHand["garlic tincture"]);

    craftList["large download-reduction potion"] = {};
    craftList["large download-reduction potion"].ingredients = [
        { name: "bowl", id: ingredients["bowl"], qty: 1, "on hand": onHand["bowl"] },
        { name: "download-reduction potion", id: ingredients["download-reduction potion"], qty: 2, "on hand": onHand["download-reduction potion"] },
        { name: "yellow hellebore flower", id: ingredients["yellow hellebore flower"], qty: 1, "on hand": onHand["yellow hellebore flower"] }
    ];
    craftList["large download-reduction potion"].icon = "http://test.test";
    craftList["large download-reduction potion"].available = Math.min(Math.floor(onHand["download-reduction potion"] / 2)
                                                                      , onHand["bowl"]
                                                                      , onHand["yellow hellebore flower"]);

    craftList["garlic tincture"] = {};
    craftList["garlic tincture"].ingredients = [
        { name: "test tube", id: ingredients["test tube"], qty: 1, "on hand": onHand["test tube"] },
        { name: "head of garlic", id: ingredients["head of garlic"], qty: 1, "on hand": onHand["head of garlic"] },
    ];
    craftList["garlic tincture"].icon = "http://test.test";
    craftList["garlic tincture"].available = Math.min(onHand["test tube"]
                                                      , onHand["head of garlic"]);

    craftList["small luck potion"] = {};
    craftList["small luck potion"].ingredients = [
        { name: "vial", id: ingredients["vial"], qty: 1, "on hand": onHand["vial"] },
        { name: "black elderberries", id: ingredients["black elderberries"], qty: 2, "on hand": onHand["black elderberries"] },
    ];
    craftList["small luck potion"].icon = "http://test.test";
    craftList["small luck potion"].available = Math.min(Math.floor(onHand["black elderberries"] / 2)
                                                        , onHand["vial"]);

    craftList["large luck potion"] = {};
    craftList["large luck potion"].ingredients = [
        { name: "bowl", id: ingredients["bowl"], qty: 1, "on hand": onHand["bowl"] },
        { name: "black elderberries", id: ingredients["black elderberries"], qty: 5, "on hand": onHand["black elderberries"] },
        { name: "yellow hellebore flower", id: ingredients["yellow hellebore flower"], qty: 1, "on hand": onHand["yellow hellebore flower"] }
    ];
    craftList["large luck potion"].icon = "http://test.test";
    craftList["large luck potion"].available = Math.min(Math.floor(onHand["black elderberries"] / 5)
                                                        , onHand["bowl"]
                                                        , onHand["yellow hellebore flower"]);

    craftList["ruby-grained baguette"] = {};
    craftList["ruby-grained baguette"].ingredients = [ { name: "ruby-flecked wheat", id: ingredients["ruby-flecked wheat"], qty: 2, "on hand": onHand["ruby-flecked wheat"] } ];
    craftList["ruby-grained baguette"].icon = "http://test.test";
    craftList["ruby-grained baguette"].available = Math.floor(onHand["ruby-flecked wheat"] / 2);

    craftList["emerald-grained baguette"] = {};
    craftList["emerald-grained baguette"].ingredients = [ { name: "emerald-flecked wheat", id: ingredients["emerald-flecked wheat"], qty: 2, "on hand": onHand["emerald-flecked wheat"] } ];
    craftList["emerald-grained baguette"].icon = "http://test.test";
    craftList["emerald-grained baguette"].available = Math.floor(onHand["emerald-flecked wheat"] / 2);

    craftList["garlic ruby-baguette"] = {};
    craftList["garlic ruby-baguette"].ingredients = [
        { name: "ruby-grained baguette", id: ingredients["ruby-grained baguette"], qty: 1, "on hand": onHand["ruby-grained baguette"] },
        { name: "head of garlic", id: ingredients["head of garlic"], qty: 2, "on hand": onHand["head of garlic"] },
    ];
    craftList["garlic ruby-baguette"].icon = "http://test.test";
    craftList["garlic ruby-baguette"].available = Math.min(Math.floor(onHand["head of garlic"] / 2)
                                                           , onHand["ruby-grained baguette"]);

    craftList["garlic emerald-baguette"] = {};
    craftList["garlic emerald-baguette"].ingredients = [
        { name: "emerald-grained baguette", id: ingredients["emerald-grained baguette"], qty: 1, "on hand": onHand["emerald-grained baguette"] },
        { name: "head of garlic", id: ingredients["head of garlic"], qty: 1, "on hand": onHand["head of garlic"] },
    ];
    craftList["garlic emerald-baguette"].icon = "http://test.test";
    craftList["garlic emerald-baguette"].available = Math.min(onHand["head of garlic"]
                                                              , onHand["emerald-grained baguette"]);

    craftList["artisan emerald-baguette"] = {};
    craftList["artisan emerald-baguette"].ingredients = [
        { name: "garlic emerald-baguette", id: ingredients["garlic emerald-baguette"], qty: 1, "on hand": onHand["garlic emerald-baguette"] },
        { name: "emerald chip", id: ingredients["emerald chip"], qty: 1, "on hand": onHand["emerald chip"] },
        { name: "yellow hellebore flower", id: ingredients["yellow hellebore flower"], qty: 1, "on hand": onHand["yellow hellebore flower"] },
    ];
    craftList["artisan emerald-baguette"].icon = "http://test.test";
    craftList["artisan emerald-baguette"].available = Math.min(onHand["garlic emerald-baguette"]
                                                               , onHand["emerald chip"]
                                                               , onHand["yellow hellebore flower"]);

    craftList["artisan ruby-baguette"] = {};
    craftList["artisan ruby-baguette"].ingredients = [
        { name: "garlic ruby-baguette", id: ingredients["garlic ruby-baguette"], qty: 1, "on hand": onHand["garlic ruby-baguette"] },
        { name: "yellow hellebore flower", id: ingredients["yellow hellebore flower"], qty: 2, "on hand": onHand["yellow hellebore flower"] },
    ];
    craftList["artisan ruby-baguette"].icon = "http://test.test";
    craftList["artisan ruby-baguette"].available = Math.min(Math.floor(onHand["yellow hellebore flower"] / 5)
                                                            , onHand["garlic ruby-baguette"]);

    craftList["gazellian emerald-baguette"] = {};
    craftList["gazellian emerald-baguette"].ingredients = [
        { name: "artisan emerald-baguette", id: ingredients["artisan emerald-baguette"], qty: 1, "on hand": onHand["artisan emerald-baguette"] },
        { name: "emerald chip", id: ingredients["emerald chip"], qty: 2, "on hand": onHand["emerald chip"] }
    ];
    craftList["gazellian emerald-baguette"].icon = "http://test.test";
    craftList["gazellian emerald-baguette"].available = Math.min(Math.floor(onHand["emerald chip"] / 2)
                                                                 , onHand["artisan emerald-baguette"]);

    craftList["impure bronze bar"] = {};
    craftList["impure bronze bar"].ingredients = [
        { name: "bronze alloy mix", id: ingredients["bronze alloy mix"], qty: 1, "on hand": onHand["bronze alloy mix"] },
        { name: "clay", id: ingredients["clay"], qty: 1, "on hand": onHand["clay"] },
    ];
    craftList["impure bronze bar"].icon = "http://test.test";
    craftList["impure bronze bar"].available = Math.min(onHand["bronze alloy mix"]
                                                        , onHand["clay"]);

    craftList["bronze bar"] = {};
    craftList["bronze bar"].ingredients = [ { name: "bronze alloy mix", id: ingredients["bronze alloy mix"], qty: 2, "on hand": onHand["bronze alloy mix"] } ];
    craftList["bronze bar"].icon = "http://test.test";
    craftList["bronze bar"].available = Math.floor(onHand["bronze alloy mix"] / 2);

    craftList["iron bar"] = {};
    craftList["iron bar"].ingredients = [ {name: "iron ore", id: ingredients["iron ore"], qty: 2, "on hand": onHand["iron ore"] } ];
    craftList["iron bar"].icon = "http://test.test";
    craftList["iron bar"].available = Math.floor(onHand["iron ore"] / 2);

    craftList["gold bar"] = {};
    craftList["gold bar"].ingredients = [ { name: "gold ore", id: ingredients["gold ore"], qty: 2, "on hand": onHand["gold ore"] } ];
    craftList["gold bar"].icon = "http://test.test";
    craftList["gold bar"].available = Math.floor(onHand["gold ore"] / 2);

    craftList["mithril bar"] = {};
    craftList["mithril bar"].ingredients = [ { name: "mithril ore", id: ingredients["mithril ore"], qty: 2, "on hand": onHand["mithril ore"] } ];
    craftList["mithril bar"].icon = "http://test.test";
    craftList["mithril bar"].available = Math.floor(onHand["mithril ore"] / 2);

    craftList["adamantium bar"] = {};
    craftList["adamantium bar"].ingredients = [ { name: "adamantium ore", id: ingredients["adamantium ore"], qty: 2, "on hand": onHand["adamantium ore"] } ];
    craftList["adamantium bar"].icon = "http://test.test";
    craftList["adamantium bar"].available = Math.floor(onHand["adamantium ore"] / 2);

    craftList["amethyst bar"] = {};
    craftList["amethyst bar"].ingredients = [ { name: "amethyst dust", id: ingredients["amethyst dust"], qty: 2, "on hand": onHand["amethyst dust"] } ];
    craftList["amethyst bar"].icon = "http://test.test";
    craftList["amethyst bar"].available = Math.floor(onHand["amethyst dust"] / 2);

    craftList["quartz bar"] = {};
    craftList["quartz bar"].ingredients = [ { name: "quartz dust", id: ingredients["quartz dust"], qty: 2, "on hand": onHand["quartz dust"] } ];
    craftList["quartz bar"].icon = "http://test.test";
    craftList["quartz bar"].available = Math.floor(onHand["quartz dust"] / 2);

    craftList["jade bar"] = {};
    craftList["jade bar"].ingredients = [ { name: "jade dust", id: ingredients["jade dust"], qty: 2, "on hand": onHand["jade dust"] } ];
    craftList["jade bar"].icon = "http://test.test";
    craftList["jade bar"].available = Math.floor(onHand["jade dust"] / 2);

    craftList["steel bar from iron ore"] = {};
    craftList["steel bar from iron ore"].ingredients = [
        { name: "iron ore", id: ingredients["iron ore"], qty: 2, "on hand": onHand["iron ore"] },
        { name: "lump of coal", id: ingredients["lump of coal"], qty: 1, "on hand": onHand["lump of coal"] },
    ];
    craftList["steel bar from iron ore"].icon = "http://test.test";
    craftList["steel bar from iron ore"].available = Math.min(Math.floor(onHand["iron ore"] / 2)
                                                              , onHand["lump of coal"]);

    craftList["steel bar from iron bar"] = {};
    craftList["steel bar from iron bar"].ingredients = [
        { name: "iron bar", id: ingredients["iron bar"], qty: 1, "on hand": onHand["iron bar"] },
        { name: "lump of coal", id: ingredients["lump of coal"], qty: 1, "on hand": onHand["lump of coal"] },
    ];
    craftList["steel bar from iron bar"].icon = "http://test.test";
    craftList["steel bar from iron bar"].available = Math.min(onHand["iron bar"]
                                                              , onHand["lump of coal"]);

    craftList["carbon-crystalline quartz gem"] = {};
    craftList["carbon-crystalline quartz gem"].ingredients = [
        { name: "quartz bar", id: ingredients["quartz bar"], qty: 1, "on hand": onHand["quartz bar"] },
        { name: "lump of coal", id: ingredients["lump of coal"], qty: 1, "on hand": onHand["lump of coal"] },
    ];
    craftList["carbon-crystalline quartz gem"].icon = "http://test.test";
    craftList["carbon-crystalline quartz gem"].available = Math.min(onHand["quartz bar"]
                                                                    , onHand["lump of coal"]);

    craftList["carbon-crystalline quartz necklace"] = {};
    craftList["carbon-crystalline quartz necklace"].ingredients = [
        { name: "carbon-crystalline quartz", id: ingredients["carbon-crystalline quartz"], qty: 1, "on hand": onHand["carbon-crystalline quartz"] },
        { name: "glass shards", id: ingredients["glass shards"], qty: 1, "on hand": onHand["glass shards"] },
    ];
    craftList["carbon-crystalline quartz necklace"].icon = "http://test.test";
    craftList["carbon-crystalline quartz necklace"].available = Math.min(onHand["carbon-crystalline quartz"]
                                                                         , onHand["glass shards"]);

    craftList["exquisite constellation of rubies"] = {};
    craftList["exquisite constellation of rubies"].ingredients = [
        { name: "amethyst bar", id: ingredients["amethyst bar"], qty: 2, "on hand": onHand["amethyst bar"] },
        { name: "ruby", id: ingredients["ruby"], qty: 4, "on hand": onHand["ruby"] },
    ];
    craftList["exquisite constellation of rubies"].icon = "http://test.test";
    craftList["exquisite constellation of rubies"].available = Math.min(Math.floor(onHand["amethyst bar"] / 2)
                                                                         , Math.floor(onHand["ruby"] / 4));

    craftList["exquisite constellation of sapphires"] = {};
    craftList["exquisite constellation of sapphires"].ingredients = [
        { name: "amethyst bar", id: ingredients["amethyst bar"], qty: 2, "on hand": onHand["amethyst bar"] },
        { name: "sapphire", id: ingredients["sapphire"], qty: 4, "on hand": onHand["sapphire"] },
    ];
    craftList["exquisite constellation of sapphires"].icon = "http://test.test";
    craftList["exquisite constellation of sapphires"].available = Math.min(Math.floor(onHand["amethyst bar"] / 2)
                                                                            , Math.floor(onHand["sapphire"] / 4));

    craftList["exquisite constellation of emeralds"] = {};
    craftList["exquisite constellation of emeralds"].ingredients = [
        { name: "amethyst bar", id: ingredients["amethyst bar"], qty: 2, "on hand": onHand["amethyst bar"] },
        { name: "emerald", id: ingredients["emerald"], qty: 4, "on hand": onHand["emerald"] },
    ];
    craftList["exquisite constellation of emeralds"].icon = "http://test.test";
    craftList["exquisite constellation of emeralds"].available = Math.min(Math.floor(onHand["amethyst bar"] / 2)
                                                                           , Math.floor(onHand["emerald"] / 4));

    craftList["melt dwarven gem"] = {};
    craftList["melt dwarven gem"].ingredients = [
        { name: "flux", id: ingredients["flux"], qty: 1, "on hand": onHand["flux"] },
        { name: "dwarven gem", id: ingredients["dwarven gem"], qty: 1, "on hand": onHand["dwarven gem"] },
    ];
    craftList["melt dwarven gem"].icon = "http://test.test";
    craftList["melt dwarven gem"].available = Math.min(onHand["flux"], onHand["dwarven gem"]);

    // Cards
    craftList["the golden throne"] = {};
    craftList["the golden throne"].ingredients = [
        { name: "A Wild Artifaxx", id: ingredients["A Wild Artifaxx"], qty: 1, "on hand": onHand["A Wild Artifaxx"] },
        { name: "A Red Hot Flamed", id: ingredients["A Red Hot Flamed"], qty: 1, "on hand": onHand["A Red Hot Flamed"] },
        { name: "The Golden Daedy", id: ingredients["The Golden Daedy"], qty: 1, "on hand": onHand["The Golden Daedy"] },
    ];
    craftList["the golden throne"].icon = "http://test.test";
    craftList["the golden throne"].available = Math.min(onHand["A Wild Artifaxx"], onHand["A Red Hot Flamed"], onHand["The Golden Daedy"]);

    craftList["biggest banhammer"] = {};
    craftList["biggest banhammer"].ingredients = [
        { name: "Stump's Banhammer", id: ingredients["Stump's Banhammer"], qty: 1, "on hand": onHand["Stump's Banhammer"] },
        { name: "thewhales Kiss", id: ingredients["thewhales Kiss"], qty: 1, "on hand": onHand["thewhales Kiss"] },
        { name: "Neos Ratio Cheats", id: ingredients["Neos Ratio Cheats"], qty: 1, "on hand": onHand["Neos Ratio Cheats"] },
    ];
    craftList["biggest banhammer"].icon = "http://test.test";
    craftList["biggest banhammer"].available = Math.min(onHand["Stump's Banhammer"], onHand["thewhales Kiss"], onHand["Neos Ratio Cheats"]);

    craftList["staff beauty parlor"] = {};
    craftList["staff beauty parlor"].ingredients = [
        { name: "Alpaca Out of Nowhere!", id: ingredients["Alpaca Out of Nowhere!"], qty: 1, "on hand": onHand["Alpaca Out of Nowhere!"] },
        { name: "Nikos Transformation", id: ingredients["Nikos Transformation"], qty: 1, "on hand": onHand["Nikos Transformation"] },
        { name: "lepik le prick", id: ingredients["lepik le prick"], qty: 1, "on hand": onHand["lepik le prick"] },
    ];
    craftList["staff beauty parlor"].icon = "http://test.test";
    craftList["staff beauty parlor"].available = Math.min(onHand["Alpaca Out of Nowhere!"], onHand["Nikos Transformation"], onHand["lepik le prick"]);

    craftList["random lvl2 staff card"] = {};
    craftList["random lvl2 staff card"].ingredients = [
        { name: "LinkinsRepeater Bone Hard Card", id: ingredients["LinkinsRepeater Bone Hard Card"], qty: 1, "on hand": onHand["LinkinsRepeater Bone Hard Card"] },
        { name: "MuffledSilence's Headphones", id: ingredients["MuffledSilence's Headphones"], qty: 1, "on hand": onHand["MuffledSilence's Headphones"] },
        { name: "Ze do Caixao Coffin Joe Card", id: ingredients["Ze do Caixao Coffin Joe Card"], qty: 1, "on hand": onHand["Ze do Caixao Coffin Joe Card"] },
    ];
    craftList["random lvl2 staff card"].icon = "http://test.test";
    craftList["random lvl2 staff card"].available = Math.min(onHand["LinkinsRepeater Bone Hard Card"], onHand["MuffledSilence's Headphones"], onHand["Ze do Caixao Coffin Joe Card"]);

    craftList["realm of staff"] = {};
    craftList["realm of staff"].ingredients = [
        { name: "The Golden Throne", id: ingredients["The Golden Throne"], qty: 1, "on hand": onHand["The Golden Throne"] },
        { name: "Biggest Banhammer", id: ingredients["Biggest Banhammer"], qty: 1, "on hand": onHand["Biggest Banhammer"] },
        { name: "Staff Beauty Parlor", id: ingredients["Staff Beauty Parlor"], qty: 1, "on hand": onHand["Staff Beauty Parlor"] },
    ];
    craftList["realm of staff"].icon = "http://test.test";
    craftList["realm of staff"].available = Math.min(onHand["The Golden Throne"], onHand["Biggest Banhammer"], onHand["Staff Beauty Parlor"]);

    craftList["super mushroom"] = {};
    craftList["super mushroom"].ingredients = [
        { name: "Mario", id: ingredients["Mario"], qty: 1, "on hand": onHand["Mario"] },
        { name: "Princess Peach", id: ingredients["Princess Peach"], qty: 1, "on hand": onHand["Princess Peach"] },
        { name: "Toad", id: ingredients["Toad"], qty: 1, "on hand": onHand["Toad"] },
    ];
    craftList["super mushroom"].icon = "http://test.test";
    craftList["super mushroom"].available = Math.min(onHand["Princess Peach"], onHand["Mario"], onHand["Toad"]);

    craftList["fire flower"] = {};
    craftList["fire flower"].ingredients = [
        { name: "Luigi", id: ingredients["Luigi"], qty: 1, "on hand": onHand["Luigi"] },
        { name: "Koopa Troopa", id: ingredients["Koopa Troopa"], qty: 1, "on hand": onHand["Koopa Troopa"] },
        { name: "Yoshi", id: ingredients["Yoshi"], qty: 1, "on hand": onHand["Yoshi"] },
    ];
    craftList["fire flower"].icon = "http://test.test";
    craftList["fire flower"].available = Math.min(onHand["Luigi"], onHand["Koopa Troopa"], onHand["Yoshi"]);

    craftList["penguin suit"] = {};
    craftList["penguin suit"].ingredients = [
        { name: "Bowser", id: ingredients["Bowser"], qty: 1, "on hand": onHand["Bowser"] },
        { name: "Wario", id: ingredients["Wario"], qty: 1, "on hand": onHand["Wario"] },
        { name: "Goomba", id: ingredients["Goomba"], qty: 1, "on hand": onHand["Goomba"] },
    ];
    craftList["penguin suit"].icon = "http://test.test";
    craftList["penguin suit"].available = Math.min(onHand["Bowser"], onHand["Wario"], onHand["Goomba"]);

    craftList["goal pole"] = {};
    craftList["goal pole"].ingredients = [
        { name: "Penguin Suit", id: ingredients["Penguin Suit"], qty: 1, "on hand": onHand["Penguin Suit"] },
        { name: "Fire Flower", id: ingredients["Fire Flower"], qty: 1, "on hand": onHand["Fire Flower"] },
        { name: "Super Mushroom", id: ingredients["Super Mushroom"], qty: 1, "on hand": onHand["Super Mushroom"] },
    ];
    craftList["goal pole"].icon = "http://test.test";
    craftList["goal pole"].available = Math.min(onHand["Penguin Suit"], onHand["Fire Flower"], onHand["Super Mushroom"]);

    craftList["portal gun"] = {};
    craftList["portal gun"].ingredients = [
        { name: "Cake", id: ingredients["Cake"], qty: 1, "on hand": onHand["Cake"] },
        { name: "GLaDOS", id: ingredients["GLaDOS"], qty: 1, "on hand": onHand["GLaDOS"] },
        { name: "Companion Cube", id: ingredients["Companion Cube"], qty: 1, "on hand": onHand["Companion Cube"] },
    ];
    craftList["portal gun"].icon = "http://test.test";
    craftList["portal gun"].available = Math.min(onHand["Cake"], onHand["GLaDOS"], onHand["Companion Cube"]);

    craftList["ricks portal gun"] = {};
    craftList["ricks portal gun"].ingredients = [
        { name: "Rick Sanchez", id: ingredients["Rick Sanchez"], qty: 1, "on hand": onHand["Rick Sanchez"] },
        { name: "A Scared Morty", id: ingredients["A Scared Morty"], qty: 1, "on hand": onHand["A Scared Morty"] },
        { name: "Mr Poopy Butthole", id: ingredients["Mr Poopy Butthole"], qty: 1, "on hand": onHand["Mr Poopy Butthole"] },
    ];
    craftList["ricks portal gun"].icon = "http://test.test";
    craftList["ricks portal gun"].available = Math.min(onHand["Rick Sanchez"], onHand["A Scared Morty"], onHand["Mr Poopy Butthole"]);

    craftList["space wormhole"] = {};
    craftList["space wormhole"].ingredients = [
        { name: "Nyx class Supercarrier", id: ingredients["Nyx class Supercarrier"], qty: 1, "on hand": onHand["Nyx class Supercarrier"] },
        { name: "Covetor Mining Ship", id: ingredients["Covetor Mining Ship"], qty: 1, "on hand": onHand["Covetor Mining Ship"] },
        { name: "Chimera Schematic", id: ingredients["Chimera Schematic"], qty: 1, "on hand": onHand["Chimera Schematic"] },
    ];
    craftList["space wormhole"].icon = "http://test.test";
    craftList["space wormhole"].available = Math.min(onHand["Nyx class Supercarrier"], onHand["Covetor Mining Ship"], onHand["Chimera Schematic"]);

    craftList["interdimensional portal"] = {};
    craftList["interdimensional portal"].ingredients = [
        { name: "Portal Gun", id: ingredients["Portal Gun"], qty: 1, "on hand": onHand["Portal Gun"] },
        { name: "Ricks Portal Gun", id: ingredients["Ricks Portal Gun"], qty: 1, "on hand": onHand["Ricks Portal Gun"] },
        { name: "Space Wormhole", id: ingredients["Space Wormhole"], qty: 1, "on hand": onHand["Space Wormhole"] },
    ];
    craftList["interdimensional portal"].icon = "http://test.test";
    craftList["interdimensional portal"].available = Math.min(onHand["Space Wormhole"], onHand["Ricks Portal Gun"], onHand["Portal Gun"]);
}

function setIngredientSlot (ingredientId, slot) {
    // Check github for previous Drag and Drop functionality made with jQueryUI
    if (slot === "#slot_0") {
        slots[0] = ingredientId;
    }
    if (slot === "#slot_1") {
        slots[1] = ingredientId;
    }
    if (slot === "#slot_2") {
        slots[2] = ingredientId;
    }
    if (slot === "#slot_3") {
        slots[3] = ingredientId;
    }
    if (slot === "#slot_4") {
        slots[4] = ingredientId;
    }
    if (slot === "#slot_5") {
        slots[5] = ingredientId;
    }
    if (slot === "#slot_6") {
        slots[6] = ingredientId;
    }
    if (slot === "#slot_7") {
        slots[7] = ingredientId;
    }
    if (slot === "#slot_8") {
        slots[8] = ingredientId;
    }
};

function reset_slots() {
    slots[0] = blankSlot;
    slots[1] = blankSlot;
    slots[2] = blankSlot;
    slots[3] = blankSlot;
    slots[4] = blankSlot;
    slots[5] = blankSlot;
    slots[6] = blankSlot;
    slots[7] = blankSlot;
    slots[8] = blankSlot;
}

function take_craft(craft_name) {
    $.get(urlBase.replace("CUSTOMRECIPE", getSlots()), function( data ) {
        console.log(data);
        console.log(data.EquipID);

        if (data === "{}" || data.EquipId !== "") {
            noty({type:'success', text: craft_name + ' was crafted successfully.'});
        } else {
            noty({type:'error', text: craft_name + ' failed.'});
            alert('Crafting failed. Response from server: ', data)
        }
    });
}


/* Crafts */
function craft_glass_shards_from_tube() {
    setIngredientSlot(ingredients["test tube"], "#slot_4");
}

function craft_glass_shards_from_sand() {
    setIngredientSlot(ingredients["pile of sand"], "#slot_4");
}

function craft_glass_test_tube() {
    setIngredientSlot(ingredients["glass shards"], "#slot_1");
    setIngredientSlot(ingredients["glass shards"], "#slot_4");
}

function craft_glass_vial() {
    setIngredientSlot(ingredients["glass shards"], "#slot_1");
    setIngredientSlot(ingredients["glass shards"], "#slot_3");
    setIngredientSlot(ingredients["glass shards"], "#slot_4");
    setIngredientSlot(ingredients["glass shards"], "#slot_6");
    setIngredientSlot(ingredients["glass shards"], "#slot_7");
}

function craft_glass_bowl() {
    setIngredientSlot(ingredients["glass shards"], "#slot_0");
    setIngredientSlot(ingredients["glass shards"], "#slot_1");
    setIngredientSlot(ingredients["glass shards"], "#slot_2");
    setIngredientSlot(ingredients["glass shards"], "#slot_3");
    setIngredientSlot(ingredients["glass shards"], "#slot_5");
    setIngredientSlot(ingredients["glass shards"], "#slot_6");
    setIngredientSlot(ingredients["glass shards"], "#slot_7");
    setIngredientSlot(ingredients["glass shards"], "#slot_8");
}

function craft_glass_dust_vial() {
    setIngredientSlot(ingredients["pile of sand"], "#slot_4");
    setIngredientSlot(ingredients["quartz dust"], "#slot_7")
    // if (setIngredientSlot === true) {} else {
    //     alert('Error 23. No Quartz Dust?');
    //     enable_quick_craft_buttons();
    //     clear_crafting_area();
    // }
}

function craft_glass_dust_bowl() {
    setIngredientSlot(ingredients["pile of sand"], "#slot_4");
    setIngredientSlot(ingredients["jade dust"], "#slot_7")
    // if (setIngredientSlot === true) {} else {
    //     alert('Error 24. No Jade Dust?');
    //     enable_quick_craft_buttons();
    //     clear_crafting_area();
    // }
}

function craft_upload_potion_sampler() {
    setIngredientSlot(ingredients["test tube"], "#slot_4");
    setIngredientSlot(ingredients["black elderberries"], "#slot_5");
    setIngredientSlot(ingredients["black elder leaves"], "#slot_2");
}

function craft_small_upload_potion() {
    setIngredientSlot(ingredients["vial"], "#slot_4");
    setIngredientSlot(ingredients["black elderberries"], "#slot_5");
    setIngredientSlot(ingredients["black elder leaves"], "#slot_2");
    setIngredientSlot(ingredients["black elder leaves"], "#slot_8");
}

function craft_upload_potion() {
    setIngredientSlot(ingredients["vial"], "#slot_4");
    setIngredientSlot(ingredients["black elderberries"], "#slot_5");
    setIngredientSlot(ingredients["black elder leaves"], "#slot_8");
    setIngredientSlot(ingredients["black elder leaves"], "#slot_6");
    setIngredientSlot(ingredients["black elder leaves"], "#slot_2");
    setIngredientSlot(ingredients["black elder leaves"], "#slot_3");
    setIngredientSlot(ingredients["black elder leaves"], "#slot_0");
}

function craft_large_upload_potion() {
    setIngredientSlot(ingredients["bowl"], "#slot_4");
    setIngredientSlot(ingredients["upload potion"], "#slot_5");
    setIngredientSlot(ingredients["upload potion"], "#slot_3");
    setIngredientSlot(ingredients["yellow hellebore flower"], "#slot_1");
}

function craft_download_potion_sampler() {
    setIngredientSlot(ingredients["test tube"], "#slot_4");
    setIngredientSlot(ingredients["purple angelica flowers"], "#slot_2");
    setIngredientSlot(ingredients["garlic tincture"], "#slot_5");
}

function craft_small_download_potion() {
    setIngredientSlot(ingredients["vial"], "#slot_4");
    setIngredientSlot(ingredients["garlic tincture"], "#slot_5");
    setIngredientSlot(ingredients["purple angelica flowers"], "#slot_8");
    setIngredientSlot(ingredients["purple angelica flowers"], "#slot_2");
}

function craft_download_potion() {
    setIngredientSlot(ingredients["vial"], "#slot_4");
    setIngredientSlot(ingredients["garlic tincture"], "#slot_5");
    setIngredientSlot(ingredients["purple angelica flowers"], "#slot_8");
    setIngredientSlot(ingredients["purple angelica flowers"], "#slot_6");
    setIngredientSlot(ingredients["purple angelica flowers"], "#slot_2");
    setIngredientSlot(ingredients["purple angelica flowers"], "#slot_3");
    setIngredientSlot(ingredients["purple angelica flowers"], "#slot_0");
}

function craft_large_download_potion() {
    setIngredientSlot(ingredients["bowl"], "#slot_4");
    setIngredientSlot(ingredients["download-reduction potion"], "#slot_5");
    setIngredientSlot(ingredients["download-reduction potion"], "#slot_3");
    setIngredientSlot(ingredients["yellow hellebore flower"], "#slot_1");
}

function craft_garlic_tincture() {
    setIngredientSlot(ingredients["test tube"], "#slot_4");
    setIngredientSlot(ingredients["head of garlic"], "#slot_5");
}

function craft_impure_bronze_bar() {
    setIngredientSlot(ingredients["bronze alloy mix"], "#slot_0");
    setIngredientSlot(ingredients["clay"], "#slot_1");
}

function craft_bronze_bar() {
    setIngredientSlot(ingredients["bronze alloy mix"], "#slot_0");
    setIngredientSlot(ingredients["bronze alloy mix"], "#slot_1");
}

function craft_iron_bar() {
    setIngredientSlot(ingredients["iron ore"], "#slot_0");
    setIngredientSlot(ingredients["iron ore"], "#slot_1");
}

function craft_steel_bar() {
    setIngredientSlot(ingredients["iron ore"], "#slot_0");
    setIngredientSlot(ingredients["iron ore"], "#slot_1");
    setIngredientSlot(ingredients["lump of coal"], "#slot_4");
}

function craft_steel_bar_from_iron_bar() {
    setIngredientSlot(ingredients["iron bar"], "#slot_1");
    setIngredientSlot(ingredients["lump of coal"], "#slot_4");
}

function craft_gold_bar() {
    setIngredientSlot(ingredients["gold ore"], "#slot_0");
    setIngredientSlot(ingredients["gold ore"], "#slot_1");
}

function craft_mithril_bar() {
    setIngredientSlot(ingredients["mithril ore"], "#slot_0");
    setIngredientSlot(ingredients["mithril ore"], "#slot_1");
}

function craft_adamantium_bar() {
    setIngredientSlot(ingredients["adamantium ore"], "#slot_0");
    setIngredientSlot(ingredients["adamantium ore"], "#slot_1");
}

function craft_quartz_bar() {
    setIngredientSlot(ingredients["quartz dust"], "#slot_0");
    setIngredientSlot(ingredients["quartz dust"], "#slot_1");
}

function craft_jade_bar() {
    setIngredientSlot(ingredients["jade dust"], "#slot_0");
    setIngredientSlot(ingredients["jade dust"], "#slot_1");
}

function craft_amethyst_bar() {
    setIngredientSlot(ingredients["amethyst dust"], "#slot_0");
    setIngredientSlot(ingredients["amethyst dust"], "#slot_1");
}

function craft_small_luck_potion() {
    setIngredientSlot(ingredients["vial"], "#slot_3");
    setIngredientSlot(ingredients["black elderberries"], "#slot_4");
    setIngredientSlot(ingredients["black elderberries"], "#slot_5");
}

function craft_large_luck_potion() {
    setIngredientSlot(ingredients["bowl"], "#slot_4");
    setIngredientSlot(ingredients["black elderberries"], "#slot_0");
    setIngredientSlot(ingredients["black elderberries"], "#slot_1");
    setIngredientSlot(ingredients["black elderberries"], "#slot_2");
    setIngredientSlot(ingredients["black elderberries"], "#slot_3");
    setIngredientSlot(ingredients["black elderberries"], "#slot_5");
    setIngredientSlot(ingredients["yellow hellebore flower"], "#slot_7");
}

function craft_ruby_grained_baguette() {
    setIngredientSlot(ingredients["ruby-flecked wheat"], "#slot_4");
    setIngredientSlot(ingredients["ruby-flecked wheat"], "#slot_5");
}

function craft_emerald_grained_baguette() {
    setIngredientSlot(ingredients["emerald-flecked wheat"], "#slot_4");
    setIngredientSlot(ingredients["emerald-flecked wheat"], "#slot_5");
}

function craft_garlic_ruby_baguette() {
    setIngredientSlot(ingredients["ruby-grained baguette"], "#slot_4");
    setIngredientSlot(ingredients["head of garlic"], "#slot_3");
    setIngredientSlot(ingredients["head of garlic"], "#slot_5");
}

function craft_garlic_emerald_baguette() {
    setIngredientSlot(ingredients["emerald-grained baguette"], "#slot_4");
    setIngredientSlot(ingredients["head of garlic"], "#slot_5");
}

function craft_artisan_ruby_baguette() {
    setIngredientSlot(ingredients["garlic ruby-baguette"], "#slot_3");
    setIngredientSlot(ingredients["yellow hellebore flower"], "#slot_4");
    setIngredientSlot(ingredients["yellow hellebore flower"], "#slot_5");
}

function craft_artisan_emerald_baguette() {
    setIngredientSlot(ingredients["garlic emerald-baguette"], "#slot_3");
    setIngredientSlot(ingredients["emerald chip"], "#slot_4");
    setIngredientSlot(ingredients["yellow hellebore flower"], "#slot_5");
}

function craft_gazellian_emerald_baguette() {
    setIngredientSlot(ingredients["artisan emerald-baguette"], "#slot_3");
    setIngredientSlot(ingredients["emerald chip"], "#slot_4");
    setIngredientSlot(ingredients["emerald chip"], "#slot_5");
}

function craft_carbon_crystalline_quartz_necklace() {
    setIngredientSlot(ingredients["carbon-crystalline quartz"], "#slot_4");
    setIngredientSlot(ingredients["glass shards"], "#slot_1");
}

function craft_carbon_crystalline_quartz_gem() {
    setIngredientSlot(ingredients["quartz bar"], "#slot_4");
    setIngredientSlot(ingredients["lump of coal"], "#slot_5");
}

function craft_exquisite_constellation_emeralds() {
    setIngredientSlot(ingredients["emerald"], "#slot_3");
    setIngredientSlot(ingredients["emerald"], "#slot_5");
    setIngredientSlot(ingredients["emerald"], "#slot_6");
    setIngredientSlot(ingredients["emerald"], "#slot_8");
    setIngredientSlot(ingredients["amethyst bar"], "#slot_4");
    setIngredientSlot(ingredients["amethyst bar"], "#slot_7");
}

function craft_exquisite_constellation_rubies() {
    setIngredientSlot(ingredients["ruby"], "#slot_3");
    setIngredientSlot(ingredients["ruby"], "#slot_5");
    setIngredientSlot(ingredients["ruby"], "#slot_6");
    setIngredientSlot(ingredients["ruby"], "#slot_8");
    setIngredientSlot(ingredients["amethyst bar"], "#slot_4");
    setIngredientSlot(ingredients["amethyst bar"], "#slot_7");
}

function craft_exquisite_constellation_sapphires() {
    setIngredientSlot(ingredients["sapphire"], "#slot_3");
    setIngredientSlot(ingredients["sapphire"], "#slot_5");
    setIngredientSlot(ingredients["sapphire"], "#slot_6");
    setIngredientSlot(ingredients["sapphire"], "#slot_8");
    setIngredientSlot(ingredients["amethyst bar"], "#slot_4");
    setIngredientSlot(ingredients["amethyst bar"], "#slot_7");
}

function melt_dwarven_gem() {
    setIngredientSlot(ingredients["flux"], "#slot_7");
    setIngredientSlot(ingredients["dwarven gem"], "#slot_4");
}

// Cards
function craft_golden_throne() {
    setIngredientSlot(ingredients["A Wild Artifaxx"], "#slot_3");
    setIngredientSlot(ingredients["A Red Hot Flamed"], "#slot_4");
    setIngredientSlot(ingredients["The Golden Daedy"], "#slot_5");
}

function craft_biggest_banhammer() {
    setIngredientSlot(ingredients["Stump's Banhammer"], "#slot_3");
    setIngredientSlot(ingredients["thewhales Kiss"], "#slot_4");
    setIngredientSlot(ingredients["Neos Ratio Cheats"], "#slot_5");
}

function craft_staff_beauty_parlor() {
    setIngredientSlot(ingredients["Alpaca Out of Nowhere!"], "#slot_3");
    setIngredientSlot(ingredients["Nikos Transformation"], "#slot_4");
    setIngredientSlot(ingredients["lepik le prick"], "#slot_5");
}

function craft_random_staff_card() {
    setIngredientSlot(ingredients["LinkinsRepeater Bone Hard Card"], "#slot_3");
    setIngredientSlot(ingredients["MuffledSilence's Headphones"], "#slot_4");
    setIngredientSlot(ingredients["Ze do Caixao Coffin Joe Card"], "#slot_5");
}

function craft_realm_of_staff() {
    setIngredientSlot(ingredients["The Golden Throne"], "#slot_3");
    setIngredientSlot(ingredients["Biggest Banhammer"], "#slot_4");
    setIngredientSlot(ingredients["Staff Beauty Parlor"], "#slot_5");
}

function craft_super_mushroom() {
    setIngredientSlot(ingredients["Mario"], "#slot_3");
    setIngredientSlot(ingredients["Princess Peach"], "#slot_4");
    setIngredientSlot(ingredients["Toad"], "#slot_5");
}

function craft_fire_flower() {
    setIngredientSlot(ingredients["Luigi"], "#slot_3");
    setIngredientSlot(ingredients["Koopa Troopa"], "#slot_4");
    setIngredientSlot(ingredients["Yoshi"], "#slot_5");
}

function craft_penguin_suit() {
    setIngredientSlot(ingredients["Bowser"], "#slot_3");
    setIngredientSlot(ingredients["Goomba"], "#slot_4");
    setIngredientSlot(ingredients["Wario"], "#slot_5");
}

function craft_goal_pole() {
    setIngredientSlot(ingredients["Super Mushroom"], "#slot_3");
    setIngredientSlot(ingredients["Fire Flower"], "#slot_4");
    setIngredientSlot(ingredients["Penguin Suit"], "#slot_5");
}

function craft_portal_gun() {
    setIngredientSlot(ingredients["Cake"], "#slot_3");
    setIngredientSlot(ingredients["GLaDOS"], "#slot_4");
    setIngredientSlot(ingredients["Companion Cube"], "#slot_5");
}

function craft_ricks_portal_gun() {
    setIngredientSlot(ingredients["Rick Sanchez"], "#slot_3");
    setIngredientSlot(ingredients["A Scared Morty"], "#slot_4");
    setIngredientSlot(ingredients["Mr Poopy Butthole"], "#slot_5");
}

function craft_space_wormhole() {
    setIngredientSlot(ingredients["Nyx class Supercarrier"], "#slot_3");
    setIngredientSlot(ingredients["Covetor Mining Ship"], "#slot_4");
    setIngredientSlot(ingredients["Chimera Schematic"], "#slot_5");
}

function craft_interdimensional_portal() {
    setIngredientSlot(ingredients["Portal Gun"], "#slot_3");
    setIngredientSlot(ingredients["Space Wormhole"], "#slot_4");
    setIngredientSlot(ingredients["Ricks Portal Gun"], "#slot_5");
    }
/* End Crafts */

function do_craft(craft_name) {
    //console.log('crafting', craft_name);

    /* Glass */
    if (craft_name === "glass shards from test tube") {
        craft_glass_shards_from_tube();
    } else if (craft_name === "glass shards from sand") {
        craft_glass_shards_from_sand();
    }
    else if (craft_name === "test tube") {
        craft_glass_test_tube();
    }
    else if (craft_name === "vial") {
        craft_glass_vial();
    }
    else if (craft_name === "bowl") {
        craft_glass_bowl();
    }
    else if (craft_name === "dust ore vial") {
        craft_glass_dust_vial();
    }
    else if (craft_name === "dust ore bowl") {
        craft_glass_dust_bowl();
    }

    /* Upload potions */
    else if (craft_name === "upload potion sampler") {
        craft_upload_potion_sampler();
    }
    else if (craft_name === "small upload potion") {
        craft_small_upload_potion();
    }
    else if (craft_name === "upload potion") {
        craft_upload_potion();
    }
    else if (craft_name === "large upload potion") {
        craft_large_upload_potion();
    }

    /* Download potions */
    else if (craft_name === "download-reduction potion sampler") {
        craft_download_potion_sampler();
    }
    else if (craft_name === "small download-reduction potion") {
        craft_small_download_potion();
    }
    else if (craft_name === "download-reduction potion") {
        craft_download_potion();
    }
    else if (craft_name === "large download-reduction potion") {
        craft_large_download_potion();
    }
    else if (craft_name === "garlic tincture") {
        craft_garlic_tincture();
    }

    /* Metal bars */
    else if (craft_name === "impure bronze bar") {
        craft_impure_bronze_bar();
    }
    else if (craft_name === "bronze bar") {
        craft_bronze_bar();
    }
    else if (craft_name === "iron bar") {
        craft_iron_bar();
    }
    else if (craft_name === "steel bar from iron ore") {
        craft_steel_bar();
    }
    else if (craft_name === "steel bar from iron bar") {
        craft_steel_bar_from_iron_bar();
    }
    else if (craft_name === "gold bar") {
        craft_gold_bar();
    }
    else if (craft_name === "mithril bar") {
        craft_mithril_bar();
    }
    else if (craft_name === "adamantium bar") {
        craft_adamantium_bar();
    }
    else if (craft_name === "quartz bar") {
        craft_quartz_bar();
    }
    else if (craft_name === "jade bar") {
        craft_jade_bar();
    }
    else if (craft_name === "amethyst bar") {
        craft_amethyst_bar();
    }

    /* Luck potions */
    else if (craft_name === "small luck potion") {
        craft_small_luck_potion();
    }
    else if (craft_name === "large luck potion") {
        craft_large_luck_potion();
    }

    /* Food */
    else if (craft_name === "ruby-grained baguette") {
        craft_ruby_grained_baguette();
    }
    else if (craft_name === "emerald-grained baguette") {
        craft_emerald_grained_baguette();
    }
    else if (craft_name === "garlic ruby-baguette") {
        craft_garlic_ruby_baguette();
    }
    else if (craft_name === "garlic emerald-baguette") {
        craft_garlic_emerald_baguette();
    }
    else if (craft_name === "artisan ruby-baguette") {
        craft_artisan_ruby_baguette();
    }
    else if (craft_name === "artisan emerald-baguette") {
        craft_artisan_emerald_baguette();
    }
    else if (craft_name === "gazellian emerald-baguette") {
        craft_gazellian_emerald_baguette();
    }

    /* Jewelry */
    else if (craft_name === "carbon-crystalline quartz gem") {
        craft_carbon_crystalline_quartz_gem();
    }
    else if (craft_name === "carbon-crystalline quartz necklace") {
        craft_carbon_crystalline_quartz_necklace();
    }
    else if (craft_name === "exquisite constellation emeralds") {
        craft_exquisite_constellation_emeralds();
    }
    else if (craft_name === "exquisite constellation sapphires") {
        craft_exquisite_constellation_sapphires();
    }
    else if (craft_name === "exquisite constellation rubies") {
        craft_exquisite_constellation_rubies();
    }

    /* Misc/Recast */
    else if (craft_name === "melt dwarven gem") {
        melt_dwarven_gem();
    }

    /* Cards */
    else if (craft_name === "the golden throne") {
        craft_golden_throne();
    }
    else if (craft_name === "biggest banhammer") {
        craft_biggest_banhammer();
    }
    else if (craft_name === "staff beauty parlor") {
        craft_staff_beauty_parlor();
    }
    else if (craft_name === "random lvl2 staff card") {
        craft_random_staff_card();
    }
    else if (craft_name === "realm of staff") {
        craft_realm_of_staff();
    }
    else if (craft_name === "super mushroom") {
        craft_super_mushroom();
    }
    else if (craft_name === "fire flower") {
        craft_fire_flower();
    }
    else if (craft_name === "penguin suit") {
        craft_penguin_suit();
    }
    else if (craft_name === "goal pole") {
        craft_goal_pole();
    }
    else if (craft_name === "portal gun") {
        craft_portal_gun();
    }
    else if (craft_name === "ricks portal gun") {
        craft_ricks_portal_gun();
    }
    else if (craft_name === "space wormhole") {
        craft_space_wormhole();
    }
    else if (craft_name === "interdimensional portal") {
        craft_interdimensional_portal();
    }

    enable_quick_craft_buttons();
}

function disable_quick_craft_buttons() {
    $("#crafting-submenu button").prop("disabled",true);
    $("#crafting-submenu button").addClass("disabled");
}

function enable_quick_craft_buttons() {
    setTimeout(function() {
        $("#crafting-submenu button").prop("disabled",false);
        $("#crafting-submenu button").removeClass("disabled");

        disable_craft_button = false;

        next_button_lockout_delay = BUTTON_LOCKOUT_DELAY;
    }, next_button_lockout_delay);
}

var disable_craft_button = false;


function open_crafting_submenu(craft_name) {
    close_crafting_submenu();
    build_on_hand();
    build_craft_list();

    $("#current_craft_box").append('<div id="crafting-submenu" style="text-align:center"></div>');
    $("#crafting-submenu").append('<p>' + titleCase(craft_name) + '</p>');

    var currentCraft = craftList[craft_name];
    console.log(currentCraft);



    $("#crafting-submenu").append('<p> Ingredients: </p>');

    currentCraft.ingredients.map(ingredient => {
        $("#crafting-submenu").append('<p style="display: inline">'
                                      + titleCase(ingredient.name) + ': ' + ingredient.qty + '/' + ingredient["on hand"] + '</p>');
        $("#crafting-submenu").append('<br />');
    });

    if (currentCraft.available > 0) {
        $("#crafting-submenu").append('<select id="craft_number_select">');

        var i;
        for (i = 1; i <= currentCraft.available; i++) {
            $("#craft_number_select").append("<option value='" + i + "'>" + i + "</option>");
        }

        $("#crafting-submenu").append('</select>');

        var craftButton = $("<button>");
        craftButton.on("click", function() {
            var craftNumber = $("#craft_number_select").children("option:selected").val();

            disable_craft_button = true;

            next_button_lockout_delay = BUTTON_LOCKOUT_DELAY * Number(craftNumber);

            disable_quick_craft_buttons();
            enable_quick_craft_buttons();

            (async function loop() {
                for (let i = 0; i < craftNumber; i++) {
                    await new Promise(resolve => setTimeout(function() {
                        do_craft(craft_name);
                        take_craft(craft_name);

                        reset_slots();
                        resolve();
                    }, CRAFT_TIME));
                }
            })();
        });

        craftButton.html('Craft');
        craftButton.prop('style', 'margin-left: 5px');

        $("#crafting-submenu").append(craftButton);

        if (disable_craft_button === true) {
            disable_quick_craft_buttons();
        }
    }
}

function open_crafting_submenu_TEST(craft_name, recipe) {
    close_crafting_submenu();
    $("#current_craft_box").append('<div id="crafting-submenu" style="text-align:center"></div>');
    $("#crafting-submenu").append('<p>' + titleCase(craft_name) + '</p>');

    var currentCraft = {};
    currentCraft.available = 10000
    currentCraft.ingredients = [];
    for (var i = 0; i < recipe.length/2; i++) {
        var ingr = recipe[2*i];
        var qty = recipe[2*i+1].length;
        var onhand = $("#items-wrapper .item[data-item=" + ingredients[ingr] + "] .item_count").text();
        if (onhand === "") { onhand = $("#items-wrapper .item[data-item=" + ingredients[ingr] + "]").length; };
        var avail = Math.floor(onhand/qty);
        if (avail < currentCraft.available) {currentCraft.available = avail};
        currentCraft.ingredients[i]={ name: ingr, id: ingredients[ingr], qty: qty, "on hand": onhand }};
    currentCraft.icon = "http://test.test";

    console.log(currentCraft);

    $("#crafting-submenu").append('<p> Ingredients: </p>');

    currentCraft.ingredients.map(ingredient => {
        $("#crafting-submenu").append('<p style="display: inline">'
                                      + titleCase(ingredient.name) + ': ' + ingredient.qty + '/' + ingredient["on hand"] + '</p>');
        $("#crafting-submenu").append('<br />');
    });

    if (currentCraft.available > 0) {
        $("#crafting-submenu").append('<select id="craft_number_select">');

        for (i = 1; i <= currentCraft.available; i++) {
            $("#craft_number_select").append("<option value='" + i + "'>" + i + "</option>");
        }

        $("#crafting-submenu").append('</select>');

        var craftButton = $("<button>");
        craftButton.on("click", function() {
            var craftNumber = $("#craft_number_select").children("option:selected").val();

            disable_craft_button = true;

            next_button_lockout_delay = BUTTON_LOCKOUT_DELAY * Number(craftNumber);

            disable_quick_craft_buttons();
            enable_quick_craft_buttons();

            (async function loop() {
                for (let i = 0; i < craftNumber; i++) {
                    await new Promise(resolve => setTimeout(function() {
                        reset_slots();
                        for (var j = 0; j < recipe.length/2; j++) {
                            var ingr = recipe[2*j];
                            for (var k = 0; k < recipe[2*j+1].length; k++) {
                                slots[recipe[2*j+1][k]] = ingredients[ingr]}}
                        take_craft(craft_name);
                        resolve();
                    }, CRAFT_TIME));
                }
            })();
        });

        craftButton.html('Craft');
        craftButton.prop('style', 'margin-left: 5px');

        $("#crafting-submenu").append(craftButton);

        if (disable_craft_button === true) {
            disable_quick_craft_buttons();
        }
    }
}

function close_crafting_submenu() {
    $("#crafting-submenu").remove();
}







(function() {
    'use strict';

    $("#crafting_recipes").before(
        '<div id="quick-crafter" style="border: 1px solid #fff;margin-bottom: 17px;display: block;clear: both;position:relative;background-color:rgba(0,0,0,.7);padding:5px;"></div>');

    const button_color = ["red","green"];
    const button_display = ["none","inline"];

// Creates a "Recipe Book" on/off button; bgcolor and tcolor are the background and text colors of the associated Recipe (craft) buttons

    class Book_button {
        constructor(book_name, bgcolor, tcolor) {
            this.enabled = DEFAULT[book_name] ;
            $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: green;" id="' + book_name + '" class="quick_craft_button">'+ book_name.replace(/_/g," ") +'</button>');
            document.getElementById(book_name).style.backgroundColor=button_color[this.enabled];
            document.getElementById(book_name).bgcolor = bgcolor;
            document.getElementById(book_name).tcolor = tcolor;
            $("#"+ book_name).click(() => {
                this.enabled = 1 - this.enabled;
                console.log(document.getElementById(book_name));
                document.getElementById(book_name).style.backgroundColor=button_color[this.enabled];
                var buttons = document.getElementsByClassName("qcbutton_" + book_name);
                for (var i = 0; i < buttons.length; i++) {buttons[i].style.display = button_display[this.enabled]};
            });
        }
    }


// Creates a Recipe button; book_name is the name of the associated Recipe Book button (which impacts the colors, on/off ability and visibility DEFAULT preset)
// Later I'll add a third "ingredients" parameter and rewrite the crafting code for easier implementation of new recipes

        class Recipe_button {
        constructor(book_name, recipe_name) {
            $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;" id="' + recipe_name + '" class="qcbutton_' + book_name + '">'+ titleCase(recipe_name.replace(/_/g," ")) +'</button>');
            document.getElementById(recipe_name).style.backgroundColor = document.getElementById(book_name).bgcolor;
            document.getElementById(recipe_name).style.color = document.getElementById(book_name).tcolor;
            document.getElementById(recipe_name).style.display = button_display[DEFAULT[book_name]];
            $("#"+ recipe_name).click(() => {
                open_crafting_submenu(recipe_name.replace(/_/g," "));
            });
        }
    }



/* Creates a Recipe button.
     book_name is the name of the associated Recipe Book button (which impacts the colors, on/off ability and visibility DEFAULT preset)    Slots: 0 1 2
     recipe is, well, the recipe, the format being ["ingredient1", [slot1, slot2, ...], ... ]                                                      3 4 5
                                                                                                                                                   6 7 8
*/
        class TEST_Recipe_button {
        constructor(book_name, recipe_name, recipe) {
            this.recipe = recipe;
            $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;" id="' + recipe_name + '" class="qcbutton_' + book_name + '">'+ titleCase(recipe_name.replace(/_/g," ")) +'</button>');
            document.getElementById(recipe_name).style.backgroundColor = document.getElementById(book_name).bgcolor;
            document.getElementById(recipe_name).style.color = document.getElementById(book_name).tcolor;
            document.getElementById(recipe_name).style.display = button_display[DEFAULT[book_name]];
            $("#"+ recipe_name).click(() => {
                open_crafting_submenu_TEST(recipe_name.replace(/_/g," "),this.recipe);
            });
        }
    }

    $("#quick-crafter").append('<div id="current_craft_box"></div>');
    $("#quick-crafter").append('<p>Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better experience.');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: red;" id="clear_button" class="quick_craft_button">Clear</button>');
    $("#quick-crafter").append('<br /> <br />');

    $("#quick-crafter").append('<span>Show or hide crafting categories:</span>');
    $("#quick-crafter").append('<br />');
    new Book_button("TEST", "red", "black");
    new Book_button("Glass", "white", "black");
    new Book_button("Basic_Stats", "green", "white");
    new Book_button("Material_Bars", "purple", "white");
    new Book_button("Luck", "blue", "white");
    new Book_button("Food", "wheat", "black");
    new Book_button("Jewelry", "deeppink", "white");
    new Book_button("Recast", "gray", "white");
    new Book_button("Staff_Cards", "#15273F", "white");
    new Book_button("Portal_Cards", "#3A3F51", "0cf");
    new Book_button("Mario_Cards", "honeydew", "red");


    $("#quick-crafter").append('<br /> <br /> <br />');
    new TEST_Recipe_button("TEST", "TEST_small_upload_potion", ["vial", [4], "black elder leaves", [2,8], "black elderberries", [5]]);
    new Recipe_button("Glass", "glass_shards_from_test_tube");
    new Recipe_button("Glass", "glass_shards_from_sand");
    new Recipe_button("Glass", "test_tube");
    new Recipe_button("Glass", "vial");
    new Recipe_button("Glass", "bowl");
    new Recipe_button("Glass", "dust_ore_vial");
    new Recipe_button("Glass", "dust_ore_bowl");

    new Recipe_button("Basic_Stats", "upload_potion_sampler");
    new Recipe_button("Basic_Stats", "small_upload_potion");
    new Recipe_button("Basic_Stats", "upload_potion");
    new Recipe_button("Basic_Stats", "large_upload_potion");
    new Recipe_button("Basic_Stats", "download-reduction_potion_sampler");
    new Recipe_button("Basic_Stats", "small_download-reduction_potion");
    new Recipe_button("Basic_Stats", "download-reduction_potion");
    new Recipe_button("Basic_Stats", "large_download-reduction_potion");
    new Recipe_button("Basic_Stats", "garlic_tincture");

    new Recipe_button("Material_Bars", "impure_bronze_bar");
    new Recipe_button("Material_Bars", "bronze_bar");
    new Recipe_button("Material_Bars", "iron_bar");
    new Recipe_button("Material_Bars", "steel_bar");
    new Recipe_button("Material_Bars", "steel_bar_from_iron_bar");
    new Recipe_button("Material_Bars", "gold_bar");
    new Recipe_button("Material_Bars", "mithril_bar");
    new Recipe_button("Material_Bars", "adamantium_bar");
    new Recipe_button("Material_Bars", "quartz_bar");
    new Recipe_button("Material_Bars", "jade_bar");
    new Recipe_button("Material_Bars", "amethyst_bar");

    new Recipe_button("Luck", "small_luck_potion");
    new Recipe_button("Luck", "large_luck_potion");

    new Recipe_button("Food", "ruby-grained_baguette");
    new Recipe_button("Food", "garlic_ruby-baguette");
    new Recipe_button("Food", "artisan_ruby-baguette");
    new Recipe_button("Food", "emerald-grained_baguette");
    new Recipe_button("Food", "garlic_emerald-baguette");
    new Recipe_button("Food", "artisan_emerald-baguette");
    new Recipe_button("Food", "gazellian_emerald-baguette");

    new Recipe_button("Jewelry", "carbon-crystalline_quartz_gem");
    new Recipe_button("Jewelry", "carbon-crystalline_quartz_necklace");
    new Recipe_button("Jewelry", "exquisite_constellation_of_emeralds");
    new Recipe_button("Jewelry", "exquisite_constellation_of_sapphires");
    new Recipe_button("Jewelry", "exquisite_constellation_of_rubies");

    new Recipe_button("Recast", "melt_dwarven_gem");

    new Recipe_button("Staff_Cards", "the_golden_throne");
    new Recipe_button("Staff_Cards", "biggest_banhammer");
    new Recipe_button("Staff_Cards", "staff_beauty_parlor");
    new Recipe_button("Staff_Cards", "random_lvl2_staff_card");
    new Recipe_button("Staff_Cards", "realm_of_staff");

    new Recipe_button("Portal_Cards", "portal_gun");
    new Recipe_button("Portal_Cards", "ricks_portal_gun");
    new Recipe_button("Portal_Cards", "space_wormhole");
    new Recipe_button("Portal_Cards", "interdimensional_portal");

    new Recipe_button("Mario_Cards", "super_mushroom");
    new Recipe_button("Mario_Cards", "fire_flower");
    new Recipe_button("Mario_Cards", "penguin_suit");
    new Recipe_button("Mario_Cards", "goal_pole");

    $("#quick-crafter").append('<br /><br /><br />');
    $("#quick-crafter").append('<p style="float:right;margin-top:-20px;margin-right:5px;">Quick Crafter by <a href="/user.php?id=58819">KingKrab23</a> v<a href="https://github.com/KingKrab23/Quick_Craft/raw/master/GGn%20Quick%20Crafting.user.js">' + VERSION +'</a></p>');


    build_on_hand();
    build_craft_list();

    $("#clear_button").click(function() {
        close_crafting_submenu();
    });

})();
