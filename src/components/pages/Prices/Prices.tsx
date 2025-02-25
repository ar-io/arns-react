import TableView from '@src/components/data-display/tables/TableView';
import { useDemandFactor } from '@src/hooks/useDemandFactor';
import {
  camelToReadable,
  formatARIOWithCommas,
  lowerCaseDomain,
} from '@src/utils';
import {
  ARNS_NAME_REGEX_PARTIAL,
  MAX_ARNS_NAME_LENGTH,
} from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

type TableData = {
  characters: number;
  baseFee: number;
  adjustedRegistrationFee: number;
  renewalFee: number;
  oneYearLeaseFee: number;
  permabuyFee: number;
  undernameFee: number;
  permabuyUndernameFee: number;
} & Record<string, any>;

const columnHelper = createColumnHelper<TableData>();

const minFees = new Array(MAX_ARNS_NAME_LENGTH - 12)
  .fill(true)
  .reduce((acc, _, index) => {
    acc[index + 13] = 200;
    return acc;
  }, {});

const BASE_NAME_FEES: Record<number, number> = {
  1: 1000000,
  2: 200000,
  3: 20000,
  4: 10000,
  5: 2500,
  6: 1500,
  7: 800,
  8: 500,
  9: 400,
  10: 350,
  11: 300,
  12: 250,
  ...minFees,
};

export default function Prices() {
  const { data: demandFactor, isLoading, error } = useDemandFactor();
  const [domain, setDomain] = useState('');

  const tableData = useMemo(() => {
    if (!demandFactor) return [];
    const newData = Object.entries(BASE_NAME_FEES).map(
      ([characters, baseFee]) => {
        const arf = baseFee * demandFactor;
        const af = arf * 0.2;
        const data: TableData = {
          characters: Number(characters),
          baseFee,
          adjustedRegistrationFee: arf,
          renewalFee: af,
          oneYearLeaseFee: arf + af * 1,
          permabuyFee: arf + af * 20,
          undernameFee: baseFee * demandFactor * 0.001,
          permabuyUndernameFee: baseFee * demandFactor * 0.005,
        };
        return data;
      },
    );
    return newData;
  }, [demandFactor, isLoading, error]);

  const columns = [
    'characters',
    'oneYearLeaseFee',
    'renewalFee',
    'permabuyFee',
    'undernameFee',
    'permabuyUndernameFee',
  ].map((key) => {
    return columnHelper.accessor(key, {
      id: key,
      header: () => {
        return <span className="">{camelToReadable(key)} </span>;
      },
      cell: ({ row }) => {
        const numVal = Number(row.getValue(key));
        if (key === 'characters') return numVal.toString();
        return formatARIOWithCommas(Number(numVal.toFixed(1)));
      },
    });
  });

  return (
    <div className="page sm:px-10 lg:px-[100px]">
      <div className="flex justify-between w-full items-center">
        <h1 className="text-white text-3xl w-full">Prices ($ARIO)</h1>{' '}
        <span className="flex p-2 bg-foreground border border-dark-grey rounded text-white whitespace-nowrap">
          Demand Factor:{' '}
          {isLoading ? 'Loading...' : error ? error.message : demandFactor}
        </span>
      </div>

      <div className="flex w-full py-2 justify-between  items-center gap-5">
        <input
          className="flex w-full p-2 bg-background border-b border-dark-grey outline-none text-white"
          placeholder="Enter an ArNS Name to see its fee"
          value={domain}
          onChange={(e) => {
            const trimmed = e.target.value.trim();
            if (trimmed.length > MAX_ARNS_NAME_LENGTH) return;
            if (!ARNS_NAME_REGEX_PARTIAL.test(lowerCaseDomain(trimmed))) {
              eventEmitter.emit('error', {
                name: 'Invalid ARNS name',
                message: `${trimmed} is not a valid arns name`,
              });
              return;
            }
            setDomain(trimmed);
          }}
        />
      </div>

      <div className="flex flex-col size-full gap-2">
        <TableView
          data={tableData}
          columns={columns}
          isLoading={false}
          defaultSortingState={{ id: 'characters', desc: false }}
          tableClass="border-[1px] border-dark-grey relative"
          paginationConfig={{ pageSize: 51 }}
          headerClass="sticky absolute"
          bodyClass="scrollbar overflow-y-scroll"
          rowClass={(props) => {
            const rowCharLength = props?.row?.getValue('characters');
            if (props?.row !== undefined) {
              return rowCharLength === lowerCaseDomain(domain).length
                ? 'bg-primary-thin border-l-2 border-primary border-t-0'
                : '';
            }

            return '';
          }}
          dataClass={(props) => {
            if (props?.row !== undefined && props.row.getIsExpanded()) {
              return 'border-t-[1px] border-dark-grey border-b-0';
            }

            return '';
          }}
        />
      </div>
    </div>
  );
}
