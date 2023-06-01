import { QuestionCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { BrandLogo, SunIcon } from '../../icons';

function Footer() {
  return (
    <div
      className="flex-row flex-space-between"
      style={{
        borderTop: '1px solid #292A2B',
        padding: '30px 100px',
        boxSizing: 'border-box',
      }}
    >
      <div className="flex flex-row flex-left">
        <BrandLogo width={'30px'} height={'30px'} fill={'var(--text-faded)'} />
        <span className="text faded center">
          Copyright &copy; 2023 ArNS, All rights reserved
        </span>
        <Link
          className="faded text"
          to={'https://ar.io/arns'}
          rel="noreferrer"
          target={'_blank'}
          style={{ textDecoration: 'underline' }}
        >
          Terms & Conditions
        </Link>
        <Link
          className="faded text"
          to={'https://ar.io/arns'}
          rel="noreferrer"
          target={'_blank'}
          style={{ textDecoration: 'underline' }}
        >
          Privacy Policy
        </Link>
      </div>

      <span
        className="flex flex-row flex-right text faded center"
        style={{ width: 'fit-content', wordBreak: 'keep-all' }}
      >
        v{process.env.npm_package_version}-
        {process.env.VITE_GITHUB_HASH?.slice(0, 6)}
      </span>

      <div className="flex flex-row flex-right">
        <button
          className="button faded text center hover"
          onClick={() =>
            alert('Bam! light mode! just kidding, thats not implemented yet.')
          }
        >
          <SunIcon width={20} height={20} fill={'var(--text-faded)'} />
        </button>
        <button className="button faded text center hover">
          <QuestionCircleOutlined style={{ fontSize: 20 }} />
        </button>
      </div>
    </div>
  );
}

export default Footer;
