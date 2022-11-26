import {action} from '@storybook/addon-actions';
import {expect, jest} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import ButtonStoryMeta, {Clickable} from '../button.stories';
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
  },
};

export default meta;
type Story = StoryObj<typeof MaxCraftButton>;
const executeCraft = jest.fn(action('executed craft'));
const setMaxCraft = jest.fn(action('set max craft value'));

export const CraftMax: Story = {args: {executeCraft: executeCraft, setMaxCraft: setMaxCraft}};
export const Confirm: Story = {
  args: {...CraftMax.args},
  play: async (args) => {
    await Clickable.play(args);
    expect(setMaxCraft).toBeCalled();
  },
};
export const Crafting: Story = {
  args: {...Confirm.args},
  play: async (args) => {
    await Confirm.play(args);
    await Clickable.play(args);
    expect(executeCraft).toBeCalled();
  },
};
