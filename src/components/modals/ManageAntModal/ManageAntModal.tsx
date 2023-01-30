import Table from 'rc-table';
import { useEffect, useRef, useState } from 'react';

import { useIsMobile } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArNSContractState, ArweaveTransactionID } from '../../../types';
import {
  DEFAULT_ATTRIBUTES,
  mapKeyToAttribute,
} from '../../cards/AntCard/AntCard';
import { NotebookIcon, PencilIcon } from '../../icons';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import TransactionStatus from '../../layout/TransactionStatus/TransactionStatus';

enum EDITABLE_FIELDS {
  NAME = 'name',
  TICKER = 'ticker',
  TARGET = 'targetID',
  TTL = 'ttlSeconds',
  CONTROLLER = 'controller',
}

const ACTIONABLE_FIELDS = {
  owner: {
    fn: () => alert('this feature is coming soon...'),
    title: 'Transfer',
  },
};

function ManageAntModal({
  contractId,
  setShowModal,
  antDetails,
}: {
  contractId: ArweaveTransactionID;
  setShowModal: (show: boolean) => void;
  antDetails: {
    name: string;
    id: string;
    target: string;
    status: number;
    key: number;
    state: ArNSContractState;
  };
}) {
  const [{ arnsSourceContract }] = useGlobalState();
  const modalRef = useRef(null);
  const isMobile = useIsMobile();
  const [editingField, setEditingField] = useState<string>();
  const [rows, setRows] = useState<
    {
      attribute: string;
      value: any;
      action: any;
      key: number;
    }[]
  >([]);
  // todo: manage asset modal writes asset modifications to contract. It will auto detect if the asset is an ANT, name, or undername.
  // if the asset is a name, it will write modifications to the registry. If its an undername, it will write mods to the ant. If its an ant, it will write mods to the ant.

  useEffect(() => {
    setDetails(contractId);
  }, [contractId, antDetails]);

  // TODO: add use effect to track edited value of a field

  function handleClickOutside(e: any) {
    if (modalRef.current && modalRef.current === e.target) {
      setShowModal(false);
    }
    return;
  }

  function getAssociatedNames(txId: ArweaveTransactionID) {
    return Object.entries(arnsSourceContract.records)
      .map(([name, id]) => {
        if (id === txId.toString()) return name;
      })
      .filter((n) => !!n);
  }

  function setDetails(id: ArweaveTransactionID) {
    const names = getAssociatedNames(id);
    //  eslint-disable-next-line
    const { state, key, ...otherDetails } = antDetails;
    const consolidatedDetails = {
      status: antDetails.status ?? 'N/A',
      associatedNames: !names.length ? 'N/A' : names.join(', '),
      name: antDetails.name ?? 'N/A',
      ticker: state.ticker ?? 'N/A',
      targetID: otherDetails.target ?? 'N/A',
      ttlSeconds: DEFAULT_ATTRIBUTES.ttlSeconds.toString(),
      controller:
        antDetails.state.controllers?.join(', ') ??
        antDetails.state.owner?.toString() ??
        'N/A',
      undernames: `${names.length} / ${DEFAULT_ATTRIBUTES.maxSubdomains}`,
      owner: antDetails.state.owner?.toString() ?? 'N/A',
    };

    const rows = Object.keys(consolidatedDetails).reduce(
      (
        details: {
          attribute: string;
          value: string;
          action: any;
          key: number;
        }[],
        attribute: string,
        index: number,
      ) => {
        const detail = {
          attribute,
          value: consolidatedDetails[attribute],
          action: Object.values(EDITABLE_FIELDS).includes(attribute) ? (
            <button onClick={() => setEditingField(attribute)}>
              <PencilIcon
                style={{ width: '24', height: '24', fill: 'white' }}
              />
            </button>
          ) : ACTIONABLE_FIELDS[attribute] ? (
            <button
              onClick={
                ACTIONABLE_FIELDS[attribute].fn ??
                (() => alert('not implemented'))
              }
              className="accent-button"
              style={{
                fontSize: '14px',
              }}
            >
              {ACTIONABLE_FIELDS[attribute].title}
            </button>
          ) : (
            <></>
          ),
          key: index,
        };
        details.push(detail);
        return details;
      },
      [],
    );
    setRows(rows);
  }

  return (
    // eslint-disable-next-line
    <div
      className="modal-container"
      style={{ background: '#1E1E1E' }}
      ref={modalRef}
      onClick={handleClickOutside}
    >
      <div
        className="flex-column"
        style={{ margin: '10%', width: '50%', minWidth: '350px' }}
      >
        <div
          className="flex"
          style={{
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
          <span className="flex bold text-medium white">
            <NotebookIcon width={25} height={25} fill={'var(--text-white)'} />
            &nbsp;Manage ANT:&nbsp;
            <span className="flex">
              <CopyTextButton
                displayText={
                  isMobile
                    ? `${contractId.toString().slice(0, 10)}...${contractId
                        .toString()
                        .slice(-10)}`
                    : contractId.toString()
                }
                copyText={contractId.toString()}
                size={24}
                wrapperStyle={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textColor: 'var(--bright-white)',
                }}
              />
            </span>
          </span>
        </div>
        <Table
          showHeader={false}
          rowClassName={'table-row'}
          columns={[
            {
              title: '',
              dataIndex: 'attribute',
              key: 'attribute',
              align: 'left',
              width: isMobile ? '0px' : '30%',
              className: 'white',
              render: (value: string) => {
                return mapKeyToAttribute(value);
              },
            },
            {
              title: '',
              dataIndex: 'value',
              key: 'value',
              align: 'left',
              width: '80%',
              className: 'white detail',
              render: (value: string | number, row: any) => {
                if (row.attribute === 'status')
                  return (
                    <>
                      {/* TODO: add label for mobile view */}
                      <TransactionStatus confirmations={+value} />
                    </>
                  );
                if (Object.values(EDITABLE_FIELDS).includes(row.attribute))
                  return (
                    <>
                      {/* TODO: add label for mobile view */}
                      <input
                        id={row.attribute}
                        style={{
                          width: '80%',
                          background:
                            editingField === row.attribute
                              ? 'white'
                              : 'transparent',
                          border: 'none',
                          color:
                            editingField === row.attribute ? 'black' : 'white',
                          padding:
                            editingField === row.attribute
                              ? '10px '
                              : '10px 0px',
                          display: 'block',
                        }}
                        disabled={editingField !== row.attribute}
                        value={value}
                      />
                    </>
                  );
                return value;
              },
            },
            {
              title: '',
              dataIndex: 'action',
              key: 'action',
              width: '10%',
              align: 'right',
              className: 'white',
              render: (value: any, row: any) => {
                //TODO: if it's got an action attached, show it
                if (row.action) {
                  return value;
                }
                return;
              },
            },
          ]}
          data={rows}
        />
      </div>
    </div>
  );
}

export default ManageAntModal;
