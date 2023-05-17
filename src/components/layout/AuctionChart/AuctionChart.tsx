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
import React, { useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

function AuctionChart({
  leaseDuration,
  name,
  id = 'auction-chart',
}: {
  startHeight: number;
  initialPrice: number;
  floorPrice: number;
  currentBlockHeight: number;
  decayInterval: number;
  decayRate: number;
  //
  fees: any[];
  leaseDuration?: number;
  name: string;
  id?: string;
}) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  );
  const show = false;
  const options = {
    fill: false,
    interaction: {
      intersect: false,
    },
    radius: 0,
    elements: {
      point: {
        radius: 0,
      },
      line: {
        padding: 20,
      },
    },
    responsive: true,
    scales: {
      x: {
        ticks: {
          display: false,
        },
        border: {
          display: false,
          color: 'white',
        },
        grid: {
          display: show,
        },
      },
      y: {
        ticks: {
          display: false,
        },
        border: {
          display: false,
          color: 'white',
        },
        grid: {
          display: show,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };
  const skipped = (ctx: any, value: any) =>
    ctx.p0.skip || ctx.p1.skip ? value : undefined;
  const down = (ctx: any, value: any) =>
    ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
  const getPrices = () => {
    let prices = [];
    const charLength = name.length;
    const floor = 0;
    const ciel = 0;
    const tier = 0;
    const auctionLength = 0;
  };

  const labels = ['', '', '', '', '', '', ''];
  const data = {
    labels,
    datasets: [
      {
        tension: 0.314,
        label: 'Dataset 1',
        data: [NaN, 50, 40, NaN, 35, 30, 20, NaN], // price
        borderColor: 'white',
        backgroundColor: 'white',
        segment: {
          borderColor: (ctx: any) =>
            skipped(ctx, 'white') || down(ctx, 'white'),
          borderDash: (ctx: any) => skipped(ctx, [6, 6]),
        },
        spanGaps: true,
      },
    ],
  };

  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        id={id}
        ref={chartRef}
        className="flex flex-column flex-center"
        style={{
          maxWidth: '900px',
          maxHeight: '475px',
          minWidth: 0,
          padding: 20,
          gap: '1em',
        }}
      >
        <span className="flex flex-row flex-center text-medium white bold"></span>
        <div
          className="flex"
          style={{
            border: '1px var(--text-faded) solid',
            borderTop: 'none',
            borderRight: 'none',
            width: '100%',
            height: '300px',
          }}
        >
          <Line options={options} data={data} />
        </div>
        <span className="flex flex-row flex-space-between white bold">
          <span>Premium</span>
          <span>Floor</span>
        </span>
      </div>
    </>
  );
}

export default AuctionChart;
