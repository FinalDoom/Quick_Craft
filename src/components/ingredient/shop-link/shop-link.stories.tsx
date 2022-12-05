import type {Meta, StoryObj} from '@storybook/react';
import ShopLink from './shop-link';

const meta: Meta<typeof ShopLink> = {
  title: 'Crafter/Ingredient/Shop Link',
  component: ShopLink,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ShopLink>;

export const PurchaseLink: Story = {
  args: {ingredientId: 1234, availableInStore: true},
};

export const Info: Story = {
  args: {ingredientId: 1234, availableInStore: false},
};
