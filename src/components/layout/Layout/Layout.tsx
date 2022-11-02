import NavBar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './styles.css';

function Layout({ children }: { children: any }) {
  return (
    <>
      <div className="header">
        <NavBar />
      </div>
      <div className="body">
        <div className="container">{children}</div>
        <div className="footer">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Layout;
