function Footer() {
  return (
    <div>
      {/* @ts-ignore */}
      <div className="textFaded">
        v{APP_VERSION}
        <br />
        <br />
        Copyright ar.io 2022
      </div>
    </div>
  );
}

export default Footer;
