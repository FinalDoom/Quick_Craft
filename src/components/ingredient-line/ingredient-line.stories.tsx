import type {Meta, StoryObj} from '@storybook/react';
import IngredientLine from './ingredient-line';

const meta: Meta<typeof IngredientLine> = {
  title: 'Crafter/Ingredient-Line',
  component: IngredientLine,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof IngredientLine>;

const example = {
  id: 1234,
  name: 'Boogie Woogie Pants',
  quantityAvailable: 1,
  quantityPerCraft: 2,
  switchNeedHave: false,
};

export const InStore: Story = {
  args: {
    ...example,
    availableInStore: true,
  },
};

export const NotInStore: Story = {
  args: {
    ...example,
    availableInStore: false,
  },
};
