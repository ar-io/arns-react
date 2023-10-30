import { QuestionCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { ARIO_DISCORD_LINK } from '../../../utils/constants';
import { BrandLogo } from '../../icons';
import Popup from '../Popup/Popup';
import './styles.css';

function Footer() {
  return (
    <div
      className={'flex-row flex-space-between app-footer'}
      style={{
        borderTop: '1px solid var(--text-faded)',
        boxSizing: 'border-box',
      }}
    >
      <div className={'flex-row flex-left flex'}>
        <BrandLogo width={'30px'} height={'30px'} fill={'var(--text-grey)'} />
        <Link
          className="grey text"
          to={'https://ar.io/terms-and-conditions/'}
          rel="noreferrer"
          target={'_blank'}
        >
          Terms & Conditions
        </Link>
      </div>

      <div className="flex flex-row flex-right">
        <span
          className="flex flex-row flex-right text grey center"
          style={{ width: 'fit-content', wordBreak: 'keep-all' }}
        >
          v{process.env.npm_package_version}-
          {process.env.VITE_GITHUB_HASH?.slice(0, 6)}
        </span>
        <Popup
          title={'Contact Support'}
          trigger={'click'}
          popupMenuOptions={[
            {
              title: 'Github',
              onClick: () =>
                window.open('https://github.com/ar-io/arns-react', '_blank'),
            },
            {
              title: 'Discord',
              onClick: () => window.open(ARIO_DISCORD_LINK, '_blank'),
            },
          ]}
        >
          <button className="button grey text center hover pointer">
            <QuestionCircleOutlined style={{ fontSize: 20 }} />
          </button>
        </Popup>
      </div>
    </div>
  );
}

export default Footer;
