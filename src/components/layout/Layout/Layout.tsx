import { Outlet } from 'react-router-dom';

import { ConnectWalletModal, CreateAntModal } from '../../../components/modals';
import {
  useConnectWalletModal,
  useCreateAntModal,
  useWalletAddress,
} from '../../../hooks/';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import Footer from '../Footer/Footer';
import NavBar from '../Navbar/Navbar';
import { Notifications } from '../Notifications/Notifications';
import './styles.css';

function Layout() {
  const [{ notifications }] = useGlobalState();
  const { showConnectModal } = useConnectWalletModal();
  const { showCreateAntModal } = useCreateAntModal();
  const { wallet, walletAddress } = useWalletAddress();

  return (
    <>
      <div className="header">
        <NavBar />
      </div>
      <div className="body">
        <Outlet />
        {/* TODO: add errors here */}
        <Notifications notifications={notifications} />
      </div>
      <div className="footer">
        <Footer />
      </div>
      <ConnectWalletModal show={showConnectModal} />
      {/* change to hook for display management */}
      <CreateAntModal
        show={showCreateAntModal && walletAddress !== undefined}
      />
    </>
  );
}

export default Layout;
