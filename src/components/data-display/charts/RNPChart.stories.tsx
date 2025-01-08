import { AoReturnedName } from '@ar.io/sdk';
import '@src/index.css';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RNPChart } from './RNPChart';

const meta = {
  title: 'Charts/RNPChart',
  component: RNPChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { parameters }) => {
      switch (true) {
        default: {
          // TODO: add correct test data
          const queryClient = new QueryClient({
            defaultOptions: {
              queries: {
                retry: false,
                initialData: () => parameters.rnpDetails,
              },
            },
          });
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
} as Meta<typeof RNPChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const stubData: AoReturnedName = {
  name: 'ardrive',
  startTimestamp: Date.now(),
  endTimestamp: Date.now() + 1 ** 6,
  initiator: '1'.padEnd(43, '1'),
  premiumMultiplier: 2,
};

export const Chart: Story = {
  args: {
    name: 'hsdlkjfhlskdjfhlksdjhflksdjhflkjhsdflkhdlfkjshdflkj',
  },
  parameters: {
    rnpDetails: stubData,
  },
};
