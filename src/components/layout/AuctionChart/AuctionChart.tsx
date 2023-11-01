import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  Plugin,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { clamp } from 'lodash';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { Link } from 'react-router-dom';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useWalletState } from '../../../state/contexts/WalletState';
import { Auction } from '../../../types';
import {
  approximateDays,
  formattedEstimatedDateFromBlockHeight,
} from '../../../utils';
import Loader from '../Loader/Loader';

const BlockHeightLabelPlugin: Plugin = {
  id: 'blockHeightLabel',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  beforeTooltipDraw(chart, args, options) {
    const { ctx, chartArea, tooltip } = chart;
    if (!(ctx && chartArea && tooltip)) {
      return;
    }
    const label = tooltip.dataPoints?.[0].label;
    if (!label) {
      return;
    }
    const blockHeight = +label;

    const fontSize = 10;
    const fontStyle = 'normal';
    const fontFamily = 'Rubik';
    ctx.save();
    ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const x = tooltip.caretX;
    const y = chartArea.bottom + 15;

    const labelText = `Block ${blockHeight}`;
    const labelDimension = ctx.measureText(labelText);
    const labelW = labelDimension.width + 14;
    const labelH = labelDimension.actualBoundingBoxAscent + 14;

    const labelLeft = clamp(x - labelW / 2, 0, chartArea.right - labelW);

    ctx.strokeStyle = '#313133';
    ctx.beginPath();
    ctx.roundRect(labelLeft, y - labelH / 2, labelW, labelH, 5);
    ctx.stroke();

    ctx.strokeStyle = '#a7a7a7';

    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    ctx.moveTo(x, tooltip.caretY + 9);
    ctx.lineTo(x, y - 12);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.fillText(labelText, labelLeft + labelW / 2, y);
    ctx.restore();
  },
};

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

function AuctionChart({
  id = 'auction-chart',
  domain,
  chartStyle,
  chartTitle,
  chartWidth = '100%',
  chartHeight = 330,
  showAuctionExplainer,
}: {
  domain: string;
  id?: string;
  chartStyle?: CSSProperties;
  chartTitle?: string;
  chartWidth?: number | string | 'fit-content';
  chartHeight?: number | string | 'fit-content';
  showAuctionExplainer?: boolean;
}) {
  const [
    { blockHeight: currentBlockHeight, arweaveDataProvider },
    dispatchGlobalState,
  ] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const chartRef = useRef<ChartJSOrUndefined>(null);

  const [labels, setLabels] = useState<string[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
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
      const validPrice = prices.includes(price);
      if (!showCurrentPrice || !chart || !prices.length) {
        return;
      }
      const data = chart.getDatasetMeta(0).data as PointElement[];
      const point = data.find((point: PointElement) =>
        point.parsed.y === prices[validPrice ? prices.indexOf(price) : 0]
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

  if (!prices.length || !labels.length || !currentBlockHeight || !auctionInfo) {
    return (
      <div className="flex flex-row center" style={{ height: '100%' }}>
        <Loader size={80} message="Loading prices..." />
      </div>
    );
  }

  return (
    <div
      id={id}
      className="flex flex-column flex-centerfade-in"
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
          position: 'relative',
          width: chartWidth,
          height: chartHeight,
          ...chartStyle,
        }}
      >
        <div
          className="flex flex-column flex-space-between grey"
          style={{
            position: 'absolute',
            top: 0,
            left: -100,
            width: 100,
            height: '100%',
            textAlign: 'right',
            fontSize: '13px',
          }}
        >
          <div
            className="flex flex-column"
            style={{ gap: 0, width: 73, paddingTop: 12 }}
          >
            {`${auctionInfo.startPrice} IO`}
            <div>ceiling</div>
          </div>

          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 1,
              width: 8,
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
          ></div>

          <div
            className="flex flex-column"
            style={{ gap: 0, width: 73, paddingBottom: 18 }}
          >
            {`${auctionInfo.floorPrice} IO`}
            <div>floor</div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 1,
              width: 8,
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
          ></div>
        </div>
        <Chart
          className="pointer"
          type="line"
          ref={chartRef}
          onMouseLeave={() => setShowCurrentPrice(true)}
          onMouseOver={() => setShowCurrentPrice(false)}
          options={{
            clip: false,
            layout: {
              padding: {
                top: 0,
                bottom: 20,
                right: 10,
              },
            },
            interaction: {
              axis: 'x',
              intersect: false,
            },
            responsive: true,
            maintainAspectRatio: false,
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
              // blockHeightLabel: {},
              tooltip: {
                borderWidth: 1,
                borderColor: '#313133',
                backgroundColor: '#141416',
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
                padding: 9,
                callbacks: {
                  title: (data: any) => {
                    const block = +data[0].label;
                    const formattedDate = formattedEstimatedDateFromBlockHeight(
                      block,
                      currentBlockHeight,
                    );
                    return `${formattedDate}*`;
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
                    xValue: prices.indexOf(auctionInfo.minimumBid),
                    yValue: auctionInfo.minimumBid,
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
          plugins={[BlockHeightLabelPlugin]}
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
        className={`flex flex-row flex-space-between grey`}
        style={{ gap: '0px', boxSizing: 'border-box', fontSize: '13px' }}
      >
        {auctionInfo && (
          <>
            <div className="flex flex-column" style={{ gap: 4 }}>
              <div>Auction start date:</div>
              <div>
                Block {auctionInfo.startHeight}
                {` (${formattedEstimatedDateFromBlockHeight(
                  auctionInfo.startHeight,
                  currentBlockHeight,
                )})*`}
              </div>
            </div>

            <div className="flex flex-column right " style={{ gap: 4 }}>
              <div>Auction end date:</div>
              <div>
                Block {auctionInfo.endHeight}
                {` (${formattedEstimatedDateFromBlockHeight(
                  auctionInfo.endHeight,
                  currentBlockHeight,
                )})*`}
              </div>
            </div>
          </>
        )}
      </span>
      {showAuctionExplainer ? (
        <div
          className="flex flex-column grey radius left"
          style={{
            padding: '16px',
            border: 'solid 1px var(--text-faded)',
            boxSizing: 'border-box',
            fontSize: '13px',
            lineHeight: '150%',
            marginTop: '48px',
          }}
        >
          To ensure that everyone has a fair opportunity to register this name,
          it has an auction premium that will reduce gradually over a
          {approximateDays(auctionInfo.settings.auctionDuration)}
          -day period. This name has been on auction for{' '}
          {approximateDays(currentBlockHeight - auctionInfo.startHeight)} days
          and has {approximateDays(auctionInfo.endHeight - currentBlockHeight)}
          days remaining, during which time anyone can buy it now for the
          current price. If there is no buyer before the auction ends, the
          auction initiator will win the name at the floor price.
          <Link
            to="https://ar.io/docs/arns/#bid-initiated-dutch-auctions-bida"
            rel="noreferrer"
            target="_blank"
            className="link"
            style={{ textDecoration: 'underline', color: 'inherit' }}
          >
            Learn more.
          </Link>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default AuctionChart;
