import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import ButtonStoryMeta from '../button.stories';
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
  argTypes: {
    ...ButtonStoryMeta.argTypes,
    executeCraft: {action: 'executed craft'},
    setMaxCraft: {action: 'set max craft value'},
  },
};

export default meta;
type Story = StoryObj<typeof MaxCraftButton>;
const testClick = (playArgs: Parameters<Story['play']>[0]) => {
  const {args, canvasElement} = playArgs;
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');
  userEvent.click(button);
  expect(args.onClick).toHaveBeenCalled();
};

export const CraftMax: Story = {};
export const Confirm: Story = {
  args: {...CraftMax.args},
  play: async (playArgs) => {
    testClick(playArgs);
    const {args} = playArgs;
    expect(args.setMaxCraft).toHaveBeenCalled();
  },
};
export const Crafting: Story = {
  args: {...Confirm.args},
  play: async (playArgs) => {
    await Confirm.play(playArgs);
    testClick(playArgs);
    const {args} = playArgs;
    expect(args.executeCraft).toBeCalled();
  },
};
