import '@src/index.css';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { TransactionDetails } from './TransactionDetails';

const meta = {
  title: 'Inputs/TransactionDetails',
  component: TransactionDetails,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { parameters }) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            initialData: () => parameters.costDetail,
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
    },
  ],
} as Meta<typeof TransactionDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BalancesBuyRecord: Story = {
  parameters: {
    costDetail: {
      tokenCost: 10000000000,
      discounts: [],
      fundingPlan: {
        balance: 10000000000,
        address: '5Gru9gQCIiRaIPV7fU7RXcpaVShG4u9nIcPVmm2FJSM',
        stakes: {},
        shortfall: 0,
      },
    },
  },
  args: {
    details: {
      name: 'ardrive',
      intent: 'Buy-Name',
      type: 'permabuy',
      fromAddress: '5Gru9gQCIiRaIPV7fU7RXcpaVShG4u9nIcPVmm2FJSM',
    },
  },
};

export const BalancesDiscountBuyRecord: Story = {
  parameters: {
    discount: true,
    costDetail: {
      tokenCost: 10000000000,
      discounts: [
        {
          name: 'blah',
          discountTotal: 10000000000 / 2,
          multiplier: 1,
        },
      ],
      fundingPlan: {
        balance: 10000000000,
        address: '5Gru9gQCIiRaIPV7fU7RXcpaVShG4u9nIcPVmm2FJSM',
        stakes: {},
        shortfall: 0,
      },
    },
  },
  args: {
    details: {
      name: 'ardrive',
      intent: 'Buy-Name',
      type: 'permabuy',
      fromAddress: '5Gru9gQCIiRaIPV7fU7RXcpaVShG4u9nIcPVmm2FJSM',
    },
  },
};
export const StakesDiscountBuyRecord: Story = {
  parameters: {
    discount: true,
    costDetail: {
      tokenCost: 10000000000,
      discounts: [
        {
          name: 'blah',
          discountTotal: 10000000000 / 2,
          multiplier: 1,
        },
      ],
      fundingPlan: {
        balance: 0,
        address: '5Gru9gQCIiRaIPV7fU7RXcpaVShG4u9nIcPVmm2FJSM',
        stakes: {
          stake1: {
            delegatedStake: 5000000000,
            vaults: {
              vault1: 2500000000,
              vault2: 2500000000,
            },
          },
        },
        shortfall: 0,
      },
    },
  },
  args: {
    details: {
      name: 'ardrive',
      intent: 'Buy-Name',
      type: 'permabuy',
      fromAddress: '5Gru9gQCIiRaIPV7fU7RXcpaVShG4u9nIcPVmm2FJSM',
    },
  },
};

export const AnyDiscountBuyRecord: Story = {
  parameters: {
    discount: true,
    costDetail: {
      tokenCost: 10000000000,
      discounts: [
        {
          name: 'blah',
          discountTotal: 10000000000 / 2,
          multiplier: 1,
        },
      ],
      fundingPlan: {
        balance: 1000000000,
        address: '5Gru9gQCIiRaIPV7fU7RXcpaVShG4u9nIcPVmm2FJSM',
        stakes: {
          stake1: {
            delegatedStake: 4000000000,
            vaults: {
              vault1: 2500000000,
              vault2: 2500000000,
            },
          },
        },
        shortfall: 0,
      },
    },
  },
  args: {
    details: {
      name: 'ardrive',
      intent: 'Buy-Name',
      type: 'permabuy',
      fromAddress: '5Gru9gQCIiRaIPV7fU7RXcpaVShG4u9nIcPVmm2FJSM',
    },
  },
};
