import {themes} from '@storybook/theming';
import {rest} from 'msw';
import {initialize, mswDecorator} from 'msw-storybook-addon';
import {GazelleApi} from '../src/api/api';
import {GMMock} from '../src/helpers/gm-mock';
import apiMock from './api-mock';

// Set up GM mocking
declare global {
  interface Window {
    GM: any /*{
      getValue: typeof GM.getValue;
      deleteValue: typeof GM.deleteValue;
      setValue: typeof GM.setValue;
    }*/;
    noty: (notification: {type: string; text: string}) => void;
    unsafeWindow: Window;
  }
}
window.GM = {getValue: GMMock.getValue, deleteValue: GMMock.deleteValue, setValue: GMMock.setValue};
window.noty = () => {};
window.unsafeWindow = window;

// Initialize MSW
initialize();
export const decorators = [mswDecorator];

// or global addParameters
export const parameters = {
  actions: {argTypesRegex: '^on[A-Z].*'},
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    theme: themes.dark,
  },
  msw: {
    handlers: {
      api: [
        rest.get('/api.php', (req, res, ctx) => {
          console.log(req.headers.get('X-API-Key'));
          if (req.url.searchParams.get('request') === 'items') {
            switch (req.url.searchParams.get('type')) {
              case 'inventory':
                return res(ctx.json(apiMock.getInventoryCounts));
              case 'equip':
                return res(ctx.json(apiMock.equip));
              case 'unequip':
                return res(ctx.json(apiMock.unequip));
              case 'users_equippable':
                return res(ctx.json(apiMock.getEquipmentInfo));
              case 'users_equipped':
                return res(ctx.json(apiMock.getEquippedIds));
            }
          }
          // Not an items api request.. where did it come from?
          return res(ctx.status(400));
        }),
      ],
      // Successful craft result
      crafting: [rest.get('/user.php', (_, res, ctx) => res(ctx.json({})))],
    },
  },
};

export const args = {
  api: new GazelleApi('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
};
