import Countdown from 'antd/lib/statistic/Countdown';
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
import { Chart } from 'react-chartjs-2';

import { useArweaveCompositeProvider } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { AuctionSettings } from '../../../types';
import { calculateMinimumAuctionBid } from '../../../utils';
import eventEmitter from '../../../utils/events';
import Loader from '../Loader/Loader';

function AuctionChart({
  id = 'auction-chart',
  startHeight,
  initialPrice,
  floorPrice,
  auctionSettings,
  chartStyle,
  chartTitle,
  chartWidth = 770,
  chartHeight = 330,
  showUpdateCountdown = true,
}: {
  startHeight: number;
  initialPrice: number;
  floorPrice: number;
  auctionSettings: AuctionSettings;
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

  const [{ blockHieght: currentBlockHeight }, dispatchGlobalState] =
    useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { decayInterval, decayRate, auctionDuration } = auctionSettings;

  if (!currentBlockHeight) {
    arweaveDataProvider
      .getCurrentBlockHeight()
      .then((b: number) =>
        dispatchGlobalState({ type: 'setBlockHieght', payload: b }),
      )
      .catch((error) => eventEmitter.emit('error', error));
  }

  if (!currentBlockHeight || !decayInterval || !decayRate) {
    return <Loader size={80} message="Calculating auction prices..." />;
  }

  const chartRef = useRef<ChartJS>(null);

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
    triggerCurrentPriceTooltipWhenNotActive();
  }, [chartRef.current, showCurrentPrice, prices]);

  function triggerCurrentPriceTooltipWhenNotActive() {
    try {
      if (!showCurrentPrice) {
        return;
      }
      const chart = chartRef.current;
      if (!chart) {
        throw new Error('Chart ref not found');
      }
      const data = chart.getDatasetMeta(0).data as PointElement[];
      const point = data.find((point: PointElement) =>
        point.parsed.y === currentPrice ? point : undefined,
      );
      if (!point) {
        throw new Error('Current price point element not found');
      }

      const tooltip = chart.tooltip;
      if (!tooltip) {
        throw new Error('Tooltip not found');
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
    } catch (error) {
      console.error(error);
    }
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

  if (!prices || !labels) {
    return (
      <>
        <Loader size={80} />
      </>
    );
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
          <Chart
            type="line"
            ref={chartRef}
            onMouseLeave={() => setShowCurrentPrice(true)}
            onMouseOver={() => setShowCurrentPrice(false)}
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
                  backgroundColor: '#38393B',
                  titleFont: {
                    size: 12,
                    weight: '400',
                  },
                  footerFont: {
                    size: 12, // footer font size in px
                    style: 'normal', // footer font style
                    weight: '700', // footer font weight
                  },
                  titleAlign: 'center',
                  footerAlign: 'center',
                  footerColor: '#FAFAFA',
                  titleColor: '#FAFAFA80',
                  mode: 'nearest',
                  xAlign: 'center',
                  yAlign: 'bottom',
                  caretPadding: 15,
                  padding: 14,
                  callbacks: {
                    title: (data) => {
                      const block = +data[0].label;
                      const blockDiff =
                        block > currentBlockHeight
                          ? block - currentBlockHeight
                          : currentBlockHeight - block;
                      const timeDifferenceMs = blockDiff * 120000;
                      const time = new Date(
                        block > currentBlockHeight
                          ? Date.now() + timeDifferenceMs
                          : Date.now() - timeDifferenceMs,
                      );
                      const formattedDate = new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }).format(time);
                      return formattedDate ?? '';
                    },
                    footer: (data) =>
                      `${Math.round(data[0].parsed.y).toLocaleString()} IO` ??
                      '',
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
            data={{
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
            }}
          />
        </div>
        <span
          className={`flex flex-row flex-space-between white`}
          style={{ gap: 0 }}
        >
          <span>Premium</span>
          {showUpdateCountdown ? (
            <span
              className="grey flex flex-row flex-center"
              style={{ gap: 0, height: 'fit-content' }}
            >
              Next price update:&nbsp;
              <Countdown
                value={timeUntilUpdate}
                valueStyle={{
                  fontSize: '15px',
                  color: 'var(--text-grey)',
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
