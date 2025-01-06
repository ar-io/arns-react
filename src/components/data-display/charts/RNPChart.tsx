import { AoGetCostDetailsParams, mARIOToken } from '@ar.io/sdk';
import { useCostDetails } from '@src/hooks/useCostDetails';
import { useReturnedName } from '@src/hooks/useReturnedNames';
import { useGlobalState, useWalletState } from '@src/state';
import { formatARIOWithCommas, formatDateMDY } from '@src/utils';
import { useEffect, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  {
    timestamp: Date.now(),
    price: 1000000 * 50,
  },
  {
    timestamp: Date.now() + 1 ** 9,
    price: 1000000,
  },
];

const CustomTooltip = ({ active, payload, label, position }: any) => {
  const [{ arioTicker }] = useGlobalState();

  if (active && payload && payload.length) {
    return (
      <div className="bg-foreground rounded p-2 text-white flex flex-col items-center justify-center">
        <p className="label">{formatDateMDY(label)}</p>

        <p className="desc">
          {formatARIOWithCommas(
            new mARIOToken(payload[0].value).toARIO().valueOf(),
          )}{' '}
          {arioTicker}
        </p>
      </div>
    );
  }

  return null;
};

export function RNPChart({
  name,
  purchaseDetails,
}: {
  name: string;
  purchaseDetails?: AoGetCostDetailsParams;
}) {
  const [{ walletAddress }] = useWalletState();
  const { data: costDetails } = useCostDetails({
    intent: 'Buy-Record',
    years: 1,
    type: 'lease',
    fromAddress: walletAddress?.toString(),
    name,
    ...(purchaseDetails ?? {}),
  });
  const { data: returnedNameData } = useReturnedName(name);

  type ChartData = {
    timestamp: number;
    price: number;
  }[];

  const [chartData, setChartData] = useState<ChartData>([]);

  useEffect(() => {}, [returnedNameData]);

  return (
    <div className="flex flex-col w-full">
      <ResponsiveContainer
        width="100%"
        height="70%"
        className={'border border-white'}
      >
        <LineChart
          margin={{
            top: 0,
            left: -60,
            right: 0,
            bottom: -30,
          }}
          data={data}
        >
          <XAxis dataKey="timestamp" tick={false} />
          <YAxis dataKey="price" tick={false} />
          <Tooltip content={<CustomTooltip />} cursor={false} />

          <Line
            type="linear"
            dataKey="price"
            stroke="white"
            activeDot={{ stroke: 'white', fill: 'white', strokeWidth: 2, r: 6 }}
            dot={false}
            strokeDasharray={'6'}
          />
        </LineChart>
      </ResponsiveContainer>{' '}
      <div className="flex justify-between px-2 text-white">
        <span>woop</span>
        <span>woop</span>
      </div>
    </div>
  );
}
