import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import React from 'react';
import {IsCraftingContext} from '../../../context/is-crafting';
import {recipes} from '../../../generated/recipe_info';
import BookButtonMeta from './book-button.stories';
import RecipeButton from './recipe-button';
import SelectableButtonMeta from './selectable-button.stories';

const meta: Meta<typeof RecipeButton> = {
  title: 'Components/Button/Recipe Button',
  component: RecipeButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
  args: {book: recipes[0].book, name: recipes[0].name},
  argTypes: {
    ...BookButtonMeta.argTypes,
    ...SelectableButtonMeta.argTypes,
    name: {options: recipes.map(({name}) => name), control: 'select'},
  },
};

export default meta;
type Story = StoryObj<typeof RecipeButton>;
export const RecipeUnselected: Story = {
  args: {selected: false},
  play: (playArgs) => {
    const {args, canvasElement} = playArgs;
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    userEvent.click(button);
    expect(args.onClick).toHaveBeenCalled();
  },
};
export const RecipeSelected: Story = {
  args: {...RecipeUnselected.args, selected: true},
  play: RecipeUnselected.play,
};
export const RecipeUnselectedDisabled: Story = {
  args: {...RecipeUnselected.args},
  decorators: [
    (Story) => (
      <IsCraftingContext.Provider value={{isCrafting: true, setIsCrafting: () => {}}}>
        <Story />
      </IsCraftingContext.Provider>
    ),
  ],
};
export const RecipeSelectedDisabled: Story = {
  args: {...RecipeSelected.args},
  decorators: RecipeUnselectedDisabled.decorators,
};
