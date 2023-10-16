import Countdown from 'antd/lib/statistic/Countdown';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';

import { useArweaveCompositeProvider } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { Auction } from '../../../types';
import { getNextPriceChangeTimestamp } from '../../../utils/auctions';
import { APPROXIMATE_BLOCKS_PER_DAY } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import Loader from '../Loader/Loader';

function AuctionChart({
  id = 'auction-chart',
  domain,
  chartStyle,
  chartTitle,
  chartWidth = '100%',
  chartHeight = 330,
  showUpdateCountdown = true,
  showAuctionExplainer,
}: {
  domain: string;
  id?: string;
  chartStyle?: CSSProperties;
  chartTitle?: string;
  chartWidth?: number | string | 'fit-content';
  chartHeight?: number | string | 'fit-content';
  showUpdateCountdown?: boolean;
  showAuctionExplainer?: boolean;
}) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend,
    annotationPlugin,
  );

  const [
    { blockHeight: currentBlockHeight, walletAddress },
    dispatchGlobalState,
  ] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const chartRef = useRef<ChartJSOrUndefined>(null);

  const [timeUntilUpdate, setTimeUntilUpdate] = useState<number>(0);
  const [labels, setLabels] = useState<string[]>();
  const [prices, setPrices] = useState<number[]>();
  const [showCurrentPrice, setShowCurrentPrice] = useState<boolean>(true);
  const [auctionInfo, setAuctionInfo] = useState<Auction>();

  useEffect(() => {
    if (!auctionInfo) {
      arweaveDataProvider
        .getAuction({ domain, address: walletAddress })
        .then((auction) => {
          setAuctionInfo(auction);
        });
      return;
    }

    if (!currentBlockHeight) {
      arweaveDataProvider.getCurrentBlockHeight().then((blockHeight) => {
        dispatchGlobalState({ type: 'setBlockHeight', payload: blockHeight });
      });
      return;
    }

    // use the price response to calculate the next interval
    const nextPriceChangeTimestamp = getNextPriceChangeTimestamp({
      currentBlockHeight,
      prices: auctionInfo.prices,
    });

    setTimeUntilUpdate(nextPriceChangeTimestamp);
    setPrices(Object.values(auctionInfo.prices));
    setLabels(Object.keys(auctionInfo.prices));
  }, [chartRef.current, domain, currentBlockHeight, auctionInfo]);

  useEffect(() => {
    if (auctionInfo) {
      triggerCurrentPriceTooltipWhenNotActive(auctionInfo?.minimumBid);
    }
  }, [chartRef.current, showCurrentPrice, prices, auctionInfo]);

  function triggerCurrentPriceTooltipWhenNotActive(price: number) {
    try {
      const chart = chartRef.current;
      const validPrice = prices?.includes(price);
      if (!showCurrentPrice || !chart || !prices) {
        return;
      }
      const data = chart.getDatasetMeta(0).data as PointElement[];
      const point = data.find((point: PointElement) =>
        point.parsed.y === prices?.[validPrice ? prices?.indexOf(price) : 0]
          ? point
          : undefined,
      );
      const tooltip = chart.tooltip;
      if (!point || !tooltip) {
        return;
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
      console.error('error', error);
    }
  }

  async function updateBlockHeight() {
    try {
      const blockHeight = await arweaveDataProvider.getCurrentBlockHeight();
      dispatchGlobalState({ type: 'setBlockHeight', payload: blockHeight });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  if (!prices || !labels || !currentBlockHeight || !auctionInfo) {
    return (
      <div className="flex flex-row center" style={{ height: '100%' }}>
        <Loader size={80} message="Loading prices..." />
      </div>
    );
  }

  return (
    <div
      id={id}
      className="flex flex-column flex-center pointer fade-in"
      style={{
        gap: '15px',
        width: 'fit-content',
        boxSizing: 'border-box',
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
                  title: (data: any) => {
                    // TODO: move these a util function in auctions.test.ts and add unit tests
                    const block = +data[0].label;
                    const blockDiff =
                      Math.max(+block, currentBlockHeight) -
                      Math.min(+block, currentBlockHeight);
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
                  footer: (data: any) =>
                    `${Math.round(data[0].parsed.y).toLocaleString()} IO` ?? '',
                  label: () => '',
                },
              },
              annotation: {
                annotations: {
                  point1: {
                    type: 'point',
                    xValue: prices.indexOf(auctionInfo?.minimumBid),
                    yValue: auctionInfo?.minimumBid,
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
                    ctx.p0.parsed.y > auctionInfo.minimumBid
                      ? undefined
                      : [3, 3],
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
        style={{ gap: '0px', boxSizing: 'border-box' }}
      >
        <span>Premium</span>
        {showUpdateCountdown ? (
          <span
            className="grey flex flex-row flex-center"
            style={{ gap: '0px', height: 'fit-content' }}
          >
            Next price update:&nbsp;
            <Countdown
              value={timeUntilUpdate}
              valueStyle={{
                fontSize: '15px',
                color: 'var(--text-grey)',
                paddingBottom: '0px',
              }}
              format="H:mm:ss"
              onFinish={() => updateBlockHeight()}
            />
          </span>
        ) : (
          <></>
        )}
        <span>Floor</span>
      </span>
      {showAuctionExplainer ? (
        <div
          className="flex flex-row grey radius left"
          style={{
            padding: '16px',
            border: 'solid 1px var(--text-faded)',
            boxSizing: 'border-box',
            fontSize: '13px',
            lineHeight: '150%',
            marginTop: '48px',
          }}
        >
          To ensure that everyone has a fair opportunity to register this
          premium name, it has an auction premium that will reduce gradually
          over a{' '}
          {Math.round(
            auctionInfo.settings.auctionDuration / APPROXIMATE_BLOCKS_PER_DAY,
          )}{' '}
          day period. This name has been on auction for{' '}
          {/* TODO: MOVE THESE TO FUNCTIONS */}
          {Math.round(
            (currentBlockHeight - auctionInfo.startHeight) /
              APPROXIMATE_BLOCKS_PER_DAY,
          )}{' '}
          days and has{' '}
          {Math.round(
            (auctionInfo.startHeight +
              auctionInfo.settings.auctionDuration -
              currentBlockHeight) /
              APPROXIMATE_BLOCKS_PER_DAY,
          )}{' '}
          days remaining, during which time anyone can buy it now for the
          current price. If there are no bidders before the auction end date,
          the person who initiated the bid will win the name for the floor
          price.
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default AuctionChart;
