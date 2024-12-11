import { Pill } from '@src/components/data-display/Pill';
import { GoldPlusIcon } from '@src/components/icons';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import { ANT_INTERACTION_TYPES, ContractInteraction } from '@src/types';
import eventEmitter from '@src/utils/events';
import { Skeleton } from 'antd';
import { Check, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import DomainSettingsRow from './DomainSettingsRow';

function AddKeywordInput({ addCb }: { addCb: (word: string) => void }) {
  const [keyword, setKeyword] = useState<string>('');
  const [edit, setEdit] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input whenever edit mode is enabled
  useEffect(() => {
    if (edit) {
      inputRef.current?.focus();
    }
  }, [edit]);

  function handleChange(word: string) {
    const trimmed = word.trim();
    if (trimmed.length <= 32) {
      setKeyword(word.trim());
    }
  }

  function handleAdd(word: string) {
    try {
      addCb(word);
      setKeyword('');
      setEdit(false);
    } catch (error: any) {
      eventEmitter.emit('error', {
        name: 'Add Keyword',
        message: error?.message ?? 'Cannot add Keyword',
      });
      return false;
    }
  }

  return (
    <>
      {!edit ? (
        <button
          onClick={() => setEdit(true)}
          className="flex flex-row rounded-full bg-background border border-dark-grey shadow-3xl py-1 items-center justify-center px-[10px] max-w-fit h-fit text-grey hover:text-white hover:border-grey transition-all"
          style={{ gap: '10px' }}
        >
          <GoldPlusIcon className="scale-150" />{' '}
          <span className="flex flex-row max-w-fit h-fit font-semibold items-center">
            add
          </span>
        </button>
      ) : (
        <div className="flex flex-row max-w-[330px]" style={{ gap: '10px' }}>
          <input
            ref={inputRef}
            className={`flex flex-row rounded-full bg-background border border-dark-grey shadow-3xl py-[2px] items-center justify-center px-[10px] w-fit w-fit text-white transition-all`}
            onChange={(e) => handleChange(e.target.value)}
            value={keyword}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAdd(keyword);
              }
            }}
          />
          <div
            className="flex flex-row text-grey max-w-fit"
            style={{ gap: '10px' }}
          >
            <button
              onClick={() => {
                handleAdd(keyword);
              }}
            >
              <Check
                className="hover:text-white"
                width={'16px'}
                height={'16px'}
              />
            </button>
            <button
              onClick={() => {
                setKeyword('');
                setEdit(false);
              }}
            >
              <X className="hover:text-white" width={'16px'} height={'16px'} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function KeywordsRow({
  keywords,
  confirm,
  editable = false,
}: {
  keywords?: string[];
  confirm: (words: string[]) => Promise<ContractInteraction>;
  editable?: boolean;
}) {
  const [editing, setEditing] = useState<boolean>(false);
  const [newKeywords, setNewKeywords] = useState<string[]>(keywords ?? []);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    setNewKeywords(keywords ?? []);
  }, [keywords]);

  async function handleSave(words: string[]) {
    try {
      await confirm(words);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setEditing(false);
      setNewKeywords(keywords ?? []);
      setShowModal(false);
    }
  }

  return (
    <>
      <DomainSettingsRow
        label="Keywords:"
        editable={editable}
        customStyle={{
          height: 'fit-content',
          maxHeight: 'unset',
        }}
        value={
          Array.isArray(keywords) ? (
            !editing ? (
              <div className="flex flex-row">
                <div
                  className="flex flex-row top-0 bottom-0 left-0 flex-wrap"
                  style={{ gap: '10px' }}
                >
                  {keywords?.map((word: string, index: number) => {
                    return (
                      <Pill
                        className=""
                        key={index}
                        closeIcon={<></>}
                        closeButtonClass="pl-0"
                      >
                        <span className="text-[14px] p-0">{word}</span>
                      </Pill>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-row relative">
                <div
                  className="flex flex-row top-0 bottom-0 left-0 flex-wrap"
                  style={{ gap: '10px' }}
                >
                  {newKeywords.map((word: string, index: number) => {
                    return (
                      <Pill
                        key={index}
                        onClose={() => {
                          setNewKeywords(
                            [...newKeywords].filter((w) => w !== word),
                          );
                        }}
                      >
                        <span className="text-[14px] p-0">{word}</span>
                      </Pill>
                    );
                  })}
                  {newKeywords.length < 16 && (
                    <AddKeywordInput
                      addCb={(w: string) => {
                        if (newKeywords.includes(w)) {
                          throw new Error(
                            'Keyword must be unique, choose a different keyword.',
                          );
                        }
                        setNewKeywords([...newKeywords, w]);
                      }}
                    />
                  )}
                </div>
              </div>
            )
          ) : (
            <Skeleton.Input active />
          )
        }
        editing={editing}
        setEditing={() => setEditing(true)}
        onSave={() => setShowModal(true)}
        onCancel={() => {
          setEditing(false);
          setNewKeywords(keywords ?? []);
        }}
      />
      {showModal && (
        <ConfirmTransactionModal
          cancel={() => setShowModal(false)}
          confirm={() => handleSave(newKeywords)}
          interactionType={ANT_INTERACTION_TYPES.SET_KEYWORDS}
          content={
            <>
              <span>
                By completing this action, you are going to change the Keywords
                of this token to <br />
                <span className="text-color-warning">
                  {`"${newKeywords.join(', ')}"`}.
                </span>
              </span>
              <span>Are you sure you want to continue?</span>
            </>
          }
        />
      )}
    </>
  );
}
