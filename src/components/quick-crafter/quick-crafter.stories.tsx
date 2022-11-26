import type {Meta, StoryObj} from '@storybook/react';
import Api from '../../api/api';
import {recipeInfo} from '../../generated/recipe_info';
import {GMMock} from '../../helpers/gm-mock';
import QuickCrafter from './quick-crafter';

declare global {
  interface Window {
    GM: any /*{
      getValue: typeof GM.getValue;
      deleteValue: typeof GM.deleteValue;
      setValue: typeof GM.setValue;
    }*/;
  }
}
window.GM = {getValue: GMMock.getValue, deleteValue: GMMock.deleteValue, setValue: GMMock.setValue};
const inventoryMap = new Map(recipeInfo.map(({id}) => [id, 99]));

const meta: Meta<typeof QuickCrafter> = {
  title: 'Crafter/Quick Crafter',
  component: QuickCrafter,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
  args: {api: {getInventoryCounts: async () => inventoryMap} as Api},
};

export default meta;
type Story = StoryObj<typeof QuickCrafter>;

export const MainUI: Story = {args: {}};
