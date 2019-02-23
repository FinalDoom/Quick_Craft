// ==UserScript==
// @name         GGn Quick Crafter
// @namespace    http://tampermonkey.net/
// @version      1.7.1b
// @description  Craft multiple items easier
// @author       KingKrab23
// @match        https://gazellegames.net/user.php?action=crafting
// @grant        none
// @require      https://code.jquery.com/jquery-1.7.2.min.js
// @require      https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js
// ==/UserScript==

const VERSION = '1.7.1b';

/* >>>BEGIN<<< User adjustable variables
 * ONLY ADJUST THESE IF YOU KNOW WHAT YOU'RE DOING
 * Too little of a delay will cause more visual bugs */

const RETRIEVE_ITEMS = true; // set to true to automatically retrieve craft recipes
const BUTTON_LOCKOUT_DELAY = 10000;
const ITEM_WINDOW_DELAY = 1000;
const GRAB_DELAY = 2000;

/* >>>END<<< user adjustable variables */

/* Used to specify the clear button lockout time only at this time */
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
ingredients["iron ore"] = "02236";
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
ingredients["amethyst bar"] = "00244";

var onHand = {};
function build_on_hand() {
    onHand["glass shards"] = $("#items-wrapper .item[data-item=" + ingredients["glass shards"] + "]").length;
    onHand["test tube"] = $("#items-wrapper .item[data-item=" + ingredients["test tube"] + "]").length;
    onHand["vial"] = $("#items-wrapper .item[data-item=" + ingredients["vial"] + "]").length;
    onHand["bowl"] = $("#items-wrapper .item[data-item=" + ingredients["bowl"] + "]").length;
    onHand["pile of sand"] = $("#items-wrapper .item[data-item=" + ingredients["pile of sand"] + "]").length;
    onHand["black elder leaves"] = $("#items-wrapper .item[data-item=" + ingredients["black elder leaves"] + "]").length;
    onHand["black elderberries"] = $("#items-wrapper .item[data-item=" + ingredients["black elderberries"] + "]").length;
    onHand["yellow hellebore flower"] = $("#items-wrapper .item[data-item=" + ingredients["yellow hellebore flower"] + "]").length;
    onHand["upload potion"] = $("#items-wrapper .item[data-item=" + ingredients["upload potion"] + "]").length;
    onHand["purple angelica flowers"] = $("#items-wrapper .item[data-item=" + ingredients["purple angelica flowers"] + "]").length;
    onHand["garlic tincture"] = $("#items-wrapper .item[data-item=" + ingredients["garlic tincture"] + "]").length;
    onHand["download-reduction potion"] = $("#items-wrapper .item[data-item=" + ingredients["download-reduction potion"] + "]").length;
    onHand["head of garlic"] = $("#items-wrapper .item[data-item=" + ingredients["head of garlic"] + "]").length;
    onHand["bronze alloy mix"] = $("#items-wrapper .item[data-item=" + ingredients["bronze allow mix"] + "]").length;
    onHand["clay"] = $("#items-wrapper .item[data-item=" + ingredients["clay"] + "]").length;
    onHand["iron ore"] = $("#items-wrapper .item[data-item=" + ingredients["iron ore"] + "]").length;
    onHand["lump of coal"] = $("#items-wrapper .item[data-item=" + ingredients["lump of coal"] + "]").length;
    onHand["iron bar"] = $("#items-wrapper .item[data-item=" + ingredients["iron bar"] + "]").length;
    onHand["gold ore"] = $("#items-wrapper .item[data-item=" + ingredients["gold ore"] + "]").length;
    onHand["adamantium ore"] = $("#items-wrapper .item[data-item=" + ingredients["adamantium ore"] + "]").length;
    onHand["mithril ore"] = $("#items-wrapper .item[data-item=" + ingredients["mithril ore"] + "]").length;
    onHand["quartz dust"] = $("#items-wrapper .item[data-item=" + ingredients["quartz dust"] + "]").length;
    onHand["jade dust"] = $("#items-wrapper .item[data-item=" + ingredients["jade dust"] + "]").length;
    onHand["amethyst dust"] = $("#items-wrapper .item[data-item=" + ingredients["amethyst dust"] + "]").length;
    onHand["ruby-flecked wheat"] = $("#items-wrapper .item[data-item=" + ingredients["ruby-flecked wheat"] + "]").length;
    onHand["emerald-flecked wheat"] = $("#items-wrapper .item[data-item=" + ingredients["emerald-flecked wheat"] + "]").length;
    onHand["ruby-grained baguette"] = $("#items-wrapper .item[data-item=" + ingredients["ruby-grained baguette"] + "]").length;
    onHand["emerald-grained baguette"] = $("#items-wrapper .item[data-item=" + ingredients["emerald-grained baguette"] + "]").length;
    onHand["garlic ruby-baguette"] = $("#items-wrapper .item[data-item=" + ingredients["garlic ruby-baguette"] + "]").length;
    onHand["garlic emerald-baguette"] = $("#items-wrapper .item[data-item=" + ingredients["garlic emerald-baguette"] + "]").length;
    onHand["artisan emerald-baguette"] = $("#items-wrapper .item[data-item=" + ingredients["garlic emerald-baguette"] + "]").length;
    onHand["emerald chip"] = $("#items-wrapper .item[data-item=" + ingredients["emerald chip"] + "]").length;
    onHand["quartz bar"] = $("#items-wrapper .item[data-item=" + ingredients["quartz bar"] + "]").length;
    onHand["carbon-crystalline quartz"] = $("#items-wrapper .item[data-item=" + ingredients["carbon-crystalline quartz"] + "]").length;
    onHand["ruby"] = $("#items-wrapper .item[data-item=" + ingredients["ruby"] + "]").length;
    onHand["sapphire"] = $("#items-wrapper .item[data-item=" + ingredients["sapphire"] + "]").length;
    onHand["emerald"] = $("#items-wrapper .item[data-item=" + ingredients["emerald"] + "]").length;
    onHand["amethyst bar"] = $("#items-wrapper .item[data-item=" + ingredients["amethyst bar"] + "]").length;
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

    craftList["dust ore glassware (vial)"] = {};
    craftList["dust ore glassware (vial)"].ingredients = [
        { name: "pile of sand", id: ingredients["pile of sand"], qty: 1, "on hand": onHand["pile of sand"] },
        { name: "quartz dust", id: ingredients["quartz dust"], qty: 1, "on hand": onHand["quartz dust"] }
    ];
    craftList["dust ore glassware (vial)"].icon = "http://test.test";
    craftList["dust ore glassware (vial)"].available = Math.min(onHand["pile of sand"]
                                                                , onHand["quartz dust"]);

    craftList["dust ore glassware (bowl)"] = {};
    craftList["dust ore glassware (bowl)"].ingredients = [
        { name: "pile of sand", id: ingredients["pile of sand"], qty: 1, "on hand": onHand["pile of sand"] },
        { name: "jade dust", id: ingredients["jade dust"], qty: 1, "on hand": onHand["jade dust"] }
    ];
    craftList["dust ore glassware (bowl)"].icon = "http://test.test";
    craftList["dust ore glassware (bowl)"].available = Math.min(onHand["pile of sand"]
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
                                                                      , onHand["garlic tincture"]);

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
    craftList["gold bar"].ingredients = [ { name: "gold bar", id: ingredients["gold ore"], qty: 2, "on hand": onHand["gold ore"] } ];
    craftList["gold bar"].icon = "http://test.test";
    craftList["gold bar"].available = Math.floor(onHand["gold ore"] / 2);

    craftList["mithril bar"] = {};
    craftList["mithril bar"].ingredients = [ { name: "mithril bar", id: ingredients["mithril ore"], qty: 2, "on hand": onHand["mithril ore"] } ];
    craftList["mithril bar"].icon = "http://test.test";
    craftList["mithril bar"].available = Math.floor(onHand["mithril ore"] / 2);

    craftList["adamantium bar"] = {};
    craftList["adamantium bar"].ingredients = [ { name: "adamantium bar", id: ingredients["adamantium ore"], qty: 2, "on hand": onHand["adamantium ore"] } ];
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
        { name: "carbon-crystalline quartz gem", id: ingredients["carbon-crystalline quartz gem"], qty: 1, "on hand": onHand["carbon-crystalline quartz"] },
        { name: "glass shards", id: ingredients["glass shards"], qty: 1, "on hand": onHand["glass shards"] },
    ];
    craftList["carbon-crystalline quartz necklace"].icon = "http://test.test";
    craftList["carbon-crystalline quartz necklace"].available = Math.min(onHand["carbon-crystalline quartz"]
                                                                         , onHand["glass shards"]);

    craftList["exquisite constellations of rubies"] = {};
    craftList["exquisite constellations of rubies"].ingredients = [
        { name: "amethyst bar", id: ingredients["amethyst bar"], qty: 2, "on hand": onHand["amethyst bar"] },
        { name: "ruby", id: ingredients["ruby"], qty: 4, "on hand": onHand["ruby"] },
    ];
    craftList["exquisite constellations of rubies"].icon = "http://test.test";
    craftList["exquisite constellations of rubies"].available = Math.min(Math.floor(onHand["amethyst bar"] / 2)
                                                                         , Math.floor(onHand["ruby"] / 4));

    craftList["exquisite constellations of sapphires"] = {};
    craftList["exquisite constellations of sapphires"].ingredients = [
        { name: "amethyst bar", id: ingredients["amethyst bar"], qty: 2, "on hand": onHand["amethyst bar"] },
        { name: "sapphire", id: ingredients["sapphire"], qty: 4, "on hand": onHand["sapphire"] },
    ];
    craftList["exquisite constellations of sapphires"].icon = "http://test.test";
    craftList["exquisite constellations of sapphires"].available = Math.min(Math.floor(onHand["amethyst bar"] / 2)
                                                                            , Math.floor(onHand["sapphire"] / 4));

    craftList["exquisite constellations of emeralds"] = {};
    craftList["exquisite constellations of emeralds"].ingredients = [
        { name: "amethyst bar", id: ingredients["amethyst bar"], qty: 2, "on hand": onHand["amethyst bar"] },
        { name: "emerald", id: ingredients["emerald"], qty: 4, "on hand": onHand["emerald"] },
    ];
    craftList["exquisite constellations of emeralds"].icon = "http://test.test";
    craftList["exquisite constellations of emeralds"].available = Math.min(Math.floor(onHand["amethyst bar"] / 2)
                                                                           , Math.floor(onHand["emerald"] / 4));
}

