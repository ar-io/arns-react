import './styles.css';
function SearchBarHeader({
  defaultText,
  isValid,
  text,
}: {
  defaultText?: string;
  isValid?: boolean;
  text?: string;
}): JSX.Element {
  return (
    <>
      {!text ? (
        <div className="sectionHeader">{defaultText}</div>
      ) : isValid ? (
        <div className="sectionHeader">
          {text}&nbsp;<span className="available">is available!</span>
        </div>
      ) : (
        <div className="sectionHeader">
          {text}&nbsp;
          <span className="unavailable">
            is already registered, try another name
          </span>
        </div>
      )}
    </>
  );
}
export default SearchBarHeader;
