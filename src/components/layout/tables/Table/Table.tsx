export function Table({
  headers,
  rows,
  headerStyle,
  rowStyle,
  tableStyle,
  columnSize,
}: {
  headers?: {
    [x: string]: {
      icon?: JSX.Element;
      action?: () => void;
      position?: 'left' | 'center' | 'right';
    };
  };
  rows: any[][];
  headerStyle?: { [x: string]: string };
  rowStyle?: { [x: string]: string };
  tableStyle?: { [x: string]: string };
  columnSize?: string;
}) {
  return (
    <table
      style={{
        ...tableStyle,
        display: 'grid',
        flex: 1,
        borderCollapse: 'collapse',
        gridTemplateColumns: columnSize,
      }}
    >
      {headers ? (
        <thead style={{ display: 'contents' }}>
          <tr style={{ display: 'contents' }}>
            {Object.entries(headers).map(([header, value], index) => (
              <th
                key={index}
                style={{ ...headerStyle, justifyContent: value.position }}
              >
                {/* <button onClick={value.action} disabled={!value.action}> */}
                {header}&nbsp;
                {value.icon ? value.icon : <></>}
                {/* </button> */}
              </th>
            ))}
          </tr>
        </thead>
      ) : (
        <></>
      )}
      <tbody style={{ display: 'contents' }}>
        {rows.map((row, index) => (
          <tr style={{ ...rowStyle, display: 'contents' }} key={index}>
            {row.map((detail: any, idx: number) => (
              <td
                style={{
                  ...rowStyle,
                }}
                key={`${detail}-${idx}`}
              >
                {detail}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>{/* TODO */}</tfoot>
    </table>
  );
}
