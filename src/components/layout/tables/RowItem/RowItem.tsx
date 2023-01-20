function RowItem({
  details,
  bgColor,
  textColor,
}: {
  details: Array<any>;
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
          {details[0]}
        </td>
        <td
          className="assets-table-item flex-left"
          style={textColor ? { color: textColor, flex: 3 } : { flex: 3 }}
        >
          {details[1]}
        </td>

        <td
          className="assets-table-item flex-right"
          style={textColor ? { color: textColor } : {}}
        >
          {details[2] ? details[2] : <></>}
        </td>
      </tr>
    </>
  );
}

export default RowItem;
