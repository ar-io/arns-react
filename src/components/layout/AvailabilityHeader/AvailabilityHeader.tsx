import './styles.css';
function AvailabilityHeader({
  availability,
  name,
}: {
  availability: string;
  name: string;
}): JSX.Element {
  return (
    <>
      {availability == 'search' || name == '' ? (
        <div className="sectionHeader">Find a domain name</div>
      ) : (
        <></>
      )}
      {availability == 'available' && name !== '' ? (
        <div className="sectionHeader">
          {name} <span className="available">is available!</span>
        </div>
      ) : (
        <></>
      )}
      {availability == 'unavailable' && name !== '' ? (
        <div className="sectionHeader">
          {name}{' '}
          <span className="unavailable">
            is already registered, try another name
          </span>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
export default AvailabilityHeader;
