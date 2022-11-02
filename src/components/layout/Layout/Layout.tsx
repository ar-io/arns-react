import NavBar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './styles.css'; // will be injected into the page

function Layout({ children }) {
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
