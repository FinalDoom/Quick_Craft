// ==UserScript==
// @name         GGn Quick Crafter
// @namespace    http://tampermonkey.net/
// @version      1.0.1b
// @description  Craft multiple items easier
// @author       KingKrab23
// @match        https://gazellegames.net/user.php?action=crafting
// @grant        none
// @require      https://code.jquery.com/jquery-1.7.2.min.js
// @require      https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js
// ==/UserScript==

const VERSION = '1.0.1b';
const ITEM_ACCESSOR = ".item:not(.hidden)";

/* >>>BEGIN<<< User adjustable variables
 * ONLY ADJUST THESE IF YOU KNOW WHAT YOU'RE DOING
 * Too little of a delay will cause more visual bugs */
const RETRIEVE_ITEMS = false; // set to true to automatically grab crafted items.
const BUTTON_LOCKOUT_DELAY = 4300;
const ITEM_WINDOW_DELAY = 500;
const GRAB_DELAY = 1000;

/* >>>END<<< user adjustable variables */

/* Used to specify the clear button lockout time only at this time */
var next_button_lockout_delay = BUTTON_LOCKOUT_DELAY;

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.disabled { background-color: #333 !important; color: #666 !important; }';
document.getElementsByTagName('head')[0].appendChild(style);

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
        triggerDragAndDrop(ITEM_ACCESSOR, "#slot_3");

        setTimeout(function (){
            triggerDragAndDrop(ITEM_ACCESSOR, "#slot_5");

            setTimeout(grab_result, GRAB_DELAY);
        }, ITEM_WINDOW_DELAY);
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
    } else {
        alert('Test mode is on. Turn RETRIEVE_ITEMS to true in the script to turn on automated retrieval. You may grab the craft result but there are visual (only) errors with doing so, and you may have to refresh after each craft.');
    }
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

    $("#clear_button").click(function() {
        next_button_lockout_delay = ITEM_WINDOW_DELAY;
        disable_quick_craft_buttons();

        clear_crafting_area();

        enable_quick_craft_buttons();
    });

    $("#shards_tube").click(function() {
        disable_quick_craft_buttons();

        craft_glass_shards_from_tube();

        enable_quick_craft_buttons();
    });
    $("#shards_sand").click(function() {
        disable_quick_craft_buttons();

        craft_glass_shards_from_sand();

        enable_quick_craft_buttons();
    });
    $("#test_tube").click(function() {
        disable_quick_craft_buttons();

        craft_glass_test_tube();

        enable_quick_craft_buttons();
    });
    $("#vial").click(function() {
        disable_quick_craft_buttons();

        craft_glass_vial();

        enable_quick_craft_buttons();
    });
    $("#bowl").click(function() {
        disable_quick_craft_buttons();

        craft_glass_bowl();

        enable_quick_craft_buttons();
    });
    $("#dust_vial").click(function() {
        disable_quick_craft_buttons();

        craft_glass_dust_vial();

        enable_quick_craft_buttons();
    });
    $("#dust_bowl").click(function() {
        disable_quick_craft_buttons();

        craft_glass_dust_bowl();

        enable_quick_craft_buttons();
    });

    $("#upload_potion_sampler").click(function() {
        disable_quick_craft_buttons();

        craft_upload_potion_sampler();

        enable_quick_craft_buttons();
    });
    $("#small_upload_potion").click(function() {
        disable_quick_craft_buttons();

        craft_small_upload_potion();

        enable_quick_craft_buttons();
    });
    $("#upload_potion").click(function() {
        disable_quick_craft_buttons();

        craft_upload_potion();

        enable_quick_craft_buttons();
    });
    $("#large_upload_potion").click(function() {
        disable_quick_craft_buttons();

        craft_large_upload_potion();

        enable_quick_craft_buttons();
    });

    $("#download_potion_sampler").click(function() {
        disable_quick_craft_buttons();

        craft_download_potion_sampler();

        enable_quick_craft_buttons();
    });
    $("#small_download_potion").click(function() {
        disable_quick_craft_buttons();

        craft_small_download_potion();

        enable_quick_craft_buttons();
    });
    $("#download_potion").click(function() {
        disable_quick_craft_buttons();

        craft_download_potion();

        enable_quick_craft_buttons();
    });
    $("#large_download_potion").click(function() {
        disable_quick_craft_buttons();

        craft_large_download_potion();

        enable_quick_craft_buttons();
    });

    $("#garlic_tincture").click(function() {
        disable_quick_craft_buttons();

        craft_garlic_tincture();

        enable_quick_craft_buttons();
    });

    $("#impure_bronze_bar").click(function() {
        disable_quick_craft_buttons();

        craft_impure_bronze_bar();

        enable_quick_craft_buttons();
    });
    $("#bronze_bar").click(function() {
        disable_quick_craft_buttons();

        craft_bronze_bar();

        enable_quick_craft_buttons();
    });
    $("#iron_bar").click(function() {
        disable_quick_craft_buttons();

        craft_iron_bar();

        enable_quick_craft_buttons();
    });
    $("#steel_bar").click(function() {
        disable_quick_craft_buttons();

        craft_steel_bar();

        enable_quick_craft_buttons();
    });
    $("#steel_bar_from_iron_bar").click(function() {
        disable_quick_craft_buttons();

        craft_steel_bar_from_iron_bar();

        enable_quick_craft_buttons();
    });
    $("#gold_bar").click(function() {
        disable_quick_craft_buttons();

        craft_gold_bar();

        enable_quick_craft_buttons();
    });
    $("#mithril_bar").click(function() {
        disable_quick_craft_buttons();

        craft_mithril_bar();

        enable_quick_craft_buttons();
    });
    $("#adamantium_bar").click(function() {
        disable_quick_craft_buttons();

        craft_adamantium_bar();

        enable_quick_craft_buttons();
    });
    $("#quartz_bar").click(function() {
        disable_quick_craft_buttons();

        craft_quartz_bar();

        enable_quick_craft_buttons();
    });
    $("#jade_bar").click(function() {
        disable_quick_craft_buttons();

        craft_jade_bar();

        enable_quick_craft_buttons();
    });
    $("#amethyst_bar").click(function() {
        disable_quick_craft_buttons();

        craft_amethyst_bar();

        enable_quick_craft_buttons();
    });

    $("#small_luck_potion").click(function() {
        disable_quick_craft_buttons();

        craft_small_luck_potion();

        enable_quick_craft_buttons();
    });
    $("#large_luck_potion").click(function() {
        disable_quick_craft_buttons();

        craft_large_luck_potion();

        enable_quick_craft_buttons();
    });

    $("#ruby_grained_baguette").click(function() {
        disable_quick_craft_buttons();

        craft_ruby_grained_baguette();

        enable_quick_craft_buttons();
    });
    $("#emerald_grained_baguette").click(function() {
        disable_quick_craft_buttons();

        craft_emerald_grained_baguette();

        enable_quick_craft_buttons();
    });
    $("#garlic_ruby_baguette").click(function() {
        disable_quick_craft_buttons();

        craft_garlic_ruby_baguette();

        enable_quick_craft_buttons();
    });
    $("#garlic_emerald_baguette").click(function() {
        disable_quick_craft_buttons();

        craft_garlic_emerald_baguette();

        enable_quick_craft_buttons();
    });
    $("#artisan_ruby_baguette").click(function() {
        disable_quick_craft_buttons();

        craft_artisan_ruby_baguette();

        enable_quick_craft_buttons();
    });
    $("#artisan_emerald_baguette").click(function() {
        disable_quick_craft_buttons();

        craft_artisan_emerald_baguette();

        enable_quick_craft_buttons();
    });
    $("#gazellian_emerald_baguette").click(function() {
        disable_quick_craft_buttons();

        craft_gazellian_emerald_baguette();

        enable_quick_craft_buttons();
    });

    $("#carbon_crystalline_quartz_gem").click(function() {
        disable_quick_craft_buttons();

        craft_carbon_crystalline_quartz_gem();

        enable_quick_craft_buttons();
    });
    $("#carbon_crystalline_quartz_necklace").click(function() {
        disable_quick_craft_buttons();

        craft_carbon_crystalline_quartz_necklace();

        enable_quick_craft_buttons();
    });
    $("#exquisite_constellation_emeralds").click(function() {
        disable_quick_craft_buttons();

        craft_exquisite_constellation_emeralds();

        enable_quick_craft_buttons();
    });
    $("#exquisite_constellation_sapphires").click(function() {
        disable_quick_craft_buttons();

        craft_exquisite_constellation_sapphires();

        enable_quick_craft_buttons();
    });
    $("#exquisite_constellation_rubies").click(function() {
        disable_quick_craft_buttons();

        craft_exquisite_constellation_rubies();

        enable_quick_craft_buttons();
    });
})();
