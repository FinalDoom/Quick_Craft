import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import Button from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button/Plain Button',
  component: Button,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
  argTypes: {onClick: {action: 'clicked'}},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Clickable: Story = {
  args: {children: 'Click Me'},
  play: async (playArgs) => {
    const {args, canvasElement} = playArgs;
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    userEvent.click(button);
    expect(args.onClick).toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: {children: "Can't Click This", disabled: true},
};
