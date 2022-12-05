import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import ButtonStoryMeta, {Clickable} from '../button.stories';
import ToggleableButton from './toggleable-button';

const meta: Meta<typeof ToggleableButton> = {
  title: 'Components/Button/Toggleable Button',
  component: ToggleableButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
  args: {style: {backgroundColor: 'green'}},
  argTypes: {...ButtonStoryMeta.argTypes, selectedChanged: {action: 'selected changed'}},
};

export default meta;
type Story = StoryObj<typeof ToggleableButton>;

export const Unselected: Story = {
  args: {text: 'Default Not Selected', selected: false},
  play: async (playArgs) => {
    Clickable.play(playArgs);
    const {args} = playArgs;
    expect(args.selectedChanged).toHaveBeenCalled();
  },
};
export const Selected: Story = {args: {text: 'Default Selected', selected: true}, play: Unselected.play};
