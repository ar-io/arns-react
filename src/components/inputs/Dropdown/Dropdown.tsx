import { useState } from 'react';

import { DropdownProps } from '../../../types';
import './styles.css';

function Dropdown(props: DropdownProps) {
  const { options } = props;

  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);

  return (
    <>
      {!showOptions ? (
        <div
          className="dataDropdown center"
          onClick={() => setShowOptions(!showOptions)}
        >
          {options[selectedOption]}
        </div>
      ) : (
        <>
          <div className="dropdownOptions">
            <div
              className="dataDropdown selectedDropdownOption center"
              onClick={() => setShowOptions(!showOptions)}
            >
              {options[selectedOption]}
            </div>
            <div className="activeDataDropdown">
              {options.map((option, index) => {
                if (index === selectedOption) {
                  return;
                }
                if (
                  index === options.length - 1 ||
                  (selectedOption === options.length - 1 &&
                    index === options.length - 2)
                ) {
                  return (
                    <div
                      className="dataDropdown lastDropdownOption center"
                      onClick={() => {
                        setSelectedOption(index);
                        setShowOptions(!showOptions);
                      }}
                    >
                      {option}
                    </div>
                  );
                }
                if (index !== selectedOption && index !== options.length) {
                  return (
                    <div
                      className="dataDropdown dropdownOption center"
                      onClick={() => {
                        setSelectedOption(index);
                        setShowOptions(!showOptions);
                      }}
                    >
                      {option}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Dropdown;
