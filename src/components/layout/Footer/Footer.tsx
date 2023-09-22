import { QuestionCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { BrandLogo, SunIcon } from '../../icons';

function Footer() {
  const isMobile = useIsMobile();
  return (
    <div
      className={`${
        !isMobile ? 'flex-row flex-space-between' : 'flex-column flex-center'
      }`}
      style={{
        borderTop: '1px solid var(--text-faded)',
        padding: '30px 100px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className={`${
          !isMobile ? 'flex-row flex-left' : 'flex-column flex-center'
        } flex`}
      >
        <BrandLogo width={'30px'} height={'30px'} fill={'var(--text-grey)'} />
        <span className="text grey center">
          Copyright &copy; 2023 ArNS, All rights reserved
        </span>
        <Link
          className="grey text"
          to={'https://ar.io/arns'}
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
        <button
          className="button grey text center hover"
          onClick={() =>
            alert('Bam! light mode! just kidding, thats not implemented yet.')
          }
        >
          <SunIcon width={20} height={20} fill={'var(--text-grey)'} />
        </button>
        <button className="button grey text center hover">
          <QuestionCircleOutlined style={{ fontSize: 20 }} />
        </button>
      </div>
    </div>
  );
}

export default Footer;
