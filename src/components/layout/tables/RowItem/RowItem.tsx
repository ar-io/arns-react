function RowItem({
  details,
  bgColor,
  textColor,
}: {
  details: { [x: number]: any };
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
        {Object.values(details).map((value, index) => (
          <td
            className="assets-table-item"
            style={textColor ? { color: textColor } : {}}
            key={index}
          >
            {value}
          </td>
        ))}
      </tr>
    </>
  );
}

export default RowItem;
