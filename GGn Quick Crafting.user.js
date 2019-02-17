// ==UserScript==
// @name         GGn Quick Crafter
// @namespace    http://tampermonkey.net/
// @version      1.0.3b
// @description  Craft multiple items easier
// @author       KingKrab23
// @match        https://gazellegames.net/user.php?action=crafting
// @grant        none
// @require      https://code.jquery.com/jquery-1.7.2.min.js
// @require      https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js
// ==/UserScript==

const VERSION = '1.0.3b';
const ITEM_ACCESSOR = ".item:not(.hidden)";

/* >>>BEGIN<<< User adjustable variables
 * ONLY ADJUST THESE IF YOU KNOW WHAT YOU'RE DOING
 * Too little of a delay will cause more visual bugs */

const RETRIEVE_ITEMS = false; // set to true to automatically retrieve craft recipes
const BUTTON_LOCKOUT_DELAY = 4300;
const ITEM_WINDOW_DELAY = 700;
const GRAB_DELAY = 1200;

/* >>>END<<< user adjustable variables */

/* Used to specify the clear button lockout time only at this time */
var next_button_lockout_delay = BUTTON_LOCKOUT_DELAY;

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.disabled { background-color: #333 !important; color: #666 !important; }';
document.getElementsByTagName('head')[0].appendChild(style);

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
    craftList["glass shards from test tube"].ingredients = [ { id: ingredients["test tube"], qty: 1, "on hand": onHand["test tube"] } ];
    craftList["glass shards from test tube"].icon = "http://test.test";
    craftList["glass shards from test tube"].available = onHand["test tube"];

    craftList["glass shards from sand"] = {};
    craftList["glass shards from sand"].ingredients = [ { id: ingredients["pile of sand"], qty: 1, "on hand": onHand["pile of sand"] } ];
    craftList["glass shards from sand"].icon = "http://test.test";
    craftList["glass shards from sand"].available = onHand["pile of sand"];

    craftList["test tube"] = {};
    craftList["test tube"].ingredients = [ { id: ingredients["glass shards"], qty: 2, "on hand": onHand["glass shards"] } ];
    craftList["test tube"].icon = "http://test.test";
    craftList["test tube"].available = Math.floor(onHand["glass shards"] / 2);

    craftList["vial"] = {};
    craftList["vial"].ingredients = [ { id: ingredients["glass shards"], qty: 5, "on hand": onHand["glass shards"] } ];
    craftList["vial"].icon = "http://test.test";
    craftList["vial"].available = Math.floor(onHand["glass shards"] / 5);

    craftList["bowl"] = {};
    craftList["bowl"].ingredients = [ { id: ingredients["glass shards"], qty: 8, "on hand": onHand["glass shards"] } ];
    craftList["bowl"].icon = "http://test.test";
    craftList["bowl"].available = Math.floor(onHand["glass shards"] / 8);

    craftList["dust ore glassware (vial)"] = {};
    craftList["dust ore glassware (vial)"].ingredients = [
        { id: ingredients["pile of sand"], qty: 1, "on hand": onHand["pile of sand"] },
        { id: ingredients["quartz dust"], qty: 1, "on hand": onHand["quartz dust"] }
    ];
    craftList["dust ore glassware (vial)"].icon = "http://test.test";
    craftList["dust ore glassware (vial)"].available = Math.min(onHand["pile of sand"]
                                                                , onHand["quartz dust"]);

    craftList["dust ore glassware (bowl)"] = {};
    craftList["dust ore glassware (bowl)"].ingredients = [
        { id: ingredients["pile of sand"], qty: 1, "on hand": onHand["pile of sand"] },
        { id: ingredients["jade dust"], qty: 1, "on hand": onHand["jade dust"] }
    ];
    craftList["dust ore glassware (bowl)"].icon = "http://test.test";
    craftList["dust ore glassware (bowl)"].available = Math.min(onHand["pile of sand"]
                                                                , onHand["jade dust"]);

    craftList["small upload potion"] = {};
    craftList["small upload potion"].ingredients = [
        { id: ingredients["vial"], qty: 1, "on hand": onHand["vial"] },
        { id: ingredients["black elder leaves"], qty: 2, "on hand": onHand["black elder leaves"] },
        { id: ingredients["black elderberries"], qty: 1, "on hand": onHand["black elderberries"] }
    ];
    craftList["small upload potion"].icon = "http://test.test";
    craftList["small upload potion"].available = Math.min(Math.floor(onHand["black elder leaves"] / 2)
                                                          , onHand["black elderberries"]);

    craftList["upload potion"] = {};
    craftList["upload potion"].ingredients = [
        { id: ingredients["vial"], qty: 1, "on hand": onHand["vial"] },
        { id: ingredients["black elder leaves"], qty: 5, "on hand": onHand["black elder leaves"] },
        { id: ingredients["black elderberries"], qty: 1, "on hand": onHand["black elderberries"] }
    ];
    craftList["upload potion"].icon = "http://test.test";
    craftList["upload potion"].available = Math.min(Math.floor(onHand["black elder leaves"] / 5)
                                                    , onHand["black elderberries"]);

    craftList["large upload potion"] = {};
    craftList["large upload potion"].ingredients = [
        { id: ingredients["bowl"], qty: 1, "on hand": onHand["bowl"] },
        { id: ingredients["upload potion"], qty: 2, "on hand": onHand["upload potion"] },
        { id: ingredients["yellow hellebore flower"], qty: 1, "on hand": onHand["yellow hellebore flower"] }
    ];
    craftList["large upload potion"].icon = "http://test.test";
    craftList["large upload potion"].available = Math.min(Math.floor(onHand["upload potion"] / 2)
                                                          , onHand["bowl"]
                                                          , onHand["yellow hellebore flower"]);

    craftList["download-reduction potion sampler"] = {};
    craftList["download-reduction potion sampler"].ingredients = [
        { id: ingredients["test tube"], qty: 1, "on hand": onHand["test tube"] },
        { id: ingredients["purple angelica flowers"], qty: 1, "on hand": onHand["purple angelica flowers"] },
        { id: ingredients["garlic tincture"], qty: 1, "on hand": onHand["garlic tincture"] }
    ];
    craftList["download-reduction potion sampler"].icon = "http://test.test";
    craftList["download-reduction potion sampler"].available = Math.min(onHand["test tube"]
                                                                        , onHand["purple angelica flowers"]
                                                                        , onHand["garlic tincture"]);

    craftList["small download-reduction potion"] = {};
    craftList["small download-reduction potion"].ingredients = [
        { id: ingredients["vial"], qty: 1, "on hand": onHand["test tube"] },
        { id: ingredients["purple angelica flowers"], qty: 2, "on hand": onHand["purple angelica flowers"] },
        { id: ingredients["garlic tincture"], qty: 1, "on hand": onHand["garlic tincture"] }
    ];
    craftList["small download-reduction potion"].icon = "http://test.test";
    craftList["small download-reduction potion"].available = Math.min(Math.floor(onHand["purple angelica flowers"] / 2)
                                                                      , onHand["vial"]
                                                                      , onHand["garlic tincture"]);

    craftList["download-reduction potion"] = {};
    craftList["download-reduction potion"].ingredients = [
        { id: ingredients["vial"], qty: 1, "on hand": onHand["test tube"] },
        { id: ingredients["purple angelica flowers"], qty: 5, "on hand": onHand["purple angelica flowers"] },
        { id: ingredients["garlic tincture"], qty: 1, "on hand": onHand["garlic tincture"] }
    ];
    craftList["download-reduction potion"].icon = "http://test.test";
    craftList["download-reduction potion"].available = Math.min(Math.floor(onHand["purple angelica flowers"] / 5)
                                                                , onHand["vial"]
                                                                , onHand["garlic tincture"]);

    craftList["large download-reduction potion"] = {};
    craftList["large download-reduction potion"].ingredients = [
        { id: ingredients["bowl"], qty: 1, "on hand": onHand["test tube"] },
        { id: ingredients["download-reduction potion"], qty: 2, "on hand": onHand["download-reduction potion"] },
        { id: ingredients["yellow hellebore flower"], qty: 1, "on hand": onHand["yellow hellebore flower"] }
    ];
    craftList["large download-reduction potion"].icon = "http://test.test";
    craftList["large download-reduction potion"].available = Math.min(Math.floor(onHand["download-reduction potions"] / 2)
                                                                      , onHand["bowl"]
                                                                      , onHand["garlic tincture"]);

    craftList["garlic tincture"] = {};
    craftList["garlic tincture"].ingredients = [
        { id: ingredients["test tube"], qty: 1, "on hand": onHand["test tube"] },
        { id: ingredients["head of garlic"], qty: 1, "on hand": onHand["head of garlic"] },
    ];
    craftList["garlic tincture"].icon = "http://test.test";
    craftList["garlic tincture"].available = Math.min(onHand["test tube"]
                                                      , onHand["head of garlic"]);

    craftList["small luck potion"] = {};
    craftList["small luck potion"].ingredients = [
        { id: ingredients["vial"], qty: 1, "on hand": onHand["vial"] },
        { id: ingredients["black elderberries"], qty: 2, "on hand": onHand["black elderberries"] },
    ];
    craftList["small luck potion"].icon = "http://test.test";
    craftList["small luck potion"].available = Math.min(Math.floor(onHand["black elderberries"] / 2)
                                                        , onHand["vial"]);

    craftList["large luck potion"] = {};
    craftList["large luck potion"].ingredients = [
        { id: ingredients["bowl"], qty: 1, "on hand": onHand["bowl"] },
        { id: ingredients["black elderberries"], qty: 5, "on hand": onHand["black elderberries"] },
        { id: ingredients["yellow hellebore flower"], qty: 1, "on hand": onHand["yellow hellebore flower"] }
    ];
    craftList["large luck potion"].icon = "http://test.test";
    craftList["large luck potion"].available = Math.min(Math.floor(onHand["black elderberries"] / 5)
                                                        , onHand["bowl"]
                                                        , onHand["yellow hellebore flower"]);

    craftList["ruby-grained baguette"] = {};
    craftList["ruby-grained baguette"].ingredients = [ { id: ingredients["ruby-flecked wheat"], qty: 2, "on hand": onHand["ruby-flecked wheat"] } ];
    craftList["ruby-grained baguette"].icon = "http://test.test";
    craftList["ruby-grained baguette"].available = Math.floor(onHand["ruby-flecked wheat"] / 2);

    craftList["emerald-grained baguette"] = {};
    craftList["emerald-grained baguette"].ingredients = [ { id: ingredients["emerald-flecked wheat"], qty: 2, "on hand": onHand["emerald-flecked wheat"] } ];
    craftList["emerald-grained baguette"].icon = "http://test.test";
    craftList["emerald-grained baguette"].available = Math.floor(onHand["emerald-flecked wheat"] / 2);

    craftList["garlic ruby-baguette"] = {};
    craftList["garlic ruby-baguette"].ingredients = [
        { id: ingredients["ruby-grained baguette"], qty: 1, "on hand": onHand["ruby-grained baguette"] },
        { id: ingredients["head of garlic"], qty: 2, "on hand": onHand["head of garlic"] },
    ];
    craftList["garlic ruby-baguette"].icon = "http://test.test";
    craftList["garlic ruby-baguette"].available = Math.min(Math.floor(onHand["head of garlic"] / 2)
                                                           , onHand["ruby-grained baguette"]);

    craftList["garlic emerald-baguette"] = {};
    craftList["garlic emerald-baguette"].ingredients = [
        { id: ingredients["emerald-grained baguette"], qty: 1, "on hand": onHand["emerald-grained baguette"] },
        { id: ingredients["head of garlic"], qty: 1, "on hand": onHand["head of garlic"] },
    ];
    craftList["garlic emerald-baguette"].icon = "http://test.test";
    craftList["garlic emerald-baguette"].available = Math.min(onHand["head of garlic"]
                                                              , onHand["emerald-grained baguette"]);

    craftList["artisan emerald-baguette"] = {};
    craftList["artisan emerald-baguette"].ingredients = [
        { id: ingredients["garlic emerald-baguette"], qty: 1, "on hand": onHand["garlic emerald-baguette"] },
        { id: ingredients["emerald chip"], qty: 1, "on hand": onHand["emerald chip"] },
        { id: ingredients["yellow hellebore flower"], qty: 1, "on hand": onHand["yellow hellebore flower"] },
    ];
    craftList["artisan emerald-baguette"].icon = "http://test.test";
    craftList["artisan emerald-baguette"].available = Math.min(onHand["garlic emerald-baguette"]
                                                               , onHand["emerald chip"]
                                                               , onHand["yellow hellebore flower"]);

    craftList["artisan ruby-baguette"] = {};
    craftList["artisan ruby-baguette"].ingredients = [
        { id: ingredients["garlic ruby-baguette"], qty: 1, "on hand": onHand["garlic ruby-baguette"] },
        { id: ingredients["yellow hellebore flower"], qty: 2, "on hand": onHand["yellow hellebore flower"] },
    ];
    craftList["artisan ruby-baguette"].icon = "http://test.test";
    craftList["artisan ruby-baguette"].available = Math.min(Math.floor(onHand["yellow hellebore flower"] / 5)
                                                            , onHand["garlic ruby-baguette"]);

    craftList["gazellian emerald-baguette"] = {};
    craftList["gazellian emerald-baguette"].ingredients = [
        { id: ingredients["artisan emerald-baguette"], qty: 1, "on hand": onHand["artisan emerald-baguette"] },
        { id: ingredients["emerald chip"], qty: 2, "on hand": onHand["emerald chip"] }
    ];
    craftList["gazellian emerald-baguette"].icon = "http://test.test";
    craftList["gazellian emerald-baguette"].available = Math.min(Math.floor(onHand["emerald chip"] / 2)
                                                                 , onHand["artisan emerald-baguette"]);

    craftList["impure bronze bar"] = {};
    craftList["impure bronze bar"].ingredients = [
        { id: ingredients["bronze alloy mix"], qty: 1, "on hand": onHand["bronze alloy mix"] },
        { id: ingredients["clay"], qty: 1, "on hand": onHand["clay"] },
    ];
    craftList["impure bronze bar"].icon = "http://test.test";
    craftList["impure bronze bar"].available = Math.min(onHand["bronze alloy mix"]
                                                        , onHand["clay"]);

    craftList["bronze bar"] = {};
    craftList["bronze bar"].ingredients = [ { id: ingredients["bronze alloy mix"], qty: 2, "on hand": onHand["bronze alloy mix"] } ];
    craftList["bronze bar"].icon = "http://test.test";
    craftList["bronze bar"].available = Math.floor(onHand["bronze alloy mix"] / 2);

    craftList["iron bar"] = {};
    craftList["iron bar"].ingredients = [ { id: ingredients["iron ore"], qty: 2, "on hand": onHand["iron ore"] } ];
    craftList["iron bar"].icon = "http://test.test";
    craftList["iron bar"].available = Math.floor(onHand["iron ore"] / 2);

    craftList["gold bar"] = {};
    craftList["gold bar"].ingredients = [ { id: ingredients["gold ore"], qty: 2, "on hand": onHand["gold ore"] } ];
    craftList["gold bar"].icon = "http://test.test";
    craftList["gold bar"].available = Math.floor(onHand["gold ore"] / 2);

    craftList["mithril bar"] = {};
    craftList["mithril bar"].ingredients = [ { id: ingredients["mithril ore"], qty: 2, "on hand": onHand["mithril ore"] } ];
    craftList["mithril bar"].icon = "http://test.test";
    craftList["mithril bar"].available = Math.floor(onHand["mithril ore"] / 2);

    craftList["adamantium bar"] = {};
    craftList["adamantium bar"].ingredients = [ { id: ingredients["adamantium ore"], qty: 2, "on hand": onHand["adamantium ore"] } ];
    craftList["adamantium bar"].icon = "http://test.test";
    craftList["adamantium bar"].available = Math.floor(onHand["adamantium ore"] / 2);

    craftList["amethyst bar"] = {};
    craftList["amethyst bar"].ingredients = [ { id: ingredients["amethyst ore"], qty: 2, "on hand": onHand["amethyst ore"] } ];
    craftList["amethyst bar"].icon = "http://test.test";
    craftList["amethyst bar"].available = Math.floor(onHand["amethyst ore"] / 2);

    craftList["quartz bar"] = {};
    craftList["quartz bar"].ingredients = [ { id: ingredients["quartz dust"], qty: 2, "on hand": onHand["quartz dust"] } ];
    craftList["quartz bar"].icon = "http://test.test";
    craftList["quartz bar"].available = Math.floor(onHand["quartz dust"] / 2);

    craftList["jade bar"] = {};
    craftList["jade bar"].ingredients = [ { id: ingredients["jade dust"], qty: 2, "on hand": onHand["jade dust"] } ];
    craftList["jade bar"].icon = "http://test.test";
    craftList["jade bar"].available = Math.floor(onHand["jade dust"] / 2);

    craftList["steel bar from iron ore"] = {};
    craftList["steel bar from iron ore"].ingredients = [
        { id: ingredients["iron ore"], qty: 2, "on hand": onHand["iron ore"] },
        { id: ingredients["lump of coal"], qty: 1, "on hand": onHand["lump of coal"] },
    ];
    craftList["steel bar from iron ore"].icon = "http://test.test";
    craftList["steel bar from iron ore"].available = Math.min(Math.floor(onHand["iron ore"] / 2)
                                                              , onHand["lump of coal"]);

    craftList["steel bar from iron bar"] = {};
    craftList["steel bar from iron bar"].ingredients = [
        { id: ingredients["iron bar"], qty: 1, "on hand": onHand["iron bar"] },
        { id: ingredients["lump of coal"], qty: 1, "on hand": onHand["lump of coal"] },
    ];
    craftList["steel bar from iron bar"].icon = "http://test.test";
    craftList["steel bar from iron bar"].available = Math.min(onHand["iron bar"]
                                                              , onHand["lump of coal"]);

    craftList["carbon-crystalline quartz gem"] = {};
    craftList["carbon-crystalline quartz gem"].ingredients = [
        { id: ingredients["quartz bar"], qty: 1, "on hand": onHand["quartz bar"] },
        { id: ingredients["lump of coal"], qty: 1, "on hand": onHand["lump of coal"] },
    ];
    craftList["carbon-crystalline quartz gem"].icon = "http://test.test";
    craftList["carbon-crystalline quartz gem"].available = Math.min(onHand["quartz bar"]
                                                                    , onHand["lump of coal"]);

    craftList["carbon-crystalline quartz necklace"] = {};
    craftList["carbon-crystalline quartz necklace"].ingredients = [
        { id: ingredients["carbon-crystalline quartz gem"], qty: 1, "on hand": onHand["carbon-crystalline quartz gem"] },
        { id: ingredients["glass shards"], qty: 1, "on hand": onHand["glass shards"] },
    ];
    craftList["carbon-crystalline quartz necklace"].icon = "http://test.test";
    craftList["carbon-crystalline quartz necklace"].available = Math.min(onHand["carbon-crystalline quartz gem"]
                                                                         , onHand["glass shards"]);

    craftList["exquisite constellations of rubies"] = {};
    craftList["exquisite constellations of rubies"].ingredients = [
        { id: ingredients["amethyst bar"], qty: 2, "on hand": onHand["amethyst bar"] },
        { id: ingredients["ruby"], qty: 4, "on hand": onHand["ruby"] },
    ];
    craftList["exquisite constellations of rubies"].icon = "http://test.test";
    craftList["exquisite constellations of rubies"].available = Math.min(Math.floor(onHand["amethyst bar"] / 2)
                                                                         , Math.floor(onHand["ruby"] / 4));

    craftList["exquisite constellations of sapphires"] = {};
    craftList["exquisite constellations of sapphires"].ingredients = [
        { id: ingredients["amethyst bar"], qty: 2, "on hand": onHand["amethyst bar"] },
        { id: ingredients["sapphire"], qty: 4, "on hand": onHand["sapphire"] },
    ];
    craftList["exquisite constellations of sapphires"].icon = "http://test.test";
    craftList["exquisite constellations of sapphires"].available = Math.min(Math.floor(onHand["amethyst bar"] / 2)
                                                                            , Math.floor(onHand["sapphire"] / 4));

    craftList["exquisite constellations of emeralds"] = {};
    craftList["exquisite constellations of emeralds"].ingredients = [
        { id: ingredients["amethyst bar"], qty: 2, "on hand": onHand["amethyst bar"] },
        { id: ingredients["emerald"], qty: 4, "on hand": onHand["emerald"] },
    ];
    craftList["exquisite constellations of emeralds"].icon = "http://test.test";
    craftList["exquisite constellations of emeralds"].available = Math.min(Math.floor(onHand["amethyst bar"] / 2)
                                                                           , Math.floor(onHand["emerald"] / 4));
}

