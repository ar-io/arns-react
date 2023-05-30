import { Tooltip } from 'antd';
import { useState } from 'react';

import { useArweaveCompositeProvider } from '../../../../hooks';
import { PDNTContract } from '../../../../services/arweave/PDNTContract';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  VALIDATION_INPUT_TYPES,
} from '../../../../types';
import eventEmitter from '../../../../utils/events';
import { CircleCheck, CirclePlus, CircleXIcon } from '../../../icons';
import { Loader } from '../../../layout';
import ValidationInput from '../ValidationInput/ValidationInput';

function NameTokenSelector({
  selectedTokenCallback,
}: {
  selectedTokenCallback: (id: ArweaveTransactionID | undefined) => void;
}) {
  const arweaveDataProvider = useArweaveCompositeProvider();

  const [searchText, setSearchText] = useState<string>();
  const [selectedNameToken, setSelectedNameToken] = useState<
    { id: string; name: string; ticker: string } | undefined
  >(undefined);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchActive, setSearchActive] = useState(false);
  const [validImport, setValidImport] = useState<boolean | undefined>(
    undefined,
  );

  async function handlePDNTId(id: string) {
    try {
      setSearching(true);
      if (!id.length) {
        setSearchText('');
        return;
      }

      setSearchText(id);
      const txid = new ArweaveTransactionID(id);
      selectedTokenCallback(txid);
      const state =
        await arweaveDataProvider.getContractState<PDNTContractJSON>(txid);
      const contract = new PDNTContract(state, txid);

      if (!contract.isValid()) {
        throw Error('Contract does not match required schema');
      }
      setSelectedNameToken({
        id,
        name: contract.name,
        ticker: contract.ticker,
      });
      setValidImport(true);
      setSearchText('');
    } catch (error) {
      eventEmitter.emit('error', error);
      setSelectedNameToken(undefined);
      setValidImport(false);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div
      className="flex flex-column"
      style={{
        position: 'relative',
        height: 'fit-content',
        maxHeight: '400px',
      }}
    >
      {/* input wrapper */}
      <div
        className="flex flex-row flex-space-between card-bg radius"
        style={{
          alignItems: 'center',
          gap: '1em',
          height: '53px',
          border: searchActive ? `0.5px solid var(--text-white)` : 'none',
          boxShadow: searchActive
            ? '0px 0px 4px 1px rgba(255, 255, 255, 0.25)'
            : 'none',
          boxSizing: 'border-box',
          position: 'absolute',
          top: 0,
          padding: 10,
        }}
      >
        {!selectedNameToken ? (
          <button
            className="button center hover"
            style={{ width: 'fit-content' }}
            onClick={() => setSearchActive(true)}
          >
            <CirclePlus width={30} height={30} fill={'var(--text-white)'} />
          </button>
        ) : (
          <CircleCheck width={30} height={30} fill={'var(--text-white)'} />
        )}
        <ValidationInput
          onClick={() => setSearchActive(true)}
          showValidationIcon={true}
          setValue={(v) => handlePDNTId(v)}
          value={searchText}
          placeholder={
            selectedNameToken
              ? `${selectedNameToken?.name} (${selectedNameToken?.id})`
              : 'Add an Arweave Name Token (ANT)'
          }
          validationPredicates={{
            [VALIDATION_INPUT_TYPES.PDNT_CONTRACT_ID]: {
              fn: (id: string) =>
                arweaveDataProvider.validateTransactionTags({
                  id,
                  requiredTags: {
                    'App-Name': ['SmartWeaveContract'],
                  },
                }),
            },
            [VALIDATION_INPUT_TYPES.TRANSACTION_CONFIRMATIONS]: {
              fn: (id: string) => arweaveDataProvider.validateConfirmations(id),
            },
          }}
          validityCallback={(validity) => validity}
          wrapperClassName="card-bg radius flex"
          wrapperCustomStyle={{
            hieght: '50px',
            boxSizing: 'border-box',
            width: '100%',
          }}
          inputClassName="data-input white card-bg"
          inputCustomStyle={{
            justifyContent: 'flex-start',
            backgroundColor: 'var(--card-bg)',
            border: 'none',
            boxSizing: 'border-box',
            fontFamily: 'Rubik',
            fontSize: '16px',
            boxShadow: 'none',
          }}
          maxLength={43}
        />
        <span
          className={`flex flex-row text faded flex-center ${
            selectedNameToken ? 'bold' : ''
          } hover`}
          style={{
            width: 'fit-content',
            height: 'fit-content',
            wordBreak: 'keep-all',
          }}
        >
          {searching ? (
            <Loader size={20} color="var(--text-white)" />
          ) : searchText && validImport === false ? (
            <></>
          ) : selectedNameToken ? (
            <button
              className="button flex flex-row center faded hover bold"
              style={{
                gap: '1em',
                border: '1px solid var(--text-faded)',
                borderRadius: '50px',
                padding: '3px 5px',
              }}
              onClick={() => setSelectedNameToken(undefined)}
            >
              Remove
              <CircleXIcon
                width={'20px'}
                height={'20px'}
                fill={'var(--text-faded)'}
              />
            </button>
          ) : (
            <Tooltip
              placement={'right'}
              autoAdjustOverflow={true}
              arrow={false}
              overlayInnerStyle={{
                width: '190px',
                color: 'var(--text-black)',
                textAlign: 'center',
                fontFamily: 'Rubik-Bold',
                fontSize: '14px',
                backgroundColor: 'var(--text-white)',
                padding: '15px',
              }}
              title={
                'You can import an ANT by entering its contract ID, or search for one of your own by name, ticker, owner, or controller status, as well is its own contract ID'
              }
            >
              Optional
            </Tooltip>
          )}
        </span>
      </div>
      {/* TODO: selector dropdown */}
    </div>
  );
}

export default NameTokenSelector;
