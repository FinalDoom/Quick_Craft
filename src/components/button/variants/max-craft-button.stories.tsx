import type {Meta, StoryObj} from '@storybook/react';
import {within, userEvent} from '@storybook/testing-library';
import {expect, jest} from '@storybook/jest';
import MaxCraftButton from './max-craft-button';

const meta: Meta<typeof MaxCraftButton> = {
  title: 'Components/Button/Max Craft Button',
  component: MaxCraftButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MaxCraftButton>;

const executeCraft = jest.fn();
const setMaxCraft = jest.fn();
const doClick = async ({canvasElement}: {canvasElement: HTMLElement}) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');
  await userEvent.click(button);
};

export const CraftMax: Story = {args: {executeCraft: executeCraft, setMaxCraft: setMaxCraft}};

const confirmPlay = async ({canvasElement}: {canvasElement: HTMLElement}) => {
  await doClick({canvasElement});
  expect(setMaxCraft).toBeCalled();
};
export const Confirm: Story = {
  args: {...CraftMax.args},
  play: confirmPlay,
};

export const Crafting: Story = {
  args: {...Confirm.args},
  play: async ({canvasElement}) => {
    await confirmPlay({canvasElement});
    await doClick({canvasElement});
    expect(executeCraft).toBeCalled();
  },
};