// slightly modified from the crafting.js script to filter on itemId if presented from this script
function filterItems_user() {
    var query = $('#search_query').val();
    query = encodeURIComponent(query);

    // Show all
    $('#items li.item').each(function () {
        $(this).removeClass('hidden').removeAttr('style');
    });

    // Has query, get items to remove
    var removeItems = $('#items li.item').filter(function () {
        if ($(this).attr("data-item") === query) {
            return false;
        } else {
            return $(this).data("item-name").toLowerCase().indexOf(query.toLowerCase()) === -1;
        }
    });

    // Hide items
    removeItems.each(function () {
        $(this).addClass('hidden');
    });

    // Scroll to the top
    $('#items-wrapper').scrollTop(0);
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

function set_filter(filter_value) {
    $('#search_query').val(filter_value);
    filterItems_user();
}

var triggerDragAndDrop = function (selectorDrag, selectorDrop) {

    // function for triggering mouse events
    var fireMouseEvent = function (type, elem, centerX, centerY) {
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent(type, true, true, window, 1, 1, 1, centerX, centerY, false, false, false, false, 0, elem);
        elem.dispatchEvent(evt);
    };

    // fetch target elements
    var elemDrag = document.querySelector(selectorDrag);
    var elemDrop = document.querySelector(selectorDrop);

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

function clear_crafting_area() {
    var i = 0;
    for (i = 0; i < 3; i++) {
        triggerDragAndDrop("#slot_0 li", "#items-wrapper");
        triggerDragAndDrop("#slot_1 li", "#items-wrapper");
        triggerDragAndDrop("#slot_2 li", "#items-wrapper");
        triggerDragAndDrop("#slot_3 li", "#items-wrapper");
        triggerDragAndDrop("#slot_4 li", "#items-wrapper");
        triggerDragAndDrop("#slot_5 li", "#items-wrapper");
        triggerDragAndDrop("#slot_6 li", "#items-wrapper");
        triggerDragAndDrop("#slot_7 li", "#items-wrapper");
        triggerDragAndDrop("#slot_8 li", "#items-wrapper");
    }

    $("#CraftingResult li").remove();
    set_filter('');
}

/* Crafts */
function craft_glass_shards_from_tube() {
    set_filter('test tube');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_glass_shards_from_sand() {
    set_filter('pile of sand');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_glass_test_tube() {
    set_filter('glass shards');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    setTimeout(grab_result, GRAB_DELAY);
}

function craft_glass_vial() {
    set_filter('glass shards');

    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");
    setTimeout(function() {
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");
        setTimeout(function() {
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
            setTimeout(function() {
                triggerDragAndDrop(ITEM_ACCESSOR, "#slot_6");
                setTimeout(function() {
                    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_7");
                    setTimeout(grab_result, GRAB_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_glass_bowl() {
    set_filter('glass shards');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");

    setTimeout(function() {
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");
        setTimeout(function() {
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_2");
            setTimeout(function() {
                triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");
                setTimeout(function() {
                    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");
                    setTimeout(function() {
                        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_6");
                        setTimeout(function() {
                            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_7");
                            setTimeout(function() {
                                triggerDragAndDrop(ITEM_ACCESSOR, "#slot_8");
                                setTimeout(grab_result, GRAB_DELAY + 400); // this needs more time
                            }, ITEM_WINDOW_DELAY);
                        }, ITEM_WINDOW_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_glass_dust_vial() {
    set_filter('pile of sand');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(function() {
        set_filter('quartz dust');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_7")
        if (triggerDragAndDrop === true) {
            setTimeout(grab_result, GRAB_DELAY);
        } else {
            alert('Error 23. No Quartz Dust?');
            enable_quick_craft_buttons();
            clear_crafting_area();
        }

    }, ITEM_WINDOW_DELAY);
}

function craft_glass_dust_bowl() {
    set_filter('pile of sand');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(function() {
        set_filter('jade dust');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_7")
        if (triggerDragAndDrop === true) {
            setTimeout(grab_result, GRAB_DELAY);
        } else {
            alert('Error 24. No Jade Dust?');
            enable_quick_craft_buttons();
            clear_crafting_area();
        }

    }, ITEM_WINDOW_DELAY);
}

function craft_upload_potion_sampler() {
    set_filter('test tube');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    set_filter('black elderberries');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

    setTimeout(function (){
        set_filter('black elder leaves');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_2");
        setTimeout(grab_result, GRAB_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_small_upload_potion() {
    set_filter('vial');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    set_filter('black elderberries');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

    setTimeout(function (){
        set_filter('black elder leaves');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_2");
        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_8");
            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_upload_potion() {
    set_filter('vial');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    set_filter('black elderberries');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

    setTimeout(function (){
        set_filter('black elder leaves');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_8");

        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_6");
            setTimeout(function (){
                triggerDragAndDrop(ITEM_ACCESSOR, "#slot_2");
                setTimeout(function (){
                    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");
                    setTimeout(function (){
                        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
                        setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_large_upload_potion() {
    set_filter('bowl');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    set_filter('00099');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

    setTimeout(function (){
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");
        setTimeout(function (){
            set_filter('yellow hellebore flower');
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");
            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_download_potion_sampler() {
    set_filter('test tube');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    set_filter('purple angelica flowers');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_2");

    setTimeout(function (){
        setTimeout(function (){
            set_filter('garlic tincture');
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");
            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_small_download_potion() {
    set_filter('vial');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    set_filter('garlic tincture');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");
    set_filter('purple angelica flowers');

    setTimeout(function (){
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_8");
        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_2");
            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_download_potion() {
    set_filter('vial');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    set_filter('garlic tincture');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

    setTimeout(function (){
        set_filter('purple angelica flowers');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_8");

        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_6");
            setTimeout(function (){
                triggerDragAndDrop(ITEM_ACCESSOR, "#slot_2");
                setTimeout(function (){
                    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");
                    setTimeout(function (){
                        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
                        setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_large_download_potion() {
    set_filter('bowl');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    set_filter('00106');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

    setTimeout(function (){
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");
        setTimeout(function (){
            set_filter('yellow hellebore flower');
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");
            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_garlic_tincture() {
    set_filter('test tube');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    set_filter('head of garlic');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_impure_bronze_bar() {
    set_filter('bronze ore');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
    set_filter('clay');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_bronze_bar() {
    set_filter('bronze ore');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_iron_bar() {
    set_filter('iron ore');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_steel_bar() {
    set_filter('iron ore');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");

    setTimeout(function() {
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

        setTimeout(function() {
            set_filter('lump of coal');
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_steel_bar_from_iron_bar() {
    set_filter('iron bar');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

    set_filter('lump of coal');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_gold_bar() {
    set_filter('gold ore');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_mithril_bar() {
    set_filter('mithril ore');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_adamantium_bar() {
    set_filter('adamantium ore');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_quartz_bar() {
    set_filter('quartz dust');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_jade_bar() {
    set_filter('jade dust');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_amethyst_bar() {
    set_filter('amethyst dust');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

    setTimeout(grab_result, GRAB_DELAY);
}

function craft_small_luck_potion() {
    set_filter('vial');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");
    set_filter('black elderberries');
    setTimeout(function (){
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_large_luck_potion() {
    set_filter('bowl');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
    set_filter('black elderberries');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_0");

    setTimeout(function (){
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_2");
            setTimeout(function (){
                triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");
                setTimeout(function (){
                    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");
                    setTimeout(function (){
                        set_filter('yellow hellebore flower');
                        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_7");

                        setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_ruby_grained_baguette() {
    set_filter('ruby-flecked wheat');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(function (){
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

        setTimeout(grab_result, GRAB_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_emerald_grained_baguette() {
    set_filter('emerald-flecked wheat');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(function (){
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

        setTimeout(grab_result, GRAB_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_garlic_ruby_baguette() {
    set_filter('ruby-grained baguette');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(function (){
        set_filter('head of garlic');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");

        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_garlic_emerald_baguette() {
    set_filter('emerald-grained baguette');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(function (){
        set_filter('head of garlic');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

        setTimeout(grab_result, GRAB_DELAY);

    }, ITEM_WINDOW_DELAY);
}

function craft_artisan_ruby_baguette() {
    set_filter('garlic ruby-baguette');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");

    setTimeout(function (){
        set_filter('yellow hellebore flower');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_artisan_emerald_baguette() {
    set_filter('garlic emerald-baguette');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");

    setTimeout(function (){
        set_filter('emerald chip');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

        setTimeout(function (){
            set_filter('yellow hellebore flower');
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_gazellian_emerald_baguette() {
    set_filter('artisan emerald-baguette');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");

    setTimeout(function (){
        set_filter('emerald chip');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_carbon_crystalline_quartz_gem() {
    set_filter('carbon-crystalline quartz');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(function (){
        set_filter('glass shards');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_1");

        setTimeout(grab_result, GRAB_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_carbon_crystalline_quartz_necklace() {
    set_filter('quartz bar');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");

    setTimeout(function (){
        set_filter('lump of coal');
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

        setTimeout(grab_result, GRAB_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_exquisite_constellation_emeralds() {
    set_filter('00116');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");

    setTimeout(function (){
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");
        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_6");
            setTimeout(function (){
                triggerDragAndDrop(ITEM_ACCESSOR, "#slot_8");
                setTimeout(function (){
                    set_filter('amethyst bar');
                    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
                    setTimeout(function (){
                        set_filter('amethyst bar');
                        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_7");

                        setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_exquisite_constellation_rubies() {
    set_filter('02323');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");

    setTimeout(function (){
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");
        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_6");
            setTimeout(function (){
                triggerDragAndDrop(ITEM_ACCESSOR, "#slot_8");
                setTimeout(function (){
                    set_filter('amethyst bar');
                    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
                    setTimeout(function (){
                        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_7");

                        setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}

function craft_exquisite_constellation_sapphires() {
    set_filter('02549');
    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");

    setTimeout(function (){
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");
        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_6");
            setTimeout(function (){
                triggerDragAndDrop(ITEM_ACCESSOR, "#slot_8");
                setTimeout(function (){
                    set_filter('amethyst bar');
                    triggerDragAndDrop(ITEM_ACCESSOR, "#slot_4");
                    setTimeout(function (){
                        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_7");

                        setTimeout(grab_result, GRAB_DELAY);
                    }, ITEM_WINDOW_DELAY);
                }, ITEM_WINDOW_DELAY);
            }, ITEM_WINDOW_DELAY);
        }, ITEM_WINDOW_DELAY);
    }, ITEM_WINDOW_DELAY);
}
/* End Crafts */

function disable_quick_craft_buttons() {
    $(".quick_craft_button").prop("disabled",true);
    $(".quick_craft_button").addClass("disabled");
}

function enable_quick_craft_buttons() {
    console.log('made it');
    setTimeout(function() {
        console.log('made it 2')
        $(".quick_craft_button").prop("disabled",false);
        $(".quick_craft_button").removeClass("disabled");

        next_button_lockout_delay = BUTTON_LOCKOUT_DELAY;
    }, next_button_lockout_delay);

}

function grab_result() {
    if (RETRIEVE_ITEMS === true) {
        triggerDragAndDrop("#CraftingResult li", "#items-wrapper");

        setTimeout(function (){clear_crafting_area()}, ITEM_WINDOW_DELAY);

        build_craft_list();
    } else {
        alert('Test mode is on. Turn RETRIEVE_ITEMS to true in the script to turn on automated craft retrieval. You may grab the craft result but there are visual (only) errors with doing so, and you have to refresh each craft.');
    }
}

function open_crafting_submenu(craft_name) {
}

(function() {
    'use strict';

    $("#crafting_recipes").before(
        '<div id="quick-crafter" style="border: 1px solid #fff;margin-bottom: 17px;display: block;clear: both;position:relative;background-color:rgba(0,0,0,.7);padding:5px;"></div>');

    $("#quick-crafter").append("<p>Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better experience.");
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
//     $("#quick-crafter").append('<button style="margin-top:3px;margin-right:5px;background-color: black;" id="test_filter_by_id">Test</button>');
//
//     $("#test_filter_by_id").click(function() {
//        set_filter('00112');
//     });

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

    console.log(ingredients);
    build_on_hand();
    console.log(onHand);
    build_craft_list();
    console.log(craftList);

    $("#clear_button").click(function() {
        next_button_lockout_delay = ITEM_WINDOW_DELAY;
        disable_quick_craft_buttons();

        clear_crafting_area();

        enable_quick_craft_buttons();
    });

    $("#shards_tube").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_glass_shards_from_tube();

        enable_quick_craft_buttons();
    });
    $("#shards_sand").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_glass_shards_from_sand();

        enable_quick_craft_buttons();
    });
    $("#test_tube").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_glass_test_tube();

        enable_quick_craft_buttons();
    });
    $("#vial").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_glass_vial();

        enable_quick_craft_buttons();
    });
    $("#bowl").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_glass_bowl();

        enable_quick_craft_buttons();
    });
    $("#dust_vial").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_glass_dust_vial();

        enable_quick_craft_buttons();
    });
    $("#dust_bowl").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_glass_dust_bowl();

        enable_quick_craft_buttons();
    });

    $("#upload_potion_sampler").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_upload_potion_sampler();

        enable_quick_craft_buttons();
    });
    $("#small_upload_potion").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_small_upload_potion();

        enable_quick_craft_buttons();
    });
    $("#upload_potion").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_upload_potion();

        enable_quick_craft_buttons();
    });
    $("#large_upload_potion").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_large_upload_potion();

        enable_quick_craft_buttons();
    });

    $("#download_potion_sampler").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_download_potion_sampler();

        enable_quick_craft_buttons();
    });
    $("#small_download_potion").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_small_download_potion();

        enable_quick_craft_buttons();
    });
    $("#download_potion").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_download_potion();

        enable_quick_craft_buttons();
    });
    $("#large_download_potion").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_large_download_potion();

        enable_quick_craft_buttons();
    });

    $("#garlic_tincture").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_garlic_tincture();

        enable_quick_craft_buttons();
    });

    $("#impure_bronze_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_impure_bronze_bar();

        enable_quick_craft_buttons();
    });
    $("#bronze_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_bronze_bar();

        enable_quick_craft_buttons();
    });
    $("#iron_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_iron_bar();

        enable_quick_craft_buttons();
    });
    $("#steel_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_steel_bar();

        enable_quick_craft_buttons();
    });
    $("#steel_bar_from_iron_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_steel_bar_from_iron_bar();

        enable_quick_craft_buttons();
    });
    $("#gold_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_gold_bar();

        enable_quick_craft_buttons();
    });
    $("#mithril_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_mithril_bar();

        enable_quick_craft_buttons();
    });
    $("#adamantium_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_adamantium_bar();

        enable_quick_craft_buttons();
    });
    $("#quartz_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_quartz_bar();

        enable_quick_craft_buttons();
    });
    $("#jade_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_jade_bar();

        enable_quick_craft_buttons();
    });
    $("#amethyst_bar").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_amethyst_bar();

        enable_quick_craft_buttons();
    });

    $("#small_luck_potion").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_small_luck_potion();

        enable_quick_craft_buttons();
    });
    $("#large_luck_potion").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_large_luck_potion();

        enable_quick_craft_buttons();
    });

    $("#ruby_grained_baguette").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_ruby_grained_baguette();

        enable_quick_craft_buttons();
    });
    $("#emerald_grained_baguette").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_emerald_grained_baguette();

        enable_quick_craft_buttons();
    });
    $("#garlic_ruby_baguette").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_garlic_ruby_baguette();

        enable_quick_craft_buttons();
    });
    $("#garlic_emerald_baguette").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_garlic_emerald_baguette();

        enable_quick_craft_buttons();
    });
    $("#artisan_ruby_baguette").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_artisan_ruby_baguette();

        enable_quick_craft_buttons();
    });
    $("#artisan_emerald_baguette").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_artisan_emerald_baguette();

        enable_quick_craft_buttons();
    });
    $("#gazellian_emerald_baguette").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_gazellian_emerald_baguette();

        enable_quick_craft_buttons();
    });

    $("#carbon_crystalline_quartz_gem").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_carbon_crystalline_quartz_gem();

        enable_quick_craft_buttons();
    });
    $("#carbon_crystalline_quartz_necklace").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_carbon_crystalline_quartz_necklace();

        enable_quick_craft_buttons();
    });
    $("#exquisite_constellation_emeralds").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_exquisite_constellation_emeralds();

        enable_quick_craft_buttons();
    });
    $("#exquisite_constellation_sapphires").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_exquisite_constellation_sapphires();

        enable_quick_craft_buttons();
    });
    $("#exquisite_constellation_rubies").click(function() {
        disable_quick_craft_buttons();

        clear_crafting_area();

        craft_exquisite_constellation_rubies();

        enable_quick_craft_buttons();
    });
})();
