import { Pagination, PaginationProps, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { useArweaveCompositeProvider } from '../../../../hooks';
import { PDNTContract } from '../../../../services/arweave/PDNTContract';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  VALIDATION_INPUT_TYPES,
} from '../../../../types';
import { getAssociatedNames, isArweaveTransactionID } from '../../../../utils';
import eventEmitter from '../../../../utils/events';
import { CirclePlus, CloseIcon, HamburgerOutlineIcon } from '../../../icons';
import { Loader } from '../../../layout';
import ValidationInput from '../ValidationInput/ValidationInput';
import './styles.css';

type NameTokenDetails = {
  [x: string]: Pick<
    PDNTContractJSON,
    'name' | 'ticker' | 'owner' | 'controller'
  > & { names?: string[] };
};

function NameTokenSelector({
  selectedTokenCallback,
}: {
  selectedTokenCallback: (id: ArweaveTransactionID | undefined) => void;
}) {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ pdnsSourceContract, walletAddress }] = useGlobalState();

  const [searchText, setSearchText] = useState<string>();
  const [tokens, setTokens] = useState<NameTokenDetails>();
  const [loading, setLoading] = useState(false);
  const [filteredTokens, setFilteredTokens] =
    useState<
      Array<{ id: string; name?: string; ticker?: string } | undefined>
    >();
  const [selectedToken, setSelectedToken] = useState<
    { id: string; name: string; ticker: string } | undefined
  >(undefined);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchActive, setSearchActive] = useState(false);
  const [validImport, setValidImport] = useState<boolean | undefined>(
    undefined,
  );

  const listRef = useRef<HTMLDivElement>(null);
  const [listPage, setListPage] = useState<number>(1);
  const listItemCount = 3;

  useEffect(() => {
    selectedTokenCallback(
      selectedToken ? new ArweaveTransactionID(selectedToken.id) : undefined,
    );
    setListPage(1);
  }, [selectedToken]);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }
    getTokenList(walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [listRef]);

  function handleClickOutside(e: any) {
    e.preventDefault();
    if (
      listRef.current &&
      e.target !== listRef.current &&
      !listRef.current.contains(e.target)
    ) {
      setSearchText('');
      setSearchActive(false);
      setFilteredTokens(undefined);
      setListPage(1);
    }
  }

  async function getTokenList(
    address: ArweaveTransactionID | undefined,
    imports?: ArweaveTransactionID[],
  ) {
    try {
      setLoading(true);
      if (!address) {
        throw new Error('No address provided');
      }
      const fetchedIds = await arweaveDataProvider.getContractsForWallet(
        address,
      );
      if (!fetchedIds.ids.length) {
        throw new Error(
          'Unable to find any Name Tokens for the provided address',
        );
      }
      if (imports?.length) {
        imports.map(async (id) => {
          await arweaveDataProvider.validateTransactionTags({
            id: id.toString(),
            requiredTags: {
              'App-Name': ['SmartWeaveContract'],
            },
          });
          const validState =
            await arweaveDataProvider.getContractState<PDNTContractJSON>(id);
          if (!validState) {
            throw new Error('Unable to get contract state');
          }
          if (!new PDNTContract(validState).isValid()) {
            throw new Error('Invalid ANT Contract.');
          }
          setValidImport(true);
        });
      }
      const ids = fetchedIds.ids.concat(imports ?? []);

      const contracts: Array<
        [ArweaveTransactionID, PDNTContractJSON] | undefined
      > = await Promise.all(
        ids.map(async (id) => {
          const state =
            await arweaveDataProvider.getContractState<PDNTContractJSON>(id);
          if (!state) {
            return;
          }
          if (!new PDNTContract(state).isValid()) {
            return;
          }
          return [id, state];
        }),
      );
      if (!contracts.length) {
        throw new Error('Unable to get details for Name Tokens');
      }
      const newTokens: NameTokenDetails = contracts.reduce(
        (result, contract) => {
          if (!contract) {
            return { ...result };
          }
          const [id, state] = contract;
          const { owner, controller, name, ticker } = state;
          const associatedNames = getAssociatedNames(
            id,
            pdnsSourceContract.records,
          );
          return {
            ...result,
            [id.toString()]: {
              owner,
              controller,
              name,
              ticker,
              names: associatedNames,
            },
          };
        },
        {},
      );
      setTokens(newTokens);
      if (imports) {
        const details = newTokens[imports[0].toString()];
        setSelectedToken({
          name: details?.name,
          ticker: details?.ticker,
          id: imports[0].toString(),
        });
      }
    } catch (error: any) {
      eventEmitter.emit('error', error);
    } finally {
      setLoading(false);
      setListPage(1);
    }
  }

  function handleTokenSearch(query: string) {
    try {
      setSearching(true);
      setValidImport(undefined);
      if (!query) {
        setSearchText('');
        return;
      }
      setSearchText(query);

      if (!tokens) {
        throw new Error('No Name Tokens Found');
      }
      const filteredResults = Object.keys(tokens)
        .filter((id) => {
          const { owner, controller, name, ticker } = tokens[id];
          const queryResult = [owner, controller, name, ticker, id].some(
            (term) =>
              term &&
              term.toString().toLowerCase().includes(query.toLowerCase()),
          );
          return queryResult;
        })
        .map((id) => {
          const { name, ticker } = tokens[id];
          return { id, name: name ?? '', ticker: ticker ?? '' };
        })
        .filter((n) => !!n);
      if (!filteredResults.length) {
        throw new Error('No ANT tokens found for that search');
      }

      setFilteredTokens(filteredResults);
    } catch (error) {
      setFilteredTokens(undefined);
    } finally {
      setSearching(false);
      setListPage(1);
    }
  }

  function handleSetToken({
    id,
    name,
    ticker,
  }: {
    id?: string;
    name?: string;
    ticker?: string;
  }) {
    try {
      setSearchText('');
      setFilteredTokens(undefined);

      if (id === undefined) {
        throw new Error(`No ID provided for ${name ?? ticker ?? ''}`);
      }
      setSelectedToken({ id, name: name ?? '', ticker: ticker ?? '' });
      selectedTokenCallback(new ArweaveTransactionID(id));
      setListPage(1);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setSearchActive(false);
    }
  }

  const customPreviousAndNextButtons: PaginationProps['itemRender'] = (
    page,
    type,
    originalElement,
  ) => {
    if (!tokens) {
      return;
    }
    if (type === 'next' || type === 'prev') {
      return;
    }
    if (type === 'page') {
      return (
        <span
          className="flex flex-row hover center"
          style={{
            color: listPage == page ? 'white' : 'var(--text-faded)',
            width: '32px',
          }}
        >
          {page}
        </span>
      );
    }
    return originalElement;
  };

  function updatePage(page: number) {
    setListPage(page);
  }

  return (
    <div
      ref={listRef}
      className="flex flex-column radius"
      style={{
        position: 'relative',
        height: 'fit-content',
        maxHeight: '400px',
        border: `1px solid var(--text-white)`,
        gap: 0,
      }}
    >
      {/* input wrapper */}
      <div
        className="name-token-input-wrapper"
        style={{ borderBottom: '1px solid var(--text-faded)' }}
      >
        <button
          className="button center hover"
          style={{ width: 'fit-content' }}
          onClick={() => setSearchActive(true)}
        >
          <CirclePlus width={30} height={30} fill={'var(--text-white)'} />
        </button>

        <ValidationInput
          onClick={() => setSearchActive(true)}
          showValidationIcon={validImport !== undefined}
          setValue={(v) => handleTokenSearch(v.length >= 1700 ? v.trim() : v)}
          value={searchText}
          maxLength={1700}
          placeholder={
            selectedToken
              ? selectedToken.name.length
                ? selectedToken.name
                : selectedToken.id
              : 'Add an Arweave Name Token (ANT)'
          }
          validationPredicates={{
            [VALIDATION_INPUT_TYPES.SMARTWEAVE_CONTRACT]: {
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
          wrapperCustomStyle={{
            width: '100%',
            hieght: '45px',
            borderRadius: '0px',
            backgroundColor: 'var(--card-bg)',
            boxSizing: 'border-box',
          }}
          inputClassName={`white ${
            selectedToken ? 'name-token-input-selected' : 'name-token-input'
          }`}
        />
        <span
          className={`flex flex-row text faded flex-center ${
            selectedToken ? 'bold' : ''
          } hover`}
          style={{
            width: 'fit-content',
            height: 'fit-content',
            wordBreak: 'keep-all',
          }}
        >
          {loading || searching ? (
            <Loader size={20} color="var(--text-white)" />
          ) : searchText && validImport === false ? (
            <></>
          ) : searchText &&
            isArweaveTransactionID(searchText) &&
            !Object.keys(tokens ?? []).includes(searchText) ? (
            <button
              className="button flex flex-row center faded bold hover"
              style={{
                gap: '1em',
                border: '2px solid var(--text-faded)',
                borderRadius: '50px',
                height: '25px',
              }}
              onClick={() => {
                getTokenList(walletAddress, [
                  new ArweaveTransactionID(searchText),
                ]);
              }}
            >
              Import
            </button>
          ) : selectedToken ? (
            <button
              className="button flex flex-row center faded bold hover pointer"
              style={{
                gap: '5px',
                border: '1px solid var(--text-faded)',
                borderRadius: '50px',
                height: '25px',
              }}
              onClick={() => {
                setSelectedToken(undefined);
                selectedTokenCallback(undefined);
              }}
            >
              <CloseIcon
                width={'16px'}
                height={'16px'}
                fill={'var(--text-faded)'}
              />
              Remove
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
      {/* selector dropdown */}
      {tokens && searchActive ? (
        <div
          className="flex flex-column"
          style={{
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            gap: 0,
            height: 'fit-content',
            width: '100%',
            backgroundColor: 'var(--card-bg)',
            boxSizing: 'border-box',
            zIndex: 10,
          }}
        >
          {searchText && !filteredTokens?.length ? (
            <span
              className="text-large center"
              style={{
                color: '#444547',
                margin: 'auto',
                height: '50px',
              }}
            >
              No Results
            </span>
          ) : filteredTokens ? (
            filteredTokens
              .slice(
                Math.max((listPage - 1) * listItemCount, 0),
                listPage * listItemCount,
              )
              .map((token, index) => {
                if (!token) {
                  return;
                }

                return (
                  <button
                    key={index}
                    className="name-token-item pointer"
                    onClick={() => {
                      handleSetToken({
                        id: token.id,
                        name: token.name ?? '',
                        ticker: token.ticker ?? '',
                      });
                    }}
                  >
                    {token.name && token.ticker
                      ? `${token.name.slice(0, 20)} (${token.ticker}) - ${
                          token.id
                        }`
                      : token.id}
                  </button>
                );
              })
          ) : (
            Object.entries(tokens)
              .slice(
                Math.max((listPage - 1) * listItemCount, 0),
                listPage * listItemCount,
              )
              .map((token, index) => {
                if (!token) {
                  return;
                }
                const [id, details] = token;
                const { name, ticker, names } = details;

                return (
                  <button
                    key={index}
                    className="name-token-item pointer"
                    onClick={() => {
                      handleSetToken({
                        id,
                        name: name ?? '',
                        ticker: ticker ?? '',
                      });
                    }}
                  >
                    {name && ticker
                      ? `${name.slice(0, 20)} ${
                          name.length > 20 ? '...' : ''
                        } (${ticker}) - ${id}`
                      : id}
                    {names?.length ? (
                      <HamburgerOutlineIcon
                        width={20}
                        height={20}
                        fill="var(--text-faded)"
                      />
                    ) : (
                      <></>
                    )}
                  </button>
                );
              })
          )}
          <div
            className="custom-next-pagination flex flex-column"
            style={{
              padding: '10px 25px',
              boxSizing: 'border-box',
              width: '100%',
              justifyContent: 'flex-start',
            }}
          >
            {tokens.length || filteredTokens?.length || !searchText ? (
              <Pagination
                total={
                  Object.keys(tokens).length && !filteredTokens
                    ? Object.keys(tokens).length
                    : filteredTokens
                    ? filteredTokens.length
                    : 0
                }
                itemRender={customPreviousAndNextButtons}
                showPrevNextJumpers={true}
                showSizeChanger={false}
                showQuickJumper={false}
                onChange={updatePage}
                current={listPage}
                defaultPageSize={listItemCount}
              />
            ) : (
              <></>
            )}{' '}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default NameTokenSelector;
