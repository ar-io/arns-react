import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ANTContractJSON, ArweaveTransactionID } from '../../../types';
import { NAME_PRICE_INFO } from '../../../utils/constants';
import { AntCard } from '../../cards';
import Loader from '../Loader/Loader';
import { Tooltip } from '../Tooltip/Tooltip';

function ConfirmAntCreation({ state }: { state: ANTContractJSON }) {
  const [{ arnsSourceContract, arnsContractId, arweaveDataProvider }] =
    useGlobalState();
  const [isPostingTransaction, setIsPostingTransaction] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  async function deployAnt(state: ANTContractJSON) {
    setIsPostingTransaction(true);
    if (!state) {
      return;
    }
    // perform checks, try/catch
    const pendingTXId = await arweaveDataProvider.deployContract({
      srcCodeTransactionId: new ArweaveTransactionID(
        'PEI1efYrsX08HUwvc6y-h6TSpsNlo2r6_fWL2_GdwhY',
      ),
      initialState: state,
    });
    if (pendingTXId) {
      console.log(`Contract Deployed: ${pendingTXId}`);
    }
    setTimeout(() => {
      setIsPostingTransaction(false);
      // TODO: write to local storage to store pending transactions
    }, 500);
  }

  return (
    <>
      <div className="register-name-modal center">
        {!isPostingTransaction ? (
          <span className="text-large white">
            Deploying contract&nbsp;:&nbsp;{state.name.toLocaleUpperCase()}
          </span>
        ) : (
          <></>
        )}
        <div className="section-header">Confirm Domain Registration</div>
        {isPostingTransaction ? (
          <Loader size={80} />
        ) : isConfirmed ? (
          <>
            <AntCard
              domain={''}
              id={undefined}
              state={state}
              compact={true}
              enableActions={false}
              overrides={{
                tier: 1,
                ttlSeconds: state.records['@'].ttlSeconds,
                maxSubdomains: state.records['@'].maxSubdomains,
                leaseDuration: `N/A`,
              }}
            />
            <span
              className="text faded underline"
              style={{ maxWidth: '475px' }}
            >
              You will sign a single transaction to deploy this ANT.
            </span>
            <div className="flex flex-column center" style={{ gap: '0.2em' }}>
              <Tooltip message={NAME_PRICE_INFO}>
                <span className="white bold text-small">{0}&nbsp;AR&nbsp;</span>
              </Tooltip>
              <span className="text faded">Estimated Price</span>
            </div>
          </>
        ) : (
          <span className="h2 error">{errorMessage}</span>
        )}
      </div>
    </>
  );
}

export default ConfirmAntCreation;
