import { Table } from 'antd';
import { kebabCase, startCase } from 'lodash';
import React, { useEffect } from 'react';
import useSWR from 'swr';

export class DataColumn {
  title: string | React.ReactNode;
  dataIndex: string | number;
  key: string;
  align?: 'left' | 'right' | 'center' | undefined;
  width?: number | string | undefined;
  ellipsis = true;
  render: (
    value: any,
    record: Record<any, any>,
    index: number,
  ) => React.ReactNode;
  className: string | undefined;

  constructor(p: {
    key: string;
    className?: string;
    title: string | React.ReactNode;
    dataIndex: string | number;
    align?: 'left' | 'right' | 'center' | undefined;
    width?: number | string | undefined;
    render?: (
      value: any,
      record: Record<any, any>,
      index: number,
    ) => React.ReactNode;
  }) {
    this.title = p.title;
    this.dataIndex = p.dataIndex;
    this.key = p.key;
    this.align = p.align ?? 'center';
    this.width = p.width ?? 'auto';
    this.render = p.render ?? ((value: any) => value);
    this.className = 'white manage-assets-table-header';
  }
}

export function dataTypeRenderer(dataType: string) {
  return (value: any) => {
    switch (dataType) {
      case 'string':
        return startCase(value);
      case 'number':
        return value;
      case 'object':
        return JSON.stringify(value, null, 2);
      case 'boolean':
        return value;
      case 'undefined':
        return 'N/A';
      case 'function':
        return `function ${value.name}()`;
      case 'symbol':
        return 'Symbol';
      default:
        return value;
    }
  };
}

// generates basic columns from data - useful for unknown data schemas
export function defaultDataColumnGenerator(data: Record<string, any>) {
  return Object.entries(data).map(([key, value]) => {
    return new DataColumn({
      key: key,
      title: kebabCase(key),
      dataIndex: key,
      align: 'center',
      width: 'auto',
      render: dataTypeRenderer(typeof value),
    });
  });
}

export function DataTable({
  requestCacheKey,
  dataFetcher,
  columnGenerator,
  defaultColumns,
}: {
  requestCacheKey: string;
  dataFetcher: () => Promise<Record<any, any>[]>;
  columnGenerator: (data: Record<any, any>) => DataColumn[];
  defaultColumns: DataColumn[];
}) {
  const [columns, setColumns] = React.useState<DataColumn[]>(defaultColumns);
  const { data, error, isLoading } = useSWR(requestCacheKey, dataFetcher);

  useEffect(() => {
    setColumns(data?.length ? columnGenerator(data[0]) : defaultColumns);
  }, [data, columnGenerator, error]);

  return (
    <>
      <Table
        className="manage-table"
        dataSource={data}
        columns={columns}
        locale={{
          emptyText: (
            <div className="flex size-full flex-col items-center justify-center gap-10">
              <span
                className={`text-xl ${
                  isLoading ? 'font-success animate-pulse' : ''
                }`}
              >
                {isLoading
                  ? 'Loading...'
                  : `${error ? error.message : 'No data found.'}`}
              </span>
            </div>
          ),
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '30', '40'],
          total: data?.length ?? 0,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    </>
  );
}
