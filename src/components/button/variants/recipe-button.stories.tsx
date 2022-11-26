import type {Meta, StoryObj} from '@storybook/react';
import {recipes} from '../../../generated/recipe_info';
import BookButtonMeta from './book-button.stories';
import RecipeButton from './recipe-button';
import SelectableButtonMeta, {Selected, Unselected} from './selectable-button.stories';

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
  play: Selected.play,
};

export const RecipeSelected: Story = {
  args: {...RecipeUnselected.args, selected: true},
  play: Unselected.play,
};
