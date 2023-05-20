import Countdown from 'antd/es/statistic/Countdown';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';

import { calculateMinimumAuctionBid } from '../../../utils';
import Loader from '../Loader/Loader';

function AuctionChart({
  id = 'auction-chart',
  currentBlockHeight,
  startHeight,
  decayInterval,
  decayRate,
  initialPrice,
  floorPrice,
  auctionDuration,
  chartStyle,
  chartTitle,
  chartWidth = 770,
  chartHeight = 330,
  showUpdateCountdown = true,
}: {
  startHeight: number;
  initialPrice: number;
  floorPrice: number;
  currentBlockHeight: number;
  decayInterval: number;
  decayRate: number;
  auctionDuration: number;
  id?: string;
  chartStyle?: CSSProperties;
  chartTitle?: string;
  chartWidth?: number | 'fit-content';
  chartHeight?: number | 'fit-content';
  showUpdateCountdown?: boolean;
}) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin,
  );

  const chartRef = useRef<ChartJSOrUndefined<'line', number[], string>>(null);

  const [timeUntilUpdate, setTimeUntilUpdate] = useState<number>(0);
  const [prices, setPrices] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [showCurrentPrice, setShowCurrentPrice] = useState<boolean>(true);

  useEffect(() => {
    const deadline = getDeadline(currentBlockHeight);
    setTimeUntilUpdate(deadline);
    const newPrices = updatePrices();
    if (!newPrices) {
      return;
    }
    setPrices(Object.values(newPrices));
    setLabels(Object.keys(newPrices));
    setCurrentPrice(
      calculateMinimumAuctionBid({
        startHeight,
        initialPrice,
        floorPrice,
        currentBlockHeight,
        decayInterval,
        decayRate,
      }),
    );
  }, [currentBlockHeight]);

  useEffect(() => {
    triggerCurrentPriceTooltip();
  }, [chartRef.current, showCurrentPrice, prices]);

  function triggerCurrentPriceTooltip() {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }
    const data = chart.getDatasetMeta(0).data as PointElement[];
    const point = data.find((point: PointElement) =>
      point.parsed.y === currentPrice ? point : undefined,
    );
    if (!point) {
      return;
    }

    const tooltip = chart.tooltip;
    if (!tooltip) {
      return;
    }

    if (tooltip.getActiveElements().length > 0) {
      tooltip.setActiveElements([], { x: point.x, y: point.y });
    }

    tooltip.setActiveElements(
      [
        {
          datasetIndex: 0,
          index: point.parsed.x,
        },
        {
          datasetIndex: 0,
          index: point.parsed.x,
        },
      ],
      { x: point.x, y: point.y },
    );

    chart.update();
  }

  function getDeadline(block: number) {
    const blockIntervalsPassed = Math.floor(
      (block - startHeight) / decayInterval,
    );
    const minBlockRange = startHeight + blockIntervalsPassed * decayInterval;
    const blocksUntilDecay = block - minBlockRange;
    const deadline = Date.now() + 120_000 * blocksUntilDecay;

    return deadline;
  }

  const updatePrices = () => {
    const expiredHieght = startHeight + auctionDuration;
    let currentHeight = startHeight;
    const newPrices: { [X: string]: number } = {};
    while (currentHeight < expiredHieght) {
      const blockPrice = calculateMinimumAuctionBid({
        startHeight,
        initialPrice,
        floorPrice,
        currentBlockHeight: currentHeight,
        decayInterval,
        decayRate,
      });
      if (blockPrice <= floorPrice) {
        break;
      }
      newPrices[currentHeight] = blockPrice;
      currentHeight = currentHeight + decayInterval;
    }

    newPrices[expiredHieght] = floorPrice;
    return newPrices;
  };

  const data = {
    labels,
    datasets: [
      {
        tension: 0.314,
        label: 'prices',
        data: prices,
        borderWidth: 1.5,
        borderColor: 'white',
        backgroundColor: 'white',
        segment: {
          borderColor: 'white',
          borderDash: (ctx: any) =>
            ctx.p0.parsed.y > currentPrice ? undefined : [3, 3],
        },
        spanGaps: true,
        pointHoverRadius: 7,
        pointRadius: 0,
      },
    ],
  };

  if (!prices) {
    return <Loader size={80} />;
  }

  return (
    <>
      <div
        id={id}
        className="flex flex-column flex-center pointer"
        style={{
          gap: 15,
          width: 'fit-content',
        }}
      >
        <span className="flex flex-row flex-center text-medium white bold">
          {chartTitle}
        </span>
        <div
          className="flex flex-center"
          style={{
            boxSizing: 'border-box',
            border: '1px rgb(255,255,255,.2) solid',
            borderTop: 'none',
            borderRight: 'none',
            width: chartWidth,
            height: chartHeight,
            ...chartStyle,
          }}
        >
          <Line
            ref={chartRef}
            onMouseEnter={() => setShowCurrentPrice(false)}
            onMouseOut={() => setShowCurrentPrice(true)}
            options={{
              clip: false,
              layout: {
                padding: {
                  top: 40,
                  bottom: 20,
                  right: 10,
                },
              },
              interaction: {
                intersect: false,
              },
              responsive: true,
              scales: {
                x: {
                  ticks: {
                    display: false,
                  },
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                  },
                },
                y: {
                  ticks: {
                    display: false,
                  },
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                  },
                },
              },
              plugins: {
                tooltip: {
                  backgroundColor: 'transparent',
                  titleFont: {
                    size: 14,
                  },
                  titleColor: '#7D7D85',
                  mode: 'nearest',
                  xAlign: 'left',
                  yAlign: 'bottom',
                  caretPadding: 5,
                  callbacks: {
                    title: (data) =>
                      Math.round(data[0].parsed.y).toLocaleString() ?? '',
                    label: () => '',
                  },
                },
                annotation: {
                  annotations: {
                    point1: {
                      type: 'point',
                      xValue: prices.indexOf(currentPrice),
                      yValue: currentPrice,
                      backgroundColor: 'white',
                      radius: 7,
                      display: showCurrentPrice,
                    },
                  },
                },
                legend: {
                  display: false,
                },
                title: {
                  display: false,
                },
              },
            }}
            data={data}
          />
        </div>
        <span
          className={`flex flex-row flex-space-between white`}
          style={{ gap: 0 }}
        >
          <span>Premium</span>
          {showUpdateCountdown ? (
            <span
              className="faded flex flex-row flex-center"
              style={{ gap: 0, height: 'fit-content' }}
            >
              Next price update:&nbsp;
              <Countdown
                value={timeUntilUpdate}
                valueStyle={{
                  fontSize: '15px',
                  color: 'var(--text-faded)',
                  paddingBottom: 2,
                }}
                format="H:mm:ss"
              />
            </span>
          ) : (
            <></>
          )}
          <span>Floor</span>
        </span>
      </div>
    </>
  );
}

export default AuctionChart;
