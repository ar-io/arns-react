import { useState } from 'react';

import { VALIDATION_INPUT_TYPES } from '../../../types';
import { EMAIL_REGEX } from '../../../utils/constants';
import { BellIcon, EnvelopeIcon } from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';

function EmailNotificationCard() {
  const [email, setEmail] = useState<string>();

  return (
    <div
      className="flex flex-column flex-center radius"
      style={{
        border: 'solid 1px var(--text-faded)',
        padding: 50,
        boxSizing: 'border-box',
      }}
    >
      <BellIcon width={'30px'} height={'30px'} fill="var(--text-grey)" />

      <div className="flex flex-column" style={{ maxWidth: '400px' }}>
        <div
          className="flex flex-row flex-center"
          style={{ gap: '10px', position: 'relative' }}
        >
          <EnvelopeIcon
            width={'24px'}
            height={'24px'}
            fill={email ? 'var(--text-white)' : 'var(--text-grey)'}
            style={{ position: 'absolute', left: '15px', top: '10px' }}
          />
          <ValidationInput
            value={email ?? ''}
            setValue={(s) => setEmail(s)}
            placeholder="Email address"
            validationPredicates={{
              [VALIDATION_INPUT_TYPES.EMAIL]: {
                fn: (v: string) =>
                  new Promise((resolve, reject) => {
                    if (EMAIL_REGEX.test(v)) {
                      resolve(v);
                    }
                    if (!EMAIL_REGEX.test(v)) {
                      reject();
                    }
                  }),
              },
            }}
            wrapperClassName="data-input"
            inputClassName="data-input"
            showValidationOutline
            showValidationChecklist={
              email && !EMAIL_REGEX.test(email) ? true : false
            }
            customValidationIcons={{
              error: (
                <span style={{ color: 'var(--error-red)', fontSize: '10px' }}>
                  Please enter a valid email address
                </span>
              ),
              success: <></>,
            }}
            inputCustomStyle={{
              background: 'inherit',
              border: 'none',
              paddingLeft: '50px',
              color: 'var(--text-white)',
              fontWieght: 500,
              boxShadow: 'none',
            }}
            wrapperCustomStyle={{
              background: 'var(--card-bg)',
              border: 'solid 1px var(--text-faded)',
              boxShadow: 'none',
            }}
            validationListStyle={{
              position: 'absolute',
              bottom: '-20px',
              fontSize: '0px',
            }}
          />

          <button
            className="accent-button center"
            style={{ height: '45px', width: '100px', fontSize: '12px' }}
            onClick={() => alert('coming soon')}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailNotificationCard;
