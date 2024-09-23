import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@src/components/icons';
import {
  ColumnDef,
  ColumnSort,
  ExpandedState,
  HeaderGroup,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ReactNode, useEffect, useState } from 'react';

import Placeholder from './Placeholder';

const TableView = <T, S>({
  columns,
  data,
  defaultSortingState,
  isLoading,
  noDataFoundText = 'No data found.',
  onRowClick,
  getSubRows,
  renderSubComponent,
  tableClass,
  headerClass,
  rowClass = () => '',
  dataClass = () => '',
  addOnAfterTable,
  paginationConfig = {
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  },
}: {
  columns: ColumnDef<T, S>[];
  data: T[];
  defaultSortingState: ColumnSort;
  isLoading: boolean;
  noDataFoundText?: ReactNode;
  onRowClick?: (row: T) => T;
  getSubRows?: (row: T, index: number) => T[] | undefined;
  renderSubComponent?: (props: { row: Row<T> }) => ReactNode;
  tableClass?: string;
  headerClass?: string;
  rowClass?: (props?: { row?: Row<T>; headerGroup?: HeaderGroup<T> }) => string;
  dataClass?: (props?: {
    row?: Row<T>;
    headerGroup?: HeaderGroup<T>;
  }) => string;
  addOnAfterTable?: ReactNode;
  paginationConfig?: {
    pageIndex?: number;
    pageSize?: number;
  };
}) => {
  const [sorting, setSorting] = useState<SortingState>([defaultSortingState]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState({
    pageIndex: paginationConfig.pageIndex ?? 0,
    pageSize: paginationConfig.pageSize ?? 10,
  });

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel<T>(),
    getSortedRowModel: getSortedRowModel(), //provide a sorting row model
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { sorting, expanded, pagination },
    onSortingChange: setSorting,
    enableExpanding: true,
    onExpandedChange: (getState: any) => {
      const state = getState();
      const isSame = Object.keys(state)[0] == Object.keys(expanded)[0];
      setExpanded(isSame ? {} : state);
    },
    getSubRows,
  });

  useEffect(() => {
    setSorting([defaultSortingState]);
  }, [defaultSortingState]);

  return (
    <>
      <div className="overflow-x-auto scrollbar">
        <table className={'w-full table-auto' + ' ' + tableClass}>
          <thead
            className={`text-[14px] text-grey ${headerClass}`}
            style={{ borderRadius: '10px' }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={`${rowClass({ headerGroup })}`}
              >
                {headerGroup.headers.map((header) => {
                  const sortState = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={`${dataClass({
                        headerGroup,
                      })} py-4 pl-4`}
                      style={{ width: `${header.getSize()}px` }}
                    >
                      <button
                        className="flex items-center gap-1 text-left"
                        onClick={() => {
                          setSorting([
                            {
                              id: header.column.id,
                              desc: sortState
                                ? sortState === 'desc'
                                  ? false
                                  : true
                                : header.column.columnDef.sortDescFirst ?? true,
                            },
                          ]);
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        &nbsp;
                        {sortState ? (
                          sortState === 'desc' ? (
                            <ChevronUpIcon
                              width={'12px'}
                              fill={'var(--text-faded)'}
                            />
                          ) : (
                            <ChevronDownIcon
                              width={'12px'}
                              fill={'var(--text-faded)'}
                            />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="text-sm">
            {table.getRowModel().rows.map((row) => {
              return (
                <>
                  <tr
                    key={row.id}
                    className={`${rowClass({
                      row,
                    })} border-t border-dark-grey text-white *:py-3 *:pl-4 ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={`${dataClass({ row })}`}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>{' '}
                  {row.getIsExpanded() && renderSubComponent && (
                    <tr
                      className={`${rowClass({ row })}`}
                      data-id="renderSubComponent"
                    >
                      {/* 2nd row is a custom 1 cell row */}
                      <td
                        colSpan={row.getVisibleCells().length}
                        className={`${dataClass({ row })}`}
                      >
                        {renderSubComponent({ row })}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center border-x border-b border-dark-grey px-6 py-4 text-low">
          <Placeholder className="w-full" />
        </div>
      )}
      {!isLoading && table.getRowCount() === 0 && (
        <div className="flex h-fit items-center justify-center border-x border-b rounded border-dark-grey text-grey">
          {noDataFoundText}
        </div>
      )}
      {addOnAfterTable}
      {/* pagination start */}
      {table.getPageCount() > 1 && (
        <div className="flex flex-row w-full py-4 items-center justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="flex items-center">
                <ChevronLeftIcon
                  width={'24px'}
                  height={'24px'}
                  fill="var(--text-grey)"
                />
              </span>
            </button>
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                disabled={i === table.getState().pagination.pageIndex}
                className={`w-[32px] h-[32px] items-center justify-center rounded text-sm ${
                  i === table.getState().pagination.pageIndex
                    ? 'bg-dark-grey text-white'
                    : 'text-grey'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="flex items-center">
                <ChevronRightIcon
                  width={'24px'}
                  height={'24px'}
                  fill="var(--text-grey)"
                />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* pagination end */}
    </>
  );
};

export default TableView;
