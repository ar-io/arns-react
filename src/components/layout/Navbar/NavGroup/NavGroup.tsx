import { useStateValue } from '../../../../state/state';
import { AccountIcon } from '../../../icons';
import ConnectButton from '../../../inputs/buttons/ConnectButton/ConnectButton';
import NavBarLink from '../NavBarLink/NavBarLink';
import './styles.css';

const NavGroup = () => {
  const [{ jwk }] = useStateValue();
  return (
    <div className="flex-row flex-right flex-padding">
      <NavBarLink path="/about" linkText="About" />
      <NavBarLink path="/faq" linkText="FAQs" />
      {!jwk ? (
        <ConnectButton />
      ) : (
        <>
          <NavBarLink path="/manage" linkText="Manage Names" />
          <AccountIcon
            width={'24px'}
            height={'24px'}
            fill={'var(--text-white)'}
          />
        </>
      )}
    </div>
  );
};

export default NavGroup;