var dropConfig = {
    drop: function(event, ui) {
        // this is needed
    }
}

var dragConfig = {
    containment: "document",
    helper: "clone",
    appendTo: "#crafting_panel",
    drag: function(event, ui) {
        // this is needed
    }
}

var slots = $( ".itemslot");
var items = $( "li.item.ui-draggable.ui-draggable-handle" );

function set_item_properties() {
    var items = $( "li.item.ui-draggable.ui-draggable-handle" );

    items.each(function( index ) {
        var itemOffset = $(this).draggable(dragConfig);
    });
}

function set_slot_properties() {
    $( '#items-wrapper' ).droppable(dropConfig);
    $( '#slots_panel' ).draggable(dragConfig);

    slots.each(function( index ) {
        if ($(this).data("slot") !== undefined) {
            var slotOffset = $(this).droppable(dropConfig);
        }
    });
}

var triggerDragAndDrop = function (selectorDrag, selectorDrop) {
    console.log('trying drag and drop', selectorDrag, selectorDrop);
    // function for triggering mouse events
    var fireMouseEvent = function (type, elem, centerX, centerY) {
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent(type, true, true, window, 1, 1, 1, centerX, centerY, false, false, false, false, 0, elem);
        elem.dispatchEvent(evt);
    };

    // fetch target elements
    var elemDrag;
    var elemDrop = document.querySelector(selectorDrop);

    if (selectorDrag.includes("data-item") === true) {
        elemDrag = document.querySelectorAll(selectorDrag);

        var tmpElemDrag;

        elemDrag.forEach(function(item) {
            tmpElemDrag = item;

            return false;
        });

        elemDrag = tmpElemDrag;
    } else {
        elemDrag = document.querySelector(selectorDrag);
    }

    if (selectorDrag === '#CraftingResult li' && elemDrag === null) {
        alert('Craft unable to be made. Do you have the materials and appropriate forge/enchantment/cooking fire?');
        return false;
    }

    if (!elemDrag || !elemDrop) return false;

    // calculate positions
    var pos = elemDrag.getBoundingClientRect();
    var center1X = Math.floor((pos.left + pos.right) / 2);
    var center1Y = Math.floor((pos.top + pos.bottom) / 2);
    pos = elemDrop.getBoundingClientRect();
    var center2X = Math.floor((pos.left + pos.right) / 2);
    var center2Y = Math.floor((pos.top + pos.bottom) / 2);

    // mouse over dragged element and mousedown
    fireMouseEvent('mousemove', elemDrag, center1X, center1Y);
    fireMouseEvent('mouseenter', elemDrag, center1X, center1Y);
    fireMouseEvent('mouseover', elemDrag, center1X, center1Y);
    fireMouseEvent('mousedown', elemDrag, center1X, center1Y);

    // start dragging process over to drop target
    fireMouseEvent('dragstart', elemDrag, center1X, center1Y);
    fireMouseEvent('drag', elemDrag, center1X, center1Y);
    fireMouseEvent('mousemove', elemDrag, center1X, center1Y);
    fireMouseEvent('drag', elemDrag, center2X, center2Y);
    fireMouseEvent('mousemove', elemDrop, center2X, center2Y);

    // trigger dragging process on top of drop target
    fireMouseEvent('mouseenter', elemDrop, center2X, center2Y);
    fireMouseEvent('dragenter', elemDrop, center2X, center2Y);
    fireMouseEvent('mouseover', elemDrop, center2X, center2Y);
    fireMouseEvent('dragover', elemDrop, center2X, center2Y);

    // release dragged element on top of drop target
    fireMouseEvent('drop', elemDrop, center2X, center2Y);
    fireMouseEvent('dragend', elemDrag, center2X, center2Y);
    fireMouseEvent('mouseup', elemDrag, center2X, center2Y);

    return true;
};

