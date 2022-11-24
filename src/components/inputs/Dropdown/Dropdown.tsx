import { useState } from 'react';

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
    headerElement,
    footerElement,
  } = props;

  const [showOptions, setShowOptions] = useState(false);

  return (
    <>
      {!showOptions ? (
        <div
          className="dataDropdown center"
          onClick={() => setShowOptions(!showOptions)}
        >
          {options[selected]}
          {showChevron ? (
            <ChevronDownIcon
              className="dropdownChevron"
              fill="var(--text-black)"
              width={'15'}
              height={'15'}
            />
          ) : (
            <></>
          )}
        </div>
      ) : (
        <>
          <div className="dropdownOptions">
            <div
              className="dataDropdown selectedDropdownOption center"
              style={{ borderBottom: 'none' }}
              onClick={() => setShowOptions(!showOptions)}
            >
              {showSelected ? options[selected] : <></>}
              {showChevron ? (
                <ChevronUpIcon
                  className="dropdownChevron"
                  fill="var(--text-black)"
                  width={'15'}
                  height={'15'}
                />
              ) : (
                <></>
              )}
            </div>
            <div className="activeDataDropdown">
              {headerElement ? (
                <div
                  className="dataDropdown dropdownOption center"
                  style={{
                    border: 'none',
                    height: 'fit-content',
                    paddingBottom: '10px',
                  }}
                >
                  {headerElement}
                </div>
              ) : (
                <></>
              )}
              {options.map((option, index) => {
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
                    <div
                      className="dataDropdown lastDropdownOption center"
                      onClick={() => {
                        setSelected(index);
                        setShowOptions(!showOptions);
                      }}
                    >
                      {option}
                    </div>
                  );
                }
                if (index !== selected && index !== options.length) {
                  return (
                    <div
                      className="dataDropdown dropdownOption center"
                      onClick={() => {
                        setSelected(index);
                        setShowOptions(!showOptions);
                      }}
                    >
                      {option}
                    </div>
                  );
                }
              })}
              {footerElement ? (
                <div className="dataDropdown lastDropdownOption center">
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
