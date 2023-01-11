function RowItem({
  col1,
  col2,
  col3,
  col4,
  col5,
  bgColor,
  textColor,
}: {
  col1: string;
  col2: string | string[] | number | JSX.Element;
  col3: string | JSX.Element;
  col4: JSX.Element;
  col5: JSX.Element;
  bgColor: string;
  textColor: string;
}) {
  return (
    <>
      <tr
        className="assets-table-header"
        style={
          bgColor
            ? {
                backgroundColor: bgColor,
                color: textColor,
              }
            : {}
        }
      >
        <td
          className="assets-table-item"
          style={textColor ? { color: textColor } : {}}
        >
          {col1}
        </td>
        <td
          className="assets-table-item"
          style={textColor ? { color: textColor } : {}}
        >
          {col2}
        </td>
        <td
          className="assets-table-item"
          style={textColor ? { color: textColor } : {}}
        >
          {col3}
        </td>
        <td
          className="assets-table-item"
          style={textColor ? { color: textColor } : {}}
        >
          {col4}
        </td>
        <td
          className="assets-table-item"
          style={textColor ? { color: textColor } : {}}
        >
          {col5}
        </td>
      </tr>
    </>
  );
}

export default RowItem;
