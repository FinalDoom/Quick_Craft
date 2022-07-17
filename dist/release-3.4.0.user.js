// ==UserScript==
// @name        GGn Quick Crafter
// @description Craft multiple items more easily including equipment repair
// @namespace   https://gazellegames.net/
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require     https://unpkg.com/lunr/lunr.js
// @require     https://unpkg.com/react@18/umd/react.development.js
// @require     https://unpkg.com/react-dom@18/umd/react-dom.development.js
// @match       https://gazellegames.net/user.php?action=crafting
// @version     3.4.0
// @author      FinalDoom
// @license     ISC
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.deleteValue
// ==/UserScript==

/*
ISC License

Copyright (c) 2022 FinalDoom

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
*/

/* globals lunr, React, ReactDOM */
(function (React, require$$0, lunr) {
  'use strict';

  

  function ___$insertStylesToHeader(css) {
    if (!css) {
      return
    }
    if (typeof window === 'undefined') {
      return
    }

    const style = document.createElement('style');

    style.setAttribute('type', 'text/css');
    style.innerHTML = css;
    document.head.appendChild(style);
    return css
  }

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
  var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
  var lunr__default = /*#__PURE__*/_interopDefaultLegacy(lunr);

  ___$insertStylesToHeader(".crafting-clear {\n  clear: both;\n  margin-bottom: 1rem;\n}\n\n#quick-crafter {\n  display: block;\n  margin: 0 auto 1rem;\n  background-color: rgba(19, 9, 0, 0.7);\n  padding: 5px;\n  width: 100%;\n  max-width: 1100px;\n  min-width: 200px;\n}\n\n.crafting-panel {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  margin-bottom: 1rem;\n  text-align: center;\n}\n.crafting-panel__title {\n  margin-bottom: 0.5rem;\n}\n\n.crafting-panel-info__ingredients-header {\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n.crafting-panel-info__ingredients-column {\n  display: flex;\n  flex-direction: column;\n}\n.crafting-panel-info__ingredient-row {\n  display: flex;\n  flex-direction: row;\n  gap: 0.25rem;\n  align-items: center;\n  align-self: center;\n}\n.crafting-panel-info__ingredient-shop-link {\n  border-radius: 50%;\n  background-color: orange;\n  color: black;\n  padding: 0 0.25rem;\n}\n.crafting-panel-info__ingredient-quantity {\n  display: inline-flex;\n}\n.crafting-panel-info:not(.crafting-panel-info__ingredient-quantity--swapped) .crafting-panel-info__ingredient-quantity {\n  flex-direction: row;\n}\n.crafting-panel-info__ingredient-quantity--swapped .crafting-panel-info__ingredient-quantity {\n  flex-direction: row-reverse;\n}\n.crafting-panel-info__ingredient--purchasable {\n  color: lightGreen;\n}\n.crafting-panel-info__ingredients-max {\n  margin-bottom: 1rem;\n}\n.crafting-panel-info__ingredients-max span {\n  margin-left: 5px;\n}\n\n.crafting-panel-actions {\n  display: flex;\n  flex-direction: row;\n  gap: 0.25rem;\n  text-align: center;\n  align-items: center;\n  align-self: center;\n  margin-bottom: 1rem;\n}\n.crafting-panel-actions__craft-row {\n  display: flex;\n  flex-direction: row;\n  gap: 0.25rem;\n  align-items: center;\n}\n.crafting-panel-actions__max-craft-button {\n  margin-left: 2rem;\n  background-color: orange;\n}\n.crafting-panel-actions__max-craft-button--confirm {\n  background-color: red;\n}\n.crafting-panel-actions__clear-craft-button {\n  border-radius: 3px;\n  border: none;\n  padding: 2px 5px;\n  background: gray;\n  margin-top: 1rem;\n  background-color: red;\n}\n\n.crafting-panel-filters {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  gap: 0.5rem;\n  margin-bottom: 0.125rem;\n}\n\n.crafting-panel-filters__books {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.crafting-panel-filters__books-row {\n  display: flex;\n  flex-direction: row;\n  gap: 0.25rem;\n  margin-bottom: 2rem;\n  align-items: center;\n}\n.crafting-panel-filters__books-button {\n  opacity: 0.4;\n}\n.crafting-panel-filters__books-button, .crafting-panel-filters__books-show, .crafting-panel-filters__books-hide {\n  border-radius: 3px;\n  border: none;\n  padding: 2px 5px;\n  background: gray;\n}\n.crafting-panel-filters__books-button input, .crafting-panel-filters__books-show input, .crafting-panel-filters__books-hide input {\n  display: none;\n}\n.crafting-panel-filters__books-button--selected, .crafting-panel-filters__books-show--selected, .crafting-panel-filters__books-hide--selected {\n  opacity: 1;\n}\n.crafting-panel-filters__books-show {\n  background-color: green;\n}\n.crafting-panel-filters__books-hide {\n  background-color: red;\n}\n.crafting-panel-filters__books-button--repair {\n  border: 1px solid green;\n  border-width: 2px;\n}\n.crafting-panel-filters__books-button--downgrade {\n  border: 1px solid red;\n  border-width: 2px;\n}\n.crafting-panel-filters__books-button--upgrade {\n  border: 1px solid purple;\n  border-width: 2px;\n}\n.crafting-panel-filters__books-button--book-potions {\n  background-color: green;\n  color: white;\n}\n.crafting-panel-filters__books-button--book-glass {\n  background-color: white;\n  color: black;\n}\n.crafting-panel-filters__books-button--book-material-bars {\n  background-color: purple;\n  color: white;\n}\n.crafting-panel-filters__books-button--book-armor {\n  background-color: darkblue;\n  color: white;\n}\n.crafting-panel-filters__books-button--book-xmas-crafting {\n  background-color: red;\n  color: lightgreen;\n}\n.crafting-panel-filters__books-button--book-jewelry {\n  background-color: deeppink;\n  color: white;\n}\n.crafting-panel-filters__books-button--book-food {\n  background-color: wheat;\n  color: black;\n}\n.crafting-panel-filters__books-button--book-halloween {\n  background-color: gray;\n  color: black;\n}\n.crafting-panel-filters__books-button--book-trading-decks {\n  background-color: #15273f;\n  color: white;\n}\n.crafting-panel-filters__books-button--book-bling {\n  background-color: gold;\n  color: darkgray;\n}\n.crafting-panel-filters__books-button--book-weapons {\n  background-color: darkred;\n  color: white;\n}\n.crafting-panel-filters__books-button--book-recasting {\n  background-color: gray;\n  color: white;\n}\n.crafting-panel-filters__books-button--book-adventure-club {\n  background-color: yellow;\n  color: black;\n}\n.crafting-panel-filters__books-button--book-birthday {\n  background-color: darkgray;\n  color: gold;\n}\n.crafting-panel-filters__books-button--book-pets {\n  background-color: brown;\n  color: beige;\n}\n.crafting-panel-filters__books-button--book-valentines {\n  background-color: pink;\n  color: deeppink;\n}\n\n.recipe-buttons {\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 1rem;\n}\n.recipe-buttons--book-sort {\n  display: flex;\n  flex-direction: column;\n}\n.recipe-buttons--book-sort.recipe-buttons--extra-space {\n  gap: 1rem;\n}\n.recipe-buttons__book-section {\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n}\n.recipe-buttons__book-section--disabled {\n  display: none;\n}\n\n.recipes__recipe {\n  border-radius: 3px;\n  border: none;\n  padding: 2px 5px;\n  background: gray;\n  border: 2px solid transparent;\n}\n.recipes__recipe--repair {\n  border: 1px solid green;\n  border-width: 2px;\n}\n.recipes__recipe--downgrade {\n  border: 1px solid red;\n  border-width: 2px;\n}\n.recipes__recipe--upgrade {\n  border: 1px solid purple;\n  border-width: 2px;\n}\n.recipes__recipe--book-potions {\n  background-color: green;\n  color: white;\n}\n.recipes__recipe--book-glass {\n  background-color: white;\n  color: black;\n}\n.recipes__recipe--book-material-bars {\n  background-color: purple;\n  color: white;\n}\n.recipes__recipe--book-armor {\n  background-color: darkblue;\n  color: white;\n}\n.recipes__recipe--book-xmas-crafting {\n  background-color: red;\n  color: lightgreen;\n}\n.recipes__recipe--book-jewelry {\n  background-color: deeppink;\n  color: white;\n}\n.recipes__recipe--book-food {\n  background-color: wheat;\n  color: black;\n}\n.recipes__recipe--book-halloween {\n  background-color: gray;\n  color: black;\n}\n.recipes__recipe--book-trading-decks {\n  background-color: #15273f;\n  color: white;\n}\n.recipes__recipe--book-bling {\n  background-color: gold;\n  color: darkgray;\n}\n.recipes__recipe--book-weapons {\n  background-color: darkred;\n  color: white;\n}\n.recipes__recipe--book-recasting {\n  background-color: gray;\n  color: white;\n}\n.recipes__recipe--book-adventure-club {\n  background-color: yellow;\n  color: black;\n}\n.recipes__recipe--book-birthday {\n  background-color: darkgray;\n  color: gold;\n}\n.recipes__recipe--book-pets {\n  background-color: brown;\n  color: beige;\n}\n.recipes__recipe--book-valentines {\n  background-color: pink;\n  color: deeppink;\n}\n.recipes__recipe input {\n  display: none;\n}\n.recipes__recipe--selected {\n  background-image: linear-gradient(rgba(255, 255, 255, 0.4) 0 0);\n}\n.recipes__recipe:focus {\n  border: 2px solid red;\n}\n\n.disabled {\n  background-color: #333 !important;\n  color: #666 !important;\n  pointer-events: none;\n}\n\na.disabled {\n  pointer-events: none;\n}\n\n.credits {\n  float: right;\n  margin-top: -20px;\n  margin-right: 5px;\n}");

  var createRoot;

  var m = require$$0__default["default"];

  {
    createRoot = m.createRoot;
    m.hydrateRoot;
  }

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  }
  function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
  }

  const universal = typeof globalThis !== "undefined" ? globalThis : global;
  const performance = universal.performance;

  // see http://nodejs.org/api/process.html#process_process_hrtime

  function hrtime(previousTimestamp) {
    const clocktime = performance.now() * 1e-3;
    let seconds = Math.floor(clocktime);
    let nanoseconds = Math.floor(clocktime % 1 * 1e9);

    if (previousTimestamp != undefined) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];

      if (nanoseconds < 0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }

    return [seconds, nanoseconds];
  } // The current timestamp in whole milliseconds


  function getMilliseconds() {
    const [seconds, nanoseconds] = hrtime();
    return seconds * 1e3 + Math.floor(nanoseconds / 1e6);
  } // Wait for a specified number of milliseconds before fulfilling the returned promise.

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * A hierarchical token bucket for rate limiting. See
   * http://en.wikipedia.org/wiki/Token_bucket for more information.
   *
   * @param options
   * @param options.bucketSize Maximum number of tokens to hold in the bucket.
   *  Also known as the burst rate.
   * @param options.tokensPerInterval Number of tokens to drip into the bucket
   *  over the course of one interval.
   * @param options.interval The interval length in milliseconds, or as
   *  one of the following strings: 'second', 'minute', 'hour', day'.
   * @param options.parentBucket Optional. A token bucket that will act as
   *  the parent of this bucket.
   */

  class TokenBucket {
    constructor({
      bucketSize,
      tokensPerInterval,
      interval,
      parentBucket
    }) {
      this.bucketSize = bucketSize;
      this.tokensPerInterval = tokensPerInterval;

      if (typeof interval === "string") {
        switch (interval) {
          case "sec":
          case "second":
            this.interval = 1000;
            break;

          case "min":
          case "minute":
            this.interval = 1000 * 60;
            break;

          case "hr":
          case "hour":
            this.interval = 1000 * 60 * 60;
            break;

          case "day":
            this.interval = 1000 * 60 * 60 * 24;
            break;

          default:
            throw new Error("Invalid interval " + interval);
        }
      } else {
        this.interval = interval;
      }

      this.parentBucket = parentBucket;
      this.content = 0;
      this.lastDrip = getMilliseconds();
    }
    /**
     * Remove the requested number of tokens. If the bucket (and any parent
     * buckets) contains enough tokens this will happen immediately. Otherwise,
     * the removal will happen when enough tokens become available.
     * @param count The number of tokens to remove.
     * @returns A promise for the remainingTokens count.
     */


    async removeTokens(count) {
      // Is this an infinite size bucket?
      if (this.bucketSize === 0) {
        return Number.POSITIVE_INFINITY;
      } // Make sure the bucket can hold the requested number of tokens


      if (count > this.bucketSize) {
        throw new Error(`Requested tokens ${count} exceeds bucket size ${this.bucketSize}`);
      } // Drip new tokens into this bucket


      this.drip();

      const comeBackLater = async () => {
        // How long do we need to wait to make up the difference in tokens?
        const waitMs = Math.ceil((count - this.content) * (this.interval / this.tokensPerInterval));
        await wait(waitMs);
        return this.removeTokens(count);
      }; // If we don't have enough tokens in this bucket, come back later


      if (count > this.content) return comeBackLater();

      if (this.parentBucket != undefined) {
        // Remove the requested from the parent bucket first
        const remainingTokens = await this.parentBucket.removeTokens(count); // Check that we still have enough tokens in this bucket

        if (count > this.content) return comeBackLater(); // Tokens were removed from the parent bucket, now remove them from
        // this bucket. Note that we look at the current bucket and parent
        // bucket's remaining tokens and return the smaller of the two values

        this.content -= count;
        return Math.min(remainingTokens, this.content);
      } else {
        // Remove the requested tokens from this bucket
        this.content -= count;
        return this.content;
      }
    }
    /**
     * Attempt to remove the requested number of tokens and return immediately.
     * If the bucket (and any parent buckets) contains enough tokens this will
     * return true, otherwise false is returned.
     * @param {Number} count The number of tokens to remove.
     * @param {Boolean} True if the tokens were successfully removed, otherwise
     *  false.
     */


    tryRemoveTokens(count) {
      // Is this an infinite size bucket?
      if (!this.bucketSize) return true; // Make sure the bucket can hold the requested number of tokens

      if (count > this.bucketSize) return false; // Drip new tokens into this bucket

      this.drip(); // If we don't have enough tokens in this bucket, return false

      if (count > this.content) return false; // Try to remove the requested tokens from the parent bucket

      if (this.parentBucket && !this.parentBucket.tryRemoveTokens(count)) return false; // Remove the requested tokens from this bucket and return

      this.content -= count;
      return true;
    }
    /**
     * Add any new tokens to the bucket since the last drip.
     * @returns {Boolean} True if new tokens were added, otherwise false.
     */


    drip() {
      if (this.tokensPerInterval === 0) {
        const prevContent = this.content;
        this.content = this.bucketSize;
        return this.content > prevContent;
      }

      const now = getMilliseconds();
      const deltaMS = Math.max(now - this.lastDrip, 0);
      this.lastDrip = now;
      const dripAmount = deltaMS * (this.tokensPerInterval / this.interval);
      const prevContent = this.content;
      this.content = Math.min(this.content + dripAmount, this.bucketSize);
      return Math.floor(this.content) > Math.floor(prevContent);
    }

  }

  /**
   * A generic rate limiter. Underneath the hood, this uses a token bucket plus
   * an additional check to limit how many tokens we can remove each interval.
   *
   * @param options
   * @param options.tokensPerInterval Maximum number of tokens that can be
   *  removed at any given moment and over the course of one interval.
   * @param options.interval The interval length in milliseconds, or as
   *  one of the following strings: 'second', 'minute', 'hour', day'.
   * @param options.fireImmediately Whether or not the promise will resolve
   *  immediately when rate limiting is in effect (default is false).
   */

  class RateLimiter {
    constructor({
      tokensPerInterval,
      interval,
      fireImmediately
    }) {
      this.tokenBucket = new TokenBucket({
        bucketSize: tokensPerInterval,
        tokensPerInterval,
        interval
      }); // Fill the token bucket to start

      this.tokenBucket.content = tokensPerInterval;
      this.curIntervalStart = getMilliseconds();
      this.tokensThisInterval = 0;
      this.fireImmediately = fireImmediately !== null && fireImmediately !== void 0 ? fireImmediately : false;
    }
    /**
     * Remove the requested number of tokens. If the rate limiter contains enough
     * tokens and we haven't spent too many tokens in this interval already, this
     * will happen immediately. Otherwise, the removal will happen when enough
     * tokens become available.
     * @param count The number of tokens to remove.
     * @returns A promise for the remainingTokens count.
     */


    async removeTokens(count) {
      // Make sure the request isn't for more than we can handle
      if (count > this.tokenBucket.bucketSize) {
        throw new Error(`Requested tokens ${count} exceeds maximum tokens per interval ${this.tokenBucket.bucketSize}`);
      }

      const now = getMilliseconds(); // Advance the current interval and reset the current interval token count
      // if needed

      if (now < this.curIntervalStart || now - this.curIntervalStart >= this.tokenBucket.interval) {
        this.curIntervalStart = now;
        this.tokensThisInterval = 0;
      } // If we don't have enough tokens left in this interval, wait until the
      // next interval


      if (count > this.tokenBucket.tokensPerInterval - this.tokensThisInterval) {
        if (this.fireImmediately) {
          return -1;
        } else {
          const waitMs = Math.ceil(this.curIntervalStart + this.tokenBucket.interval - now);
          await wait(waitMs);
          const remainingTokens = await this.tokenBucket.removeTokens(count);
          this.tokensThisInterval += count;
          return remainingTokens;
        }
      } // Remove the requested number of tokens from the token bucket


      const remainingTokens = await this.tokenBucket.removeTokens(count);
      this.tokensThisInterval += count;
      return remainingTokens;
    }
    /**
     * Attempt to remove the requested number of tokens and return immediately.
     * If the bucket (and any parent buckets) contains enough tokens and we
     * haven't spent too many tokens in this interval already, this will return
     * true. Otherwise, false is returned.
     * @param {Number} count The number of tokens to remove.
     * @param {Boolean} True if the tokens were successfully removed, otherwise
     *  false.
     */


    tryRemoveTokens(count) {
      // Make sure the request isn't for more than we can handle
      if (count > this.tokenBucket.bucketSize) return false;
      const now = getMilliseconds(); // Advance the current interval and reset the current interval token count
      // if needed

      if (now < this.curIntervalStart || now - this.curIntervalStart >= this.tokenBucket.interval) {
        this.curIntervalStart = now;
        this.tokensThisInterval = 0;
      } // If we don't have enough tokens left in this interval, return false


      if (count > this.tokenBucket.tokensPerInterval - this.tokensThisInterval) return false; // Try to remove the requested number of tokens from the token bucket

      const removed = this.tokenBucket.tryRemoveTokens(count);

      if (removed) {
        this.tokensThisInterval += count;
      }

      return removed;
    }
    /**
     * Returns the number of tokens remaining in the TokenBucket.
     * @returns {Number} The number of tokens remaining.
     */


    getTokensRemaining() {
      this.tokenBucket.drip();
      return this.tokenBucket.content;
    }

  }

  // prettier-ignore
  var INGREDIENTS = {
      46: { name: 'Obsidian Plate Armor', image: 'static/common/items/Cover/Armor/2_black.png', category: 'Equipment', gold: 600, infStock: true },
      66: { name: 'Upload Potion Sampler', image: 'static/common/items/Items/Potions/sample_green.png', category: 'Stat potions', gold: 2500, infStock: true },
      72: { name: 'IRC Voice (2 Weeks)', image: 'static/common/items/Items/Buff/irc_voice_cheap.png', category: 'IRC customizations', gold: 10000, infStock: true },
      98: { name: 'Small Upload Potion', image: 'static/common/items/Items/Potions/small_green.png', category: 'Stat potions', gold: 5000, infStock: true },
      99: { name: 'Upload Potion', image: 'static/common/items/Items/Potions/green.png', category: 'Stat potions', gold: 10000, infStock: true },
      100: { name: 'Large Upload Potion', image: 'static/common/items/Items/Potions/large_green.png', category: 'Stat potions', gold: 25000, infStock: true },
      104: { name: 'Download-Reduction Potion Sampler', image: 'static/common/items/Items/Potions/sample_red.png', category: 'Stat potions', gold: 3000, infStock: true },
      105: { name: 'Small Download-Reduction Potion', image: 'static/common/items/Items/Potions/small_red.png', category: 'Stat potions', gold: 6000, infStock: true },
      106: { name: 'Download-Reduction Potion', image: 'static/common/items/Items/Potions/red.png', category: 'Stat potions', gold: 12000, infStock: true },
      107: { name: 'Large Download-Reduction Potion', image: 'static/common/items/Items/Potions/large_red.png', category: 'Stat potions', gold: 30000, infStock: true },
      111: { name: 'Purple Angelica Flowers', image: 'static/common/items/Items/Plants/angelica_flowers.png', category: 'Crafting Materials', gold: 2000, infStock: true },
      112: { name: 'Head of Garlic', image: 'static/common/items/Items/Plants/garlic.png', category: 'Crafting Materials', gold: 1000, infStock: false },
      113: { name: 'Yellow Hellebore Flower', image: 'static/common/items/Items/Plants/hellebore_flower.png', category: 'Crafting Materials', gold: 2500, infStock: true },
      114: { name: 'Black Elderberries', image: 'static/common/items/Items/Plants/black_elder_berries.png', category: 'Crafting Materials', gold: 2000, infStock: true },
      115: { name: 'Black Elder Leaves', image: 'static/common/items/Items/Plants/black_elder_leaves.png', category: 'Crafting Materials', gold: 1600, infStock: true },
      116: { name: 'Emerald', image: 'static/common/items/Items/Gems/emerald.png', category: 'Crafting Materials', gold: 10000, infStock: true },
      120: { name: 'Green Onyx Gem', image: 'static/common/items/Items/Gems/green_onyx.png', category: 'Crafting Materials', gold: 20000, infStock: true },
      121: { name: 'Flawless Amethyst', image: 'static/common/items/Items/Gems/flawless_amethyst.png', category: 'Crafting Materials', gold: 200000, infStock: true },
      124: { name: 'Vial', image: 'static/common/items/Items/Vials/vial.png', category: 'Crafting Materials', gold: 1000, infStock: true },
      125: { name: 'Test Tube', image: 'static/common/items/Items/Vials/test_tube.png', category: 'Crafting Materials', gold: 400, infStock: true },
      126: { name: 'Bowl', image: 'static/common/items/Items/Vials/bowl.png', category: 'Crafting Materials', gold: 1500, infStock: true },
      127: { name: 'Garlic Tincture', image: 'static/common/items/Items/Plants/garlic_tincture.png', category: 'Crafting Materials', gold: 2000, infStock: true },
      175: { name: 'IRC Voice (2 Weeks) - Low Cost Option', image: 'static/common/items/Items/Buff/irc_voice_cheap.png', category: 'IRC customizations', gold: 5000, infStock: true },
      1987: { name: 'Pile of Sand', image: 'static/common/items/Items/Vials/sand.png', category: 'Crafting Materials', gold: 250, infStock: true },
      1988: { name: 'Glass Shards', image: 'static/common/items/Items/Vials/shards.png', category: 'Crafting Materials', gold: 275, infStock: true },
      2130: { name: "Monarch's Crown", image: 'static/common/items/Cover/Helmet/Helmet__Style_11_Yellow.png', category: 'Equipment', gold: 1500, infStock: true },
      2135: { name: "Lucky Deity's Wings", image: 'static/common/items/Cover/Wings/White_Angel_Wings.png', category: 'Equipment', gold: 2000, infStock: true },
      2153: { name: "Farore's Flame", image: 'static/common/items/Items/Bling/flame_green.png', category: 'Crafting Materials', gold: 150000, infStock: false },
      2154: { name: "Nayru's Flame", image: 'static/common/items/Items/Bling/flame_blue.png', category: 'Crafting Materials', gold: 150000, infStock: false },
      2155: { name: "Din's Flame", image: 'static/common/items/Items/Bling/flame_red.png', category: 'Crafting Materials', gold: 150000, infStock: false },
      2212: { name: 'IRC Voice (8 Weeks)', image: 'static/common/items/Items/Buff/irc_voice_cheap.png', category: 'IRC customizations', gold: 20000, infStock: true },
      2225: { name: 'Bronze Alloy Mix', image: 'static/common/items/Items/Ore/bronze.png', category: 'Crafting Materials', gold: 1000, infStock: false },
      2226: { name: 'Iron Ore', image: 'static/common/items/Items/Ore/iron.png', category: 'Crafting Materials', gold: 2000, infStock: false },
      2227: { name: 'Gold Ore', image: 'static/common/items/Items/Ore/gold.png', category: 'Crafting Materials', gold: 3500, infStock: false },
      2228: { name: 'Mithril Ore', image: 'static/common/items/Items/Ore/mithril.png', category: 'Crafting Materials', gold: 5500, infStock: false },
      2229: { name: 'Adamantium Ore', image: 'static/common/items/Items/Ore/adamantium.png', category: 'Crafting Materials', gold: 16000, infStock: false },
      2230: { name: 'Quartz Dust', image: 'static/common/items/Items/Ore/quartz.png', category: 'Crafting Materials', gold: 1250, infStock: false },
      2231: { name: 'Jade Dust', image: 'static/common/items/Items/Ore/jade.png', category: 'Crafting Materials', gold: 2500, infStock: false },
      2232: { name: 'Amethyst Dust', image: 'static/common/items/Items/Ore/amethyst.png', category: 'Crafting Materials', gold: 8000, infStock: false },
      2233: { name: 'Lump of Coal', image: 'static/common/items/Items/Ore/coal.png', category: 'Crafting Materials', gold: 1250, infStock: true },
      2234: { name: 'Lump of Clay', image: 'static/common/items/Items/Ore/clay.png', category: 'Crafting Materials', gold: 150, infStock: true },
      2235: { name: 'Bronze Bar', image: 'static/common/items/Items/Ore/bronze_bar.png', category: 'Crafting Materials', gold: 2000, infStock: false },
      2236: { name: 'Impure Bronze Bar', image: 'static/common/items/Items/Ore/impure_bronze_bar.png', category: 'Crafting Materials', gold: 1150, infStock: false },
      2237: { name: 'Iron Bar', image: 'static/common/items/Items/Ore/iron_bar.png', category: 'Crafting Materials', gold: 4000, infStock: false },
      2238: { name: 'Steel Bar', image: 'static/common/items/Items/Ore/steel_bar.png', category: 'Crafting Materials', gold: 4500, infStock: false },
      2239: { name: 'Gold Bar', image: 'static/common/items/Items/Ore/gold_bar.png', category: 'Crafting Materials', gold: 7000, infStock: false },
      2240: { name: 'Mithril Bar', image: 'static/common/items/Items/Ore/mithril_bar.png', category: 'Crafting Materials', gold: 11000, infStock: false },
      2241: { name: 'Adamantium Bar', image: 'static/common/items/Items/Ore/adamantium_bar.png', category: 'Crafting Materials', gold: 32000, infStock: false },
      2242: { name: 'Quartz Bar', image: 'static/common/items/Items/Ore/quartz_bar.png', category: 'Crafting Materials', gold: 2500, infStock: false },
      2243: { name: 'Jade Bar', image: 'static/common/items/Items/Ore/jade_bar.png', category: 'Crafting Materials', gold: 5000, infStock: false },
      2244: { name: 'Amethyst Bar', image: 'static/common/items/Items/Ore/amethyst_bar.png', category: 'Crafting Materials', gold: 16000, infStock: false },
      2261: { name: 'Impure Bronze Cuirass', image: 'static/common/items/Cover/Body Armor/Impure_Bronze_Cuirass.png', category: 'Equipment', gold: 2300, infStock: false, equipLife: 2592000 },
      2262: { name: 'Bronze Cuirass', image: 'https://ptpimg.me/3mf3lw.png', category: 'Equipment', gold: 4000, infStock: false, equipLife: 2592000 },
      2263: { name: 'Iron Cuirass', image: 'static/common/items/Cover/Body Armor/Iron_Cuirass.png', category: 'Equipment', gold: 16000, infStock: false, equipLife: 2592000 },
      2264: { name: 'Steel Cuirass', image: 'static/common/items/Cover/Body Armor/Steel_Cuirass.png', category: 'Equipment', gold: 18000, infStock: false, equipLife: 2592000 },
      2265: { name: 'Gold Cuirass', image: 'static/common/items/Cover/Body Armor/Gold_Cuirass.png', category: 'Equipment', gold: 28000, infStock: false, equipLife: 2592000 },
      2266: { name: 'Mithril Cuirass', image: 'static/common/items/Cover/Body Armor/Mithril_Cuirass.png', category: 'Equipment', gold: 55000, infStock: false, equipLife: 2592000 },
      2267: { name: 'Adamantium Cuirass', image: 'static/common/items/Cover/Body Armor/Adamantium_Cuirass.png', category: 'Equipment', gold: 160000, infStock: false, equipLife: 2592000 },
      2268: { name: 'Quartz Chainmail', image: 'static/common/items/Cover/Body Armor/Quartz_Chainmail.png', category: 'Equipment', gold: 5000, infStock: false, equipLife: 2592000 },
      2269: { name: 'Jade Chainmail', image: 'static/common/items/Cover/Body Armor/Jade_Chainmail.png', category: 'Equipment', gold: 20000, infStock: false, equipLife: 2592000 },
      2270: { name: 'Amethyst Chainmail', image: 'static/common/items/Cover/Body Armor/Amethyst_Chainmail.png', category: 'Equipment', gold: 80000, infStock: false, equipLife: 2592000 },
      2295: { name: 'Pile of Snow', image: 'static/common/items/Items/Christmas/snow.png', category: 'Crafting Materials', gold: 700, infStock: true },
      2296: { name: 'Snowball', image: 'static/common/items/Items/Christmas/snowball_small.png', category: 'Crafting Materials', gold: 1400, infStock: false },
      2297: { name: 'Candy Cane', image: 'static/common/items/Items/Christmas/candycane.png', category: 'Crafting Materials', gold: 1000, infStock: true },
      2298: { name: 'Hot Chocolate', image: 'static/common/items/Items/Christmas/hotchoc.png', category: 'Stat potions', gold: 5500, infStock: false },
      2299: { name: 'Peppermint Hot Chocolate', image: 'static/common/items/Items/Christmas/peremint_hotchoc.png', category: 'Stat potions', gold: 6500, infStock: false },
      2300: { name: 'Pile of Charcoal', image: 'static/common/items/Items/Christmas/charcoal.png', category: 'Crafting Materials', gold: 5000, infStock: true },
      2303: { name: 'Hyper Realistic Eggnog', image: 'static/common/items/Items/Christmas/eggnog.png', category: 'Stat potions', gold: 5500, infStock: false },
      2305: { name: 'Large Snowball', image: 'static/common/items/Items/Christmas/snowball.png', category: 'Crafting Materials', gold: 4200, infStock: false },
      2306: { name: 'Carrot', image: 'static/common/items/Items/Christmas/carrot.png', category: 'Crafting Materials', gold: 3500, infStock: true },
      2307: { name: 'Snowman', image: 'static/common/items/Items/Christmas/snowman.png', category: 'Stat potions', gold: 27500, infStock: false },
      2321: { name: 'Gold Power Gloves', image: 'static/common/items/Cover/Gloves/Power_Gloves.png', category: 'Equipment', gold: 105000, infStock: true, equipLife: 2592000 },
      2323: { name: 'Ruby', image: 'static/common/items/Items/Gems/ruby.png', category: 'Crafting Materials', gold: 25000, infStock: true },
      2333: { name: 'Gazelle Pet', image: 'static/common/items/Cover/Pets/gazelle.png', category: 'Equipment', gold: 12000, infStock: false },
      2357: { name: 'The Golden Daedy', image: 'static/common/items/Items/Card/Staff_The_Golden_Daedy.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2358: { name: 'A Wild Artifaxx', image: 'static/common/items/Items/Card/Staff_A_Wild_Artifaxx.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2359: { name: 'A Red Hot Flamed', image: 'static/common/items/Items/Card/Staff_A_Red_Hot_Flamed.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2361: { name: 'Alpaca Out of Nowhere!', image: 'static/common/items/Items/Card/Staff_Alpaca_Out_of_Nowhere.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2364: { name: "thewhale's Kiss", image: 'static/common/items/Items/Card/Staff_thewhales_Kiss.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2365: { name: "Stump's Banhammer", image: 'static/common/items/Items/Card/Staff_Stumps_Banhammer.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2366: { name: "Neo's Ratio Cheats", image: 'static/common/items/Items/Card/Staff_Neos_Ratio_Cheats.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2367: { name: "Niko's Transformation", image: 'static/common/items/Items/Card/Staff_Nikos_Transformation.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2368: { name: 'lepik le prick', image: 'static/common/items/Items/Card/Staff_lepik_le_prick.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2369: { name: 'The Golden Throne', image: 'static/common/items/Items/Card/Staff_The_Golden_Throne.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2370: { name: 'The Biggest Banhammer', image: 'static/common/items/Items/Card/Staff_The_Biggest_Banhammer.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2371: { name: 'The Staff Beauty Parlor', image: 'static/common/items/Items/Card/Staff_The_Staff_Beauty_Parlor.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2372: { name: 'The Realm of Staff', image: 'static/common/items/Items/Card/Staff_The_Realm_of_Staff.png', category: 'Trading Cards', gold: 35000, infStock: false },
      2373: { name: 'Cake', image: 'static/common/items/Items/Card/Portal_Cake.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2374: { name: 'GLaDOS', image: 'static/common/items/Items/Card/Portal_GLaDOS.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2375: { name: 'Companion Cube', image: 'static/common/items/Items/Card/Portal_Companion_Cube.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2376: { name: 'Portal Gun', image: 'static/common/items/Items/Card/Portal_Portal_Gun.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2377: { name: 'A Scared Morty', image: 'static/common/items/Items/Card/Portal_A_Scared_Morty.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2378: { name: 'Rick Sanchez', image: 'static/common/items/Items/Card/Portal_Rick_Sanchez.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2379: { name: 'Mr. Poopy Butthole', image: 'static/common/items/Items/Card/Portal_Mr_Poopy_Butthole.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2380: { name: "Rick's Portal Gun", image: 'static/common/items/Items/Card/Portal_Ricks_Portal_Gun.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2381: { name: 'Nyx class Supercarrier', image: 'static/common/items/Items/Card/Portal_Nyx_class_Supercarrier.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2382: { name: 'Chimera Schematic', image: 'static/common/items/Items/Card/Portal_Chimera_Schematic.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2383: { name: 'Covetor Mining Ship', image: 'static/common/items/Items/Card/Portal_Covetor_Mining_Ship.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2384: { name: 'Space Wormhole', image: 'static/common/items/Items/Card/Portal_Space_Wormhole.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2385: { name: 'Interdimensional Portal', image: 'static/common/items/Items/Card/Portal_Interdimensional_Portal.png', category: 'Trading Cards', gold: 35000, infStock: false },
      2388: { name: "MuffledSilence's Headphones", image: 'static/common/items/Items/Card/Staff_MuffledSilences_Headphones.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2390: { name: 'Mario', image: 'static/common/items/Items/Card/Mario_Mario.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2391: { name: 'Luigi', image: 'static/common/items/Items/Card/Mario_Luigi.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2392: { name: 'Princess Peach', image: 'static/common/items/Items/Card/Mario_Princess_Peach.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2393: { name: 'Toad', image: 'static/common/items/Items/Card/Mario_Toad.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2394: { name: 'Yoshi', image: 'static/common/items/Items/Card/Mario_Yoshi.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2395: { name: 'Bowser', image: 'static/common/items/Items/Card/Mario_Bowser.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2396: { name: 'Goomba', image: 'static/common/items/Items/Card/Mario_Goomba.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2397: { name: 'Koopa Troopa', image: 'static/common/items/Items/Card/Mario_Koopa_Troopa.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2398: { name: 'Wario', image: 'static/common/items/Items/Card/Mario_Wario.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2400: { name: 'LinkinsRepeater Bone Hard Card', image: 'static/common/items/Items/Card/Staff_LinkinsRepeater_Bone_Hard_Card.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2401: { name: 'Super Mushroom', image: 'static/common/items/Items/Card/Mario_Super_Mushroom.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2402: { name: 'Fire Flower', image: 'static/common/items/Items/Card/Mario_Fire_Flower.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2403: { name: 'Penguin Suit', image: 'static/common/items/Items/Card/Mario_Penguin_Suit.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2404: { name: 'Goal Pole', image: 'static/common/items/Items/Card/Mario_Goal_Pole.png', category: 'Trading Cards', gold: 35000, infStock: false },
      2410: { name: 'Zé do Caixão Coffin Joe Card', image: 'static/common/items/Items/Card/Staff_Ze_do_Caixao_Coffin_Joe_Card.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2421: { name: "Din's Lootbox", image: 'static/common/items/Items/Pack/Dins_Lootbox.png', category: 'Special Items', gold: 150000, infStock: false },
      2433: { name: 'Small Luck Potion', image: 'static/common/items/Items/Potions/small_purple.png', category: 'Buffs', gold: 5000, infStock: false },
      2434: { name: 'Large Luck Potion', image: 'static/common/items/Items/Potions/large_purple.png', category: 'Buffs', gold: 14000, infStock: false },
      2436: { name: 'Glass Shards x2', image: 'static/common/items/Items/Vials/shards.png', category: 'Crafting Materials', gold: 550, infStock: true },
      2437: { name: 'Glass Shards x3', image: 'static/common/items/Items/Vials/shards.png', category: 'Crafting Materials', gold: 825, infStock: true },
      2438: { name: 'Random Lvl2 Staff Card', image: 'static/common/items/Items/Pack/Random_Lvl2_Staff_Card.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2465: { name: "Farore's Lootbox", image: 'static/common/items/Items/Pack/Farores_Lootbox.png', category: 'Special Items', gold: 150000, infStock: false },
      2466: { name: "Nayru's Lootbox", image: 'static/common/items/Items/Pack/Nayrus_Lootbox.png', category: 'Special Items', gold: 150000, infStock: false },
      2468: { name: 'Random Lootbox (Din, Farore, or Nayru)', image: 'static/common/items/Items/Pack/Random_Lootbox.png', category: 'Special Items', gold: 150000, infStock: false },
      2508: { name: 'Dwarven Gem', image: 'static/common/items/Items/Gems/dwarven_gem.png', category: 'Crafting Materials', gold: 100000, infStock: false },
      2509: { name: 'Bronze Dwarf Companion', image: 'static/common/items/Cover/Pets/dwarf_bronze.png', category: 'Equipment', gold: 35000, infStock: true },
      2510: { name: 'Iron Dwarf Companion', image: 'static/common/items/Cover/Pets/dwarf_iron.png', category: 'Equipment', gold: 70000, infStock: false },
      2511: { name: 'Gold Dwarf Companion', image: 'static/common/items/Cover/Pets/dwarf_gold.png', category: 'Equipment', gold: 122500, infStock: false },
      2512: { name: 'Sand Dwarf Companion', image: 'static/common/items/Cover/Pets/dwarf_sand.png', category: 'Equipment', gold: 10000, infStock: true },
      2513: { name: 'Mithril Dwarf Companion', image: 'static/common/items/Cover/Pets/dwarf_mithril.png', category: 'Equipment', gold: 192500, infStock: false },
      2515: { name: 'Adamantium Dwarf Companion', image: 'static/common/items/Cover/Pets/dwarf_adamantium.png', category: 'Equipment', gold: 560000, infStock: false },
      2524: { name: 'Green IRC Slime Pet', image: 'static/common/items/Cover/Pets/slime_green.png', category: 'Equipment', gold: 50000, infStock: true },
      2525: { name: 'Blue IRC Slime Pet', image: 'static/common/items/Cover/Pets/slime_blue.png', category: 'Equipment', gold: 25000, infStock: true },
      2537: { name: 'Carbon-Crystalline Quartz', image: 'static/common/items/Items/Gems/carbonquartz.png', category: 'Crafting Materials', gold: 3750, infStock: false },
      2538: { name: 'Carbon-Crystalline Quartz Necklace', image: 'static/common/items/Cover/Jewelry/crystalline.png', category: 'Equipment', gold: 4000, infStock: false },
      2539: { name: 'Silver Ring of Gazellia', image: 'static/common/items/Cover/Jewelry/silvering.png', category: 'Equipment', gold: 1000, infStock: true },
      2540: { name: 'Quartz Loop of Luck', image: 'static/common/items/Cover/Jewelry/quartzringluck.png', category: 'Equipment', gold: 4100, infStock: false },
      2541: { name: 'Jade Loop of Luck', image: 'static/common/items/Cover/Jewelry/jaderingluck.png', category: 'Equipment', gold: 17000, infStock: false },
      2542: { name: 'Amethyst Loop of Luck', image: 'static/common/items/Cover/Jewelry/amethystringluck.png', category: 'Equipment', gold: 67000, infStock: false },
      2543: { name: 'Quartz Loop of Aggression', image: 'static/common/items/Cover/Jewelry/quartzringaggression.png', category: 'Equipment', gold: 4500, infStock: false },
      2544: { name: 'Jade Loop of Aggression', image: 'static/common/items/Cover/Jewelry/jaderingaggression.png', category: 'Equipment', gold: 21000, infStock: false },
      2545: { name: 'Amethyst Loop of Aggression', image: 'static/common/items/Cover/Jewelry/amethystringaggression.png', category: 'Equipment', gold: 79000, infStock: false },
      2546: { name: 'Quartz Loop of Fortune', image: 'static/common/items/Cover/Jewelry/quartzringfortune.png', category: 'Equipment', gold: 6000, infStock: false },
      2547: { name: 'Jade Loop of Fortune', image: 'static/common/items/Cover/Jewelry/jaderingfortune.png', category: 'Equipment', gold: 36000, infStock: false },
      2548: { name: 'Amethyst Loop of Fortune', image: 'static/common/items/Cover/Jewelry/amethystringfortune.png', category: 'Equipment', gold: 124000, infStock: false },
      2549: { name: 'Sapphire', image: 'static/common/items/Items/Gems/sapphire.png', category: 'Crafting Materials', gold: 6000, infStock: true },
      2550: { name: 'Ruby Chip', image: 'static/common/items/Items/Gems/chip_ruby.png', category: 'Crafting Materials', gold: 2500, infStock: true },
      2551: { name: 'Emerald Chip', image: 'static/common/items/Items/Gems/chip_emerald.png', category: 'Crafting Materials', gold: 1000, infStock: true },
      2552: { name: 'Sapphire Chip', image: 'static/common/items/Items/Gems/chip_sapphire.png', category: 'Crafting Materials', gold: 600, infStock: true },
      2554: { name: 'Unity Flame Necklet', image: 'static/common/items/Cover/Jewelry/unityneck.png', category: 'Equipment', gold: 1000000, infStock: false },
      2555: { name: 'Gods Pennant', image: 'static/common/items/Cover/Back/gods_pennant.png', category: 'Equipment', gold: 1000000, infStock: false },
      2556: { name: 'Gods Cradle', image: 'static/common/items/Cover/Helmet/gods_cradle.png', category: 'Equipment', gold: 1000000, infStock: false },
      2563: { name: 'Exquisite Constellation of Rubies', image: 'static/common/items/Items/Jewelry/constellation_ruby.png', category: 'Crafting Materials', gold: 120000, infStock: false },
      2564: { name: 'Exquisite Constellation of Sapphires', image: 'static/common/items/Items/Jewelry/constellation_sapphire.png', category: 'Crafting Materials', gold: 44000, infStock: false },
      2565: { name: 'Exquisite Constellation of Emeralds', image: 'static/common/items/Items/Jewelry/constellation_emerald.png', category: 'Crafting Materials', gold: 60000, infStock: false },
      2566: { name: 'Quartz Prism of Aggression', image: 'static/common/items/Cover/Jewelry/quartzneckaggression.png', category: 'Equipment', gold: 13400, infStock: false },
      2567: { name: 'Quartz Prism of Luck', image: 'static/common/items/Cover/Jewelry/quartzneckluck.png', category: 'Equipment', gold: 11000, infStock: false },
      2568: { name: 'Quartz Prism of Fortune', image: 'static/common/items/Cover/Jewelry/quartzneckfortune.png', category: 'Equipment', gold: 22400, infStock: false },
      2569: { name: 'Jade Trifocal of Aggression', image: 'static/common/items/Cover/Jewelry/jadeneckaggression.png', category: 'Equipment', gold: 40750, infStock: false },
      2570: { name: 'Jade Trifocal of Luck', image: 'static/common/items/Cover/Jewelry/jadeneckluck.png', category: 'Equipment', gold: 32750, infStock: false },
      2571: { name: 'Jade Trifocal of Fortune', image: 'static/common/items/Cover/Jewelry/jadeneckfortune.png', category: 'Equipment', gold: 70750, infStock: false },
      2572: { name: 'Amethyst Totality of Aggression', image: 'static/common/items/Cover/Jewelry/amethystneckaggression.png', category: 'Equipment', gold: 150750, infStock: false },
      2573: { name: 'Amethyst Totality of Luck', image: 'static/common/items/Cover/Jewelry/amethystneckluck.png', category: 'Equipment', gold: 126750, infStock: false },
      2574: { name: 'Amethyst Totality of Fortune', image: 'static/common/items/Cover/Jewelry/amethystneckfortune.png', category: 'Equipment', gold: 240750, infStock: false },
      2579: { name: 'Ruby-Flecked Wheat', image: 'static/common/items/Items/Food/wheat_ruby.png', category: 'Crafting Materials', gold: 1200, infStock: false },
      2580: { name: 'Ruby-Grained Baguette', image: 'static/common/items/Items/Food/baguette_ruby.png', category: 'Buffs', gold: 2400, infStock: false },
      2581: { name: 'Garlic Ruby-Baguette', image: 'static/common/items/Items/Food/garlic_ruby.png', category: 'Buffs', gold: 4500, infStock: false },
      2582: { name: 'Artisan Ruby-Baguette', image: 'static/common/items/Items/Food/artisan_ruby.png', category: 'Buffs', gold: 9500, infStock: false },
      2584: { name: 'Unity Flame Band', image: 'static/common/items/Cover/Jewelry/unityring.png', category: 'Equipment', gold: 850000, infStock: false },
      2585: { name: 'Amethyst', image: 'static/common/items/Items/Gems/amethyst.png', category: 'Crafting Materials', gold: 30000, infStock: true },
      2589: { name: 'Ripe Pumpkin', image: 'static/common/items/Items/Card/Halloween_Ripe_Pumpkin.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2590: { name: 'Rotting Pumpkin', image: 'static/common/items/Items/Card/Halloween_Rotting_Pumpkin.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2591: { name: 'Carved Pumpkin', image: 'static/common/items/Items/Card/Halloween_Carved_Pumpkin.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2592: { name: 'Stormrage Pumpkin', image: 'static/common/items/Items/Card/Halloween_Stormrage_Pumpkin.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2593: { name: 'Russian Pumpkin', image: 'static/common/items/Items/Card/Halloween_Russian_Pumpkin.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2594: { name: 'Green Mario Pumpkin', image: 'static/common/items/Items/Card/Halloween_Green_Mario_Pumpkin.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2595: { name: 'Lame Pumpkin Trio', image: 'static/common/items/Items/Card/Halloween_Lame_Pumpkin_Trio.png', category: 'Trading Cards', gold: 35000, infStock: false },
      2598: { name: 'Ghost Billie', image: 'static/common/items/Cover/Pets/ghost_white.png', category: 'Equipment', gold: 12000, infStock: false },
      2599: { name: 'Ghost Billy', image: 'static/common/items/Cover/Pets/ghost_yellow.png', category: 'Equipment', gold: 120000, infStock: false },
      2600: { name: 'Pumpkin Badge Bits', image: 'static/common/items/Items/Halloween/pumpkin_bits.png', category: 'Stat potions', gold: 2250, infStock: false },
      2601: { name: 'Halloween Pumpkin Badge', image: 'static/common/items/Items/Badges/Halloween_Pumpkin_Badge.png', category: 'User badges', gold: 13500, infStock: false },
      2627: { name: 'Blacksmith Tongs', image: 'static/common/items/Items/Recast/blacksmith_tongs.png', category: 'Crafting Materials', gold: 50, infStock: true },
      2639: { name: 'Dwarven Disco Ball', image: 'static/common/items/Cover/Clothing/disco_ball.png', category: 'Equipment', gold: 900000, infStock: false },
      2641: { name: 'Impure Bronze Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Impure_Bronze_Claymore.png', category: 'Equipment', gold: 2300, infStock: false, equipLife: 2592000 },
      2642: { name: 'Bronze Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Bronze_Claymore.png', category: 'Equipment', gold: 4000, infStock: false, equipLife: 2592000 },
      2643: { name: 'Iron Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Iron_Claymore.png', category: 'Equipment', gold: 16000, infStock: false, equipLife: 2592000 },
      2644: { name: 'Steel Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Steel_Claymore.png', category: 'Equipment', gold: 18000, infStock: false, equipLife: 2592000 },
      2645: { name: 'Gold Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Gold_Claymore.png', category: 'Equipment', gold: 28000, infStock: false, equipLife: 2592000 },
      2646: { name: 'Mithril Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Mithril_Claymore.png', category: 'Equipment', gold: 55000, infStock: false, equipLife: 2592000 },
      2647: { name: 'Adamantium Claymore', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Adamantium_Claymore.png', category: 'Equipment', gold: 160000, infStock: false, equipLife: 2592000 },
      2648: { name: 'Quartz Khopesh', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Quartz_Khopesh.png', category: 'Equipment', gold: 5000, infStock: false, equipLife: 2592000 },
      2649: { name: 'Jade Khopesh', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Jade_Khopesh.png', category: 'Equipment', gold: 20000, infStock: false, equipLife: 2592000 },
      2650: { name: 'Amethyst Khopesh', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Amethyst_Khopesh.png', category: 'Equipment', gold: 80000, infStock: false, equipLife: 2592000 },
      2653: { name: 'Flux', image: 'static/common/items/Items/Recast/flux.png', category: 'Crafting Materials', gold: 50, infStock: true },
      2656: { name: 'Impure Bronze Bar x2', image: 'static/common/items/Items/Ore/impure_bronze_bar.png', category: 'Crafting Materials', gold: 2500, infStock: false },
      2657: { name: 'Iron Bar x2', image: 'static/common/items/Items/Ore/iron_bar.png', category: 'Crafting Materials', gold: 8000, infStock: false },
      2658: { name: 'Steel Bar x2', image: 'static/common/items/Items/Ore/steel_bar.png', category: 'Crafting Materials', gold: 9000, infStock: false },
      2659: { name: 'Gold Bar x2', image: 'static/common/items/Items/Ore/gold_bar.png', category: 'Crafting Materials', gold: 14000, infStock: false },
      2661: { name: 'Mithril Bar x2', image: 'static/common/items/Items/Ore/mithril_bar.png', category: 'Crafting Materials', gold: 22000, infStock: false },
      2662: { name: 'Adamantium Bar x2', image: 'static/common/items/Items/Ore/adamantium_bar.png', category: 'Crafting Materials', gold: 64000, infStock: false },
      2664: { name: 'Jade Bar x2', image: 'static/common/items/Items/Ore/jade_bar.png', category: 'Crafting Materials', gold: 10000, infStock: false },
      2665: { name: 'Amethyst Bar x2', image: 'static/common/items/Items/Ore/amethyst_bar.png', category: 'Crafting Materials', gold: 32000, infStock: false },
      2666: { name: 'Bronze Alloy Mix x2', image: 'static/common/items/Items/Ore/bronze.png', category: 'Crafting Materials', gold: 2000, infStock: false },
      2668: { name: 'Iron Ore x2', image: 'static/common/items/Items/Ore/iron.png', category: 'Crafting Materials', gold: 4000, infStock: false },
      2670: { name: 'Gold Ore x2', image: 'static/common/items/Items/Ore/gold.png', category: 'Crafting Materials', gold: 7000, infStock: false },
      2671: { name: 'Mithril Ore x2', image: 'static/common/items/Items/Ore/mithril.png', category: 'Crafting Materials', gold: 11000, infStock: false },
      2672: { name: 'Adamantium Ore x2', image: 'static/common/items/Items/Ore/adamantium.png', category: 'Crafting Materials', gold: 32000, infStock: false },
      2673: { name: 'Quartz Dust x2', image: 'static/common/items/Items/Ore/quartz.png', category: 'Crafting Materials', gold: 2000, infStock: false },
      2675: { name: 'Jade Dust x2', image: 'static/common/items/Items/Ore/jade.png', category: 'Crafting Materials', gold: 4000, infStock: false },
      2676: { name: 'Amethyst Dust x2', image: 'static/common/items/Items/Ore/amethyst.png', category: 'Crafting Materials', gold: 16000, infStock: false },
      2688: { name: 'Christmas Spices', image: 'static/common/items/Items/Christmas/spices.png', category: 'Crafting Materials', gold: 2600, infStock: true },
      2689: { name: 'Old Scarf & Hat', image: 'static/common/items/Items/Christmas/hatscarf.png', category: 'Crafting Materials', gold: 2500, infStock: true },
      2690: { name: 'Umaro', image: 'static/common/items/Cover/Pets/umaro_white.png', category: 'Equipment', gold: 12000, infStock: false },
      2691: { name: 'Golden Umaro', image: 'static/common/items/Cover/Pets/umaro_yellow.png', category: 'Equipment', gold: 120000, infStock: false },
      2698: { name: 'Perfect Snowball', image: 'static/common/items/Items/Card/Christmas_Perfect_Snowball.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2699: { name: 'Mistletoe', image: 'static/common/items/Items/Card/Christmas_Mistletoe.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2700: { name: 'Santa Suit', image: 'static/common/items/Items/Card/Christmas_Santa_Suit.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2701: { name: 'Abominable Santa', image: 'static/common/items/Items/Card/Christmas_Abominable_Santa.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2702: { name: 'Icy Kisses', image: 'static/common/items/Items/Card/Christmas_Icy_Kisses.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2703: { name: 'Sexy Santa', image: 'static/common/items/Items/Card/Christmas_Sexy_Santa.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2704: { name: 'Christmas Cheer', image: 'static/common/items/Items/Card/Christmas_Christmas_Cheer.png', category: 'Trading Cards', gold: 35000, infStock: false },
      2711: { name: 'Jazz Pants', image: 'static/common/items/Cover/Leg Armor/Jazz_Pants.png', category: 'Equipment', gold: 11000, infStock: true },
      2712: { name: 'Jazzier Pants', image: 'static/common/items/Cover/Leg Armor/Jazzier_Pants.png', category: 'Equipment', gold: 22000, infStock: false },
      2713: { name: 'Disco Pants', image: 'static/common/items/Cover/Leg Armor/Disco_Pants.png', category: 'Equipment', gold: 800000, infStock: false },
      2714: { name: "Devil's Pantaloons", image: 'static/common/items/Cover/Leg Armor/Devils_Pants.png', category: 'Equipment', gold: 1600000, infStock: false },
      2717: { name: 'Emerald-Flecked Wheat', image: 'static/common/items/Items/Food/wheat_emerald.png', category: 'Crafting Materials', gold: 600, infStock: false },
      2718: { name: 'Emerald-Grained Baguette', image: 'static/common/items/Items/Food/bagette_emerald.png', category: 'Buffs', gold: 1200, infStock: false },
      2719: { name: 'Garlic Emerald-Baguette', image: 'static/common/items/Items/Food/garlic_emerald.png', category: 'Buffs', gold: 2500, infStock: false },
      2720: { name: 'Artisan Emerald-Baguette', image: 'static/common/items/Items/Food/artisan_emerald.png', category: 'Buffs', gold: 6000, infStock: false },
      2721: { name: 'Gazellian Emerald-Baguette', image: 'static/common/items/Items/Food/gazellian_emerald.png', category: 'Buffs', gold: 8000, infStock: false },
      2729: { name: 'Empowered Quartz Loop of Luck', image: 'static/common/items/Cover/Jewelry/empoweredquartzringluck.png', category: 'Equipment', gold: 6600, infStock: false, equipLife: 7776000 },
      2730: { name: 'Empowered Jade Loop of Luck', image: 'static/common/items/Cover/Jewelry/empoweredjaderingluck.png', category: 'Equipment', gold: 27000, infStock: false, equipLife: 7776000 },
      2731: { name: 'Empowered Amethyst Loop of Luck', image: 'static/common/items/Cover/Jewelry/empoweredamethystringluck.png', category: 'Equipment', gold: 115000, infStock: false, equipLife: 7776000 },
      2732: { name: 'Empowered Quartz Loop of Aggression', image: 'static/common/items/Cover/Jewelry/empoweredquartzringaggression.png', category: 'Equipment', gold: 7000, infStock: false, equipLife: 7776000 },
      2733: { name: 'Empowered Jade Loop of Aggression', image: 'static/common/items/Cover/Jewelry/empoweredjaderingaggression.png', category: 'Equipment', gold: 31000, infStock: false, equipLife: 7776000 },
      2734: { name: 'Empowered Amethyst Loop of Aggression', image: 'static/common/items/Cover/Jewelry/empoweredamethystringaggression.png', category: 'Equipment', gold: 127000, infStock: false, equipLife: 7776000 },
      2735: { name: 'Empowered Quartz Loop of Fortune', image: 'static/common/items/Cover/Jewelry/empoweredquartzringfortune.png', category: 'Equipment', gold: 8500, infStock: false, equipLife: 7776000 },
      2736: { name: 'Empowered Jade Loop of Fortune', image: 'static/common/items/Cover/Jewelry/empoweredjaderingfortune.png', category: 'Equipment', gold: 46000, infStock: false, equipLife: 7776000 },
      2737: { name: 'Empowered Amethyst Loop of Fortune', image: 'static/common/items/Cover/Jewelry/empoweredamethystringfortune.png', category: 'Equipment', gold: 172000, infStock: false, equipLife: 7776000 },
      2738: { name: 'Empowered Quartz Prism of Aggression', image: 'static/common/items/Cover/Jewelry/empoweredquartzneckaggression.png', category: 'Equipment', gold: 18400, infStock: false, equipLife: 7776000 },
      2739: { name: 'Empowered Quartz Prism of Luck', image: 'static/common/items/Cover/Jewelry/empoweredquartzneckluck.png', category: 'Equipment', gold: 16000, infStock: false, equipLife: 7776000 },
      2740: { name: 'Empowered Quartz Prism of Fortune', image: 'static/common/items/Cover/Jewelry/empoweredquartzneckfortune.png', category: 'Equipment', gold: 27400, infStock: false, equipLife: 7776000 },
      2741: { name: 'Empowered Jade Trifocal of Aggression', image: 'static/common/items/Cover/Jewelry/empoweredjadeneckaggression.png', category: 'Equipment', gold: 55750, infStock: false, equipLife: 7776000 },
      2742: { name: 'Empowered Jade Trifocal of Luck', image: 'static/common/items/Cover/Jewelry/empoweredjadeneckluck.png', category: 'Equipment', gold: 47750, infStock: false, equipLife: 7776000 },
      2743: { name: 'Empowered Jade Trifocal of Fortune', image: 'static/common/items/Cover/Jewelry/empoweredjadeneckfortune.png', category: 'Equipment', gold: 85750, infStock: false, equipLife: 7776000 },
      2744: { name: 'Empowered Amethyst Totality of Aggression', image: 'static/common/items/Cover/Jewelry/empoweredamethystneckaggression.png', category: 'Equipment', gold: 230750, infStock: false, equipLife: 7776000 },
      2745: { name: 'Empowered Amethyst Totality of Luck', image: 'static/common/items/Cover/Jewelry/empoweredamethystneckluck.png', category: 'Equipment', gold: 206750, infStock: false, equipLife: 7776000 },
      2746: { name: 'Empowered Amethyst Totality of Fortune', image: 'static/common/items/Cover/Jewelry/empoweredamethystneckfortune.png', category: 'Equipment', gold: 320750, infStock: false, equipLife: 7776000 },
      2760: { name: 'Dwarven Disco Plate', image: 'static/common/items/Cover/Body Armor/Disco_Plate.png', category: 'Equipment', gold: 800000, infStock: false },
      2761: { name: 'Impure Bronze Segmentata', image: 'static/common/items/Cover/Body Armor/Impure_Bronze_Segmentata.png', category: 'Equipment', gold: 1150, infStock: false },
      2762: { name: 'Bronze Segmentata', image: 'static/common/items/Cover/Body Armor/Bronze_Segmentata.png', category: 'Equipment', gold: 2000, infStock: false },
      2763: { name: 'Iron Segmentata', image: 'static/common/items/Cover/Body Armor/Iron_Segmentata.png', category: 'Equipment', gold: 8000, infStock: false },
      2764: { name: 'Steel Segmentata', image: 'static/common/items/Cover/Body Armor/Steel_Segmentata.png', category: 'Equipment', gold: 9000, infStock: false },
      2765: { name: 'Gold Segmentata', image: 'static/common/items/Cover/Body Armor/Gold_Segmentata.png', category: 'Equipment', gold: 14000, infStock: false },
      2766: { name: 'Mithril Segmentata', image: 'static/common/items/Cover/Body Armor/Mithril_Segmentata.png', category: 'Equipment', gold: 22000, infStock: false },
      2767: { name: 'Adamantium Segmentata', image: 'static/common/items/Cover/Body Armor/Adamantium_Segmentata.png', category: 'Equipment', gold: 64000, infStock: false },
      2772: { name: 'Regenerate', image: 'static/common/items/Items/AdventureClub/attack_meditation.png', category: 'Attacks', gold: 200, infStock: false },
      2774: { name: 'Hypnosis', image: 'static/common/items/Items/AdventureClub/attack_hypnosis.png', category: 'Attacks', gold: 250, infStock: false },
      2775: { name: 'Muddle', image: 'static/common/items/Items/AdventureClub/attack_muddle.png', category: 'Attacks', gold: 250, infStock: false },
      2776: { name: 'Parasite', image: 'static/common/items/Items/AdventureClub/attack_parasite.png', category: 'Attacks', gold: 800, infStock: false },
      2801: { name: '3 Backpack Slots', image: 'static/common/items/Items/AdventureClub/backpack_3.png', category: 'Backpack (IRC)', gold: 300, infStock: false },
      2802: { name: '4 Backpack Slots', image: 'static/common/items/Items/AdventureClub/backpack_4.png', category: 'Backpack (IRC)', gold: 400, infStock: false },
      2803: { name: '6 Backpack Slots', image: 'static/common/items/Items/AdventureClub/backpack_6.png', category: 'Backpack (IRC)', gold: 600, infStock: false },
      2813: { name: 'Scrap', image: 'static/common/items/Items/AdventureClub/craft_scrap.png', category: 'Items', gold: 500, infStock: false },
      2814: { name: 'Cloth', image: 'static/common/items/Items/AdventureClub/craft_cloth.png', category: 'Items', gold: 500, infStock: false },
      2816: { name: 'Hide', image: 'static/common/items/Items/AdventureClub/craft_hide.png', category: 'Items', gold: 500, infStock: false },
      2822: { name: "Can't Believe This Is Cherry", image: 'static/common/items/Items/Birthday/chakefhake.png', category: 'Buffs', gold: 8000, infStock: false },
      2825: { name: '9th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/9th_Birthday_Badge.png', category: 'User badges', gold: 13500, infStock: false },
      2826: { name: 'Lick Badge Bits', image: 'static/common/items/Items/Birthday/licks_bits.png', category: 'Stat potions', gold: 2250, infStock: false },
      2827: { name: '[Au]zelle Pet', image: 'static/common/items/Cover/Pets/gazelle_yellow.png', category: 'Equipment', gold: 120000, infStock: false },
      2829: { name: 'Ripped Gazelle', image: 'static/common/items/Items/Card/Birthday_Ripped_Gazelle.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2830: { name: 'Fancy Gazelle', image: 'static/common/items/Items/Card/Birthday_Fancy_Gazelle.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2831: { name: 'Gamer Gazelle', image: 'static/common/items/Items/Card/Birthday_Gamer_Gazelle.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2833: { name: 'Future Gazelle', image: 'static/common/items/Items/Card/Birthday_Future_Gazelle.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2834: { name: 'Alien Gazelle', image: 'static/common/items/Items/Card/Birthday_Alien_Gazelle.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2835: { name: 'Lucky Gazelle', image: 'static/common/items/Items/Card/Birthday_Lucky_Gazelle.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2836: { name: 'Supreme Gazelle', image: 'static/common/items/Items/Card/Birthday_Supreme_Gazelle.png', category: 'Trading Cards', gold: 35000, infStock: false },
      2841: { name: 'Condensed Light', image: 'static/common/items/Items/AdventureClub/craft_light.png', category: 'Items', gold: 500, infStock: false },
      2842: { name: 'Bottled Ghost', image: 'static/common/items/Items/AdventureClub/craft_bottle_ghost.png.png', category: 'Items', gold: 500, infStock: false },
      2844: { name: 'Glowing Leaves', image: 'static/common/items/Items/AdventureClub/craft_glowing_leaves.png.png', category: 'Items', gold: 50, infStock: false },
      2845: { name: 'Dark Orb', image: 'static/common/items/Items/AdventureClub/attack_darkorb.png', category: 'Attacks', gold: 5000, infStock: false },
      2846: { name: 'Burst of Light', image: 'static/common/items/Items/AdventureClub/attack_burstlight.png', category: 'Attacks', gold: 5000, infStock: false },
      2847: { name: 'Scrappy Gauntlets', image: 'static/common/items/Cover/AdventureClub/scrappy_gauntlets.png', category: 'Items', gold: 2500, infStock: false },
      2849: { name: 'Quartz Lamellar', image: 'static/common/items/Cover/Body Armor/Quartz_Lamellar.png', category: 'Equipment', gold: 2500, infStock: false },
      2850: { name: 'Jade Lamellar', image: 'static/common/items/Cover/Body Armor/Jade_Lamellar.png', category: 'Equipment', gold: 10000, infStock: false },
      2851: { name: 'Amethyst Lamellar', image: 'static/common/items/Cover/Body Armor/Amethyst_Lamellar.png', category: 'Equipment', gold: 32000, infStock: false },
      2852: { name: 'Impure Bronze Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Impure_Bronze_Billhook.png', category: 'Equipment', gold: 1150, infStock: false },
      2853: { name: 'Bronze Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Bronze_Billhook.png', category: 'Equipment', gold: 2000, infStock: false },
      2854: { name: 'Iron Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Iron_Billhook.png', category: 'Equipment', gold: 8000, infStock: false },
      2855: { name: 'Steel Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Steel_Billhook.png', category: 'Equipment', gold: 9000, infStock: false },
      2856: { name: 'Gold Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Gold_Billhook.png', category: 'Equipment', gold: 14000, infStock: false },
      2857: { name: 'Mithril Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Mithril_Billhook.png', category: 'Equipment', gold: 22000, infStock: false },
      2858: { name: 'Adamantium Billhook', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Adamantium_Billhook.png', category: 'Equipment', gold: 64000, infStock: false },
      2859: { name: 'Quartz Guandao', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Quartz_Guandao.png', category: 'Equipment', gold: 2500, infStock: false },
      2860: { name: 'Jade Guandao', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Jade_Guandao.png', category: 'Equipment', gold: 10000, infStock: false },
      2861: { name: 'Amethyst Guandao', image: 'static/common/items/Cover/Two-Handed Melee Weapon/Amethyst_Guandao.png', category: 'Equipment', gold: 32000, infStock: false },
      2862: { name: 'Impure Bronze Armguards', image: 'static/common/items/Cover/Arm Armor/Impure_Bronze_Armguards.png', category: 'Equipment', gold: 1250, infStock: false },
      2863: { name: 'Bronze Armguards', image: 'static/common/items/Cover/Arm Armor/Bronze_Armguards.png', category: 'Equipment', gold: 3250, infStock: false },
      2864: { name: 'Iron Armguards', image: 'static/common/items/Cover/Arm Armor/Iron_Armguards.png', category: 'Equipment', gold: 7250, infStock: false },
      2865: { name: 'Steel Armguards', image: 'static/common/items/Cover/Arm Armor/Steel_Armguards.png', category: 'Equipment', gold: 11750, infStock: false },
      2866: { name: 'Gold Armguards', image: 'static/common/items/Cover/Arm Armor/Gold_Armguards.png', category: 'Equipment', gold: 18750, infStock: false },
      2867: { name: 'Mithril Armguards', image: 'static/common/items/Cover/Arm Armor/Mithril_Armguards.png', category: 'Equipment', gold: 29750, infStock: false, equipLife: 7776000 },
      2868: { name: 'Adamantium Armguards', image: 'static/common/items/Cover/Arm Armor/Adamantium_Armguards.png', category: 'Equipment', gold: 61750, infStock: false, equipLife: 7776000 },
      2892: { name: 'Glowing Ash', image: 'https://ptpimg.me/3i2xd1.png', category: 'Items', gold: 50, infStock: false },
      2893: { name: 'Troll Tooth', image: 'https://ptpimg.me/mrr24x.png', category: 'Items', gold: 50, infStock: false },
      2894: { name: 'Advanced Hide', image: 'https://ptpimg.me/1d6926.png', category: 'Items', gold: 50, infStock: false },
      2900: { name: 'Burning Ash Cloud', image: 'https://ptpimg.me/n7900m.png', category: 'Attacks', gold: 7500, infStock: false },
      2901: { name: 'Troll Tooth Necklace', image: 'https://ptpimg.me/480516.png', category: 'Items', gold: 3500, infStock: false },
      2902: { name: 'Mithril Power Gloves', image: 'https://ptpimg.me/xiq9n9.png', category: 'Equipment', gold: 190000, infStock: false, equipLife: 2592000 },
      2903: { name: 'Adamantium Power Gloves', image: 'https://ptpimg.me/850f5v.png', category: 'Equipment', gold: 305000, infStock: false, equipLife: 2592000 },
      2905: { name: 'Steel Power Gloves', image: 'https://ptpimg.me/oqwww2.png', category: 'Equipment', gold: 37000, infStock: false },
      2906: { name: 'Iron Power Gloves', image: 'https://ptpimg.me/999ex6.png', category: 'Equipment', gold: 22500, infStock: false },
      2907: { name: 'Bronze Power Gloves', image: 'https://ptpimg.me/v98n53.png', category: 'Equipment', gold: 11000, infStock: false },
      2908: { name: 'Impure Bronze Power Gloves', image: 'https://ptpimg.me/9d1e15.png', category: 'Equipment', gold: 4000, infStock: false },
      2915: { name: 'Flame Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Flame_Badge.png', category: 'User badges', gold: 1000000, infStock: false },
      2927: { name: 'Amethyst Dust Dwarf Companion', image: 'https://ptpimg.me/8n1o75.png', category: 'Equipment', gold: 280000, infStock: false },
      2928: { name: 'Jade Dust Dwarf Companion', image: 'https://ptpimg.me/803l8j.png', category: 'Equipment', gold: 87500, infStock: false },
      2929: { name: 'Quartz Dust Dwarf Companion', image: 'https://ptpimg.me/6zl54e.png', category: 'Equipment', gold: 43750, infStock: true },
      2930: { name: "Nayru's Username", image: 'static/common/items/Items/Username/Nayru.png', category: 'Username customizations', gold: 270000, infStock: false },
      2931: { name: "Farore's Username", image: 'static/common/items/Items/Username/Farore.png', category: 'Username customizations', gold: 270000, infStock: false },
      2932: { name: "Din's Username", image: 'static/common/items/Items/Username/Din.png', category: 'Username customizations', gold: 270000, infStock: false },
      2945: { name: 'Bloody Mario', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Bloody_Mario.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2946: { name: "Mommy's Recipe", image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Mommys_Recipe.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2947: { name: 'Memory Boost', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Memory_Boost.png', category: 'Trading Cards', gold: 6660, infStock: false },
      2948: { name: 'Link was here!', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Link_was_here.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2949: { name: 'Gohma Sees You', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Gohma_sees_you.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2950: { name: 'Skultilla the Cake Guard', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Skultilla_the_cake_guard.png', category: 'Trading Cards', gold: 6660, infStock: false },
      2951: { name: 'Who eats whom?', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Halloween_Who_eats_whom.png', category: 'Trading Cards', gold: 15000, infStock: false },
      2952: { name: 'Cupcake Crumbles', image: 'https://ptpimg.me/ckw9ad.png', category: 'Crafting Materials', gold: 2250, infStock: false },
      2953: { name: 'Halloween Cupcake Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Halloween_Cupcake_Badge.png', category: 'User badges', gold: 13500, infStock: false },
      2969: { name: 'Gingerbread Kitana', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Kitana.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2970: { name: 'Gingerbread Marston', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Marston.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2972: { name: 'Gingerbread Doomslayer', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Doomslayer.png', category: 'Trading Cards', gold: 6500, infStock: false },
      2973: { name: 'Millenium Falcon Gingerbread', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_Millenium_Falcon.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2974: { name: 'Gingerbread AT Walker', image: 'static/common/items/Items/Card/9th_Christmas_Gingerbread_AT_Walker.png', category: 'Trading Cards', gold: 3000, infStock: false },
      2975: { name: 'Mario Christmas', image: 'static/common/items/Items/Card/9th_Christmas_Mario_Christmas.png', category: 'Trading Cards', gold: 6500, infStock: false },
      2976: { name: 'Baby Yoda with Gingerbread', image: 'static/common/items/Items/Card/9th_Christmas_Baby_Yoda.png', category: 'Trading Cards', gold: 14000, infStock: false },
      2986: { name: 'Sonic and Amy', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Sonic_and_Amy.png', category: 'Trading Cards', gold: 2000, infStock: false },
      2987: { name: 'Yoshi and Birdo', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Yoshi_and_Birdo.png', category: 'Trading Cards', gold: 2000, infStock: false },
      2988: { name: 'Kirlia and Meloetta', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Kirlia_and_Meloetta.png', category: 'Trading Cards', gold: 4500, infStock: false },
      2989: { name: 'Aerith and Cloud', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Aerith_and_Cloud.png', category: 'Trading Cards', gold: 2000, infStock: false },
      2990: { name: 'Master Chief and Cortana', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Master_Chief_and_Cortana.png', category: 'Trading Cards', gold: 2000, infStock: false },
      2991: { name: 'Dom and Maria', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Master_Dom_and_Maria.png', category: 'Trading Cards', gold: 4500, infStock: false },
      2992: { name: 'Mr. and Mrs. Pac Man', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Master_Mr_and_Mrs_Pac_Man.png', category: 'Trading Cards', gold: 10000, infStock: false },
      2993: { name: 'Chainsaw Chess', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Chainsaw_Chess.png', category: 'Trading Cards', gold: 2000, infStock: false },
      2994: { name: 'Chainsaw Wizard', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Chainsaw_Wizard.png', category: 'Trading Cards', gold: 2000, infStock: false },
      2995: { name: 'Angelise Reiter', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Angelise_Reiter.png', category: 'Trading Cards', gold: 4500, infStock: false },
      2996: { name: 'Ivy Valentine', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Ivy_Valentine.png', category: 'Trading Cards', gold: 2000, infStock: false },
      2997: { name: 'Jill Valentine', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Jill_Valentine.png', category: 'Trading Cards', gold: 2000, infStock: false },
      2998: { name: 'Sophitia', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Sophitia.png', category: 'Trading Cards', gold: 4500, infStock: false },
      2999: { name: 'Yennefer', image: 'https://gazellegames.net/static/common/items/Items/Card/9th_Valentine_Yennefer.png', category: 'Trading Cards', gold: 10000, infStock: false },
      3000: { name: 'Valentine Sugar Heart', image: 'https://ptpimg.me/82osc2.png', category: 'Stat potions', gold: 500, infStock: false },
      3001: { name: 'Valentine Chocolate Heart', image: 'https://ptpimg.me/gg9293.png', category: 'Stat potions', gold: 500, infStock: false },
      3002: { name: 'Valentine Rose', image: 'https://ptpimg.me/o6mt84.png', category: 'Buffs', gold: 5000, infStock: false },
      3004: { name: 'Special Box', image: 'static/common/items/Items/Valentine2022/special_box.png', category: 'Special Items', gold: 300000, infStock: false },
      3023: { name: 'Exodus Truce', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Exodus_Truce.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3024: { name: 'Gazelle Breaking Bad', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Gazelle_Breaking_Bad.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3025: { name: 'A Fair Fight', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_A_Fair_Fight.png', category: 'Trading Cards', gold: 6500, infStock: false },
      3026: { name: 'Home Sweet Home', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Home_Sweet_Home.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3027: { name: 'Birthday Battle Kart', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_Birthday_Battle_Kart.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3028: { name: 'What an Adventure', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_What_an_Adventure.png', category: 'Trading Cards', gold: 6500, infStock: false },
      3029: { name: 'After Party', image: 'https://gazellegames.net/static/common/items/Items/Card/10th_Birthday_After_Party.png', category: 'Trading Cards', gold: 15000, infStock: false },
      3031: { name: 'Birthday Leaves (10th)', image: 'https://ptpimg.me/744jj8.png', category: 'Stat potions', gold: 2250, infStock: false },
      3032: { name: '10th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/10th_Birthday_Badge.png', category: 'User badges', gold: 13500, infStock: false },
      3105: { name: 'Cyberpunk 2077', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Cyberpunk_2077.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3106: { name: 'Watch Dogs Legion', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Watch_Dogs_Legion.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3107: { name: 'Dirt 5', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Dirt_5.png', category: 'Trading Cards', gold: 6000, infStock: false },
      3108: { name: 'Genshin Impact', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Genshin_Impact.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3109: { name: 'Animal Crossing', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Animal_Crossing.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3110: { name: 'Gazelle', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Gazelle.png', category: 'Trading Cards', gold: 6000, infStock: false },
      3111: { name: 'Mafia', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2020_Mafia.png', category: 'Trading Cards', gold: 15000, infStock: false },
      3112: { name: 'Christmas Bauble Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Bauble_Badge.png', category: 'User badges', gold: 8000, infStock: false },
      3113: { name: 'Red Crewmate Bauble', image: 'https://ptpimg.me/43o3rh.png', category: 'Crafting Materials', gold: 5000, infStock: false },
      3114: { name: 'Green Crewmate Bauble', image: 'https://ptpimg.me/sm003l.png', category: 'Crafting Materials', gold: 5001, infStock: false },
      3115: { name: 'Cyan Crewmate Bauble', image: 'https://ptpimg.me/r85pwu.png', category: 'Crafting Materials', gold: 5000, infStock: false },
      3117: { name: 'Christmas Impostor Bauble?', image: 'https://ptpimg.me/455r6g.png', category: 'Special Items', gold: 10000, infStock: false },
      3119: { name: 'Broken Bauble Fragment', image: 'https://ptpimg.me/w3544e.png', category: 'Crafting Materials', gold: 2250, infStock: false },
      3120: { name: 'Wilted Four-Leaves Holly', image: 'https://ptpimg.me/nsth09.png', category: 'Crafting Materials', gold: 2250, infStock: false },
      3121: { name: 'Lucky Four-Leaves Holly', image: 'https://ptpimg.me/136074.png', category: 'Buffs', gold: 8000, infStock: false },
      3136: { name: "Cupid's Winged Boots", image: 'https://ptpimg.me/vlk630.png', category: 'Equipment', gold: 160000, infStock: false },
      3143: { name: 'Symbol of Love', image: 'https://ptpimg.me/cf9vfc.png', category: 'Crafting Materials', gold: 100000, infStock: false },
      3144: { name: 'Old Worn Boots', image: 'https://ptpimg.me/66unrh.png', category: 'Crafting Materials', gold: 10000, infStock: true },
      3145: { name: "Cupid's Magical Feather", image: 'https://ptpimg.me/004ho6.png', category: 'Crafting Materials', gold: 21500, infStock: false },
      3146: { name: "Cupid's Winged Boots of Luck", image: 'https://ptpimg.me/1bx3k2.png', category: 'Equipment', gold: 200000, infStock: false, equipLife: 5184000 },
      3147: { name: "Cupid's Winged Boots of Aggression", image: 'https://ptpimg.me/3983q6.png', category: 'Equipment', gold: 200000, infStock: false, equipLife: 5184000 },
      3148: { name: "Cupid's Winged Boots of Fortune", image: 'https://ptpimg.me/mopf18.png', category: 'Equipment', gold: 200000, infStock: false, equipLife: 5184000 },
      3151: { name: 'Bill Rizer', image: 'static/common/items/Items/Card/11th_Birthday_Bill_Rizer.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3152: { name: 'Donkey Kong', image: 'static/common/items/Items/Card/11th_Birthday_Donkey_Kong.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3153: { name: 'Duck Hunt Dog', image: 'static/common/items/Items/Card/11th_Birthday_Duck_Hunt_Dog.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3154: { name: 'Dr. Mario', image: 'static/common/items/Items/Card/11th_Birthday_Dr_Mario.png', category: 'Trading Cards', gold: 10000, infStock: false },
      3155: { name: 'Pit', image: 'static/common/items/Items/Card/11th_Birthday_Pit.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3156: { name: 'Little Mac', image: 'static/common/items/Items/Card/11th_Birthday_Little_Mac.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3157: { name: 'Mega Man', image: 'static/common/items/Items/Card/11th_Birthday_Mega_Man.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3158: { name: 'Link', image: 'static/common/items/Items/Card/11th_Birthday_Link.png', category: 'Trading Cards', gold: 10000, infStock: false },
      3159: { name: 'Pac-Man', image: 'static/common/items/Items/Card/11th_Birthday_Pac_Man.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3160: { name: 'Samus Aran', image: 'static/common/items/Items/Card/11th_Birthday_Samus_Aran.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3161: { name: 'Simon Belmont', image: 'static/common/items/Items/Card/11th_Birthday_Simon_Belmont.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3162: { name: 'Kirby', image: 'static/common/items/Items/Card/11th_Birthday_Kirby.png', category: 'Trading Cards', gold: 10000, infStock: false },
      3163: { name: 'Black Mage', image: 'static/common/items/Items/Card/11th_Birthday_Black_Mage.png', category: 'Trading Cards', gold: 35000, infStock: false },
      3165: { name: '11th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/11th_Birthday_Badge.png', category: 'User badges', gold: 13500, infStock: false },
      3166: { name: 'Party Pipe Badge Bit', image: 'https://ptpimg.me/r6vdr3.png', category: 'Crafting Materials', gold: 2250, infStock: false },
      3218: { name: 'Milk', image: 'https://ptpimg.me/raa068.png', category: 'Crafting Materials', gold: 3000, infStock: false },
      3219: { name: 'Cherries', image: 'https://ptpimg.me/x02af9.png', category: 'Crafting Materials', gold: 3000, infStock: false },
      3220: { name: 'Grapes', image: 'https://ptpimg.me/351721.png', category: 'Crafting Materials', gold: 3000, infStock: false },
      3221: { name: 'Coconuts', image: 'https://ptpimg.me/9c121y.png', category: 'Crafting Materials', gold: 3000, infStock: false },
      3222: { name: 'Marshmallows', image: 'https://ptpimg.me/6tl43k.png', category: 'Crafting Materials', gold: 3000, infStock: false },
      3223: { name: 'Cocoa beans', image: 'https://ptpimg.me/8h05tu.png', category: 'Crafting Materials', gold: 3000, infStock: false },
      3224: { name: 'Vanilla Pods', image: 'https://ptpimg.me/7c4us8.png', category: 'Crafting Materials', gold: 3000, infStock: false },
      3225: { name: 'Strawberries', image: 'https://ptpimg.me/gp622c.png', category: 'Crafting Materials', gold: 3000, infStock: false },
      3226: { name: '"Grape" Milkshake', image: 'static/common/items/Items/Birthday/grapeshake.png', category: 'Buffs', gold: 0, infStock: false },
      3227: { name: 'Coco-Cooler Milkshake', image: 'static/common/items/Items/Birthday/coconutshake.png', category: 'Buffs', gold: 8000, infStock: false },
      3228: { name: 'Cinnamon Milkshake', image: 'https://ptpimg.me/kl097r.png', category: 'Buffs', gold: 8000, infStock: false },
      3229: { name: 'Rocky Road Milkshake', image: 'https://ptpimg.me/q8634k.png', category: 'Buffs', gold: 11000, infStock: false },
      3230: { name: 'Neapolitan Milkshake', image: 'https://ptpimg.me/fr7433.png', category: 'Buffs', gold: 14000, infStock: false },
      3237: { name: 'Rainbow IRC Slime Pet', image: 'https://ptpimg.me/kh1c5k.png', category: 'Equipment', gold: 100000, infStock: true },
      3241: { name: 'Cinnamon', image: 'https://ptpimg.me/tol70u.png', category: 'Crafting Materials', gold: 3000, infStock: false },
      3263: { name: 'Blinky', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Blinky.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3264: { name: 'Halloween Tombstone Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/Halloween2021_Thombstone_Badge.png', category: 'User badges', gold: 15000, infStock: false },
      3265: { name: 'Clyde', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Clyde.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3266: { name: 'Pinky', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Pinky.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3267: { name: 'Inky', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Inky.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3268: { name: 'Ghostbusters', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Ghostbusters.png', category: 'Trading Cards', gold: 6500, infStock: false },
      3269: { name: 'Boo', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_Boo.png', category: 'Trading Cards', gold: 6500, infStock: false },
      3270: { name: 'King Boo', image: 'https://gazellegames.net/static/common/items/Items/Card/Halloween2021_King_Boo.png', category: 'Trading Cards', gold: 15000, infStock: false },
      3281: { name: 'Haunted Tombstone Shard', image: 'https://gazellegames.net/static/common/items/Items/Halloween2021/Haunted_Tombstone_Shard.png', category: 'Special Items', gold: 2500, infStock: false },
      3313: { name: 'Snowman Cookie', image: 'static/common/items/Items/Christmas2021/Christmas2021_Snowman_Cookie.png', category: 'Stat potions', gold: 650, infStock: false },
      3322: { name: 'Young Snowman', image: 'static/common/items/Items/Christmas2021/Christmas2021_Young_Snowman.png', category: 'Equipment', gold: 35000, infStock: false },
      3323: { name: 'Frosty Snowman', image: 'static/common/items/Items/Christmas2021/Christmas2021_Frosty_Snowman.png', category: 'Equipment', gold: 70000, infStock: false },
      3324: { name: 'Happy Snowman', image: 'static/common/items/Items/Christmas2021/Christmas2021_Happy_Snowman.png', category: 'Equipment', gold: 170000, infStock: false },
      3325: { name: 'Snowflake', image: 'static/common/items/Items/Christmas2021/Christmas2021_Snowflake.png', category: 'Stat potions', gold: 825, infStock: false },
      3326: { name: 'Penguin Snowglobe', image: 'static/common/items/Items/Christmas2021/Christmas2021_Penguin_Snowglobe.png', category: 'Stat potions', gold: 1375, infStock: false },
      3327: { name: 'Owl Snowglobe', image: 'static/common/items/Items/Christmas2021/Christmas2021_Owl_Snowglobe.png', category: 'Stat potions', gold: 1625, infStock: false },
      3328: { name: 'Santa Claus Is Out There', image: 'static/common/items/Items/Card/Christmas2021_Santa_Claus_Is_Out_There.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3329: { name: 'Back to the Future', image: 'static/common/items/Items/Card/Christmas2021_Back_to_the_Future.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3330: { name: 'Big Lebowski', image: 'static/common/items/Items/Card/Christmas2021_Big_Lebowski.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3331: { name: 'Picard', image: 'static/common/items/Items/Card/Christmas2021_Picard.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3332: { name: 'Braveheart', image: 'static/common/items/Items/Card/Christmas2021_Braveheart.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3333: { name: 'Indy', image: 'static/common/items/Items/Card/Christmas2021_Indy.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3334: { name: 'Gremlins', image: 'static/common/items/Items/Card/Christmas2021_Gremlins.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3335: { name: 'Die Hard', image: 'static/common/items/Items/Card/Christmas2021_Die_Hard.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3336: { name: 'Jurassic Park', image: 'static/common/items/Items/Card/Christmas2021_Jurassic_Park.png', category: 'Trading Cards', gold: 3000, infStock: false },
      3338: { name: 'Mando', image: 'static/common/items/Items/Card/Christmas2021_Mando.png', category: 'Trading Cards', gold: 10000, infStock: false },
      3339: { name: 'Doomguy', image: 'static/common/items/Items/Card/Christmas2021_Doomguy.png', category: 'Trading Cards', gold: 10000, infStock: false },
      3340: { name: 'Grievous', image: 'static/common/items/Items/Card/Christmas2021_Grievous.png', category: 'Trading Cards', gold: 10000, infStock: false },
      3341: { name: 'Have a Breathtaking Christmas', image: 'https://gazellegames.net/static/common/items/Items/Card/Christmas2021_Have_a_Breathtaking_Christmas.png', category: 'Trading Cards', gold: 35000, infStock: false },
      3348: { name: "Cupid's Wings", image: 'static/common/items/Items/Valentine2022/cupids_wings_avatar.png', category: 'Equipment', gold: 10000, infStock: true, equipLife: 7776000 },
      3349: { name: "Cupid's Gold Wings", image: 'static/common/items/Items/Valentine2022/cupids_gold_wings_avatar.png', category: 'Equipment', gold: 36000, infStock: false, equipLife: 7776000 },
      3352: { name: "Cupid's Mithril Wings", image: 'static/common/items/Items/Valentine2022/cupids_mithril_wings_avatar.png', category: 'Equipment', gold: 87000, infStock: false, equipLife: 7776000 },
      3353: { name: "Cupid's Adamantium Wings", image: 'static/common/items/Items/Valentine2022/cupids_adamantium_wings_avatar.png', category: 'Equipment', gold: 239000, infStock: false, equipLife: 7776000 },
      3358: { name: "Valentine's Day 2022 Badge", image: 'static/common/items/Items/Valentine2022/valentines_badge_shop.png', category: 'User badges', gold: 15000, infStock: false },
      3359: { name: 'Rose Petals', image: 'static/common/items/Items/Valentine2022/rose_petals.png', category: 'Crafting Materials', gold: 3750, infStock: false },
      3360: { name: "Cupid's Tiara", image: 'static/common/items/Items/Valentine2022/cupids_tiara.png', category: 'Equipment', gold: 30000, infStock: false },
      3361: { name: "Cupid's Cradle", image: 'static/common/items/Items/Valentine2022/cupids_cradle_avatar.png', category: 'Equipment', gold: 1030000, infStock: false },
      3362: { name: 'Disassembled Adamantium Wings', image: 'static/common/items/Items/Valentine2022/cupids_mithril_wings_avatar.png', category: 'Crafting Materials', gold: 189000, infStock: false },
      3363: { name: 'Disassembled Mithril Wings', image: 'static/common/items/Items/Valentine2022/cupids_gold_wings_avatar.png', category: 'Crafting Materials', gold: 64000, infStock: false },
      3364: { name: 'Disassembled Gold Wings', image: 'static/common/items/Items/Valentine2022/cupids_wings_avatar.png', category: 'Crafting Materials', gold: 23000, infStock: false },
      3365: { name: "Disassembled Cupid's Cradle", image: 'https://ptpimg.me/7itno5.png', category: 'Crafting Materials', gold: 1030000, infStock: false },
      3368: { name: 'IRC Voice (1 Year)', image: 'static/common/items/Items/Buff/irc_voice_cheap.png', category: 'IRC customizations', gold: 130000, infStock: true },
      3369: { name: 'Red Dragon', image: 'https://ptpimg.me/01y295.png', category: 'Equipment', gold: 500000, infStock: false },
      3370: { name: 'Blue Dragon', image: 'https://ptpimg.me/g1t9wq.png', category: 'Equipment', gold: 500000, infStock: false },
      3371: { name: 'Green Dragon', image: 'https://ptpimg.me/eb6p8q.png', category: 'Equipment', gold: 500000, infStock: false },
      3373: { name: 'Gold Dragon', image: 'https://ptpimg.me/39xam3.png', category: 'Equipment', gold: 1000000, infStock: false },
      3378: { name: '12th Birthday Badge', image: 'https://gazellegames.net/static/common/items/Items/Badges/12th_Birthday_Badge.png', category: 'User badges', gold: 15000, infStock: false },
      3379: { name: 'Slice of Birthday Cake', image: 'https://ptpimg.me/880dpt.png', category: 'Crafting Materials', gold: 3000, infStock: false },
      3384: { name: 'Golden Egg', image: 'https://ptpimg.me/vg48o6.png', category: 'Crafting Materials', gold: 1000000, infStock: true },
  };

  //
  // Defines all the recipes with ingredients and results, from data.js
  //
  // recipe object:
  //    See https://gazellegames.net/wiki.php?action=article&id=401#_2452401087 for details
  //  name (optional) is the recipe display name. Item's name (via itemId) is used if omitted
  //
  // prettier-ignore
  var RECIPES = [
      { itemId: 1988, recipe: 'EEEEEEEEEEEEEEEEEEEE01987EEEEEEEEEEEEEEEEEEEE', book: 'Glass', type: 'Standard', requirement: 1, name: 'Glass Shards From Sand' },
      { itemId: 1988, recipe: 'EEEEEEEEEEEEEEEEEEEE00125EEEEEEEEEEEEEEEEEEEE', book: 'Glass', type: 'Standard', name: 'Glass Shards From Test Tube' },
      { itemId: 2436, recipe: 'EEEEEEEEEEEEEEEEEEEE00124EEEEEEEEEEEEEEEEEEEE', book: 'Glass', type: 'Standard', name: 'Glass Shards From Vial' },
      { itemId: 2437, recipe: 'EEEEEEEEEEEEEEEEEEEE00126EEEEEEEEEEEEEEEEEEEE', book: 'Glass', type: 'Standard', name: 'Glass Shards From Bowl' },
      { itemId: 125, recipe: 'EEEEE01988EEEEEEEEEE01988EEEEEEEEEEEEEEEEEEEE', book: 'Glass', type: 'Standard', requirement: 1 },
      { itemId: 124, recipe: 'EEEEE01988EEEEE0198801988EEEEE0198801988EEEEE', book: 'Glass', type: 'Standard', requirement: 1 },
      { itemId: 126, recipe: '01988019880198801988EEEEE01988019880198801988', book: 'Glass', type: 'Standard', requirement: 1 },
      { itemId: 124, recipe: 'EEEEEEEEEEEEEEEEEEEE01987EEEEEEEEEE02230EEEEE', book: 'Glass', type: 'Standard', requirement: 1, name: 'Dust Ore Vial' },
      { itemId: 126, recipe: 'EEEEEEEEEEEEEEEEEEEE01987EEEEEEEEEE02231EEEEE', book: 'Glass', type: 'Standard', requirement: 1, name: 'Dust Ore Bowl' },
      { itemId: 66, recipe: 'EEEEEEEEEE00115EEEEE0012500114EEEEEEEEEEEEEEE', book: 'Potions', type: 'Standard' },
      { itemId: 98, recipe: 'EEEEEEEEEE00115EEEEE0012400114EEEEEEEEEE00115', book: 'Potions', type: 'Standard' },
      { itemId: 99, recipe: '00115EEEEE0011500115001240011400115EEEEE00115', book: 'Potions', type: 'Standard' },
      { itemId: 100, recipe: 'EEEEE00113EEEEE000990012600099EEEEEEEEEEEEEEE', book: 'Potions', type: 'Standard' },
      { itemId: 104, recipe: 'EEEEEEEEEE00111EEEEE0012500127EEEEEEEEEEEEEEE', book: 'Potions', type: 'Standard' },
      { itemId: 105, recipe: 'EEEEEEEEEE00111EEEEE0012400127EEEEEEEEEE00111', book: 'Potions', type: 'Standard' },
      { itemId: 106, recipe: '00111EEEEE0011100111001240012700111EEEEE00111', book: 'Potions', type: 'Standard' },
      { itemId: 107, recipe: 'EEEEE00113EEEEE001060012600106EEEEEEEEEEEEEEE', book: 'Potions', type: 'Standard' },
      { itemId: 127, recipe: 'EEEEEEEEEEEEEEEEEEEE0012500112EEEEEEEEEEEEEEE', book: 'Potions', type: 'Standard' },
      { itemId: 2433, recipe: 'EEEEEEEEEEEEEEE001240011400114EEEEEEEEEEEEEEE', book: 'Potions', type: 'Standard' },
      { itemId: 2434, recipe: '001140011400114001140012600114EEEEE00113EEEEE', book: 'Potions', type: 'Standard' },
      { itemId: 2580, recipe: 'EEEEEEEEEEEEEEEEEEEE0257902579EEEEEEEEEEEEEEE', book: 'Food', type: 'Standard', requirement: 3 },
      { itemId: 2581, recipe: 'EEEEEEEEEEEEEEE001120258000112EEEEEEEEEEEEEEE', book: 'Food', type: 'Standard', requirement: 3 },
      { itemId: 2582, recipe: 'EEEEEEEEEEEEEEE025810011300113EEEEEEEEEEEEEEE', book: 'Food', type: 'Standard', requirement: 3 },
      { itemId: 2718, recipe: 'EEEEEEEEEEEEEEEEEEEE0271702717EEEEEEEEEEEEEEE', book: 'Food', type: 'Standard', requirement: 3 },
      { itemId: 2719, recipe: 'EEEEEEEEEEEEEEEEEEEE0271800112EEEEEEEEEEEEEEE', book: 'Food', type: 'Standard', requirement: 3 },
      { itemId: 2720, recipe: 'EEEEEEEEEEEEEEE027190255100113EEEEEEEEEEEEEEE', book: 'Food', type: 'Standard', requirement: 3 },
      { itemId: 2721, recipe: 'EEEEEEEEEEEEEEE027200255102551EEEEEEEEEEEEEEE', book: 'Food', type: 'Standard', requirement: 3 },
      { itemId: 2822, recipe: '032180229503219EEEEEEEEEEEEEEE019880198801988', book: 'Food', type: 'Standard' },
      { itemId: 3226, recipe: '032180229503220EEEEEEEEEEEEEEE019880198801988', book: 'Food', type: 'Standard' },
      { itemId: 3227, recipe: '032180229503221EEEEEEEEEEEEEEE019880198801988', book: 'Food', type: 'Standard' },
      { itemId: 3228, recipe: '032180229503241EEEEEEEEEEEEEEE019880198801988', book: 'Food', type: 'Standard' },
      { itemId: 3229, recipe: '0321802295EEEEE0322303222EEEEE019880198801988', book: 'Food', type: 'Standard' },
      { itemId: 3230, recipe: '0321802295EEEEE032230322403225019880198801988', book: 'Food', type: 'Standard' },
      { itemId: 2236, recipe: '0222502234EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1 },
      { itemId: 2235, recipe: '0222502225EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1 },
      { itemId: 2237, recipe: '0222602226EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1 },
      { itemId: 2238, recipe: '0222602226EEEEEEEEEE02233EEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1 },
      { itemId: 2238, recipe: 'EEEEE02237EEEEEEEEEE02233EEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1, name: 'Steel Bar From Iron Bar' },
      { itemId: 2239, recipe: '0222702227EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1 },
      { itemId: 2240, recipe: '0222802228EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1 },
      { itemId: 2241, recipe: '0222902229EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1 },
      { itemId: 2242, recipe: '0223002230EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1 },
      { itemId: 2243, recipe: '0223102231EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1 },
      { itemId: 2244, recipe: '0223202232EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', book: 'Material Bars', type: 'Standard', requirement: 1 },
      { itemId: 2261, recipe: 'EEEEE02236EEEEEEEEEEEEEEEEEEEE02236EEEEEEEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2262, recipe: 'EEEEE02235EEEEEEEEEEEEEEEEEEEE02235EEEEEEEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2263, recipe: 'EEEEE02237EEEEEEEEEE02237EEEEE02237EEEEE02237', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2264, recipe: 'EEEEE02238EEEEEEEEEE02238EEEEE02238EEEEE02238', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2265, recipe: 'EEEEE02239EEEEEEEEEE02239EEEEE02239EEEEE02239', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2266, recipe: 'EEEEE02240EEEEEEEEEE02240EEEEE022400224002240', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2267, recipe: 'EEEEE02241EEEEEEEEEE02241EEEEE022410224102241', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2268, recipe: 'EEEEE02242EEEEEEEEEEEEEEEEEEEE02242EEEEEEEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2269, recipe: 'EEEEE02243EEEEEEEEEE02243EEEEE02243EEEEE02243', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2270, recipe: 'EEEEE02244EEEEEEEEEE02244EEEEE022440224402244', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2761, recipe: 'EEEEE02236EEEEEEEEEEEEEEEEEEEEEEEEE02627EEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2762, recipe: 'EEEEE02235EEEEEEEEEEEEEEEEEEEEEEEEE02627EEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2763, recipe: 'EEEEE02237EEEEEEEEEE02237EEEEEEEEEE02627EEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2764, recipe: 'EEEEE02238EEEEEEEEEE02238EEEEEEEEEE02627EEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2765, recipe: 'EEEEE02239EEEEEEEEEE02239EEEEEEEEEE02627EEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2766, recipe: 'EEEEE02240EEEEEEEEEE02240EEEEEEEEEE02627EEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2767, recipe: 'EEEEE02241EEEEEEEEEE02241EEEEEEEEEE02627EEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2849, recipe: 'EEEEE02242EEEEEEEEEEEEEEEEEEEEEEEEE02627EEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2850, recipe: 'EEEEE02243EEEEEEEEEE02243EEEEEEEEEE02627EEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2851, recipe: 'EEEEE02244EEEEEEEEEE02244EEEEEEEEEE02627EEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2261, recipe: 'EEEEEEEEEEEEEEE0223602761EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1, name: 'Impure Bronze Segmentata To Cuirass' },
      { itemId: 2262, recipe: 'EEEEEEEEEEEEEEE0223502762EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1, name: 'Bronze Segmentata To Cuirass' },
      { itemId: 2263, recipe: '02237EEEEEEEEEE0223702763EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1, name: 'Iron Segmentata To Cuirass' },
      { itemId: 2264, recipe: '02238EEEEEEEEEE0223802764EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1, name: 'Steel Segmentata To Cuirass' },
      { itemId: 2265, recipe: '02239EEEEEEEEEE0223902765EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1, name: 'Gold Segmentata To Cuirass' },
      { itemId: 2266, recipe: '02240EEEEEEEEEE0224002766EEEEE02240EEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1, name: 'Mithril Segmentata To Cuirass' },
      { itemId: 2267, recipe: '02241EEEEEEEEEE0224102767EEEEE02241EEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1, name: 'Adamantium Segmentata To Cuirass' },
      { itemId: 2268, recipe: 'EEEEEEEEEEEEEEE0224202849EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1, name: 'Quartz Lamellar To Chainmail' },
      { itemId: 2269, recipe: '02243EEEEEEEEEE0224302850EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1, name: 'Jade Lamellar To Chainmail' },
      { itemId: 2270, recipe: '02244EEEEEEEEEE0224402851EEEEE02244EEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1, name: 'Amethyst Lamellar To Chainmail' },
      { itemId: 2862, recipe: 'EEEEE02236EEEEEEEEEEEEEEEEEEEE02627EEEEE02627', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2863, recipe: 'EEEEE02235EEEEEEEEEE02862EEEEE02627EEEEE02627', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2864, recipe: 'EEEEE02237EEEEEEEEEE02863EEEEE02627EEEEE02627', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2865, recipe: 'EEEEE02238EEEEEEEEEE02864EEEEE02627EEEEE02627', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2866, recipe: 'EEEEE02239EEEEEEEEEE02865EEEEE02627EEEEE02627', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2867, recipe: 'EEEEE02240EEEEEEEEEE02866EEEEE02627EEEEE02627', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2868, recipe: 'EEEEE02241EEEEEEEEEE02867EEEEE02627EEEEE02627', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2908, recipe: 'EEEEE02236EEEEEEEEEEEEEEE0262702550EEEEEEEEEE', book: 'Armor', type: 'Standard', requirement: 1 },
      { itemId: 2907, recipe: '0255002235EEEEEEEEEE029080262702550EEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2906, recipe: '0255002237EEEEE02550029070262702550EEEEEEEEEE', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2905, recipe: '0255002238EEEEE0255002906026270255002550EEEEE', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2321, recipe: '0232302239EEEEE0232302905026270232302239EEEEE', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2902, recipe: '0232302240EEEEEEEEEE02321026270232302240EEEEE', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2903, recipe: '0232302241EEEEEEEEEE02902026270232302241EEEEE', book: 'Armor', type: 'Upgrade', requirement: 1 },
      { itemId: 2261, recipe: 'EEEEEEEEEEEEEEE0223602261EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Impure Bronze Cuirass' },
      { itemId: 2262, recipe: 'EEEEEEEEEEEEEEE0223502262EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Bronze Cuirass' },
      { itemId: 2263, recipe: '02237EEEEEEEEEE0223702263EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Iron Cuirass' },
      { itemId: 2264, recipe: '02238EEEEEEEEEE0223802264EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Steel Cuirass' },
      { itemId: 2265, recipe: '02239EEEEEEEEEE0223902265EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Gold Cuirass' },
      { itemId: 2266, recipe: '02240EEEEEEEEEE0224002266EEEEE02240EEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Mithril Cuirass' },
      { itemId: 2267, recipe: '02241EEEEEEEEEE0224102267EEEEE02241EEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repeer Adamantium Cuirass' },
      { itemId: 2268, recipe: 'EEEEEEEEEEEEEEE0224202268EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Quartz Chainmail' },
      { itemId: 2269, recipe: '02243EEEEEEEEEE0224302269EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Jade Chainmail' },
      { itemId: 2270, recipe: '02244EEEEEEEEEE0224402270EEEEE02244EEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Amethyst Chainmail' },
      { itemId: 2867, recipe: 'EEEEE02240EEEEEEEEEE02867EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Mithril Armguards' },
      { itemId: 2868, recipe: 'EEEEE02241EEEEEEEEEE02868EEEEEEEEEEEEEEEEEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Adamantium Armguards' },
      { itemId: 2321, recipe: 'EEEEE02323EEEEEEEEEE02321EEEEEEEEEE02239EEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Gold Power Gloves' },
      { itemId: 2902, recipe: 'EEEEE02323EEEEEEEEEE02902EEEEEEEEEE02240EEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Mithril Power Gloves' },
      { itemId: 2903, recipe: 'EEEEE02323EEEEEEEEEE02903EEEEEEEEEE02241EEEEE', book: 'Armor', type: 'Repair', requirement: 1, name: 'Repair Adamantium Power Gloves' },
      { itemId: 2641, recipe: '02236EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE02236EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2642, recipe: '02235EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE02235EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2643, recipe: '02237EEEEE02237EEEEE02237EEEEEEEEEE02237EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2644, recipe: '02238EEEEE02238EEEEE02238EEEEEEEEEE02238EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2645, recipe: '02239EEEEE02239EEEEE02239EEEEEEEEEE02239EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2646, recipe: '022400224002240EEEEE02240EEEEEEEEEE02240EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2647, recipe: '022410224102241EEEEE02241EEEEEEEEEE02241EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2648, recipe: '02242EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE02242EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2649, recipe: '02243EEEEE02243EEEEE02243EEEEEEEEEE02243EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2650, recipe: '022440224402244EEEEE02244EEEEEEEEEE02244EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2852, recipe: 'EEEEE02627EEEEEEEEEEEEEEEEEEEEEEEEE02236EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2853, recipe: 'EEEEE02627EEEEEEEEEEEEEEEEEEEEEEEEE02235EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2854, recipe: 'EEEEE02627EEEEEEEEEE02237EEEEEEEEEE02237EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2855, recipe: 'EEEEE02627EEEEEEEEEE02238EEEEEEEEEE02238EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2856, recipe: 'EEEEE02627EEEEEEEEEE02239EEEEEEEEEE02239EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2857, recipe: 'EEEEE02627EEEEEEEEEE02240EEEEEEEEEE02240EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2858, recipe: 'EEEEE02627EEEEEEEEEE02241EEEEEEEEEE02241EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2859, recipe: 'EEEEE02627EEEEEEEEEEEEEEEEEEEEEEEEE02242EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2860, recipe: 'EEEEE02627EEEEEEEEEE02243EEEEEEEEEE02243EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2861, recipe: 'EEEEE02627EEEEEEEEEE02244EEEEEEEEEE02244EEEEE', book: 'Weapons', type: 'Standard', requirement: 1 },
      { itemId: 2641, recipe: 'EEEEEEEEEEEEEEE0223602852EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Upgrade', requirement: 1, name: 'Impure Bronze Billhook To Claymore' },
      { itemId: 2642, recipe: 'EEEEEEEEEEEEEEE0223502853EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Upgrade', requirement: 1, name: 'Bronze Billhook To Claymore' },
      { itemId: 2643, recipe: '02237EEEEEEEEEE0223702854EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Upgrade', requirement: 1, name: 'Iron Billhook To Claymore' },
      { itemId: 2644, recipe: '02238EEEEEEEEEE0223802855EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Upgrade', requirement: 1, name: 'Steel Billhook To Claymore' },
      { itemId: 2645, recipe: '02239EEEEEEEEEE0223902856EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Upgrade', requirement: 1, name: 'Gold Billhook To Claymore' },
      { itemId: 2646, recipe: '02240EEEEEEEEEE0224002857EEEEE02240EEEEEEEEEE', book: 'Weapons', type: 'Upgrade', requirement: 1, name: 'Mithril Billhook To Claymore' },
      { itemId: 2647, recipe: '02241EEEEEEEEEE0224102858EEEEE02241EEEEEEEEEE', book: 'Weapons', type: 'Upgrade', requirement: 1, name: 'Adamantium Billhook To Claymore' },
      { itemId: 2648, recipe: 'EEEEEEEEEEEEEEE0224202859EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Upgrade', requirement: 1, name: 'Quartz Guandao To Khopesh' },
      { itemId: 2649, recipe: '02243EEEEEEEEEE0224302860EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Upgrade', requirement: 1, name: 'Jade Guandao To Khopesh' },
      { itemId: 2650, recipe: '02244EEEEEEEEEE0224402861EEEEE02244EEEEEEEEEE', book: 'Weapons', type: 'Upgrade', requirement: 1, name: 'Amethyst Guandao To Khopesh' },
      { itemId: 2641, recipe: 'EEEEEEEEEEEEEEE0223602641EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Repair', requirement: 1, name: 'Repair Impure Bronze Claymore' },
      { itemId: 2642, recipe: 'EEEEEEEEEEEEEEE0223502642EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Repair', requirement: 1, name: 'Repair Bronze Claymore' },
      { itemId: 2643, recipe: '02237EEEEEEEEEE0223702643EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Repair', requirement: 1, name: 'Repair Iron Claymore' },
      { itemId: 2644, recipe: '02238EEEEEEEEEE0223802644EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Repair', requirement: 1, name: 'Repair Steel Claymore' },
      { itemId: 2645, recipe: '02239EEEEEEEEEE0223902645EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Repair', requirement: 1, name: 'Repair Gold Claymore' },
      { itemId: 2646, recipe: '02240EEEEEEEEEE0224002646EEEEE02240EEEEEEEEEE', book: 'Weapons', type: 'Repair', requirement: 1, name: 'Repair Mithril Claymore' },
      { itemId: 2647, recipe: '02241EEEEEEEEEE0224102647EEEEE02241EEEEEEEEEE', book: 'Weapons', type: 'Repair', requirement: 1, name: 'Repair Adamantium Claymore' },
      { itemId: 2648, recipe: 'EEEEEEEEEEEEEEE0224202648EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Repair', requirement: 1, name: 'Repair Quartz Khopesh' },
      { itemId: 2649, recipe: '02243EEEEEEEEEE0224302649EEEEEEEEEEEEEEEEEEEE', book: 'Weapons', type: 'Repair', requirement: 1, name: 'Repair Jade Khopesh' },
      { itemId: 2650, recipe: '02244EEEEEEEEEE0224402650EEEEE02244EEEEEEEEEE', book: 'Weapons', type: 'Repair', requirement: 1, name: 'Repair Amethyst Khopesh' },
      { itemId: 2225, recipe: 'EEEEEEEEEEEEEEE026530223602653EEEEEEEEEEEEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Impure Bronze Bar To Ore' },
      { itemId: 2666, recipe: 'EEEEEEEEEEEEEEE026530223502653EEEEEEEEEEEEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Bronze Bar To Ore' },
      { itemId: 2668, recipe: 'EEEEEEEEEEEEEEE026530223702653EEEEEEEEEEEEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Iron Bar To Ore' },
      { itemId: 2668, recipe: 'EEEEEEEEEEEEEEE026530223802653EEEEEEEEEEEEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Steel Bar To Ore' },
      { itemId: 2670, recipe: 'EEEEEEEEEEEEEEE026530223902653EEEEEEEEEEEEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Gold Bar To Ore' },
      { itemId: 2671, recipe: 'EEEEEEEEEEEEEEE026530224002653EEEEEEEEEEEEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Mithril Bar To Ore' },
      { itemId: 2672, recipe: 'EEEEEEEEEEEEEEE026530224102653EEEEEEEEEEEEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Adamantium Bar To Ore' },
      { itemId: 2673, recipe: 'EEEEEEEEEEEEEEE026530224202653EEEEEEEEEEEEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Quartz Bar To Dust' },
      { itemId: 2675, recipe: 'EEEEEEEEEEEEEEE026530224302653EEEEEEEEEEEEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Jade Bar To Dust' },
      { itemId: 2676, recipe: 'EEEEEEEEEEEEEEE026530224402653EEEEEEEEEEEEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Amethyst Bar To Dust' },
      { itemId: 2656, recipe: 'EEEEEEEEEEEEEEE022340223502234EEEEE02653EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Downgrade Bronze Bar' },
      { itemId: 2237, recipe: 'EEEEEEEEEEEEEEEEEEEE02238EEEEEEEEEE02653EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Downgrade Steel Bar' },
      { itemId: 1987, recipe: 'EEEEEEEEEEEEEEEEEEEE02508EEEEEEEEEE02653EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Melt Dwarven Gem' },
      { itemId: 2236, recipe: 'EEEEEEEEEEEEEEEEEEEE02261EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Impure Bronze Cuirass To Bar' },
      { itemId: 2235, recipe: 'EEEEEEEEEEEEEEEEEEEE02262EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Bronze Cuirass To Bar' },
      { itemId: 2657, recipe: 'EEEEEEEEEEEEEEEEEEEE02263EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Iron Cuirass To Bars' },
      { itemId: 2658, recipe: 'EEEEEEEEEEEEEEEEEEEE02264EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Steel Cuirass To Bars' },
      { itemId: 2659, recipe: 'EEEEEEEEEEEEEEEEEEEE02265EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Gold Cuirass To Bars' },
      { itemId: 2661, recipe: 'EEEEEEEEEEEEEEEEEEEE02266EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Mithril Cuirass To Bars' },
      { itemId: 2662, recipe: 'EEEEEEEEEEEEEEEEEEEE02267EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Adamantium Cuirass To Bars' },
      { itemId: 2236, recipe: 'EEEEEEEEEEEEEEEEEEEE02641EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Impure Bronze Claymore To Bar' },
      { itemId: 2235, recipe: 'EEEEEEEEEEEEEEEEEEEE02642EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Bronze Claymore To Bar' },
      { itemId: 2657, recipe: 'EEEEEEEEEEEEEEEEEEEE02643EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Iron Claymore To Bars' },
      { itemId: 2658, recipe: 'EEEEEEEEEEEEEEEEEEEE02644EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Steel Claymore To Bars' },
      { itemId: 2659, recipe: 'EEEEEEEEEEEEEEEEEEEE02645EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Gold Claymore To Bars' },
      { itemId: 2661, recipe: 'EEEEEEEEEEEEEEEEEEEE02646EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Mithril Claymore To Bars' },
      { itemId: 2662, recipe: 'EEEEEEEEEEEEEEEEEEEE02647EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Adamantium Claymore To Bars' },
      { itemId: 2242, recipe: 'EEEEEEEEEEEEEEEEEEEE02268EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Quartz Chainmail To Bar' },
      { itemId: 2664, recipe: 'EEEEEEEEEEEEEEEEEEEE02269EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Jade Chainmail To Bars' },
      { itemId: 2665, recipe: 'EEEEEEEEEEEEEEEEEEEE02270EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Amethyst Chainmail To Bars' },
      { itemId: 2242, recipe: 'EEEEEEEEEEEEEEEEEEEE02648EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Quartz Khopesh To Bar' },
      { itemId: 2664, recipe: 'EEEEEEEEEEEEEEEEEEEE02649EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Jade Khopesh To Bars' },
      { itemId: 2665, recipe: 'EEEEEEEEEEEEEEEEEEEE02650EEEEE026530265302653', book: 'Recasting', type: 'Downgrade', requirement: 1, name: ' Amethyst Khopesh To Bars' },
      { itemId: 2642, recipe: '02653EEEEE0265302225026410222502653EEEEE02653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Impure Bronze Claymore To Bronze' },
      { itemId: 2262, recipe: '02653EEEEE0265302225022610222502653EEEEE02653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Impure Bronze Cuirass To Bronze' },
      { itemId: 2643, recipe: '02653EEEEE02653022370264202237026530223702653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Bronze Claymore To Iron' },
      { itemId: 2263, recipe: '02653EEEEE02653022370226202237026530223702653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Bronze Cuirass To Iron' },
      { itemId: 2644, recipe: '02653EEEEE02653022330264302233026530223302653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Iron Claymore To Steel' },
      { itemId: 2264, recipe: '02653EEEEE02653022330226302233026530223302653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Iron Cuirass To Steel' },
      { itemId: 2645, recipe: '02653EEEEE02653022390264402239026530223902653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Steel Claymore To Gold' },
      { itemId: 2265, recipe: '02653EEEEE02653022390226402239026530223902653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Steel Cuirass To Gold' },
      { itemId: 2646, recipe: '026530224002653022400264502240026530224002653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Gold Claymore To Mithril' },
      { itemId: 2266, recipe: '026530224002653022400226502240026530224002653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Gold Cuirass To Mithril' },
      { itemId: 2647, recipe: '026530224102653022410264602241026530224102653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Mithril Claymore To Adamantium' },
      { itemId: 2267, recipe: '026530224102653022410226602241026530224102653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Mithril Cuirass To Adamantium' },
      { itemId: 2649, recipe: '02653EEEEE02653022430264802243026530224302653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Quartz Khopesh To Jade' },
      { itemId: 2269, recipe: '02653EEEEE02653022430226802243026530224302653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Quartz Chainmail To Jade' },
      { itemId: 2650, recipe: '026530224402653022440264902244026530224402653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Jade Khopesh To Amethyst' },
      { itemId: 2270, recipe: '026530224402653022440226902244026530224402653', book: 'Recasting', type: 'Upgrade', requirement: 1, name: 'Jade Chainmail To Amethyst' },
      { itemId: 2543, recipe: 'EEEEE02653EEEEEEEEEE02732EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Quartz Loop of Aggression' },
      { itemId: 2546, recipe: 'EEEEE02653EEEEEEEEEE02735EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Quartz Loop of Fortune' },
      { itemId: 2540, recipe: 'EEEEE02653EEEEEEEEEE02729EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Quartz Loop of Luck' },
      { itemId: 2544, recipe: 'EEEEE02653EEEEEEEEEE02733EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Jade Loop of Aggression' },
      { itemId: 2547, recipe: 'EEEEE02653EEEEEEEEEE02736EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Jade Loop of Fortune' },
      { itemId: 2541, recipe: 'EEEEE02653EEEEEEEEEE02730EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Jade Loop of Luck' },
      { itemId: 2545, recipe: 'EEEEE02653EEEEEEEEEE02734EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Amethyst Loop of Aggression' },
      { itemId: 2548, recipe: 'EEEEE02653EEEEEEEEEE02737EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Amethyst Loop of Fortune' },
      { itemId: 2542, recipe: 'EEEEE02653EEEEEEEEEE02731EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Amethyst Loop of Luck' },
      { itemId: 2566, recipe: 'EEEEE02653EEEEEEEEEE02738EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Quartz Prism of Aggression' },
      { itemId: 2568, recipe: 'EEEEE02653EEEEEEEEEE02740EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Quartz Prism of Fortune' },
      { itemId: 2567, recipe: 'EEEEE02653EEEEEEEEEE02739EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Quartz Prism of Luck' },
      { itemId: 2569, recipe: 'EEEEE02653EEEEEEEEEE02741EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Jade Trifocal of Aggression' },
      { itemId: 2571, recipe: 'EEEEE02653EEEEEEEEEE02743EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Jade Trifocal of Fortune' },
      { itemId: 2570, recipe: 'EEEEE02653EEEEEEEEEE02742EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Jade Trifocal of Luck' },
      { itemId: 2572, recipe: 'EEEEE02653EEEEEEEEEE02744EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Amethyst Totality of Aggression' },
      { itemId: 2574, recipe: 'EEEEE02653EEEEEEEEEE02746EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Amethyst Totality of Fortune' },
      { itemId: 2573, recipe: 'EEEEE02653EEEEEEEEEE02745EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Unpower Amethyst Totality of Luck' },
      { itemId: 2761, recipe: 'EEEEE02653EEEEEEEEEE02261EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Impure Bronze Cuirass To Segmentata' },
      { itemId: 2762, recipe: 'EEEEE02653EEEEEEEEEE02262EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Bronze Cuirass To Segmentata' },
      { itemId: 2763, recipe: 'EEEEE02653EEEEEEEEEE02263EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Iron Cuirass To Segmentata' },
      { itemId: 2764, recipe: 'EEEEE02653EEEEEEEEEE02264EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Steel Cuirass To Segmentata' },
      { itemId: 2765, recipe: 'EEEEE02653EEEEEEEEEE02265EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Gold Cuirass To Segmentata' },
      { itemId: 2766, recipe: 'EEEEE02653EEEEEEEEEE02266EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Mithril Cuirass To Segmentata' },
      { itemId: 2767, recipe: 'EEEEE02653EEEEEEEEEE02267EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Adamantium Cuirass To Segmentata' },
      { itemId: 2852, recipe: 'EEEEE02653EEEEEEEEEE02641EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Impure Bronze Claymore To Billhook' },
      { itemId: 2853, recipe: 'EEEEE02653EEEEEEEEEE02642EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Bronze Claymore To Billhook' },
      { itemId: 2854, recipe: 'EEEEE02653EEEEEEEEEE02643EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Iron Claymore To Billhook' },
      { itemId: 2855, recipe: 'EEEEE02653EEEEEEEEEE02644EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Steel Claymore To Billhook' },
      { itemId: 2856, recipe: 'EEEEE02653EEEEEEEEEE02645EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Gold Claymore To Billhook' },
      { itemId: 2857, recipe: 'EEEEE02653EEEEEEEEEE02646EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Mithril Claymore To Billhook' },
      { itemId: 2858, recipe: 'EEEEE02653EEEEEEEEEE02647EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Adamantium Claymore To Billhook' },
      { itemId: 2849, recipe: 'EEEEE02653EEEEEEEEEE02268EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Quartz Chainmail To Lamellar' },
      { itemId: 2850, recipe: 'EEEEE02653EEEEEEEEEE02269EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Jade Chainmail To Lamellar' },
      { itemId: 2851, recipe: 'EEEEE02653EEEEEEEEEE02270EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Amethyst Chainmail To Lamellar' },
      { itemId: 2859, recipe: 'EEEEE02653EEEEEEEEEE02648EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Quartz Khopesh To Guandao' },
      { itemId: 2860, recipe: 'EEEEE02653EEEEEEEEEE02649EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Jade Khopesh To Guandao' },
      { itemId: 2861, recipe: 'EEEEE02653EEEEEEEEEE02650EEEEEEEEEE02627EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Amethyst Khopesh To Guandao' },
      { itemId: 2866, recipe: 'EEEEEEEEEEEEEEEEEEEE02867EEEEEEEEEE02653EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Mithril Armguards To Gold' },
      { itemId: 2866, recipe: 'EEEEEEEEEEEEEEEEEEEE02868EEEEEEEEEE02653EEEEE', book: 'Recasting', type: 'Downgrade', requirement: 1, name: 'Adamantium Armguards To Gold' },
      { itemId: 2537, recipe: 'EEEEEEEEEEEEEEEEEEEE0224202233EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2538, recipe: 'EEEEE01988EEEEEEEEEE02537EEEEEEEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2565, recipe: 'EEEEEEEEEEEEEEE001160224400116001160224400116', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2564, recipe: 'EEEEEEEEEEEEEEE025490224402549025490224402549', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2563, recipe: 'EEEEEEEEEEEEEEE023230224402323023230224402323', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2566, recipe: '025510224202551025510253802551025510223602551', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2568, recipe: '025500224202550025500253802550025500223602550', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2567, recipe: '025520224202552025520253802552025520223602552', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2543, recipe: 'EEEEE02551EEEEEEEEEE02539EEEEEEEEEE02242EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2546, recipe: 'EEEEE02550EEEEEEEEEE02539EEEEEEEEEE02242EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2540, recipe: 'EEEEE02552EEEEEEEEEE02539EEEEEEEEEE02242EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2569, recipe: '022430224302243001160253800116EEEEE02235EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2571, recipe: '022430224302243023230253802323EEEEE02235EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2570, recipe: '022430224302243025490253802549EEEEE02235EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2544, recipe: 'EEEEE00116EEEEE022430253902243EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2547, recipe: 'EEEEE02323EEEEE022430253902243EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2541, recipe: 'EEEEE02549EEEEE022430253902243EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2572, recipe: '0224402244022440011602538001160256502239EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2574, recipe: '0224402244022440232302538023230256302239EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2573, recipe: '0224402244022440254902538025490256402239EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2545, recipe: '001160011600116022440253902244EEEEE02244EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2548, recipe: '023230232302323022440253902244EEEEE02244EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2542, recipe: '025490254902549022440253902244EEEEE02244EEEEE', book: 'Jewelry', type: 'Standard', requirement: 2 },
      { itemId: 2732, recipe: 'EEEEEEEEEEEEEEEEEEEE02543EEEEEEEEEE02242EEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2735, recipe: 'EEEEEEEEEEEEEEEEEEEE02546EEEEEEEEEE02242EEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2729, recipe: 'EEEEEEEEEEEEEEEEEEEE02540EEEEEEEEEE02242EEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2733, recipe: 'EEEEE02243EEEEEEEEEE02544EEEEEEEEEE02243EEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2736, recipe: 'EEEEE02243EEEEEEEEEE02547EEEEEEEEEE02243EEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2730, recipe: 'EEEEE02243EEEEEEEEEE02541EEEEEEEEEE02243EEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2734, recipe: 'EEEEE02244EEEEEEEEEE0254502244EEEEE02244EEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2737, recipe: 'EEEEE02244EEEEEEEEEE0254802244EEEEE02244EEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2731, recipe: 'EEEEE02244EEEEEEEEEE0254202244EEEEE02244EEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2738, recipe: 'EEEEEEEEEEEEEEE022420256602242EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2740, recipe: 'EEEEEEEEEEEEEEE022420256802242EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2739, recipe: 'EEEEEEEEEEEEEEE022420256702242EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2741, recipe: 'EEEEE02243EEEEE022430256902243EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2743, recipe: 'EEEEE02243EEEEE022430257102243EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2742, recipe: 'EEEEE02243EEEEE022430257002243EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2744, recipe: '022440224402244022440257202244EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2746, recipe: '022440224402244022440257402244EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2745, recipe: '022440224402244022440257302244EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Upgrade', requirement: 2 },
      { itemId: 2732, recipe: 'EEEEEEEEEEEEEEEEEEEE02732EEEEEEEEEE02242EEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Quartz Loop of Aggression' },
      { itemId: 2735, recipe: 'EEEEEEEEEEEEEEEEEEEE02735EEEEEEEEEE02242EEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Quartz Loop of Fortune' },
      { itemId: 2729, recipe: 'EEEEEEEEEEEEEEEEEEEE02729EEEEEEEEEE02242EEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Quartz Loop of Luck' },
      { itemId: 2733, recipe: 'EEEEE02243EEEEEEEEEE02733EEEEEEEEEE02243EEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Jade Loop of Aggression' },
      { itemId: 2736, recipe: 'EEEEE02243EEEEEEEEEE02736EEEEEEEEEE02243EEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Jade Loop of Fortune' },
      { itemId: 2730, recipe: 'EEEEE02243EEEEEEEEEE02730EEEEEEEEEE02243EEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Jade Loop of Luck' },
      { itemId: 2734, recipe: 'EEEEE02244EEEEEEEEEE0273402244EEEEE02244EEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Amethyst Loop of Aggression' },
      { itemId: 2737, recipe: 'EEEEE02244EEEEEEEEEE0273702244EEEEE02244EEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Amethyst Loop of Fortune' },
      { itemId: 2731, recipe: 'EEEEE02244EEEEEEEEEE0273102244EEEEE02244EEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Amethyst Loop of Luck' },
      { itemId: 2738, recipe: 'EEEEEEEEEEEEEEE022420273802242EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Quartz Prism of Aggression' },
      { itemId: 2740, recipe: 'EEEEEEEEEEEEEEE022420274002242EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Quartz Prism of Fortune' },
      { itemId: 2739, recipe: 'EEEEEEEEEEEEEEE022420273902242EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Quartz Prism of Luck' },
      { itemId: 2741, recipe: 'EEEEE02243EEEEE022430274102243EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Jade Trifocal of Aggression' },
      { itemId: 2743, recipe: 'EEEEE02243EEEEE022430274302243EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Jade Trifocal of Fortune' },
      { itemId: 2742, recipe: 'EEEEE02243EEEEE022430274202243EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Jade Trifocal of Luck' },
      { itemId: 2744, recipe: '022440224402244022440274402244EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Amethyst Totality of Aggression' },
      { itemId: 2746, recipe: '022440224402244022440274602244EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Amethyst Totality of Fortune' },
      { itemId: 2745, recipe: '022440224402244022440274502244EEEEEEEEEEEEEEE', book: 'Jewelry', type: 'Repair', requirement: 2, name: 'Repair Amethyst Totality of Luck' },
      { itemId: 2369, recipe: 'EEEEEEEEEEEEEEE023580235902357EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2370, recipe: 'EEEEEEEEEEEEEEE023650236402366EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2371, recipe: 'EEEEEEEEEEEEEEE023610236702368EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2438, recipe: 'EEEEEEEEEEEEEEE024000238802410EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2372, recipe: 'EEEEEEEEEEEEEEE023690237002371EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2376, recipe: 'EEEEEEEEEEEEEEE023730237402375EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2384, recipe: 'EEEEEEEEEEEEEEE023810238302382EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2380, recipe: 'EEEEEEEEEEEEEEE023780237702379EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2385, recipe: 'EEEEEEEEEEEEEEE023760238402380EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2401, recipe: 'EEEEEEEEEEEEEEE023900239202393EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2402, recipe: 'EEEEEEEEEEEEEEE023910239702394EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2403, recipe: 'EEEEEEEEEEEEEEE023950239602398EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2404, recipe: 'EEEEEEEEEEEEEEE024010240202403EEEEEEEEEEEEEEE', book: 'Trading Decks', type: 'Standard' },
      { itemId: 2468, recipe: '02372EEEEEEEEEEEEEEE02404EEEEE02385EEEEEEEEEE', book: 'Trading Decks', type: 'Standard', requirement: 2, name: 'Random Lootbox' },
      { itemId: 2421, recipe: '02372EEEEEEEEEEEEEEE02404EEEEE02372EEEEEEEEEE', book: 'Trading Decks', type: 'Standard', requirement: 2 },
      { itemId: 2465, recipe: '02404EEEEEEEEEEEEEEE02372EEEEE02404EEEEEEEEEE', book: 'Trading Decks', type: 'Standard', requirement: 2 },
      { itemId: 2466, recipe: '02385EEEEEEEEEEEEEEE02372EEEEE02385EEEEEEEEEE', book: 'Trading Decks', type: 'Standard', requirement: 2 },
      { itemId: 3107, recipe: 'EEEEEEEEEEEEEEEEEEEE0310503106EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 3110, recipe: 'EEEEEEEEEEEEEEEEEEEE0310803109EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 3111, recipe: 'EEEEEEEEEEEEEEEEEEEE0310703110EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 3112, recipe: 'EEEEE0311903119EEEEE0311903119EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 3117, recipe: 'EEEEEEEEEEEEEEE031130311403115EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 3121, recipe: 'EEEEEEEEEE00114EEEEE0312000114EEEEEEEEEE00114', book: 'Xmas Crafting', type: 'Standard', requirement: 2 },
      { itemId: 2296, recipe: 'EEEEEEEEEEEEEEEEEEEE02295EEEEEEEEEE02295EEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2305, recipe: 'EEEEE02295EEEEE022950229602295EEEEE02295EEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2298, recipe: 'EEEEE02688EEEEEEEEEE02296EEEEEEEEEE00126EEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2299, recipe: 'EEEEE02297EEEEEEEEEE02298EEEEEEEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2303, recipe: 'EEEEE00126EEEEEEEEEE02296EEEEEEEEEE02688EEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2300, recipe: 'EEEEE02233EEEEE022330223302233EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard', requirement: 2 },
      { itemId: 2701, recipe: 'EEEEEEEEEEEEEEEEEEEE0269802700EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2702, recipe: 'EEEEEEEEEEEEEEEEEEEE0269802699EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2703, recipe: 'EEEEEEEEEEEEEEEEEEEE0270002699EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2704, recipe: 'EEEEEEEEEEEEEEE027010270202703EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2972, recipe: 'EEEEEEEEEEEEEEEEEEEE0296902970EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2975, recipe: 'EEEEEEEEEEEEEEEEEEEE0297302974EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2976, recipe: 'EEEEEEEEEEEEEEEEEEEE0297202975EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 3340, recipe: 'EEEEEEEEEEEEEEE033280332903334EEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 3338, recipe: '033310333203333EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 3339, recipe: 'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEE033300333503336', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 3341, recipe: 'EEEEE03340EEEEEEEEEE03338EEEEEEEEEE03339EEEEE', book: 'Xmas Crafting', type: 'Standard' },
      { itemId: 2833, recipe: 'EEEEEEEEEEEEEEE0282902831EEEEEEEEEEEEEEEEEEEE', book: 'Birthday', type: 'Standard' },
      { itemId: 2834, recipe: 'EEEEEEEEEEEEEEE0282902830EEEEEEEEEEEEEEEEEEEE', book: 'Birthday', type: 'Standard' },
      { itemId: 2835, recipe: 'EEEEEEEEEEEEEEEEEEEE0283002831EEEEEEEEEEEEEEE', book: 'Birthday', type: 'Standard' },
      { itemId: 2836, recipe: 'EEEEEEEEEEEEEEE028330283402835EEEEEEEEEEEEEEE', book: 'Birthday', type: 'Standard' },
      { itemId: 2825, recipe: 'EEEEEEEEEEEEEEE028260282602826028260282602826', book: 'Birthday', type: 'Standard', name: 'Birthday Licks Badge - 9th' },
      { itemId: 3025, recipe: 'EEEEEEEEEEEEEEEEEEEE0302303024EEEEEEEEEEEEEEE', book: 'Birthday', type: 'Standard' },
      { itemId: 3028, recipe: 'EEEEEEEEEEEEEEEEEEEE0302603027EEEEEEEEEEEEEEE', book: 'Birthday', type: 'Standard' },
      { itemId: 3029, recipe: 'EEEEEEEEEEEEEEEEEEEE0302503028EEEEEEEEEEEEEEE', book: 'Birthday', type: 'Standard' },
      { itemId: 3032, recipe: '03031EEEEE0303103031EEEEE0303103031EEEEE03031', book: 'Birthday', type: 'Standard', name: 'Birthday Gazelle Badge - 10th' },
      { itemId: 3154, recipe: 'EEEEEEEEEEEEEEE031510315203153EEEEEEEEEEEEEEE', book: 'Birthday', type: 'Standard' },
      { itemId: 3158, recipe: 'EEEEEEEEEEEEEEE031550315603157EEEEEEEEEEEEEEE', book: 'Birthday', type: 'Standard' },
      { itemId: 3162, recipe: 'EEEEEEEEEEEEEEE031590316003161EEEEEEEEEEEEEEE', book: 'Birthday', type: 'Standard' },
      { itemId: 3163, recipe: '03154EEEEEEEEEEEEEEE03158EEEEEEEEEEEEEEE03162', book: 'Birthday', type: 'Standard' },
      { itemId: 3165, recipe: '03166EEEEEEEEEEEEEEE0316603166EEEEEEEEEE03166', book: 'Birthday', type: 'Standard', name: 'Birthday Gazelle Badge - 11th' },
      { itemId: 3378, recipe: '03379EEEEE03379EEEEE03379EEEEE03379EEEEE03379', book: 'Birthday', type: 'Standard' },
      { itemId: 2988, recipe: 'EEEEEEEEEEEEEEE029860300002987EEEEEEEEEEEEEEE', book: 'Valentines', type: 'Standard' },
      { itemId: 2991, recipe: 'EEEEEEEEEEEEEEE029890300002990EEEEEEEEEEEEEEE', book: 'Valentines', type: 'Standard' },
      { itemId: 2992, recipe: 'EEEEEEEEEEEEEEE029880300002991EEEEEEEEEEEEEEE', book: 'Valentines', type: 'Standard' },
      { itemId: 2995, recipe: 'EEEEEEEEEEEEEEE029930300102994EEEEEEEEEEEEEEE', book: 'Valentines', type: 'Standard' },
      { itemId: 2998, recipe: 'EEEEEEEEEEEEEEE029960300102997EEEEEEEEEEEEEEE', book: 'Valentines', type: 'Standard' },
      { itemId: 2999, recipe: 'EEEEEEEEEEEEEEE029950300102998EEEEEEEEEEEEEEE', book: 'Valentines', type: 'Standard' },
      { itemId: 3143, recipe: 'EEEEE03002EEEEE03002EEEEE03002EEEEE03002EEEEE', book: 'Valentines', type: 'Standard', name: 'Vegetal Symbol' },
      { itemId: 3143, recipe: '02323EEEEE02323EEEEEEEEEEEEEEE02323EEEEE02323', book: 'Valentines', type: 'Standard', requirement: 2, name: 'Mineral Symbol' },
      { itemId: 3145, recipe: '022420224302242EEEEE02227EEEEEEEEEE02232EEEEE', book: 'Valentines', type: 'Standard', requirement: 2 },
      { itemId: 3358, recipe: '03359EEEEE03359EEEEE03359EEEEE03359EEEEE03359', book: 'Valentines', type: 'Standard', name: 'Valentine 2022 Badge' },
      { itemId: 3004, recipe: '02992EEEEE03163EEEEEEEEEEEEEEE02999EEEEE03270', book: 'Valentines', type: 'Standard' },
      { itemId: 3136, recipe: 'EEEEE03143EEEEEEEEEE03144EEEEE03145EEEEE03145', book: 'Valentines', type: 'Standard', requirement: 2 },
      { itemId: 3147, recipe: 'EEEEE02551EEEEEEEEEE03136EEEEEEEEEE03145EEEEE', book: 'Valentines', type: 'Upgrade', requirement: 2 },
      { itemId: 3148, recipe: 'EEEEE02550EEEEEEEEEE03136EEEEEEEEEE03145EEEEE', book: 'Valentines', type: 'Upgrade', requirement: 2 },
      { itemId: 3146, recipe: 'EEEEE02552EEEEEEEEEE03136EEEEEEEEEE03145EEEEE', book: 'Valentines', type: 'Upgrade', requirement: 2 },
      { itemId: 3136, recipe: 'EEEEE02653EEEEE026530314702653EEEEE02653EEEEE', book: 'Valentines', type: 'Downgrade', requirement: 2, name: "Downgrade Cupid's Winged Boots of Aggression" },
      { itemId: 3136, recipe: 'EEEEE02653EEEEE026530314802653EEEEE02653EEEEE', book: 'Valentines', type: 'Downgrade', requirement: 2, name: "Downgrade Cupid's Winged Boots of Fortune" },
      { itemId: 3136, recipe: 'EEEEE02653EEEEE026530314602653EEEEE02653EEEEE', book: 'Valentines', type: 'Downgrade', requirement: 2, name: "Downgrade Cupid's Winged Boots of Luck" },
      { itemId: 3349, recipe: '02549EEEEE02549EEEEE03348EEEEE02239EEEEE02239', book: 'Valentines', type: 'Upgrade', requirement: 2 },
      { itemId: 3352, recipe: '025490254902549EEEEE03349EEEEE022400224002240', book: 'Valentines', type: 'Upgrade', requirement: 2 },
      { itemId: 3353, recipe: '025490254902549025490335202241022410224102241', book: 'Valentines', type: 'Upgrade', requirement: 2 },
      { itemId: 3348, recipe: 'EEEEE02549EEEEEEEEEE03348EEEEEEEEEEEEEEEEEEEE', book: 'Valentines', type: 'Repair', requirement: 2, name: "Repair Cupid's Wings" },
      { itemId: 3349, recipe: 'EEEEE02549EEEEEEEEEE03349EEEEEEEEEE02239EEEEE', book: 'Valentines', type: 'Repair', requirement: 2, name: "Repair Cupid's Gold Wings" },
      { itemId: 3352, recipe: '02549EEEEE02549EEEEE03352EEEEEEEEEE02240EEEEE', book: 'Valentines', type: 'Repair', requirement: 2, name: "Repair Cupid's Mithril Wings" },
      { itemId: 3353, recipe: '025490254902549EEEEE03353EEEEEEEEEE02241EEEEE', book: 'Valentines', type: 'Repair', requirement: 2, name: "Repair Cupid's Adamantium Wings" },
      { itemId: 3364, recipe: 'EEEEE02653EEEEEEEEEE03349EEEEEEEEEE02627EEEEE', book: 'Valentines', type: 'Downgrade', requirement: 2 },
      { itemId: 3363, recipe: '02653EEEEE02653EEEEE03352EEEEE02627EEEEE02627', book: 'Valentines', type: 'Downgrade', requirement: 2 },
      { itemId: 3362, recipe: '026530265302653EEEEE03353EEEEE026270262702627', book: 'Valentines', type: 'Downgrade', requirement: 2 },
      { itemId: 3361, recipe: 'EEEEEEEEEEEEEEEEEEEE0255603360EEEEEEEEEEEEEEE', book: 'Valentines', type: 'Standard', requirement: 2 },
      { itemId: 3365, recipe: '026530265302653026530336102627026270262702627', book: 'Valentines', type: 'Downgrade', requirement: 2 },
      { itemId: 2592, recipe: 'EEEEEEEEEEEEEEEEEEEE0259002591EEEEEEEEEEEEEEE', book: 'Halloween', type: 'Standard' },
      { itemId: 2593, recipe: 'EEEEEEEEEEEEEEEEEEEE0259102589EEEEEEEEEEEEEEE', book: 'Halloween', type: 'Standard' },
      { itemId: 2594, recipe: 'EEEEEEEEEEEEEEEEEEEE0258902590EEEEEEEEEEEEEEE', book: 'Halloween', type: 'Standard' },
      { itemId: 2595, recipe: 'EEEEEEEEEEEEEEE025920259302594EEEEEEEEEEEEEEE', book: 'Halloween', type: 'Standard' },
      { itemId: 2601, recipe: 'EEEEEEEEEEEEEEE026000260002600026000260002600', book: 'Halloween', type: 'Standard' },
      { itemId: 2947, recipe: 'EEEEEEEEEEEEEEEEEEEE0294502946EEEEEEEEEEEEEEE', book: 'Halloween', type: 'Standard' },
      { itemId: 2950, recipe: 'EEEEEEEEEEEEEEEEEEEE0294802949EEEEEEEEEEEEEEE', book: 'Halloween', type: 'Standard' },
      { itemId: 2951, recipe: 'EEEEEEEEEEEEEEEEEEEE0294702950EEEEEEEEEEEEEEE', book: 'Halloween', type: 'Standard' },
      { itemId: 2953, recipe: 'EEEEEEEEEEEEEEE029520295202952029520295202952', book: 'Halloween', type: 'Standard' },
      { itemId: 3268, recipe: 'EEEEEEEEEEEEEEE0326303265EEEEEEEEEEEEEEEEEEEE', book: 'Halloween', type: 'Standard' },
      { itemId: 3269, recipe: 'EEEEEEEEEEEEEEE0326603267EEEEEEEEEEEEEEEEEEEE', book: 'Halloween', type: 'Standard' },
      { itemId: 3270, recipe: 'EEEEEEEEEEEEEEE0326803269EEEEEEEEEEEEEEEEEEEE', book: 'Halloween', type: 'Standard' },
      { itemId: 3264, recipe: '032810328103281EEEEEEEEEEEEEEE032810328103281', book: 'Halloween', type: 'Standard', name: 'Tombstone Badge' },
      { itemId: 2772, recipe: 'EEEEEEEEEEEEEEEEEEEE02844EEEEEEEEEEEEEEEEEEEE', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2774, recipe: 'EEEEEEEEEEEEEEE028440284402844EEEEEEEEEEEEEEE', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2775, recipe: 'EEEEE02844EEEEEEEEEE02844EEEEEEEEEE02844EEEEE', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2776, recipe: '028440284402844EEEEEEEEEEEEEEE028440284402844', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2846, recipe: 'EEEEEEEEEEEEEEEEEEEE02841EEEEEEEEEEEEEEEEEEEE', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2845, recipe: 'EEEEEEEEEEEEEEEEEEEE02842EEEEEEEEEEEEEEEEEEEE', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2900, recipe: 'EEEEE02892EEEEE028920289202892EEEEE02892EEEEE', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2801, recipe: 'EEEEEEEEEEEEEEE028160281402816EEEEEEEEEEEEEEE', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2802, recipe: 'EEEEE02816EEEEE028160281402816EEEEE02816EEEEE', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2803, recipe: '028140281602814028160289402816028140281602814', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2847, recipe: 'EEEEE02813EEEEEEEEEE02813EEEEEEEEEE02813EEEEE', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2901, recipe: 'EEEEE02816EEEEE028930289302893EEEEE02813EEEEE', book: 'Adventure Club', type: 'Standard' },
      { itemId: 2712, recipe: 'EEEEEEEEEEEEEEEEEEEE0271102711EEEEEEEEEEEEEEE', book: 'Bling', type: 'Upgrade' },
      { itemId: 2713, recipe: 'EEEEE02154EEEEE021530271202155EEEEEEEEEEEEEEE', book: 'Bling', type: 'Upgrade', requirement: 2 },
      { itemId: 2714, recipe: 'EEEEE02154EEEEE021530271302155EEEEEEEEEEEEEEE', book: 'Bling', type: 'Upgrade', requirement: 2 },
      { itemId: 2554, recipe: '021550215302154022390012102243025370253702537', book: 'Bling', type: 'Standard', requirement: 2, name: 'Unity Necklace' },
      { itemId: 2584, recipe: '021550215302154022390253902243025850253702585', book: 'Bling', type: 'Standard', requirement: 2, name: 'Unity Band' },
      { itemId: 2556, recipe: '021550215302154025370213002537025370012102537', book: 'Bling', type: 'Upgrade', requirement: 2 },
      { itemId: 2555, recipe: '021550215302154025370213502537025370012102537', book: 'Bling', type: 'Upgrade', requirement: 2 },
      { itemId: 2915, recipe: '02155EEEEE02154EEEEE00121EEEEEEEEEE02153EEEEE', book: 'Bling', type: 'Standard', requirement: 2 },
      { itemId: 2930, recipe: 'EEEEEEEEEEEEEEE0215400120EEEEEEEEEEEEEEEEEEEE', book: 'Bling', type: 'Standard', requirement: 2 },
      { itemId: 2931, recipe: 'EEEEEEEEEEEEEEE0215300120EEEEEEEEEEEEEEEEEEEE', book: 'Bling', type: 'Standard', requirement: 2 },
      { itemId: 2932, recipe: 'EEEEEEEEEEEEEEE0215500120EEEEEEEEEEEEEEEEEEEE', book: 'Bling', type: 'Standard', requirement: 2 },
      { itemId: 2639, recipe: '025080250802508025080250802508025080250802508', book: 'Bling', type: 'Standard', requirement: 2 },
      { itemId: 2760, recipe: '025080250802508025080004602508025080250802508', book: 'Bling', type: 'Standard', requirement: 2 },
      { itemId: 2212, recipe: 'EEEEEEEEEEEEEEE000720007200072EEEEEEEEEEEEEEE', book: 'Bling', type: 'Standard', requirement: 2, name: 'Irc Voice 8w' },
      { itemId: 2212, recipe: 'EEEEE00175EEEEE001750017500175EEEEEEEEEEEEEEE', book: 'Bling', type: 'Standard', requirement: 2, name: 'Irc Voice 8w - Low Cost' },
      { itemId: 3368, recipe: '022120221202212022120221202212EEEEE02549EEEEE', book: 'Bling', type: 'Standard', requirement: 2, name: 'Irc Voice 1y' },
      { itemId: 2509, recipe: 'EEEEEEEEEEEEEEEEEEEE0251202508EEEEEEEEEEEEEEE', book: 'Pets', type: 'Upgrade', name: 'Bronze Dwarf' },
      { itemId: 2929, recipe: 'EEEEEEEEEEEEEEEEEEEE02512EEEEE02508EEEEEEEEEE', book: 'Pets', type: 'Upgrade', name: 'Quartz Dwarf' },
      { itemId: 2510, recipe: 'EEEEEEEEEEEEEEEEEEEE0250902508EEEEEEEEEEEEEEE', book: 'Pets', type: 'Upgrade', name: 'Bronze To Iron Dwarf' },
      { itemId: 2510, recipe: 'EEEEEEEEEEEEEEEEEEEE0292902508EEEEEEEEEEEEEEE', book: 'Pets', type: 'Upgrade', name: 'Quartz To Iron Dwarf' },
      { itemId: 2511, recipe: 'EEEEEEEEEEEEEEEEEEEE0251002508EEEEEEEEEEEEEEE', book: 'Pets', type: 'Upgrade', name: 'Gold Dwarf' },
      { itemId: 2928, recipe: 'EEEEEEEEEEEEEEEEEEEE02510EEEEE02508EEEEEEEEEE', book: 'Pets', type: 'Upgrade', name: 'Jade Dwarf' },
      { itemId: 2513, recipe: 'EEEEEEEEEEEEEEEEEEEE0251102508EEEEEEEEEEEEEEE', book: 'Pets', type: 'Upgrade', name: 'Gold To Mithril Dwarf' },
      { itemId: 2513, recipe: 'EEEEEEEEEEEEEEEEEEEE0292802508EEEEEEEEEEEEEEE', book: 'Pets', type: 'Upgrade', name: 'Jade To Mithril Dwarf' },
      { itemId: 2515, recipe: 'EEEEEEEEEEEEEEEEEEEE0251302508EEEEEEEEEEEEEEE', book: 'Pets', type: 'Upgrade', name: 'Adamantium Dwarf' },
      { itemId: 2927, recipe: 'EEEEEEEEEEEEEEEEEEEE02513EEEEE02508EEEEEEEEEE', book: 'Pets', type: 'Upgrade', name: 'Amethyst Dwarf' },
      { itemId: 2524, recipe: 'EEEEEEEEEEEEEEEEEEEE0252502525EEEEEEEEEEEEEEE', book: 'Pets', type: 'Standard', name: 'Green Slime' },
      { itemId: 3237, recipe: '0252502524EEEEEEEEEEEEEEEEEEEEEEEEE0198702323', book: 'Pets', type: 'Standard', name: 'Rainbow Slime' },
      { itemId: 2307, recipe: '023060268902234022960230502300001260230502300', book: 'Pets', type: 'Standard' },
      { itemId: 3322, recipe: 'EEEEE03313EEEEE033130230703313EEEEE03313EEEEE', book: 'Pets', type: 'Upgrade' },
      { itemId: 3323, recipe: 'EEEEE03325EEEEE033250332203325EEEEE03325EEEEE', book: 'Pets', type: 'Upgrade' },
      { itemId: 3324, recipe: '033270332603327033260332303326033270332603327', book: 'Pets', type: 'Upgrade' },
      { itemId: 2598, recipe: 'EEEEEEEEEEEEEEEEEEEE02595EEEEE02385EEEEE02404', book: 'Pets', type: 'Standard' },
      { itemId: 2599, recipe: '02585EEEEEEEEEE025950270402836EEEEEEEEEEEEEEE', book: 'Pets', type: 'Standard', name: 'Ghost Billie (gold)' },
      { itemId: 2690, recipe: 'EEEEEEEEEEEEEEEEEEEE02704EEEEE02385EEEEE02404', book: 'Pets', type: 'Standard' },
      { itemId: 2691, recipe: 'EEEEE02585EEEEE025950270402836EEEEEEEEEEEEEEE', book: 'Pets', type: 'Standard' },
      { itemId: 2333, recipe: 'EEEEEEEEEEEEEEEEEEEE02836EEEEE02385EEEEE02404', book: 'Pets', type: 'Standard' },
      { itemId: 2827, recipe: 'EEEEEEEEEE02585025950270402836EEEEEEEEEEEEEEE', book: 'Pets', type: 'Standard', name: '[Au]zelle' },
      { itemId: 3369, recipe: '029510297603029EEEEE02155EEEEE025950270402836', book: 'Pets', type: 'Standard', requirement: 2 },
      { itemId: 3371, recipe: '029510297603029EEEEE02153EEEEE025950270402836', book: 'Pets', type: 'Standard', requirement: 2 },
      { itemId: 3370, recipe: '029510297603029EEEEE02154EEEEE025950270402836', book: 'Pets', type: 'Standard', requirement: 2 },
      { itemId: 3373, recipe: '029510297603029EEEEE03384EEEEE025950270402836', book: 'Pets', type: 'Standard', requirement: 2 },
  ];

  Array.from(new Set(Object.values(INGREDIENTS).map(({ category }) => category)));
  const BOOKS = Array.from(new Set(RECIPES.map(({ book }) => book)));
  Array.from(new Set(RECIPES.map(({ type }) => type)));
  const ITEM_ID_MATCHER = /.{5}/g;
  const recipeInfo = RECIPES.map((recipe, id) => {
      const ingredientCounts = new Map();
      recipe.recipe.match(ITEM_ID_MATCHER).forEach((item) => {
          if (item !== 'EEEEE') {
              const itemId = Number(item);
              if (!ingredientCounts.has(itemId))
                  ingredientCounts.set(itemId, 0);
              ingredientCounts.set(itemId, ingredientCounts.get(itemId) + 1);
          }
      });
      return {
          name: INGREDIENTS[recipe.itemId].name,
          id: id,
          category: INGREDIENTS[recipe.itemId].category,
          ingredientCounts: ingredientCounts,
          ingredients: [...ingredientCounts.entries()].map(([id, _]) => ({ ...INGREDIENTS[id], id: id })),
          ...recipe,
      };
  });
  const ingredients = INGREDIENTS;

  var _GazelleApi_instances, _GazelleApi_key, _GazelleApi_limiter, _GazelleApi_log, _GazelleApi_sleep, _GazelleApi_fetchAndRetryIfNecessary, _GazelleApi_acquireToken;
  const API_THROTTLE_WINDOW_MILLLIS = 10000;
  const MAX_QUERIES_PER_WINDOW = 5;
  const BACKOFF_TIME_MILLIS = 2000;
  const isFailureResponse = (response) => response.status === 'failure';
  class GazelleApi {
      constructor(log, apiKey) {
          _GazelleApi_instances.add(this);
          _GazelleApi_key.set(this, void 0);
          _GazelleApi_limiter.set(this, void 0);
          _GazelleApi_log.set(this, void 0);
          __classPrivateFieldSet(this, _GazelleApi_key, apiKey, "f");
          __classPrivateFieldSet(this, _GazelleApi_log, log, "f");
          __classPrivateFieldSet(this, _GazelleApi_limiter, new RateLimiter({
              tokensPerInterval: MAX_QUERIES_PER_WINDOW,
              interval: API_THROTTLE_WINDOW_MILLLIS,
          }), "f");
      }
      async call(data) {
          return __classPrivateFieldGet(this, _GazelleApi_instances, "m", _GazelleApi_fetchAndRetryIfNecessary).call(this, () => __classPrivateFieldGet(this, _GazelleApi_instances, "m", _GazelleApi_acquireToken).call(this, () => {
              __classPrivateFieldGet(this, _GazelleApi_log, "f").debug('API call', data);
              return fetch('/api.php?' + new URLSearchParams(data).toString(), {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                      'X-API-Key': __classPrivateFieldGet(this, _GazelleApi_key, "f"),
                  },
              });
          }));
      }
      async unequip(equipid) {
          return await this.call({ request: 'items', type: 'unequip', equipid: String(equipid) })
              .then((response) => response.json())
              .then((response) => {
              if (isFailureResponse(response)) {
                  const fail = `Failed to unequip equip id ${equipid}: ${response.error}`;
                  __classPrivateFieldGet(this, _GazelleApi_log, "f").error(fail);
                  throw fail;
              }
              return true;
          });
      }
      async equip(equipid) {
          return await this.call({ request: 'items', type: 'equip', equipid: String(equipid) })
              .then((response) => response.json())
              .then((response) => {
              if (isFailureResponse(response)) {
                  const fail = `Failed to re-equip equip id ${equipid}: ${response.error}`;
                  __classPrivateFieldGet(this, _GazelleApi_log, "f").error(fail);
                  throw fail;
              }
              return true;
          });
      }
      // Caller needs:
      // window.noty({type: 'error', text: 'Quick Crafting loading inventory failed. Please check logs and reload.'});
      async getInventoryCounts() {
          return await this.call({ request: 'items', type: 'inventory' })
              .then((response) => response.json())
              .then((response) => {
              if (isFailureResponse(response)) {
                  const fail = 'Loading inventory failed';
                  __classPrivateFieldGet(this, _GazelleApi_log, "f").error(fail);
                  throw fail;
              }
              return new Map(response.response
                  .filter(({ equipid }) => !(equipid && Number(equipid)))
                  .map(({ itemid, amount }) => [Number(itemid), Number(amount)]));
          });
      }
      async getEquippedIds() {
          return await this.call({ request: 'items', type: 'users_equipped' })
              .then((response) => response.json())
              .then((response) => {
              if (isFailureResponse(response)) {
                  const fail = 'Loading equipped IDs failed.';
                  __classPrivateFieldGet(this, _GazelleApi_log, "f").error(fail);
                  throw fail;
              }
              return response.response.map(({ equipid }) => Number(equipid));
          });
      }
      async getEquipmentInfo() {
          const equippedIds = (await this.getEquippedIds()) || [];
          return await this.call({ request: 'items', type: 'users_equippable' })
              .then((response) => response.json())
              .then((response) => {
              if (isFailureResponse(response)) {
                  const fail = 'Loading equipment Info failed.';
                  __classPrivateFieldGet(this, _GazelleApi_log, "f").error(fail);
                  throw fail;
              }
              return response.response
                  .filter(({ itemid }) => itemid in ingredients)
                  .map(({ itemid, id, experience, timeUntilBreak }) => ({
                  itemId: Number(itemid),
                  id: Number(id),
                  experience: Number(experience),
                  equipLife: ingredients[Number(itemid)].equipLife,
                  equipped: equippedIds.includes(Number(id)),
                  ...(timeUntilBreak !== 'Null' ? { timeUntilBreak: Number(timeUntilBreak) } : {}),
              }))
                  .sort(({ id: idA }, { id: idB }) => idA - idB)
                  .reduce((grouped, equip) => {
                  if (!grouped.has(equip.itemId))
                      grouped.set(equip.itemId, []);
                  grouped.get(equip.itemId).push(equip);
                  return grouped;
              }, new Map());
          });
      }
  }
  _GazelleApi_key = new WeakMap(), _GazelleApi_limiter = new WeakMap(), _GazelleApi_log = new WeakMap(), _GazelleApi_instances = new WeakSet(), _GazelleApi_sleep = async function _GazelleApi_sleep(millisToSleep) {
      await new Promise((resolve) => setTimeout(resolve, millisToSleep));
  }, _GazelleApi_fetchAndRetryIfNecessary = async function _GazelleApi_fetchAndRetryIfNecessary(callFn) {
      const response = await callFn();
      if (response.status === 429) {
          await __classPrivateFieldGet(this, _GazelleApi_instances, "m", _GazelleApi_sleep).call(this, BACKOFF_TIME_MILLIS);
          return __classPrivateFieldGet(this, _GazelleApi_instances, "m", _GazelleApi_fetchAndRetryIfNecessary).call(this, callFn);
      }
      return response;
  }, _GazelleApi_acquireToken = async function _GazelleApi_acquireToken(fn) {
      if (__classPrivateFieldGet(this, _GazelleApi_limiter, "f").tryRemoveTokens(1)) {
          return fn();
      }
      else {
          await __classPrivateFieldGet(this, _GazelleApi_instances, "m", _GazelleApi_sleep).call(this, API_THROTTLE_WINDOW_MILLLIS);
          return __classPrivateFieldGet(this, _GazelleApi_instances, "m", _GazelleApi_acquireToken).call(this, fn);
      }
  };

  var _ConsoleLog_instances, _ConsoleLog_level, _ConsoleLog_prefix, _ConsoleLog_start, _ConsoleLog_logToConsole;
  var LogLevel;
  (function (LogLevel) {
      LogLevel[LogLevel["None"] = 0] = "None";
      LogLevel[LogLevel["Error"] = 1] = "Error";
      LogLevel[LogLevel["Warning"] = 2] = "Warning";
      LogLevel[LogLevel["Log"] = 3] = "Log";
      LogLevel[LogLevel["Debug"] = 4] = "Debug";
      LogLevel[LogLevel["Timing"] = 5] = "Timing";
  })(LogLevel || (LogLevel = {}));
  class ConsoleLog {
      constructor(prefix, level = LogLevel.Log) {
          _ConsoleLog_instances.add(this);
          _ConsoleLog_level.set(this, void 0);
          _ConsoleLog_prefix.set(this, void 0);
          _ConsoleLog_start.set(this, new Date());
          __classPrivateFieldSet(this, _ConsoleLog_prefix, prefix, "f");
          __classPrivateFieldSet(this, _ConsoleLog_level, level, "f");
      }
      timing(...args) {
          if (__classPrivateFieldGet(this, _ConsoleLog_level, "f") >= LogLevel.Timing)
              __classPrivateFieldGet(this, _ConsoleLog_instances, "m", _ConsoleLog_logToConsole).call(this, console.debug, () => `(${new Date().valueOf() - __classPrivateFieldGet(this, _ConsoleLog_start, "f").valueOf()})`, ...args);
      }
      debug(...args) {
          if (__classPrivateFieldGet(this, _ConsoleLog_level, "f") >= LogLevel.Debug)
              __classPrivateFieldGet(this, _ConsoleLog_instances, "m", _ConsoleLog_logToConsole).call(this, console.debug, ...args);
      }
      log(...args) {
          if (__classPrivateFieldGet(this, _ConsoleLog_level, "f") >= LogLevel.Log)
              __classPrivateFieldGet(this, _ConsoleLog_instances, "m", _ConsoleLog_logToConsole).call(this, console.log, ...args);
      }
      warn(...args) {
          if (__classPrivateFieldGet(this, _ConsoleLog_level, "f") >= LogLevel.Warning)
              __classPrivateFieldGet(this, _ConsoleLog_instances, "m", _ConsoleLog_logToConsole).call(this, console.warn, ...args);
      }
      error(...args) {
          if (__classPrivateFieldGet(this, _ConsoleLog_level, "f") >= LogLevel.Error)
              __classPrivateFieldGet(this, _ConsoleLog_instances, "m", _ConsoleLog_logToConsole).call(this, console.error, ...args);
      }
      setLevel(level) {
          __classPrivateFieldSet(this, _ConsoleLog_level, level, "f");
      }
  }
  _ConsoleLog_level = new WeakMap(), _ConsoleLog_prefix = new WeakMap(), _ConsoleLog_start = new WeakMap(), _ConsoleLog_instances = new WeakSet(), _ConsoleLog_logToConsole = function _ConsoleLog_logToConsole(logMethod, ...args) {
      const resolvedArgs = args.map((arg) => (typeof arg === 'function' ? arg() : arg));
      logMethod(__classPrivateFieldGet(this, _ConsoleLog_prefix, "f"), ...resolvedArgs);
  };

  var name = "gazelle_quick_craft";
  var version = "3.4.0";
  var description = "Craft multiple items more easily including equipment repair";
  var main = "index.ts";
  var keywords = [
  	"craft",
  	"quick craft",
  	"gazelle",
  	"games",
  	"repair",
  	"equipment",
  	"upgrade"
  ];
  var author = "FinalDoom";
  var license = "ISC";
  var repository = {
  	type: "git",
  	url: "https://github.com/FinalDoom/Quick_Craft/"
  };
  var scripts = {
  	build: "npx rollup --config rollup.config.js",
  	watch: "npx rollup --config rollup.config.js --watch",
  	serve: "node -r esm server.js",
  	start: "node -r esm server.js",
  	"build:release": "npx rollup --config rollup.config.js --sourcemap 0 --file dist/release-$npm_package_version.user.js",
  	"build:release:win32": "npx rollup --config rollup.config.js --sourcemap 0 --file dist\\release-%npm_package_version%.user.js",
  	version: "npm run build:release && git add -f dist/release-$npm_package_version.user.js",
  	prepublishOnly: "npm run build:release && git add -f dist/release-$npm_package_version.user.js",
  	test: "env TS_NODE_COMPILER_OPTIONS='{\"module\": \"commonjs\" }' mocha --reporter spec -r ts-node/register src/**/*.test.ts",
  	addRecipe: "yarn build && node dist/scripts/add-recipe.js"
  };
  var devDependencies = {
  	"@babel/cli": "^7.18.6",
  	"@babel/core": "^7.18.2",
  	"@babel/plugin-proposal-class-properties": "^7.17.12",
  	"@babel/preset-env": "^7.18.6",
  	"@babel/preset-typescript": "^7.18.6",
  	"@rollup/plugin-babel": "^5.3.1",
  	"@rollup/plugin-commonjs": "^22.0.1",
  	"@rollup/plugin-json": "^4.1.0",
  	"@rollup/plugin-node-resolve": "^13.3.0",
  	"@rollup/plugin-replace": "^4.0.0",
  	"@rollup/plugin-typescript": "^8.3.2",
  	"@types/chai": "^4.3.1",
  	"@types/greasemonkey": "^4.0.3",
  	"@types/lunr": "^2.3.4",
  	"@types/mocha": "^9.1.1",
  	"@types/react": "^18.0.15",
  	"@types/react-dom": "^18.0.6",
  	chai: "^4.3.6",
  	colorette: "^2.0.19",
  	"deep-object-diff": "^1.1.7",
  	esm: "^3.2.25",
  	"html-entities": "^2.3.3",
  	limiter: "^2.1.0",
  	lunr: "^2.3.9",
  	mocha: "^10.0.0",
  	prettier: "^2.7.1",
  	react: "^18.2.0",
  	"react-dom": "^18.2.0",
  	rollup: "^2.76.0",
  	"rollup-plugin-scss": "^3",
  	"rollup-plugin-userscript-metablock": "^0.3.1",
  	sass: "^1.53.0",
  	serve: "^13.0.4",
  	"test-console": "^2.0.0",
  	"trie-search": "^1.3.6",
  	"ts-node": "^10.8.2",
  	tslib: "^2.4.0",
  	typescript: "^4.7.4"
  };
  var config = {
  	port: "8124"
  };
  var pkg = {
  	name: name,
  	version: version,
  	description: description,
  	main: main,
  	keywords: keywords,
  	author: author,
  	license: license,
  	"private": true,
  	repository: repository,
  	scripts: scripts,
  	devDependencies: devDependencies,
  	config: config
  };

  var Sort;
  (function (Sort) {
      Sort["alpha"] = "Alphabetical";
      Sort["gold"] = "Gold Value";
      Sort["book"] = "Book Order";
      Sort["book-alpha"] = "Books / Alphabetical";
      Sort["book-gold"] = "Books / Gold";
  })(Sort || (Sort = {}));
  const GM_KEYS = {
      apiKey: 'forumgames_apikey',
      currentCraft: 'current-craft',
      extraSpace: 'SEG',
      repairEquipped: 'repair-equipped',
      repairThreshold: 'repair-threshold',
      selectedBooks: 'selected-books',
      selectedCategories: 'selected-categories',
      selectedCraftable: 'selected-craftable',
      selectedTypes: 'selected-types',
      search: 'search-string',
      searchIngredients: 'search-ingredients',
      sort: 'recipe-sort',
      switchNeedHave: 'NHswitch', // TODO double check key.. if we care
  };

  class Button extends React__default["default"].Component {
      constructor(props) {
          super(props);
          if (props.variant === 'toggle') {
              this.state = { selected: props.defaultSelected };
          }
      }
      click() {
          if (this.props.variant === 'toggle') {
              const selected = !this.state.selected;
              this.setState({ selected: selected });
              this.props.clickCallback(selected);
          }
          else {
              if (this.props.clickCallback) {
                  this.props.clickCallback();
              }
          }
      }
      render() {
          const classes = [this.props.classNameBase];
          if (this.props.additionalClassNames) {
              classes.push(this.props.additionalClassNames);
          }
          if (this.props.variant === 'select' && this.props.selected) {
              classes.push(this.props.classNameBase + '--selected');
          }
          if (this.props.variant === 'toggle') {
              if (this.state.selected) {
                  classes.push(this.props.classNameBase + '--on');
              }
              else {
                  classes.push(this.props.classNameBase + '--off');
              }
          }
          return (React__default["default"].createElement("button", { className: classes.join(' '), onClick: this.click.bind(this) }, this.props.text));
      }
  }

  class RecipeButton extends React__default["default"].Component {
      constructor(props) {
          super(props);
          this.base = 'recipes__recipe';
      }
      render() {
          return (React__default["default"].createElement(Button, { additionalClassNames: this.base + '--book-' + this.props.book.toLocaleLowerCase().replace(/ /g, '-'), classNameBase: this.base, clickCallback: this.props.clickCallback, selected: this.props.selected, text: this.props.name, variant: "select" }));
      }
  }

  class BookButton extends React__default["default"].Component {
      constructor(props) {
          super(props);
          this.base = 'crafting-panel-filters__books-button';
      }
      render() {
          return (React__default["default"].createElement(Button, { additionalClassNames: this.base + '--book-' + this.props.book.toLocaleLowerCase().replace(/ /g, '-'), classNameBase: this.base, clickCallback: this.props.clickCallback, selected: this.props.selected, text: this.props.book, variant: "select" }));
      }
  }

  class Checkbox extends React__default["default"].Component {
      constructor(props) {
          super(props);
          this.state = { checked: this.props.checked };
      }
      render() {
          return (React__default["default"].createElement("label", { className: this.props.className },
              this.props.prefix,
              React__default["default"].createElement("input", { type: "checkbox", checked: this.props.checked, onChange: this.props.onChange, title: this.props.title }),
              this.props.suffix));
      }
  }

  var ConfirmState;
  (function (ConfirmState) {
      ConfirmState[ConfirmState["DEFAULT"] = 0] = "DEFAULT";
      ConfirmState[ConfirmState["CONFIRM"] = 1] = "CONFIRM";
      ConfirmState[ConfirmState["CRAFTING"] = 2] = "CRAFTING";
  })(ConfirmState || (ConfirmState = {}));
  class MaxCraftButton extends React__default["default"].Component {
      constructor(props) {
          super(props);
          this.base = 'crafting-panel-actions__max-craft-button';
          this.state = { state: ConfirmState.DEFAULT };
      }
      click() {
          this.props.setMaxCraft();
          if (this.state.state === ConfirmState.DEFAULT) {
              this.setState({ state: ConfirmState.CONFIRM });
          }
          else if (this.state.state === ConfirmState.CONFIRM) {
              this.setState({ state: ConfirmState.CRAFTING });
              this.props.executeCraft();
          }
      }
      render() {
          const additionalClassNames = [];
          if (this.state.state === ConfirmState.CONFIRM) {
              additionalClassNames.push(this.base + '--confirm');
          }
          const text = this.state.state === ConfirmState.DEFAULT
              ? 'Craft maximum'
              : this.state.state === ConfirmState.CONFIRM
                  ? '** CONFIRM **'
                  : '-- Crafting --';
          return (React__default["default"].createElement(Button, { additionalClassNames: additionalClassNames.join(' '), classNameBase: this.base, clickCallback: this.click.bind(this), text: text, variant: "click" }));
      }
  }

  const authKey = new URLSearchParams(document.querySelector('link[rel="alternate"]').href).get('authkey');
  const urlBase = (customRecipe) => `https://gazellegames.net/user.php?action=ajaxtakecraftingresult&recipe=${customRecipe}&auth=${authKey}`;
  function take_craft(recipe) {
      const craftName = recipe.name || ingredients[recipe.itemId].name;
      fetch(urlBase(recipe.recipe))
          .then((response) => response.json())
          .then((data) => {
          console.log(data);
          console.log(data.EquipID);
          if (data === '{}' || data.EquipId !== '') {
              unsafeWindow.noty({ type: 'success', text: `${craftName} was crafted successfully.` });
          }
          else {
              unsafeWindow.noty({ type: 'error', text: `${craftName} failed.` });
              alert(`Crafting failed. Response from server: ${data}`);
          }
      });
  }

  class IngredientQuantity extends React__default["default"].Component {
      constructor(props) {
          super(props);
      }
      render() {
          return (React__default["default"].createElement("div", { className: "crafting-panel-info__ingredient-quantity" },
              React__default["default"].createElement("span", null, this.props.countOnHand),
              "/",
              React__default["default"].createElement("span", null, this.props.countPerCraft)));
      }
  }

  class ShopLink extends React__default["default"].Component {
      constructor(props) {
          super(props);
      }
      render() {
          return (React__default["default"].createElement("a", { className: "crafting-panel-info__ingredient-shop-link", target: "_blank", href: `https://gazellegames.net/shop.php?ItemID=${this.props.ingredientId}` }, "$"));
      }
  }

  class IngredientLine extends React__default["default"].Component {
      constructor(props) {
          super(props);
      }
      render() {
          const classNames = ['crafting-panel-info__ingredient-row'];
          if (this.props.switchNeedHave) {
              classNames.push('crafting-panel-info__ingredient-quantity--swapped');
          }
          if (this.props.purchasable) {
              classNames.push('crafting-panel-info__ingredient--purchasable');
          }
          let max;
          if (this.props.maxCraftableWithPurchase > this.props.quantityAvailable / this.props.quantityPerCraft) {
              max = (React__default["default"].createElement("span", { title: "Needed for max possible crafts" },
                  ' (',
                  this.props.maxCraftableWithPurchase * this.props.quantityPerCraft - this.props.quantityAvailable,
                  ')'));
          }
          return (React__default["default"].createElement("div", { className: classNames.join(' '), onClick: this.props.click },
              React__default["default"].createElement(ShopLink, { ingredientId: this.props.id }),
              this.props.name,
              ':',
              React__default["default"].createElement(IngredientQuantity, { countOnHand: this.props.quantityAvailable, countPerCraft: this.props.quantityPerCraft }),
              max));
      }
  }

  const CRAFT_TIME = 1000;
  class CraftingSubmenu extends React__default["default"].Component {
      constructor(props) {
          super(props);
          this.state = { purchasable: [] };
      }
      async doCraft() {
          // Disable crafting buttons and craft switching
          const craftButtons = Array.from(document.querySelectorAll('#crafting-submenu button, #crafting-submenu select'));
          craftButtons.forEach((elem) => {
              elem.disabled = true;
              elem.classList.add('disabled');
          });
          let count = Number(document.querySelector('.crafting-panel-actions__craft-number').value);
          const resultId = this.props.recipe.itemId;
          for (let i = 0; i < count; i++) {
              await new Promise((resolve) => setTimeout(() => {
                  take_craft(this.props.recipe);
                  this.props.inventory.set(resultId, (this.props.inventory.get(resultId) || 0) + 1);
                  [...this.props.recipe.ingredientCounts.entries()].forEach(([id, count]) => this.props.inventory.set(id, this.props.inventory.get(id) - count));
                  resolve();
              }, CRAFT_TIME));
          }
          craftButtons.forEach((elem) => {
              elem.disabled = false;
              elem.classList.remove('disabled');
          });
      }
      render() {
          let available = Number.MAX_SAFE_INTEGER;
          for (let [id, perCraft] of this.props.recipe.ingredientCounts.entries()) {
              const onHand = this.props.inventory.get(id) || 0;
              const avail = Math.floor(onHand / perCraft);
              if (avail < available) {
                  available = avail;
              }
          }
          const maxWithPurchase = this.state.purchasable.length
              ? Math.min(...this.props.recipe.ingredients.map((ingredient) => this.state.purchasable.includes(ingredient.name)
                  ? Number.MAX_SAFE_INTEGER
                  : Math.floor(this.props.inventory.get(ingredient.id) / this.props.recipe.ingredientCounts.get(ingredient.id))))
              : available;
          return (React__default["default"].createElement("div", { className: "crafting-panel", id: "crafting-submenu" },
              React__default["default"].createElement("div", { className: "crafting-panel__title" },
                  ingredients[this.props.recipe.itemId].name,
                  this.props.inventory.get(this.props.recipe.itemId) > 0
                      ? ` (${this.props.inventory.get(this.props.recipe.itemId)} in inventory)`
                      : ''),
              React__default["default"].createElement("div", { className: "crafting-panel-info__ingredients-header" }, "Ingredients:"),
              React__default["default"].createElement("div", { className: "crafting-panel-info__ingredients-column" }, [...this.props.recipe.ingredientCounts.entries()].map(([id, count], index) => {
                  const name = this.props.recipe.ingredients[index].name;
                  return (React__default["default"].createElement(IngredientLine, { key: id, click: () => {
                          if (this.state.purchasable.includes(name)) {
                              this.setState({ purchasable: this.state.purchasable.filter((p) => p !== name) });
                          }
                          else if (this.state.purchasable.length < this.state.purchasable.length - 1) {
                              this.setState({ purchasable: [...this.state.purchasable, name] });
                          }
                      }, id: id, maxCraftableWithPurchase: maxWithPurchase, name: name, purchasable: this.state.purchasable.includes(ingredients[id].name), quantityAvailable: this.props.inventory.get(id) || 0, quantityPerCraft: count, switchNeedHave: this.props.switchNeedHave }));
              })),
              React__default["default"].createElement("span", { className: "crafting-panel-info__ingredients-max" },
                  "Max available craft(s): ",
                  available,
                  available !== maxWithPurchase ? (React__default["default"].createElement("span", { title: "Max possible if additional ingredients are purchased" },
                      "(",
                      maxWithPurchase,
                      ")")) : (''),
                  React__default["default"].createElement("sup", null,
                      React__default["default"].createElement("a", { title: "Click ingredients to mark as purchasable and calculate +purchase needed and max possible crafted." }, "?"))),
              available > 0 && (React__default["default"].createElement("div", { className: "crafting-panel-actions" },
                  React__default["default"].createElement("select", { className: "crafting-panel-actions__craft-number" }, Array(available)
                      .fill(undefined)
                      .map((_, i) => (React__default["default"].createElement("option", { key: i, value: i + 1 }, i + 1)))),
                  React__default["default"].createElement(Button, { variant: "click", classNameBase: "crafting-panel-actions__craft-button", clickCallback: this.doCraft.bind(this), text: "Craft" }),
                  React__default["default"].createElement(MaxCraftButton, { executeCraft: this.doCraft.bind(this), setMaxCraft: () => (document.querySelector('.crafting-panel-actions__craft-number').value =
                          String(available)) })))));
      }
  }

  ___$insertStylesToHeader(".crafting-panel-search {\n  margin-bottom: 0.25rem;\n}\n.crafting-panel-search__searchbox-wrapper {\n  position: relative;\n  display: inline-flex;\n  flex-grow: 1;\n  align-items: center;\n  max-width: 412.5px;\n}\n.crafting-panel-search__searchbox-wrapper span {\n  position: absolute;\n  display: block;\n  right: 3px;\n  width: 15px;\n  height: 15px;\n  border-radius: 50%;\n  color: #fff;\n  background-color: gray;\n  opacity: 0.7;\n  font: 13px monospace;\n  text-align: center;\n  line-height: 1em;\n  cursor: pointer;\n}\n.crafting-panel-search__searchbox {\n  flex-grow: 1;\n}");

  class SearchBox extends React__default["default"].Component {
      constructor() {
          super(...arguments);
          this.base = 'crafting-panel-search';
      }
      render() {
          return (React__default["default"].createElement("span", { className: this.base + '__searchbox-wrapper' },
              React__default["default"].createElement("input", { className: this.base + '__searchbox', defaultValue: this.props.initialSearch, onChange: (event) => this.props.changeSearch(event.target.value), placeholder: "Search...", ref: (el) => (this.input = el), type: "text" }),
              React__default["default"].createElement("span", { onClick: () => {
                      this.input.value = '';
                      this.input.focus();
                      this.props.changeSearch('');
                  } }, "x")));
      }
  }

  function isGMValue(value) {
      const type = typeof value;
      return type === 'string' || type === 'number' || type === 'boolean';
  }
  async function getGMStorageValue(key, defaultValue) {
      // getting stored value
      const saved = await GM.getValue(key);
      let initial;
      if (saved) {
          if (typeof saved === 'string') {
              try {
                  initial = JSON.parse(saved);
              }
              catch (e) {
                  initial = saved;
              }
          }
          else {
              initial = saved;
          }
      }
      return initial || defaultValue;
  }
  async function setGMStorageValue(key, value) {
      if (value === undefined) {
          await GM.deleteValue(key);
      }
      else {
          await GM.setValue(key, isGMValue(value) ? value : JSON.stringify(value));
      }
  }

  const bookIndexName = 'book';
  const categoryIndexName = 'category';
  const ingredientsIndexName = 'ingredients';
  const nameIndexName = 'name';
  const resultIndexName = 'result';
  const typeIndexName = 'type';
  const normalizer = (token) => token.update((str) => str.normalize('NFD').replace(/\p{Diacritic}/gu, ''));
  lunr__default["default"].Pipeline.registerFunction(normalizer, 'normalizer');
  const recipeIndex = lunr__default["default"](function () {
      this.ref('id');
      this.field(nameIndexName);
      this.field(resultIndexName, {
          extractor: (doc) => String(doc.itemId) + ' ' + ingredients[doc.itemId].name,
      });
      this.field(bookIndexName);
      this.field(categoryIndexName);
      this.field(typeIndexName);
      this.field(ingredientsIndexName, {
          extractor: (doc) => doc.ingredients.map((ingredient) => ingredient.name + ' ' + ingredient.id).join(' '),
      });
      this.pipeline.remove(lunr__default["default"].stopWordFilter);
      this.pipeline.before(lunr__default["default"].stemmer, normalizer);
      recipeInfo.forEach((recipe) => this.add(recipe));
  });
  class QuickCrafter extends React__default["default"].Component {
      constructor(props) {
          super(props);
          this.state = {
              currentCraft: undefined,
              extraSpace: false,
              filteredRecipes: this.getSortedRecipes(recipeInfo.map(({ id }) => id)),
              inventory: new Map(),
              loadingApi: false,
              loadingEquipment: false,
              loadingInventory: true,
              loadingStore: true,
              search: '',
              searchIngredients: true,
              selectedBooks: new Set(BOOKS),
              switchNeedHave: false,
          };
          this.recipeButtons = recipeInfo.map((recipe) => (React__default["default"].createElement(RecipeButton, { key: recipe.id, book: recipe.book, clickCallback: () => this.setCurrentCraft(recipe.id), name: recipe.name, selected: this.state.currentCraft === recipe.id })));
          // Fetch async state
          Promise.all([this.props.api.getInventoryCounts()]).then(([inventory]) => {
              this.setState({ inventory: inventory, loadingInventory: false });
          });
          Promise.all([
              getGMStorageValue(GM_KEYS.currentCraft, this.state.currentCraft),
              getGMStorageValue(GM_KEYS.extraSpace, this.state.extraSpace),
              getGMStorageValue(GM_KEYS.search, this.state.search),
              getGMStorageValue(GM_KEYS.searchIngredients, this.state.searchIngredients),
              getGMStorageValue(GM_KEYS.selectedBooks, ['Potions', 'Food', 'Material Bars']),
              getGMStorageValue(GM_KEYS.switchNeedHave, this.state.switchNeedHave),
          ]).then(([currentCraft, extraSpace, search, searchIngredients, selectedBooks, switchNeedHave]) => {
              this.setState({
                  currentCraft: currentCraft,
                  extraSpace: extraSpace,
                  loadingStore: false,
                  search: search,
                  searchIngredients: searchIngredients,
                  selectedBooks: new Set(selectedBooks),
                  switchNeedHave: switchNeedHave,
              });
          });
      }
      // TODO how to skip copying these types?
      setState(state, callback) {
          if (typeof state === 'function') {
              state = state(this.state, this.props);
          }
          if (this.recipeFiltersChanged(state)) {
              try {
                  const filteredRecipes = this.getFilteredRecipes(state);
                  state = { ...state, filteredRecipes: filteredRecipes };
              }
              catch (err) {
                  if (!('name' in err && err.name === 'QueryParseError'))
                      throw err;
              }
          }
          super.setState(state, callback);
      }
      recipeFiltersChanged(state) {
          return (('search' in state && state.search !== this.state.search) ||
              ('searchIngredients' in state &&
                  state.searchIngredients !== this.state.searchIngredients &&
                  (state.search || this.state.search)) ||
              ('selectedBooks' in state &&
                  (state.selectedBooks.size !== this.state.selectedBooks.size ||
                      !Array.prototype.every.call(state.selectedBooks, (book) => this.state.selectedBooks.has(book)))));
      }
      getFilteredRecipes(state) {
          const selectedBooks = 'selectedBooks' in state ? state.selectedBooks : this.state.selectedBooks;
          const search = 'search' in state ? state.search : this.state.search;
          const searchIngredients = 'searchIngredients' in state ? state.searchIngredients : this.state.searchIngredients;
          const bookMatches = recipeIndex
              .search([...selectedBooks].map((book) => bookIndexName + ':' + book.split(/\s+/)[0]).join(' '))
              .map((result) => Number(result.ref));
          let filteredRecipes;
          if (search.length === 0)
              filteredRecipes = Array.from(bookMatches);
          else {
              const searchString = search
                  .split(/\s+/)
                  .map((token) => {
                  if (/:/.test(token))
                      return token;
                  return token.replace(/^([-+]?)(.*)$/, `$1${nameIndexName}:$2 $1${resultIndexName}:$2` +
                      (searchIngredients ? ` $1${ingredientsIndexName}:$2` : ''));
              })
                  .join(' ');
              const results = new Set(recipeIndex.search(searchString).map((result) => Number(result.ref)));
              filteredRecipes = bookMatches.filter((id) => results.has(id));
          }
          return this.getSortedRecipes(filteredRecipes);
      }
      getSortedRecipes(filteredRecipes) {
          // Sort however
          filteredRecipes.sort((a, b) => {
              const recipeA = recipeInfo[a];
              const recipeB = recipeInfo[b];
              return recipeA.book === recipeB.book
                  ? recipeA.id - recipeB.id
                  : BOOKS.indexOf(recipeA.book) - BOOKS.indexOf(recipeB.book);
          });
          // if book sort
          let currentBook;
          const reduced = filteredRecipes.reduce((arr, id) => {
              if (currentBook !== recipeInfo[id].book) {
                  arr.push([]);
                  currentBook = recipeInfo[id].book;
              }
              arr[arr.length - 1].push(id);
              return arr;
          }, []);
          return reduced;
      }
      setCurrentCraft(id) {
          this.setState({ currentCraft: id }, () => setGMStorageValue(GM_KEYS.currentCraft, id));
      }
      setExtraSpace(extraSpace) {
          this.setState({ extraSpace: extraSpace }, () => setGMStorageValue(GM_KEYS.extraSpace, extraSpace));
      }
      setSearch(search) {
          this.setState({ search: search }, () => setGMStorageValue(GM_KEYS.search, search));
      }
      setSearchIngredients(include) {
          this.setState({ searchIngredients: include }, () => setGMStorageValue(GM_KEYS.searchIngredients, include));
      }
      setSelectedBooks(books) {
          this.setState({ selectedBooks: books }, () => setGMStorageValue(GM_KEYS.selectedBooks, Array.from(books)));
      }
      setSwitchNeedHave(switchNeedHave) {
          this.setState({ switchNeedHave: switchNeedHave }, () => setGMStorageValue(GM_KEYS.switchNeedHave, switchNeedHave));
      }
      render() {
          return (React__default["default"].createElement(React__default["default"].StrictMode, null,
              this.state.currentCraft !== undefined && (React__default["default"].createElement(CraftingSubmenu, { inventory: this.state.inventory, recipe: recipeInfo[this.state.currentCraft], switchNeedHave: this.state.switchNeedHave })),
              React__default["default"].createElement("div", { id: "current_craft_box" },
                  React__default["default"].createElement("p", null, "Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better experience."),
                  React__default["default"].createElement(Button, { variant: "click", classNameBase: "crafting-panel-actions__clear-craft-button", clickCallback: () => this.setCurrentCraft(undefined), text: "Clear" })),
              React__default["default"].createElement("div", { className: "crafting-panel-actions__craft-row" },
                  React__default["default"].createElement("span", null, "Click on the buttons below to show or hide crafting categories - "),
                  React__default["default"].createElement(Button, { variant: "click", classNameBase: "crafting-panel-filters__books-hide", clickCallback: () => this.setSelectedBooks(new Set()), text: "Hide all" }),
                  React__default["default"].createElement(Button, { variant: "click", classNameBase: "crafting-panel-filters__books-show", clickCallback: () => this.setSelectedBooks(new Set(BOOKS)), text: "Show all" }),
                  React__default["default"].createElement(Checkbox, { className: "quick_craft_button", checked: this.state.extraSpace, onChange: async (event) => this.setExtraSpace(event.target.checked), suffix: "Blank line between books" }),
                  React__default["default"].createElement(Checkbox, { title: "Switches between needed/have and have/needed", checked: this.state.switchNeedHave, onChange: (event) => this.setSwitchNeedHave(event.target.checked), suffix: "NH switch" })),
              React__default["default"].createElement("div", { className: "crafting-panel-filters__books-row" }, BOOKS.map((name) => (React__default["default"].createElement(BookButton, { key: name, book: name, clickCallback: () => {
                      const selectedBooks = new Set(this.state.selectedBooks);
                      // Hide book sections
                      if (selectedBooks.has(name)) {
                          selectedBooks.delete(name);
                      }
                      else {
                          selectedBooks.add(name);
                      }
                      this.setSelectedBooks(selectedBooks);
                  }, selected: this.state.selectedBooks.has(name) })))),
              React__default["default"].createElement("div", { className: "crafting-panel-search" },
                  React__default["default"].createElement(SearchBox, { changeSearch: (search) => this.setSearch(search), initialSearch: this.state.search }),
                  React__default["default"].createElement(Checkbox, { checked: this.state.searchIngredients, className: "crafating-panel-search__include-ingredients", prefix: "Include ingredients", onChange: (event) => this.setSearchIngredients(event.target.checked) })),
              React__default["default"].createElement("div", { className: 'recipe-buttons recipe-buttons--book-sort' + (this.state.extraSpace ? ' recipe-buttons--extra-space' : '') }, this.state.filteredRecipes.map((idOrArray) => {
                  if (Array.isArray(idOrArray)) {
                      return (React__default["default"].createElement("div", { key: recipeInfo[idOrArray[0]].book, className: 'recipe-buttons__book-section' }, idOrArray.map((id) => this.recipeButtons[id])));
                  }
                  else {
                      return this.recipeButtons[idOrArray];
                  }
              })),
              React__default["default"].createElement("p", { className: "credits" },
                  "Quick Crafter by ",
                  React__default["default"].createElement("a", { href: "/user.php?id=58819" }, "KingKrab23"),
                  " v",
                  React__default["default"].createElement("a", { target: "_blank", href: "https://github.com/KingKrab23/Quick_Craft/raw/master/GGn%20Quick%20Crafting.user.js" }, pkg.version))));
      }
  }

  (async function () {
      const LOG = new ConsoleLog('[Quick Crafter]');
      async function getApiKey() {
          const apiKey = await getGMStorageValue(GM_KEYS.apiKey, undefined);
          if (apiKey)
              return apiKey;
          const input = window.prompt(`Please input your GGn API key.
If you don't have one, please generate one from your Edit Profile page: https://gazellegames.net/user.php?action=edit.
The API key must have "Items" permission

Please disable this userscript until you have one as this prompt will continue to show until you enter one in.`);
          const trimmed = input.trim();
          if (/[a-f0-9]{64}/.test(trimmed)) {
              setGMStorageValue(GM_KEYS.apiKey, trimmed);
              return trimmed;
          }
          else {
              throw 'No API key found.';
          }
      }
      const API = new GazelleApi(LOG, await getApiKey());
      const clearDiv = document.createElement('div');
      clearDiv.classList.add('crafting-clear');
      const quickCrafter = document.createElement('div');
      quickCrafter.id = 'quick-crafter';
      document.getElementById('crafting_recipes').before(clearDiv, quickCrafter);
      createRoot(quickCrafter).render(React__default["default"].createElement(QuickCrafter, { api: API, log: LOG }));
  })();

})(React, ReactDOM, lunr);
