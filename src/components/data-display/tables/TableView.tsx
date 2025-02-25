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
  tableWrapperClassName,
  headerClass,
  bodyClass,
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
  bodyClass?: string;
  tableWrapperClassName?: string;
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
    autoResetPageIndex: false,
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

  useEffect(() => {
    table.setPageIndex(0);
  }, [data.length]);

  return (
    <>
      <div className={`overflow-x-auto scrollbar ${tableWrapperClassName}`}>
        <table className={`${tableClass} w-full table-auto`}>
          <thead className={`${headerClass} text-[0.875rem] text-grey `}>
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
          <tbody className={`${bodyClass} text-sm`}>
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

            {table.getPageCount() <= 6 ? (
              Array.from({ length: table.getPageCount() }, (_, i) => (
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
              ))
            ) : (
              <>
                {/* First 3 pages */}
                {Array.from({ length: 3 }, (_, i) => (
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

                {/* Only render the middle pages if the current page is not in the first 3 or last 3 */}
                {table.getState().pagination.pageIndex >= 2 &&
                  table.getState().pagination.pageIndex <=
                    table.getPageCount() - 3 && (
                    <>
                      <span className="text-grey">...</span>

                      {/* Pages around current page: 2 before, current, 2 after */}
                      {Array.from(
                        { length: Math.min(5, table.getPageCount() - 6) },
                        (_, i) => {
                          const pageCount = table.getPageCount();
                          const minPage = 3;
                          const maxPage = pageCount - 3;
                          const pageIndex =
                            Math.max(
                              minPage,
                              table.getState().pagination.pageIndex - 2,
                            ) + i;

                          if (
                            pageIndex >= pageCount ||
                            pageIndex < 0 ||
                            pageIndex < minPage ||
                            pageIndex >= maxPage
                          )
                            return null; // Prevent exceeding page count
                          return (
                            <button
                              key={pageIndex}
                              onClick={() => table.setPageIndex(pageIndex)}
                              disabled={
                                pageIndex ===
                                table.getState().pagination.pageIndex
                              }
                              className={`w-[32px] h-[32px] items-center justify-center rounded text-sm ${
                                pageIndex ===
                                table.getState().pagination.pageIndex
                                  ? 'bg-dark-grey text-white'
                                  : 'text-grey'
                              }`}
                            >
                              {pageIndex + 1}
                            </button>
                          );
                        },
                      )}
                    </>
                  )}

                <span className="text-grey">...</span>

                {/* Last 3 pages */}
                {Array.from({ length: 3 }, (_, i) => (
                  <button
                    key={table.getPageCount() - 3 + i}
                    onClick={() =>
                      table.setPageIndex(table.getPageCount() - 3 + i)
                    }
                    disabled={
                      table.getPageCount() - 3 + i ===
                      table.getState().pagination.pageIndex
                    }
                    className={`w-[32px] h-[32px] items-center justify-center rounded text-sm ${
                      table.getPageCount() - 3 + i ===
                      table.getState().pagination.pageIndex
                        ? 'bg-dark-grey text-white'
                        : 'text-grey'
                    }`}
                  >
                    {table.getPageCount() - 3 + i + 1}
                  </button>
                ))}
              </>
            )}

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
