import type {Meta, StoryObj} from '@storybook/react';
import IngredientQuantity from './ingredient-quantity';

const meta: Meta<typeof IngredientQuantity> = {
  title: 'Crafter/Ingredient-Quantity',
  component: IngredientQuantity,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof IngredientQuantity>;

export const Count: Story = {
  args: {
    countOnHand: 5,
    countPerCraft: 1,
  },
};
