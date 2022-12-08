import type {Meta, StoryObj} from '@storybook/react';
import ButtonStoryMeta, {Clickable} from '../button.stories';
import SelectableButton from './selectable-button';

const meta: Meta<typeof SelectableButton> = {
  title: 'Components/Button/Selectable Button',
  component: SelectableButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
  args: {style: {backgroundColor: 'green'}},
  argTypes: {...ButtonStoryMeta.argTypes},
};

export default meta;
type Story = StoryObj<typeof SelectableButton>;

export const Unselected: Story = {
  args: {
    children: 'Not Selected',
    selected: false,
    classNameBase: 'crafting-panel-filters__books-button',
    additionalClassNames: '',
  },
  play: Clickable.play,
};
export const Selected: Story = {
  args: {...Unselected.args, children: 'Selected', selected: true},
  play: Clickable.play,
};
