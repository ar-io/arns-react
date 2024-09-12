import { Loader } from '@src/components/layout';
import DialogModal from '@src/components/modals/DialogModal/DialogModal';
import useGateways from '@src/hooks/useGateways';

function SelectGatewayModal({
  show,
  setShow,

  setGateway,
}: {
  show: boolean;
  setShow: (show: boolean) => void;

  setGateway: (gateway: string) => void;
}) {
  const { data: gateways, isLoading: loadingArIOGateways } = useGateways();
  return (
    <>
      {show && (
        <div className="modal-container">
          <DialogModal
            title={
              <h2 className="text-white text-2xl">
                Select a gateway from the ar.io network
              </h2>
            }
            body={
              <div
                className="flex flex-column text-white max-h-[600px] min-h-[150px] overflow-auto scrollbar scrollbar-w-2 scrollbar-thumb-grey scrollbar-thumb-rounded-md px-2"
                style={{ gap: '10px' }}
              >
                {loadingArIOGateways ? (
                  <Loader message="Loading ArIO gateways..." size={100} />
                ) : (
                  Object.entries(gateways ?? {}).map(([, gateway], index) => (
                    <div
                      key={index}
                      className="flex flex-row w-full border-dark-grey border-b-2 py-1 justify-between"
                    >
                      <span>{gateway.settings.fqdn}</span>
                      <button
                        className="bg-primary text-black p-1 rounded-sm"
                        onClick={() => setGateway(gateway.settings.fqdn)}
                      >
                        select
                      </button>
                    </div>
                  ))
                )}
              </div>
            }
            onCancel={() => setShow(false)}
            onClose={() => setShow(false)}
            cancelText={'Close'}
          />
        </div>
      )}
    </>
  );
}

export default SelectGatewayModal;
