'use strict';

import './style/main.scss';

import React from 'react';
import {createRoot} from 'react-dom/client';
import {GazelleApi} from './api/api';
import {ConsoleLog} from './log/log';
import {Inventory} from './models/inventory';
import {QuickCraftStore} from './store/store';
import QuickCrafter from './quick-crafter/quick-crafter';

declare global {
  interface Window {
    noty: (options: {type: 'error' | 'warn' | 'success'; text: string}) => void;
  }
}

(async function () {
  const LOG = new ConsoleLog('[Quick Crafter]');
  const STORE = new QuickCraftStore();
  await STORE.init();

  function askForApiKey() {
    if (!STORE.apiKey) {
      const input = window.prompt(`Please input your GGn API key.
If you don't have one, please generate one from your Edit Profile page: https://gazellegames.net/user.php?action=edit.
The API key must have "Items" permission

Please disable this userscript until you have one as this prompt will continue to show until you enter one in.`);
      const trimmed = input.trim();

      if (/[a-f0-9]{64}/.test(trimmed)) {
        STORE.apiKey = trimmed;
        return STORE.apiKey;
      } else {
        throw 'No API key found.';
      }
    }
  }

  const API = new GazelleApi(LOG, STORE.apiKey || askForApiKey());
  const INVENTORY = new Inventory(API);
  await INVENTORY.refreshInventory();

  const clearDiv = document.createElement('div');
  clearDiv.classList.add('crafting-clear');

  const quickCrafter = document.createElement('div');
  quickCrafter.id = 'quick-crafter';

  document.getElementById('crafting_recipes').before(clearDiv, quickCrafter);

  createRoot(quickCrafter).render(
    <QuickCrafter extraSpace={await GM.getValue('SEG', false)} inventory={INVENTORY} store={STORE} />,
  );
})();
