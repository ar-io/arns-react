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
import './styles.css';

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
    ctx.save();

    const x = tooltip.caretX;
    const y = chartArea.bottom + 15;

    ctx.strokeStyle = '#a7a7a7';

    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    ctx.moveTo(x, tooltip.caretY + 9);
    ctx.lineTo(x, y - 12);
    ctx.stroke();

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

  const tooltipRef = useRef<HTMLDivElement>(null);
  const blockHeightLabelRef = useRef<HTMLDivElement>(null);

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
        <div
          ref={tooltipRef}
          className="flex flex-column flex-center bottom-arrow"
          style={{
            position: 'absolute',
            width: 'fit-content',
            height: 'fit-content',
            pointerEvents: 'none',
            gap: '5px',
            padding: '9px',
            fontSize: '12px',
            borderRadius: '5px',
            border: 'solid 1px var(--text-faded)',
            backgroundColor: 'var(--bg-color) ',
            opacity: 0,
          }}
        >
          <div
            className="grey"
            style={{ fontWeight: '400', whiteSpace: 'nowrap' }}
          ></div>
          <div
            className="white"
            style={{ fontWeight: '700', whiteSpace: 'nowrap' }}
          ></div>
        </div>

        <div
          ref={blockHeightLabelRef}
          style={{
            position: 'absolute',
            width: 'fit-content',
            height: 'fit-content',
            pointerEvents: 'none',
            padding: '3.5px 7px',
            fontSize: '10px',
            borderRadius: '5px',
            border: 'solid 1px #313133',
            backgroundColor: 'var(--bg-color) ',
            color: 'white',
            whiteSpace: 'nowrap',
            bottom: '3px',
            opacity: 0,
          }}
        ></div>

        <Chart
          className="pointer"
          type="line"
          ref={chartRef}
          onMouseLeave={() => setShowCurrentPrice(true)}
          onMouseOver={() => setShowCurrentPrice(false)}
          options={{
            clip: false,
            animation: false,
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
              tooltip: {
                enabled: false,
                external: (context) => {
                  const { tooltip } = context;

                  const label = tooltip.dataPoints?.[0].label;
                  const io = tooltip.dataPoints?.[0].parsed.y;
                  if (!label || !io) {
                    if (tooltipRef.current) {
                      tooltipRef.current.style.opacity = '0';
                    }

                    if (blockHeightLabelRef.current) {
                      blockHeightLabelRef.current.style.opacity = '0';
                    }
                    return;
                  }

                  if (tooltipRef.current && blockHeightLabelRef.current) {
                    tooltipRef.current.style.opacity = '1';
                    blockHeightLabelRef.current.style.opacity = '1';

                    const tooltipDiv = tooltipRef.current;
                    const blockHeightLabelDiv = blockHeightLabelRef.current;

                    let left = tooltip.caretX - tooltipDiv.clientWidth / 2;
                    let top = tooltip.caretY - tooltipDiv.clientHeight - 15;
                    let bottomArrow = true;

                    if (left < 5) {
                      left = tooltip.caretX + 15;
                      top = tooltip.caretY - tooltipDiv.clientHeight / 2;
                      bottomArrow = false;
                    }

                    if (bottomArrow) {
                      tooltipDiv.classList.add('bottom-arrow');
                      tooltipDiv.classList.remove('left-arrow');
                    } else {
                      tooltipDiv.classList.remove('bottom-arrow');
                      tooltipDiv.classList.add('left-arrow');
                    }

                    tooltipDiv.style.left = `${left}px`;
                    tooltipDiv.style.top = `${top}px`;

                    const block = +label;
                    const formattedDate = formattedEstimatedDateFromBlockHeight(
                      block,
                      currentBlockHeight,
                    );

                    tooltipDiv.childNodes[0].textContent = `${formattedDate}*`;
                    tooltipDiv.childNodes[1].textContent =
                      `${Math.round(io).toLocaleString()} IO` ?? '';

                    blockHeightLabelDiv.textContent = `Block ${block}`;

                    const blockHeightLabelX =
                      tooltip.caretX - blockHeightLabelDiv.clientWidth / 2;

                    blockHeightLabelDiv.style.left = `${blockHeightLabelX}px`;
                  }
                },
                mode: 'nearest',
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
              <div>Auction start: Block {auctionInfo.startHeight}</div>
              <div>
                {` (${formattedEstimatedDateFromBlockHeight(
                  auctionInfo.startHeight,
                  currentBlockHeight,
                )})*`}
              </div>
            </div>

            <div className="flex flex-column right " style={{ gap: 4 }}>
              <div>Auction end: Block {auctionInfo.endHeight}</div>
              <div>
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
