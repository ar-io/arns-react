import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import DialogModal from '@src/components/modals/DialogModal/DialogModal';
import useMetaplexAttributes from '@src/hooks/useMetaplexAttributes';
import { SolanaAddress } from '@src/services/solana/SolanaAddress';
import { Skeleton } from 'antd';

export function MetaplexAttributesModal({
  show,
  setShow,
  processId,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  processId?: string;
}) {
  const { data, error, isLoading } = useMetaplexAttributes(processId);

  if (!show) return <></>;

  return (
    <div className="modal-container">
      <DialogModal
        title={<h1 className="text-xl text-white">Metaplex Attributes</h1>}
        body={
          <div className="flex flex-col text-white w-[min(42rem,80vw)] max-h-[70vh] gap-5 overflow-y-auto text-sm">
            {processId && (
              <div className="flex flex-col gap-1">
                <span className="text-grey">ANT Asset</span>
                <ArweaveID
                  id={new SolanaAddress(processId)}
                  shouldLink
                  characterCount={16}
                  type={ArweaveIdTypes.CONTRACT}
                />
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton.Input active className="w-full" />
                <Skeleton.Input active className="w-full" />
                <Skeleton.Input active className="w-full" />
              </div>
            ) : error ? (
              <span className="text-error">
                Unable to load Metaplex attributes:{' '}
                {error instanceof Error ? error.message : 'Unknown error'}
              </span>
            ) : (
              <>
                <div className="grid grid-cols-[9rem_1fr] gap-x-4 gap-y-3 rounded border border-dark-grey p-4">
                  <span className="text-grey">Asset Name</span>
                  <span className="break-words">
                    {data?.assetName || 'N/A'}
                  </span>

                  <span className="text-grey">Asset URI</span>
                  <span className="break-all">{data?.assetUri || 'N/A'}</span>
                </div>

                <div className="flex flex-col rounded border border-dark-grey">
                  <div className="grid grid-cols-[12rem_1fr] gap-4 border-b border-dark-grey px-4 py-3 text-grey">
                    <span>Attribute</span>
                    <span>Value</span>
                  </div>
                  {data?.attributes.length ? (
                    data.attributes.map((attribute) => (
                      <div
                        key={attribute.key}
                        className="grid grid-cols-[12rem_1fr] gap-4 border-b border-dark-grey px-4 py-3 last:border-b-0"
                      >
                        <span className="text-grey">{attribute.key}</span>
                        <span className="break-words">{attribute.value}</span>
                      </div>
                    ))
                  ) : (
                    <span className="px-4 py-3 text-grey">
                      No Attributes plugin entries found on this ANT asset.
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        }
        nextText="Done"
        onNext={() => setShow(false)}
        onClose={() => setShow(false)}
      />
    </div>
  );
}
