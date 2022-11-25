import type {Meta, StoryObj} from '@storybook/react';
import {within, userEvent} from '@storybook/testing-library';
import {expect, jest} from '@storybook/jest';
import RecipeButton from './recipe-button';

const meta: Meta<typeof RecipeButton> = {
  title: 'Components/Button/Recipe Button',
  component: RecipeButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof RecipeButton>;

const clickCallback = jest.fn();

export const PotionRecipe: Story = {
  args: {book: 'Potions', clickCallback: clickCallback, name: 'Some Thingie', selected: false},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    expect(clickCallback).toBeCalled();
  },
};

export const PotionRecipeSelected: Story = {
  args: {...PotionRecipe.args, selected: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    expect(clickCallback).toBeCalled();
  },
};
