import { AoGetCostDetailsParams, mARIOToken } from '@ar.io/sdk';
import { useCostDetails } from '@src/hooks/useCostDetails';
import { useGlobalState, useWalletState } from '@src/state';
import { formatARIOWithCommas, formatDateMDY } from '@src/utils';
import { useEffect, useRef, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Coordinate } from 'recharts/types/util/types';

const START_RNP_PREMIUM = 50;

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

  type ChartData = {
    timestamp: number;
    price: number;
  }[];

  const [chartData, setChartData] = useState<ChartData>([]);
  const [activePayload, setActivePayload] = useState<any>(null);
  const [defaultTooltip, setDefaultTooltip] = useState<any>(null);
  const [defaultTooltipCoords, setDefaultTooltipCoords] =
    useState<Partial<Coordinate> | null>(null);
  const [tooltipData, setTooltipData] = useState<any>(null);

  const chartRef = useRef<any>(null);

  useEffect(() => {
    try {
      if (costDetails?.returnedNameDetails) {
        const startPrice =
          costDetails.returnedNameDetails.basePrice * START_RNP_PREMIUM;
        const endPrice = costDetails.returnedNameDetails.basePrice;
        const startTimestamp = costDetails.returnedNameDetails.startTimestamp;
        const endTimestamp = costDetails.returnedNameDetails.endTimestamp;
        const pricePointCount = 14;

        const newChartData: ChartData = new Array(pricePointCount)
          .fill(true)
          .map((_, i) => {
            const timestamp =
              startTimestamp +
              ((endTimestamp - startTimestamp) / (pricePointCount - 1)) * i;

            const percentageOfPeriodPassed =
              (timestamp - startTimestamp) / (endTimestamp - startTimestamp);
            const price =
              startPrice + percentageOfPeriodPassed * (endPrice - startPrice);

            return {
              price: Math.round(price),
              timestamp,
            };
          });

        setChartData(
          [
            ...newChartData,
            // Add the current price for tooltip orientation on default position
            {
              timestamp: Date.now(),
              price: costDetails.tokenCost,
            },
          ].sort((a, b) => a.timestamp - b.timestamp),
        );
        return;
      }
    } catch (error) {
      console.error(error);
    }
    setChartData([]);
  }, [costDetails]);

  useEffect(() => {
    const point = chartData?.find((d) => d.price === costDetails?.tokenCost);
    if (point) {
      const tipData = {
        payload: [
          {
            value: point.price,
            timestamp: point.timestamp,
          },
        ],
        label: point.timestamp,
      };
      setDefaultTooltip(tipData);
      setTooltipData(tipData);

      if (
        chartRef.current?.state?.xAxisMap &&
        chartRef.current?.state?.yAxisMap
      ) {
        const { xAxisMap, yAxisMap } = chartRef.current.state;
        const xScale = xAxisMap[0].scale;
        const yScale = yAxisMap[0].scale;
        setDefaultTooltipCoords({
          x: xScale(point.timestamp),
          y: yScale(point.price),
        });
      }
    }
  }, [chartData, chartRef.current]);

  const CustomTooltip = ({ data }: { data: any }) => {
    const [{ arioTicker }] = useGlobalState();

    if (data?.payload?.length) {
      return (
        <div className="flex flex-col bg-dark-grey rounded p-2 text-white items-center justify-center">
          <p>{formatDateMDY(data.label)}</p>
          <p>
            {formatARIOWithCommas(
              new mARIOToken(data.payload[0].value).toARIO().valueOf(),
            )}{' '}
            {arioTicker}
          </p>
        </div>
      );
    }

    return null;
  };

  const renderActiveDot = (props: any) => {
    const { cx, cy, payload } = props;

    const isActive = tooltipData?.payload?.[0]?.value === payload.price;

    if (isActive) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="white"
          stroke="black"
          strokeWidth={1}
        />
      );
    }

    return <></>;
  };

  if (!chartData.length) return <></>;

  if (!costDetails?.returnedNameDetails) return <></>;

  return (
    <div className="flex flex-col size-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          ref={chartRef}
          margin={{
            top: 0,
            left: -60,
            right: 0,
            bottom: -30,
          }}
          onMouseMove={(state) => {
            if (state?.activePayload?.length) {
              const currentPayload = state.activePayload[0];
              setActivePayload(currentPayload);
              setTooltipData({
                payload: [currentPayload],
                label: currentPayload.payload.timestamp,
              });
            } else {
              setActivePayload(null);
              setTooltipData(defaultTooltip);
            }
          }}
          onMouseLeave={() => {
            setActivePayload(null);
            setTooltipData(defaultTooltip);
          }}
        >
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={false}
            padding={{ left: 10, right: 10 }}
            allowDataOverflow={false}
            allowDuplicatedCategory={false}
          />
          <YAxis
            dataKey="price"
            tick={false}
            domain={['dataMin', 'dataMax']}
            type="number"
            padding={{ bottom: 10, top: 10 }}
            allowDataOverflow={false}
            allowDuplicatedCategory={false}
          />
          <Tooltip
            content={<CustomTooltip data={tooltipData} />}
            cursor={false}
            active={activePayload ? undefined : true}
            position={
              activePayload !== null || !defaultTooltipCoords
                ? undefined
                : defaultTooltipCoords
            }
          />

          <Line
            type="linear"
            dataKey="price"
            data={chartData.filter(
              (point) => point.price >= costDetails.tokenCost,
            )}
            stroke="white"
            dot={(props) => renderActiveDot(props)}
          />
          <Line
            type="linear"
            dataKey="price"
            data={chartData.filter(
              (point) => point.price <= costDetails.tokenCost,
            )}
            stroke="white"
            strokeDasharray="6 6"
            dot={(props) => renderActiveDot(props)}
          />
        </LineChart>
      </ResponsiveContainer>{' '}
      <div className="flex justify-between pt-2 text-[14px] text-white">
        <span>
          {formatDateMDY(costDetails.returnedNameDetails.startTimestamp)}
        </span>
        <span>
          {' '}
          {formatDateMDY(costDetails.returnedNameDetails.endTimestamp)}
        </span>
      </div>
    </div>
  );
}
