import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
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
  decorators: [
    (Story) => (
      <div id="quick-crafter" style={{color: 'white'}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuickCrafter>;

export const MainUI: Story = {args: {}};
