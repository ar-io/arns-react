function Footer() {
  return (
    <div className="flex-row flex-center">
      <div className="text faded center">
        v{process.env.npm_package_version}-
        {process.env.VITE_GITHUB_HASH?.slice(0, 6)}
        <br />
        <br />
        Copyright 2021 - {new Date().getFullYear()}
      </div>
    </div>
  );
}

export default Footer;
