function Footer() {
  return (
    <div className="flex-row flex-center">
      <div className="text faded center">
        v{VITE_CONFIG.version}
        <br />
        <br />
        Copyright {new Date().getFullYear()}
      </div>
    </div>
  );
}

export default Footer;
