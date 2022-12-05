import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, waitFor, within} from '@storybook/testing-library';
import {recipeInfo} from '../../generated/recipe_info';
import QuickCrafter from './quick-crafter';

const meta: Meta<typeof QuickCrafter> = {
  title: 'Main/Quick Crafter',
  component: QuickCrafter,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof QuickCrafter>;

export const MainUI: Story = {
  args: {},
  play: async (playArgs) => {
    const {canvasElement} = playArgs;
    const canvas = within(canvasElement);
    expect(canvas.queryByText('Clear')).toBeNull();
    expect(canvasElement.querySelectorAll('.crafting-panel-filters__books-row button')).toHaveLength(16);
    expect(canvasElement.querySelector('.crafting-panel-filters__books-row button[class$="-off"]')).toBeNull();
    expect(canvasElement.querySelectorAll('.recipes__recipe')).toHaveLength(recipeInfo.length);
  },
};
export const HideAll: Story = {
  args: {...MainUI.args},
  play: async (playArgs) => {
    await MainUI.play(playArgs);
    const {canvasElement} = playArgs;
    const canvas = within(canvasElement);
    userEvent.click(await canvas.findByText('Hide all'));
    await waitFor(async () => expect(canvasElement.querySelectorAll('.recipes__recipe')).toHaveLength(0));
  },
};
export const HideAllAndSearch: Story = {
  args: {...MainUI.args},
  play: async (playArgs) => {
    await HideAll.play(playArgs);
    const {canvasElement} = playArgs;
    const canvas = within(canvasElement);
    // Searching with no books should not show recipes
    userEvent.type(await canvas.findByRole('search'), 'gold');
    expect(canvasElement.querySelectorAll('.recipes__recipe')).toHaveLength(0);
    // Clearing search should not show recipes
    userEvent.click(await within((await canvas.findByRole('search')).parentElement).findByRole('button'));
    expect(canvasElement.querySelectorAll('.recipes__recipe')).toHaveLength(0);
  },
};
export const ShowAll: Story = {
  args: {...MainUI.args},
  play: async (playArgs) => {
    await HideAll.play(playArgs);
    const {canvasElement} = playArgs;
    const canvas = within(canvasElement);
    userEvent.click(await canvas.findByText('Show all'));
    await waitFor(async () =>
      expect(canvasElement.querySelectorAll('.recipes__recipe')).toHaveLength(recipeInfo.length),
    );
  },
};
export const ShowAllAndSearch: Story = {
  args: {...MainUI.args},
  play: async (playArgs) => {
    await ShowAll.play(playArgs);
    const {canvasElement} = playArgs;
    const canvas = within(canvasElement);
    // Search should show results, unchecking ingredients should show fewer
    userEvent.type(await canvas.findByRole('search'), 'gold');
    await waitFor(async () => expect(canvasElement.querySelectorAll('.recipes__recipe')).toHaveLength(39));
    userEvent.click(await canvas.findByLabelText('Include ingredients'));
    await waitFor(async () => expect(canvasElement.querySelectorAll('.recipes__recipe')).not.toHaveLength(39));
  },
};
export const HideBooksIndividually: Story = {
  args: {...MainUI.args},
  play: async (playArgs) => {
    await MainUI.play(playArgs);
    const {canvasElement} = playArgs;
    let bookButton: HTMLButtonElement;
    do {
      bookButton = canvasElement.querySelector('.crafting-panel-filters__books-button--on');
      if (bookButton) {
        const book = [...bookButton.classList]
          .map((cls) => ~cls.indexOf('--book-') && cls.substring(cls.indexOf('--book-')))
          .find((cls) => !!cls);
        expect(canvasElement.querySelectorAll('.recipes__recipe' + book)).not.toHaveLength(0);
        userEvent.click(bookButton);
        await waitFor(async () => expect(canvasElement.querySelectorAll('.recipes__recipe' + book)).toHaveLength(0));
      }
    } while (bookButton);
  },
};
export const ShowBooksIndividually: Story = {
  args: {...MainUI.args},
  play: async (playArgs) => {
    await HideAll.play(playArgs);
    const {canvasElement} = playArgs;
    let bookButton: HTMLButtonElement;
    do {
      bookButton = canvasElement.querySelector('.crafting-panel-filters__books-button--off');
      if (bookButton) {
        const book = [...bookButton.classList]
          .map((cls) => ~cls.indexOf('--book-') && cls.substring(cls.indexOf('--book-')))
          .find((cls) => !!cls);
        expect(canvasElement.querySelectorAll('.recipes__recipe' + book)).toHaveLength(0);
        userEvent.click(bookButton);
        await waitFor(async () =>
          expect(canvasElement.querySelectorAll('.recipes__recipe' + book)).not.toHaveLength(0),
        );
      }
    } while (bookButton);
  },
};
export const ShowUncraftableRecipe: Story = {
  args: {...MainUI.args},
  play: async (playArgs) => {
    const {canvasElement} = playArgs;
    const canvas = within(canvasElement);
    userEvent.click(canvasElement.querySelector('.recipes__recipe'));
    await waitFor(async () => (expect(canvasElement.querySelector('.crafting-panel')) as any).toBeInTheDocument());
    (expect(canvasElement.querySelector('.crafting-panel-actions')).not as any).toBeInTheDocument();
  },
};
export const ShowCraftableRecipe: Story = {
  args: {...MainUI.args},
  play: async (playArgs) => {
    const {canvasElement} = playArgs;
    userEvent.click(canvasElement.querySelectorAll('.recipes__recipe')[1]);
    await waitFor(async () => (expect(canvasElement.querySelector('.crafting-panel')) as any).toBeInTheDocument());
    (expect(canvasElement.querySelector('.crafting-panel-actions')) as any).toBeInTheDocument();
  },
};
export const ShowBlankLineBetweenBooks: Story = {
  args: {...MainUI.args},
  play: async (playArgs) => {
    const {canvasElement} = playArgs;
    const canvas = within(canvasElement);
    userEvent.click(await canvas.findByLabelText('Blank line between books'));
    (expect(canvasElement.querySelector('.recipe-buttons')) as any).toHaveClass('recipe-buttons--extra-space');
  },
};
