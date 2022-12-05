import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, waitFor} from '@storybook/testing-library';
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
const clickTwoIngredients = async (playArgs: Parameters<Story['play']>[0], first: number, second: number) => {
  const {canvasElement} = playArgs;
  const max = canvasElement.querySelector('.crafting-panel-info__ingredients-max');
  const ingredients = canvasElement.querySelectorAll('.crafting-panel-info__ingredient-row');
  userEvent.click(ingredients[first]);
  await waitFor(async () =>
    (expect(ingredients[first]) as any).toHaveClass('crafting-panel-info__ingredient--purchasable'),
  );
  (expect(max.querySelector('span')) as any).not.toBeInTheDocument();
  userEvent.click(ingredients[second]);
  await waitFor(async () =>
    (expect(ingredients[second]) as any).toHaveClass('crafting-panel-info__ingredient--purchasable'),
  );
  (expect(max.querySelector('span')) as any).toBeInTheDocument();
};

export const SingleItemRecipeReadyToMake: Story = {
  args: {switchNeedHave: false, recipe: singleItemRecipe, inventory: singleItemInventory},
  play: async (playArgs) => {
    const {canvasElement} = playArgs;
    const ingredient = canvasElement.querySelector('.crafting-panel-info__ingredient-row');
    userEvent.click(ingredient);
    (expect(ingredient).not as any).toHaveClass('crafting-panel-info__ingredient--purchasable');
    (expect(canvasElement.querySelector('.crafting-panel-actions')) as any).toBeInTheDocument();
  },
};
export const SingleItemRecipeMissingIngredients: Story = {
  args: {recipe: singleItemRecipe, inventory: emptyInventory},
  play: async (playArgs) => {
    const {canvasElement} = playArgs;
    const ingredient = canvasElement.querySelector('.crafting-panel-info__ingredient-row');
    userEvent.click(ingredient);
    (expect(ingredient).not as any).toHaveClass('crafting-panel-info__ingredient--purchasable');
    (expect(canvasElement.querySelector('.crafting-panel-actions')).not as any).toBeInTheDocument();
  },
};
export const MultiItemRecipeReadyToMake: Story = {
  args: {recipe: multiItemRecipe, inventory: multiItemInventory},
  play: (playArgs) => {
    const {canvasElement} = playArgs;
    (expect(canvasElement.querySelector('.crafting-panel-actions')) as any).toBeInTheDocument();
  },
};
export const MultiItemRecipeMissingFirstIngredient: Story = {
  args: {recipe: multiItemRecipe, inventory: missingFirstInventory},
  play: async (playArgs) => {
    await clickTwoIngredients(playArgs, 1, 0);
    const {canvasElement} = playArgs;
    (expect(canvasElement.querySelector('.crafting-panel-actions')).not as any).toBeInTheDocument();
  },
};
export const MultiItemRecipeMissingSecondIngredient: Story = {
  args: {recipe: multiItemRecipe, inventory: missingSecondInventory},
  play: async (playArgs) => {
    await clickTwoIngredients(playArgs, 2, 1);
    const {canvasElement} = playArgs;
    (expect(canvasElement.querySelector('.crafting-panel-actions')).not as any).toBeInTheDocument();
  },
};
export const MultiItemRecipeMissingThirdIngredient: Story = {
  args: {recipe: multiItemRecipe, inventory: missingThirdInventory},
  play: async (playArgs) => {
    await clickTwoIngredients(playArgs, 0, 2);
    const {canvasElement} = playArgs;
    (expect(canvasElement.querySelector('.crafting-panel-actions')).not as any).toBeInTheDocument();
  },
};
