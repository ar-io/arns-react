import DomainSettingsRow from './DomainSettingsRow';

export default function OwnerRow({ owner }: { owner: string }) {
  function handleTransferANT() {
    console.log('Transfer ANT');
  }

  return (
    <>
      <DomainSettingsRow
        label="Owner:"
        value={owner}
        action={[
          <button
            key={1}
            onClick={() => handleTransferANT()}
            className="button-secondary"
            style={{
              padding: '9px 12px',
              fontSize: '13px',
              boxSizing: 'border-box',
              letterSpacing: '0.5px',
              fontWeight: 500,
            }}
          >
            Transfer
          </button>,
        ]}
      />
    </>
  );
}
