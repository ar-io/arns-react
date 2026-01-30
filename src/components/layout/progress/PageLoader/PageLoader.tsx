import Loader from '../../Loader/Loader';

function PageLoader({
  loading,
  message,
}: {
  loading: boolean;
  message?: string | JSX.Element;
}) {
  return loading ? (
    <div className="modal-container text-center justify-center items-center">
      <div
        className="flex-col gap-8 text-center justify-center items-center text-foreground"
        style={{
          padding: '30px',
          width: '30%',
          minWidth: '300px',
          wordBreak: 'break-word',
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
