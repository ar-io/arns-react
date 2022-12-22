function Footer() {
  return (
    <div className="flex-row flex-center">
      <div className="text faded center">
        v{process.env.npm_package_version}
        <br />
        <br />
        Copyright 2021 - {new Date().getFullYear()}
      </div>
    </div>
  );
}

export default Footer;
