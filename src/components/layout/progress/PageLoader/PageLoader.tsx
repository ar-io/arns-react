import Loader from '../../Loader/Loader';

function PageLoader({
  loading,
  message,
}: {
  loading: boolean;
  message?: string | JSX.Element;
}) {
  return loading ? (
    <div className="modal-container center">
      <div
        className="flex flex-column center white"
        style={{
          padding: '30px',
          width: 'fit-content',
          height: 'fit-content',
          background: 'var(--card-bg)',
          borderRadius: 'var(--corner-radius)',
        }}
      >
        <Loader size={80} color="var(--accent)" />
        {message}
      </div>
    </div>
  ) : (
    <></>
  );
}

export default PageLoader;
