import {themes} from '@storybook/theming';
import {initialize, mswDecorator} from 'msw-storybook-addon';

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
};