function grab_result() {
    if (RETRIEVE_ITEMS === true) {
        triggerDragAndDrop("#CraftingResult li", "#items-wrapper");

        clear_crafting_area(true);
        build_craft_list();
    } else {
        alert('Test mode is on. Turn RETRIEVE_ITEMS to true in the script to turn on automated craft retrieval. You may grab the craft result but there are visual (only) errors with doing so, and you have to refresh each craft.');
    }
}

function clear_crafting_area(afterSuccessfulCraft) {
    //$("#crafting-submenu").remove();

    var i = 0;
    for (i = 0; i < 3; i++) {
        if (afterSuccessfulCraft !== true) {
            triggerDragAndDrop("#slot_0 li", "#items-wrapper");
            triggerDragAndDrop("#slot_1 li", "#items-wrapper");
            triggerDragAndDrop("#slot_2 li", "#items-wrapper");
            triggerDragAndDrop("#slot_3 li", "#items-wrapper");
            triggerDragAndDrop("#slot_4 li", "#items-wrapper");
            triggerDragAndDrop("#slot_5 li", "#items-wrapper");
            triggerDragAndDrop("#slot_6 li", "#items-wrapper");
            triggerDragAndDrop("#slot_7 li", "#items-wrapper");
            triggerDragAndDrop("#slot_8 li", "#items-wrapper");
        } else {
            $("#slot_0 li").remove();
            $("#slot_1 li").remove();
            $("#slot_2 li").remove();
            $("#slot_3 li").remove();
            $("#slot_4 li").remove();
            $("#slot_5 li").remove();
            $("#slot_6 li").remove();
            $("#slot_7 li").remove();
            $("#slot_8 li").remove();
        }
    }

    $("#CraftingResult li").remove();

    set_item_properties();
    set_slot_properties();
}


/* Crafts */
function craft_glass_shards_from_tube() {
    triggerDragAndDrop(getElement(ingredients["test tube"]), "#slot_4");
}

