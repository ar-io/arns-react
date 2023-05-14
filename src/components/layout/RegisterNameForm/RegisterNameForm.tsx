import { useEffect, useRef, useState } from 'react';

import { useArweaveCompositeProvider } from '../../../hooks';
import { PDNTContract } from '../../../services/arweave/PDNTContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import NameTokenSelector from '../../inputs/text/NameTokenSelector/NameTokenSelector';
import Loader from '../Loader/Loader';
import './styles.css';

function RegisterNameForm() {
  const [{ domain, ttl, pdntID }, dispatchRegisterState] =
    useRegistrationState();
  const [{ gateway, pdnsSourceContract, walletAddress }] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();

  const [isValidPDNT, setIsValidPDNT] = useState<boolean | undefined>(
    undefined,
  );
  const [pdntTxID, setPDNTTXId] = useState<string | undefined>(
    pdntID?.toString(),
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!pdntID) {
      reset();
      return;
    }
    if (inputRef.current) {
      inputRef.current.focus();
      handlePDNTId(pdntID.toString());
    }
  }, []);

  function reset() {
    setIsValidPDNT(undefined);
    setPDNTTXId('');
    dispatchRegisterState({
      type: 'setPDNTID',
      payload: undefined,
    });
    dispatchRegisterState({
      type: 'setTTL',
      payload: 100,
    });
  }

  async function handlePDNTId(id?: string) {
    if (!id || !id.length) {
      reset();
      return;
    }
    if (id && id.length < 44) {
      setPDNTTXId(id);
    }

    try {
      const txId = new ArweaveTransactionID(id);
      dispatchRegisterState({
        type: 'setPDNTID',
        payload: txId,
      });

      const state =
        await arweaveDataProvider.getContractState<PDNTContractJSON>(txId);
      if (state == undefined) {
        throw Error('PDNT contract state is undefined');
      }

      const pdnt = new PDNTContract(state);
      dispatchRegisterState({
        type: 'setControllers',
        payload: [
          pdnt.controller
            ? new ArweaveTransactionID(pdnt.controller)
            : new ArweaveTransactionID(pdnt.owner),
        ],
      });
      // update to use PDNTContract
      dispatchRegisterState({
        type: 'setNickname',
        payload: pdnt.name,
      });
      dispatchRegisterState({
        type: 'setOwner',
        payload: new ArweaveTransactionID(pdnt.owner),
      });
      dispatchRegisterState({
        type: 'setTicker',
        payload: pdnt.ticker,
      });
      // legacy targetID condition

      dispatchRegisterState({
        type: 'setTargetID',
        payload: new ArweaveTransactionID(pdnt.getRecord('@').transactionId),
      });

      setIsValidPDNT(true);
    } catch (error: any) {
      dispatchRegisterState({
        type: 'setPDNTID',
        payload: undefined,
      });
      // don't emit here, since we have the validation
    }
  }

  if (!walletAddress) {
    return <Loader size={80} />;
  }

  return (
    <>
      <div className="register-name-modal">
        <span className="text-large white center">
          {domain}.{gateway} is available!
        </span>
        <div className="section-header">Register Domain</div>
        <div className="register-inputs center">
          <div className="input-group center column">
            <NameTokenSelector
              walletAddress={walletAddress}
              selectedTokenCallback={(id) => handlePDNTId(id.toString())}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterNameForm;
