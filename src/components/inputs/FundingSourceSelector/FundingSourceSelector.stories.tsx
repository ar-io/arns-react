import '@src/index.css';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { FundingSourceSelector } from './FundingSourceSelector';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: 'Inputs/FundingSourceSelector',
  component: FundingSourceSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { parameters }) => {
      switch (parameters.asTransactionView) {
        default: {
          return (
            <QueryClientProvider client={queryClient}>
              <div className="flex w-[700px] h-[500px] bg-background p-10 rounded-xl">
                <Story />
              </div>
            </QueryClientProvider>
          );
        }
      }
    },
  ],
} as Meta<typeof FundingSourceSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BuyRecord: Story = {
  args: {
    details: {
      name: 'ardrive',
      intent: 'Buy-Name',
      type: 'permabuy',
      fromAddress: '7waR8v4STuwPnTck1zFVkQqJh5K9q9Zik4Y5-5dV7nk',
    },
    costDetailsCallback: (details) => {
      console.log('Cost details:', details);
    },
  },
};