function craft_glass_shards_from_sand() {
    triggerDragAndDrop(getElement(ingredients["pile of sand"]), "#slot_4");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_glass_test_tube() {
    triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_1");
    triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_4");
    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_glass_vial() {
    triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_1");
    setTimeout(function() {
        triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_3");
        setTimeout(function() {
            triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_4");
            setTimeout(function() {
                triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_6");
                setTimeout(function() {
                    triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_7");
                    //setTimeout(grab_result, GRAB_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_glass_bowl() {
    triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_0");

    setTimeout(function() {
        triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_1");
        setTimeout(function() {
            triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_2");
            setTimeout(function() {
                triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_3");
                setTimeout(function() {
                    triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_5");
                    setTimeout(function() {
                        triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_6");
                        setTimeout(function() {
                            triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_7");
                            setTimeout(function() {
                                triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_8");
                                //setTimeout(grab_result, GRAB_DELAY + 200); // this needs more time
                            }, ITEM_WINDOW_DELAY);
                        }, ITEM_WINDOW_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_glass_dust_vial() {
    triggerDragAndDrop(getElement(ingredients["pile of sand"]), "#slot_4");

    setTimeout(function() {
        triggerDragAndDrop(getElement(ingredients["quartz dust"]), "#slot_7")
        if (triggerDragAndDrop === true) {
            //setTimeout(grab_result, GRAB_DELAY);
        } else {
            alert('Error 23. No Quartz Dust?');
            enable_quick_craft_buttons();
            clear_crafting_area();
        }

    }, ITEM_WINDOW_DELAY);
}

function craft_glass_dust_bowl() {
    triggerDragAndDrop(getElement(ingredients["pile of sand"]), "#slot_4");

    setTimeout(function() {
        triggerDragAndDrop(getElement(ingredients["jade dust"]), "#slot_7")
        if (triggerDragAndDrop === true) {
            //setTimeout(grab_result, GRAB_DELAY);
        } else {
            alert('Error 24. No Jade Dust?');
            enable_quick_craft_buttons();
            clear_crafting_area();
        }

    }, ITEM_WINDOW_DELAY);
}

function craft_upload_potion_sampler() {
    triggerDragAndDrop(getElement(ingredients["test tube"]), "#slot_4");
    triggerDragAndDrop(getElement(ingredients["black elderberries"]), "#slot_5");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["black elder leaves"]), "#slot_2");
        //setTimeout(grab_result, GRAB_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_small_upload_potion() {
    triggerDragAndDrop(getElement(ingredients["vial"]), "#slot_4");
    triggerDragAndDrop(getElement(ingredients["black elderberries"]), "#slot_5");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["black elder leaves"]), "#slot_2");
        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["black elder leaves"]), "#slot_8");
            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_upload_potion() {
    triggerDragAndDrop(getElement(ingredients["vial"]), "#slot_4");
    triggerDragAndDrop(getElement(ingredients["black elderberries"]), "#slot_5");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["black elder leaves"]), "#slot_8");

        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["black elder leaves"]), "#slot_6");
            setTimeout(function (){
                triggerDragAndDrop(getElement(ingredients["black elder leaves"]), "#slot_2");
                setTimeout(function (){
                    triggerDragAndDrop(getElement(ingredients["black elder leaves"]), "#slot_3");
                    setTimeout(function (){
                        triggerDragAndDrop(getElement(ingredients["black elder leaves"]), "#slot_0");
                        //setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_large_upload_potion() {
    triggerDragAndDrop(getElement(ingredients["bowl"]), "#slot_4");
    triggerDragAndDrop(getElement(ingredients["upload potion"]), "#slot_5");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["upload potion"]), "#slot_3");
        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["yellow hellebore flower"]), "#slot_1");
            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_download_potion_sampler() {
    triggerDragAndDrop(getElement(ingredients["test tube"]), "#slot_4");
    triggerDragAndDrop(getElement(ingredients["purple angelica flowers"]), "#slot_2");

    setTimeout(function (){
        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["garlic tincture"]), "#slot_5");
            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_small_download_potion() {
    triggerDragAndDrop(getElement(ingredients["vial"]), "#slot_4");
    triggerDragAndDrop(getElement(ingredients["garlic tincture"]), "#slot_5");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["purple angelica flowers"]), "#slot_8");
        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["purple angelica flowers"]), "#slot_2");
            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_download_potion() {
    triggerDragAndDrop(getElement(ingredients["vial"]), "#slot_4");
    triggerDragAndDrop(getElement(ingredients["garlic tincture"]), "#slot_5");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["purple angelica flowers"]), "#slot_8");

        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["purple angelica flowers"]), "#slot_6");
            setTimeout(function (){
                triggerDragAndDrop(getElement(ingredients["purple angelica flowers"]), "#slot_2");
                setTimeout(function (){
                    triggerDragAndDrop(getElement(ingredients["purple angelica flowers"]), "#slot_3");
                    setTimeout(function (){
                        triggerDragAndDrop(getElement(ingredients["purple angelica flowers"]), "#slot_0");
                        //setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_large_download_potion() {
    triggerDragAndDrop(getElement(ingredients["bowl"]), "#slot_4");
    triggerDragAndDrop(getElement(ingredients["download-reduction potion"]), "#slot_5");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["download-reduction potion"]), "#slot_3");
        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["yellow hellebore flower"]), "#slot_1");
            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_garlic_tincture() {
    triggerDragAndDrop(getElement(ingredients["test tube"]), "#slot_4");
    triggerDragAndDrop(getElement(ingredients["head of garlic"]), "#slot_5");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_impure_bronze_bar() {
    triggerDragAndDrop(getElement(ingredients["bronze alloy mix"]), "#slot_0");
    triggerDragAndDrop(getElement(ingredients["clay"]), "#slot_1");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_bronze_bar() {
    triggerDragAndDrop(getElement(ingredients["bronze alloy mix"]), "#slot_0");
    triggerDragAndDrop(getElement(ingredients["bronze alloy mix"]), "#slot_1");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_iron_bar() {
    triggerDragAndDrop(getElement(ingredients["iron ore"]), "#slot_0");
    triggerDragAndDrop(getElement(ingredients["iron ore"]), "#slot_1");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_steel_bar() {
    triggerDragAndDrop(getElement(ingredients["iron ore"]), "#slot_0");

    setTimeout(function() {
        triggerDragAndDrop(getElement(ingredients["iron ore"]), "#slot_1");

        setTimeout(function() {
            triggerDragAndDrop(getElement(ingredients["lump of coal"]), "#slot_4");

            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_steel_bar_from_iron_bar() {
    triggerDragAndDrop(getElement(ingredients["iron bar"]), "#slot_1");
    triggerDragAndDrop(getElement(ingredients["lump of coal"]), "#slot_4");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_gold_bar() {
    triggerDragAndDrop(getElement(ingredients["gold ore"]), "#slot_0");
    triggerDragAndDrop(getElement(ingredients["gold ore"]), "#slot_1");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_mithril_bar() {
    triggerDragAndDrop(getElement(ingredients["mithril ore"]), "#slot_0");
    triggerDragAndDrop(getElement(ingredients["mithril ore"]), "#slot_1");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_adamantium_bar() {
    triggerDragAndDrop(getElement(ingredients["adamantium ore"]), "#slot_0");
    triggerDragAndDrop(getElement(ingredients["adamantium ore"]), "#slot_1");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_quartz_bar() {
    triggerDragAndDrop(getElement(ingredients["quartz dust"]), "#slot_0");
    triggerDragAndDrop(getElement(ingredients["quartz dust"]), "#slot_1");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_jade_bar() {
    triggerDragAndDrop(getElement(ingredients["jade dust"]), "#slot_0");
    triggerDragAndDrop(getElement(ingredients["jade dust"]), "#slot_1");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_amethyst_bar() {
    triggerDragAndDrop(getElement(ingredients["amethyst dust"]), "#slot_0");
    triggerDragAndDrop(getElement(ingredients["amethyst dust"]), "#slot_1");

    //setTimeout(grab_result, GRAB_DELAY);
}

function craft_small_luck_potion() {
    triggerDragAndDrop(getElement(ingredients["vial"]), "#slot_3");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["black elderberries"]), "#slot_4");
        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["black elderberries"]), "#slot_5");

            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_large_luck_potion() {
    triggerDragAndDrop(getElement(ingredients["bowl"]), "#slot_4");
    triggerDragAndDrop(getElement(ingredients["black elderberries"]), "#slot_0");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["black elderberries"]), "#slot_1");

        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["black elderberries"]), "#slot_2");
            setTimeout(function (){
                triggerDragAndDrop(getElement(ingredients["black elderberries"]), "#slot_3");
                setTimeout(function (){
                    triggerDragAndDrop(getElement(ingredients["black elderberries"]), "#slot_5");
                    setTimeout(function (){
                        triggerDragAndDrop(getElement(ingredients["yellow hellebore flower"]), "#slot_7");

                        //setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_ruby_grained_baguette() {
    triggerDragAndDrop(getElement(ingredients["ruby-flecked wheat"]), "#slot_4");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["ruby-flecked wheat"]), "#slot_5");

        //setTimeout(grab_result, GRAB_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_emerald_grained_baguette() {
    triggerDragAndDrop(getElement(ingredients["emerald-flecked wheat"]), "#slot_4");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["emerald-flecked wheat"]), "#slot_5");

        //setTimeout(grab_result, GRAB_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_garlic_ruby_baguette() {
    triggerDragAndDrop(getElement(ingredients["ruby-grained baguette"]), "#slot_4");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["head of garlic"]), "#slot_3");

        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["head of garlic"]), "#slot_5");

            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_garlic_emerald_baguette() {
    triggerDragAndDrop(getElement(ingredients["emerald-grained baguette"]), "#slot_4");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["head of garlic"]), "#slot_5");

        //setTimeout(grab_result, GRAB_DELAY);

    }, ITEM_WINDOW_DELAY);
}

function craft_artisan_ruby_baguette() {
    triggerDragAndDrop(getElement(ingredients["garlic ruby-baguette"]), "#slot_3");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["yellow hellebore flower"]), "#slot_4");

        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["yellow hellebore flower"]), "#slot_5");

            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_artisan_emerald_baguette() {
    triggerDragAndDrop(getElement(ingredients["garlic emerald-baguette"]), "#slot_3");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["emerald chip"]), "#slot_4");

        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["yellow hellebore flower"]), "#slot_5");

            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_gazellian_emerald_baguette() {
    triggerDragAndDrop(getElement(ingredients["artisan emerald-baguette"]), "#slot_3");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["emerald chip"]), "#slot_4");

        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["emerald chip"]), "#slot_5");

            //setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_carbon_crystalline_quartz_gem() {
    triggerDragAndDrop(getElement(ingredients["carbon-crystalline quartz"]), "#slot_4");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["glass shards"]), "#slot_1");

        //setTimeout(grab_result, GRAB_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_carbon_crystalline_quartz_necklace() {
    triggerDragAndDrop(getElement(ingredients["quartz bar"]), "#slot_4");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["lump of coal"]), "#slot_5");

        //setTimeout(grab_result, GRAB_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_exquisite_constellation_emeralds() {
    triggerDragAndDrop(getElement(ingredients["emerald"]), "#slot_3");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["emerald"]), "#slot_5");
        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["emerald"]), "#slot_6");
            setTimeout(function (){
                triggerDragAndDrop(getElement(ingredients["emerald"]), "#slot_8");
                setTimeout(function (){
                    triggerDragAndDrop(getElement(ingredients["amethyst bar"]), "#slot_4");
                    setTimeout(function (){
                        triggerDragAndDrop(getElement(ingredients["amethyst bar"]), "#slot_7");

                        //setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_exquisite_constellation_rubies() {
    triggerDragAndDrop(getElement(ingredients["ruby"]), "#slot_3");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["ruby"]), "#slot_5");
        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["ruby"]), "#slot_6");
            setTimeout(function (){
                triggerDragAndDrop(getElement(ingredients["ruby"]), "#slot_8");
                setTimeout(function (){
                    triggerDragAndDrop(getElement(ingredients["amethyst bar"]), "#slot_4");
                    setTimeout(function (){
                        triggerDragAndDrop(getElement(ingredients["amethyst bar"]), "#slot_7");

                        //setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_exquisite_constellation_sapphires() {
    triggerDragAndDrop(getElement(ingredients["sapphire"]), "#slot_3");

    setTimeout(function (){
        triggerDragAndDrop(getElement(ingredients["sapphire"]), "#slot_5");
        setTimeout(function (){
            triggerDragAndDrop(getElement(ingredients["sapphire"]), "#slot_6");
            setTimeout(function (){
                triggerDragAndDrop(getElement(ingredients["sapphire"]), "#slot_8");
                setTimeout(function (){
                    triggerDragAndDrop(getElement(ingredients["amethyst bar"]), "#slot_4");
                    setTimeout(function (){
                        triggerDragAndDrop(getElement(ingredients["amethyst bar"]), "#slot_7");

                        //setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}
/* End Crafts */

function do_craft(craft_name) {
    console.log('crafting', craft_name);

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
    else if (craft_name === "dust ore glassware (vial)") {
        craft_glass_dust_vial();
    }
    else if (craft_name === "dust ore glassware (bowl)") {
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
    else if (craft_name === "download-reduction potion_sampler") {
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

    enable_quick_craft_buttons();
}

function disable_quick_craft_buttons() {
    $(".quick_craft_button").prop("disabled",true);
    $(".quick_craft_button").addClass("disabled");
}

function enable_quick_craft_buttons() {
    setTimeout(function() {
        $(".quick_craft_button").prop("disabled",false);
        $(".quick_craft_button").removeClass("disabled");

        next_button_lockout_delay = BUTTON_LOCKOUT_DELAY;
    }, next_button_lockout_delay);
}

function open_crafting_submenu(craft_name) {
    //clear_crafting_area();
    close_crafting_submenu();
    build_on_hand();
    build_craft_list();

// I'm having trouble gettinga close button working right now, maybe later
//     $("#current_craft_box").append('<div id="close-submenu" style="float:left">'
//                                    + '<span style="text-decoration: underline" onClick=document.getElementById("crafting-submenu").outerHTML = ""; '
//                                    + 'id="close_crafting_submenu">X</span></div>');

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

        console.log('testing1234');

        var craftButton = $("<button>");
        craftButton.on("click", function() {
            console.log('testing5678');
            disable_quick_craft_buttons();

            var craftNumber = $("#craft_number_select").children("option:selected").val();

            (async function loop() {
                for (let i = 0; i < craftNumber; i++) {
                    await new Promise(resolve => setTimeout(function() {
                        console.log('craft');
                        do_craft(craft_name);
                        resolve();
                    }, 2000));
                    await new Promise(resolve => setTimeout(function() {
                        console.log('grab');
                        grab_result();
                        resolve();
                    }, 15000));
                    await new Promise(resolve => setTimeout(function() {
                        console.log('clear');
                        clear_crafting_area();
                        resolve();
                    }, 2000));
                }
            })();

//                 // https://stackoverflow.com/a/3583740/3150365
//                 (function myLoop (i) {
//                     setTimeout(function () {
//                         do_craft(craft_name); // your code here
//                         if (--i) myLoop(i);   //  decrement i and call myLoop again if i > 0
//                     }, 15000)
//                 })(craftNumber - 1);          //  pass the number of iterations as an argument

            enable_quick_craft_buttons();
        });

        craftButton.html('Craft');
        craftButton.prop('style', 'margin-left: 5px');

        $("#crafting-submenu").append(craftButton);
    }
}

function close_crafting_submenu() {
    $("#crafting-submenu").remove();
}

(function() {
    'use strict';

    $("#crafting_recipes").before(
        '<div id="quick-crafter" style="border: 1px solid #fff;margin-bottom: 17px;display: block;clear: both;position:relative;background-color:rgba(0,0,0,.7);padding:5px;"></div>');

//     $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: black;" id="test_filter_by_id">Test</button>');

//     var test = false;
//     $("#test_filter_by_id").click(function() {
//         if (test === false) {
//             clear_crafting_area();
//             setTimeout(function() {
//                 console.log(getElement(ingredients["test tube"]));
//                 triggerDragAndDrop(getElement(ingredients["test tube"]), "#slot_4");
//             }, 1500);
//             test = true;
//         } else {
//             grab_result();
//             clear_crafting_area();
//             test = false;
//         }
//     });

    $("#quick-crafter").append('<div id="current_craft_box"></div>');
    $("#quick-crafter").append('<p>Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better experience.');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: red;" id="clear_button" class="quick_craft_button">Clear</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: white; color: black;" id="shards_tube" class="quick_craft_button">Glass Shards From Tube</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: white; color: black;" id="shards_sand" class="quick_craft_button glass">Glass Shards From Sand</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: white; color: black;" id="test_tube" class="quick_craft_button glass">Test Tube</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: white; color: black;" id="vial" class="quick_craft_button glass">Vial</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: white; color: black;" id="bowl" class="quick_craft_button glass">Bowl</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: white; color: black;" id="dust_vial" class="quick_craft_button glass">Dust Ore Glassware (Vial)</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: white; color: black;" id="dust_bowl" class="quick_craft_button glass">Dust Ore Glassware (Bowl)</button>');
    $("#quick-crafter").append('<br />');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: green;" id="upload_potion_sampler" class="quick_craft_button basic_stat">Upload Potion Sampler</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: green;" id="small_upload_potion" class="quick_craft_button basic_stat">Small Upload Potion</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: green;" id="upload_potion" class="quick_craft_button basic_stat">Upload Potion</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: green;" id="large_upload_potion" class="quick_craft_button basic_stat">Large Upload Potion</button>');
    $("#quick-crafter").append('<br />');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: brown;" id="download_potion_sampler" class="quick_craft_button basic_stat">Download-Reduction Potion Sampler</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: brown;" id="small_download_potion" class="quick_craft_button basic_stat">Small Download-Reduction Potion</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: brown;" id="download_potion" class="quick_craft_button basic_stat">Download-Reduction Potion</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: brown;" id="large_download_potion" class="quick_craft_button basic_stat">Large Download-Reduction Potion</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: brown;" id="garlic_tincture" class="quick_craft_button basic_stat">Garlic Tincture</button>');
    $("#quick-crafter").append('<br />');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: purple;" id="impure_bronze_bar" class="quick_craft_button metal_bar">Impure Bronze Bar</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: purple;" id="bronze_bar" class="quick_craft_button metal_bar">Bronze Bar</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: purple;" id="iron_bar" class="quick_craft_button metal_bar">Iron Bar</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: purple;" id="steel_bar" class="quick_craft_button metal_bar">Steel Bar from Iron Ore</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: purple;" id="steel_bar_from_iron_bar" class="quick_craft_button metal_bar">Steel Bar from Iron Bar</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: purple;" id="gold_bar" class="quick_craft_button metal_bar">Gold Bar</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: purple;" id="mithril_bar" class="quick_craft_button metal_bar">Mithril Bar</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: purple;" id="adamantium_bar" class="quick_craft_button metal_bar">Adamantium Bar</button>');
    $("#quick-crafter").append('<br />');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: #9966cc;" id="quartz_bar" class="quick_craft_button metal_bar">Quartz Bar</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: #9966cc;" id="jade_bar" class="quick_craft_button metal_bar">Jade Bar</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: #9966cc;" id="amethyst_bar" class="quick_craft_button metal_bar">Amethyst Bar</button>');
    $("#quick-crafter").append('<br />');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: blue;" id="small_luck_potion" class="quick_craft_button luck">Small Luck Potion</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: blue;" id="large_luck_potion" class="quick_craft_button luck">Large Luck Potion</button>');
    $("#quick-crafter").append('<br />');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: wheat;color: black;" id="ruby_grained_baguette" class="quick_craft_button food">Ruby-Grained Baguette</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: wheat;color: black;" id="emerald_grained_baguette" class="quick_craft_button food">Emerald-Grained Baguette</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: wheat;color: black;" id="garlic_ruby_baguette" class="quick_craft_button food">Garlic Ruby-Baguette</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: wheat;color: black;" id="garlic_emerald_baguette" class="quick_craft_button food">Garlic Emerald-Baguette</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: wheat;color: black;" id="artisan_ruby_baguette" class="quick_craft_button food">Artisan Ruby-Baguette</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: wheat;color: black;" id="artisan_emerald_baguette" class="quick_craft_button food">Artisan Emerald-Baguette</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: wheat;color: black;" id="gazellian_emerald_baguette" class="quick_craft_button food">Gazellian Emerald-Baguette</button>');
    $("#quick-crafter").append('<br />');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: deeppink;" id="carbon_crystalline_quartz_gem" class="quick_craft_button jewelry">Carbon-Crystalline Quartz Gem</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: deeppink;" id="carbon_crystalline_quartz_necklace" class="quick_craft_button jewelry">Carbon-Crystalline Quartz Necklace</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: deeppink;" id="exquisite_constellation_emeralds" class="quick_craft_button jewelry">Exquisite Constellation of Emeralds</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: deeppink;" id="exquisite_constellation_rubies" class="quick_craft_button jewelry">Exquisite Constellation of Rubies</button>');
    $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: deeppink;" id="exquisite_constellation_sapphires" class="quick_craft_button jewelry">Exquisite Constellation of Sapphires</button>');
    $("#quick-crafter").append('<br />');
    $("#quick-crafter").append('<br />');

    var hasFoodBook = $("#crafting_recipes h3:contains('Food Cooking Recipes')").length ? true : false;
    var hasStatPotionBook = $("#crafting_recipes h3:contains('Basic Stat Potion Crafting Recipes')").length ? true : false;
    var hasMetalBarBook = $("#crafting_recipes h3:contains('Metal Bar Crafting Recipes')").length ? true : false;
    var hasJewelryBook = $("#crafting_recipes h3:contains('Jewelry Crafting Recipes')").length ? true : false;
    var hasGlassBook = $("#crafting_recipes h3:contains('Basic Stat Potion Crafting Recipes')").length ? true : false;
    var hasLuckBook = $("#crafting_recipes h3:contains('Luck Potion Crafting Recipes')").length ? true : false;
    var hasDebugBook = $("#crafting_recipes h3:contains('A fake book for testing')").length ? true : false;

    $("#quick-crafter").append('<span>Recipes will appear if you have one or more of the following books:</span>');
    $("#quick-crafter").append('<br />');
    $("#quick-crafter").append('<span><b>Glass Book:</span> ' + hasGlassBook + ' | <b>Food Book:</b> ' + hasFoodBook +
                               ' | <b>Basic Stat Potion Book:</b> ' + hasStatPotionBook + ' | <b>Metal Bar Book:</b> '
                               + hasMetalBarBook + ' | <b>Jewelry Book:</b> ' + hasJewelryBook + ' | <b>Luck Book:</b> ' + hasLuckBook + '</p>');

    $("#quick-crafter").append('<p style="float:right;margin-top:-20px;margin-right:5px;">Quick Crafter by <a href="/user.php?id=58819">KingKrab23</a> v<a href="https://github.com/KingKrab23/Quick_Craft/raw/master/GGn%20Quick%20Crafting.user.js">' + VERSION +'</a></p>');

    if (hasFoodBook === false) {
        $('.food').remove();
    }

    if (hasStatPotionBook === false) {
        $('.basic_stat').remove();
    }

    if (hasLuckBook === false) {
        $('.luck').remove();
    }

    if (hasJewelryBook === false) {
        $('.jewelry').remove();
    }

    if (hasMetalBarBook === false) {
        $('.metal_bar').remove();
    }

    if (hasGlassBook === false) {
        $('.glass').remove();
    }

    set_item_properties();
    set_slot_properties();

    //console.log(ingredients);
    build_on_hand();
    build_craft_list();
    //console.log(craftList);

    $("#clear_button").click(function() {
        next_button_lockout_delay = 300;
        disable_quick_craft_buttons();

        clear_crafting_area();

        enable_quick_craft_buttons();
    });

    $("#shards_tube").click(function() {
        open_crafting_submenu("glass shards from test tube");
    });
    $("#shards_sand").click(function() {
        open_crafting_submenu("glass shards from sand");
    });
    $("#test_tube").click(function() {
        open_crafting_submenu("test tube");
    });
    $("#vial").click(function() {
        open_crafting_submenu("vial")
    });
    $("#bowl").click(function() {
        open_crafting_submenu("bowl");
    });
    $("#dust_vial").click(function() {
        open_crafting_submenu("dust ore glassware (vial)");
    });
    $("#dust_bowl").click(function() {
        open_crafting_submenu("dust ore glassware (bowl)");
    });

    $("#upload_potion_sampler").click(function() {
        open_crafting_submenu("upload potion sampler");
    });
    $("#small_upload_potion").click(function() {
        open_crafting_submenu("small upload potion");
    });
    $("#upload_potion").click(function() {
        open_crafting_submenu("upload potion");
    });
    $("#large_upload_potion").click(function() {
        open_crafting_submenu("large upload potion");
    });

    $("#download_potion_sampler").click(function() {
        open_crafting_submenu("download-reduction potion sampler");
    });
    $("#small_download_potion").click(function() {
        open_crafting_submenu("small download-reduction potion");
    });
    $("#download_potion").click(function() {
        open_crafting_submenu("download-reduction potion");
    });
    $("#large_download_potion").click(function() {
        open_crafting_submenu("large download-reduction potion");
    });

    $("#garlic_tincture").click(function() {
        open_crafting_submenu("garlic tincture");
    });

    $("#impure_bronze_bar").click(function() {
        open_crafting_submenu("impure bronze bar");
    });
    $("#bronze_bar").click(function() {
        open_crafting_submenu("bronze bar");
    });
    $("#iron_bar").click(function() {
        open_crafting_submenu("iron bar");
    });
    $("#steel_bar").click(function() {
        open_crafting_submenu("steel bar from iron ore");
    });
    $("#steel_bar_from_iron_bar").click(function() {
        open_crafting_submenu("steel bar from iron bar");
    });
    $("#gold_bar").click(function() {
        open_crafting_submenu("gold bar");
    });
    $("#mithril_bar").click(function() {
        open_crafting_submenu("mithril bar");
    });
    $("#adamantium_bar").click(function() {
        open_crafting_submenu("adamantium bar");
    });
    $("#quartz_bar").click(function() {
        open_crafting_submenu("quartz bar");
    });
    $("#jade_bar").click(function() {
        open_crafting_submenu("jade bar");
    });
    $("#amethyst_bar").click(function() {
        open_crafting_submenu("amethyst bar");
    });

    $("#small_luck_potion").click(function() {
        open_crafting_submenu("small luck potion");
    });
    $("#large_luck_potion").click(function() {
        open_crafting_submenu("large luck potion");
    });

    $("#ruby_grained_baguette").click(function() {
        open_crafting_submenu("ruby-grained baguette");
    });
    $("#emerald_grained_baguette").click(function() {
        open_crafting_submenu("emerald-grained baguette");
    });
    $("#garlic_ruby_baguette").click(function() {
        open_crafting_submenu("garlic ruby-baguette");
    });
    $("#garlic_emerald_baguette").click(function() {
        open_crafting_submenu("garlic emerald-baguette");
    });
    $("#artisan_ruby_baguette").click(function() {
        open_crafting_submenu("artisan ruby-baguette");
    });
    $("#artisan_emerald_baguette").click(function() {
        open_crafting_submenu("artisan emerald-baguette");
    });
    $("#gazellian_emerald_baguette").click(function() {
        open_crafting_submenu("gazellian emerald-baguette");
    });

    $("#carbon_crystalline_quartz_gem").click(function() {
        open_crafting_submenu("carbon-crystalline quartz gem");
    });
    $("#carbon_crystalline_quartz_necklace").click(function() {
        open_crafting_submenu("carbon-crystalline quartz necklace");
    });
    $("#exquisite_constellation_emeralds").click(function() {
        open_crafting_submenu("exquisite constellations of emeralds");
    });
    $("#exquisite_constellation_sapphires").click(function() {
        open_crafting_submenu("exquisite constellations of sapphires");
    });
    $("#exquisite_constellation_rubies").click(function() {
        open_crafting_submenu("exquisite constellations of rubies");
    });

})();
