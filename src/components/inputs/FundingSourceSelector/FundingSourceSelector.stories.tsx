import { CostDetailsResult, mARIOToken } from '@ar.io/sdk';
import TransactionCost from '@src/components/layout/TransactionCost/TransactionCost';
import '@src/index.css';
import { useGlobalState } from '@src/state';
import { formatIO } from '@src/utils';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

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
    (Story, { parameters, args }) => {
      switch (parameters.asTransactionView) {
        case true: {
          const [{ arioTicker }] = useGlobalState();
          const [costDetail, setCostDetails] = useState<
            CostDetailsResult | undefined
          >(undefined);
          const initialCost = costDetail
            ? new mARIOToken(costDetail.tokenCost).toARIO().valueOf()
            : 0;
          const discount = costDetail
            ? costDetail.discounts.reduce((acc, d) => acc + d.discountTotal, 1)
            : 0;
          const totalCost = Math.min(0, initialCost - discount);

          return (
            <QueryClientProvider client={queryClient}>
              <div className="flex min-w-fit w-[700px] h-[500px] bg-background p-10 rounded-xl">
                <div className="flex justify-between gap-10">
                  {' '}
                  <div className="flex flex-col gap-3">
                    <span className="text-grey">Select payment method</span>
                    <Story
                      args={{
                        ...args,
                        costDetailsCallback: (v) => setCostDetails(v),
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className="text-white whitespace-nowrap">
                      Initial Cost:&nbsp;
                      <span className="font-sans-bold font-light">
                        {formatIO(initialCost)}&nbsp;{arioTicker}
                      </span>
                    </span>
                    {discount > 0 && (
                      <span className="text-error whitespace-nowrap">
                        Operator discount:&nbsp;
                        <span className="font-sans-bold font-light">
                          -{formatIO(discount)}&nbsp;{arioTicker}
                        </span>
                      </span>
                    )}
                    <span className="text-white whitespace-nowrap">
                      Total Cost:&nbsp;
                      <span className="font-sans-bold font-light">
                        {formatIO(totalCost)}&nbsp;{arioTicker}
                      </span>
                    </span>

                    <span className="text-grey">()</span>
                  </div>
                </div>
              </div>
            </QueryClientProvider>
          );
        }
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
      intent: 'Buy-Record',
      type: 'permabuy',
      fromAddress: '7waR8v4STuwPnTck1zFVkQqJh5K9q9Zik4Y5-5dV7nk',
    },
    costDetailsCallback: (details) => {
      console.log('Cost details:', details);
    },
  },
};

export const BuyRecordInTransactionView: Story = {
  parameters: { asTransactionView: true },
  args: {
    details: {
      name: 'ardrive',
      intent: 'Buy-Record',
      type: 'permabuy',
      fromAddress: '7waR8v4STuwPnTck1zFVkQqJh5K9q9Zik4Y5-5dV7nk',
    },
    costDetailsCallback: (details) => {
      console.log('Cost details:', details);
    },
  },
};
