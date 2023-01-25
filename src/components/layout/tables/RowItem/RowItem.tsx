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
        {details}
      </tr>
    </>
  );
}

export default RowItem;
