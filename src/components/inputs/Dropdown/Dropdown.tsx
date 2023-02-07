import { useEffect, useState } from 'react';

import { DropdownProps } from '../../../types';
import { ChevronDownIcon, ChevronUpIcon } from '../../icons';
import './styles.css';

function Dropdown(props: DropdownProps) {
  const {
    options,
    showSelected,
    showChevron,
    selected,
    setSelected,
    headerElement = <></>,
    footerElement,
  } = props;

  const [showOptions, setShowOptions] = useState(false);
  const [header, setHeader] = useState(<></>);

  useEffect(() => {
    if (headerElement) {
      setHeader(headerElement);
    }
  }, []);

  return (
    <>
      {!showOptions ? (
        <button
          className="data-dropdown center"
          onClick={() => setShowOptions(!showOptions)}
        >
          {selected}
          {showChevron ? (
            <ChevronDownIcon
              className="dropdown-chevron"
              fill="var(--text-black)"
              width={'15'}
              height={'15'}
            />
          ) : (
            <></>
          )}
        </button>
      ) : (
        <>
          <div className="dropdown-options">
            <button
              className="data-dropdown selected-dropdown-option center"
              style={{ borderBottom: 'none' }}
              onClick={() => setShowOptions(!showOptions)}
            >
              {showSelected && selected != undefined ? selected : <></>}
              {showChevron ? (
                <ChevronUpIcon
                  className="dropdown-chevron"
                  fill="var(--text-black)"
                  width={'15'}
                  height={'15'}
                />
              ) : (
                <></>
              )}
            </button>
            <div className="active-data-dropdown">
              {header}
              {/* eslint-disable-next-line */}
              {Object.entries(options).map(([key, value], index) => {
                if (index === selected) {
                  return;
                }
                if (
                  (index === options.length - 1 && !footerElement) ||
                  (selected === options.length - 1 &&
                    index === options.length - 2 &&
                    !footerElement)
                ) {
                  return (
                    <button
                      key={index}
                      className="data-dropdown last-dropdown-option center"
                      onClick={() => {
                        setSelected(value);
                        setShowOptions(!showOptions);
                      }}
                    >
                      {value}
                    </button>
                  );
                }
                if (index !== selected && index !== options.length) {
                  return (
                    <button
                      key={index}
                      className="data-dropdown dropdown-option center"
                      onClick={() => {
                        setSelected(value);
                        setShowOptions(!showOptions);
                      }}
                    >
                      {value}
                    </button>
                  );
                }
              })}
              {footerElement ? (
                <div className="data-dropdown last-dropdown-option center">
                  {footerElement}
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Dropdown;
