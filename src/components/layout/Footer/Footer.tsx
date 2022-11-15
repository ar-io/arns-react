function Footer() {
  return (
    <div>
      <div className="text faded center">
        v{APP_VERSION}
        <br />
        <br />
        Copyright {new Date().getFullYear()}
      </div>
    </div>
  );
}

export default Footer;
