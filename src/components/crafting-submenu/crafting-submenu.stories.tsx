import type {Meta, StoryObj} from '@storybook/react';
import {recipeInfo} from '../../generated/recipe_info';
import CraftingSubmenu from './crafting-submenu';

const meta: Meta<typeof CraftingSubmenu> = {
  title: 'Components/Crafting Submenu',
  component: CraftingSubmenu,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'padded',
  },
  args: {switchNeedHave: false},
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof CraftingSubmenu>;
// const onChange = jest.fn();
// const testClick = async ({canvasElement}) => {
//   const canvas = within(canvasElement);
//   const checkbox = canvas.getByRole('checkbox');
//   await userEvent.click(checkbox);
//   expect(onChange).toBeCalled();
// };

const singleItemRecipe = recipeInfo[0];
const multiItemRecipe = recipeInfo[9];
const emptyInventory = new Map<number, number>([]);
const singleItemInventory = new Map([[recipeInfo[0].ingredients[0].id, 99]]);
const multiItemInventory = new Map([
  [recipeInfo[9].ingredients[0].id, 99],
  [recipeInfo[9].ingredients[1].id, 99],
  [recipeInfo[9].ingredients[2].id, 99],
]);
const missingFirstInventory = new Map(multiItemInventory);
missingFirstInventory.delete(recipeInfo[9].ingredients[0].id);
const missingSecondInventory = new Map(multiItemInventory);
missingSecondInventory.delete(recipeInfo[9].ingredients[1].id);
const missingThirdInventory = new Map(multiItemInventory);
missingThirdInventory.delete(recipeInfo[9].ingredients[2].id);

console.log(multiItemInventory, missingFirstInventory, missingSecondInventory, missingThirdInventory);

export const SingleItemRecipeReadyToMake: Story = {
  args: {switchNeedHave: false, recipe: singleItemRecipe, inventory: singleItemInventory},
};
export const SingleItemRecipeMissingIngredients: Story = {args: {recipe: singleItemRecipe, inventory: emptyInventory}};
export const MultiItemRecipeReadyToMake: Story = {args: {recipe: multiItemRecipe, inventory: multiItemInventory}};
export const MultiItemRecipeMissingFirstIngredient: Story = {
  args: {recipe: multiItemRecipe, inventory: missingFirstInventory},
};
export const MultiItemRecipeMissingSecondIngredient: Story = {
  args: {recipe: multiItemRecipe, inventory: missingSecondInventory},
};
export const MultiItemRecipeMissingThirdIngredient: Story = {
  args: {recipe: multiItemRecipe, inventory: missingThirdInventory},
};
