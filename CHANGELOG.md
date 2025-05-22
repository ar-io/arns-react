# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.10.0] - 2025-05-22

### Added

- Added support for Beacon wallet integration

### Fixed

- Improved wallet compatibility and connection handling

## [1.9.0] - 2025-05-09

### Added

- Increase Undername Support, Extend Lease, and Upgrade Domain workflows now
  support card and credits payments.

## [1.8.0] - 2025-05-08

### Changed

- Now displays USD and ARIO prices on search and register page.

## [1.7.2] - 2025-05-05

### Fixed

- Fix TTL rendering on domain management page

### Changed

- Updated default landing page transaction ID

## [1.7.1] - 2025-05-05

### Fixed

- Fix Wander download url

## [1.7.0] - 2025-04-28

### Added

- Credit card payment support on checkout page

## [1.6.2] - 2025-04-28

### Fixed

- Upgrade Domain handles missing Reassign-Name handlers
- ANT's with missing handlers will be flagged to update

## [1.6.1] - 2025-04-21

### Fixed

- Name purchase workflow now provides default logo.
- Wallet switch event for Wander updated
- Featured domains reordered.

## [1.6.0] - 2025-04-17

### Added

- Fiat Turbo Credits topup workflow

## [1.5.0] - 2025-04-17

### Added

- Added Turbo credits payment method to checkout page

## [1.4.0] - 2025-04-3

### Changed

- Added new checkout page for ArNS Name purchases.

## [1.3.0] - 2025-03-25

### Added

- Added Turbo credit balance

### Changed

- Removed AR balance

## [1.2.0] - 2025-03-13

### Changed

- Converted Upgrade ANT workflow to Upgrade Domain workflow, which uses
  Reassign-Name to fork the domain's associated ANT process with a new ANT
  module binary instead of using AOS `Eval` to update the code.

## [1.1.1] - 2025-02-25

### Fixed

- Fixed pricing jog on Returned Names chart

### Added

- Added Prices page on /prices

## [1.1.0] - 2025-02-20

### Changed

- Application configured for mainnet process
- Featured Domains
  - Updated for metalinks and arlink
  - Replaced ar-io.dev with ar.io gateway
- Landing page header and sub-title text updated
- Header navigation links now icons
- Footer links re-styled
- Modal dialog styling normalized
- Other minor visual improvements (icon sizing/coloring)

### Fixed

- Removed duplicate menu options in Profile menu on mobile

## [1.0.2] - 2025-02-14

### Added

- Added Start Date column in Return Name Table

### Changed

- Updated Return Name Table to use left-hand arrow button for expand/collapse of
  chart

### Fixed

- Fixed funding source option for primary name requests.
- Fixed incorrect insufficient funds message on extend lease page
- Minor visual improvements (spacing, colors, etc.)

## [1.0.1] - 2025-02-13

### Changed

- Changed ArConnect branding to Wander branding.
- Added support for account switching with Metamask.

### Fixed

- Fixed auto-reconnect issue when disconnecting with Metamask and refreshing
  page.
- Fixed displaying Update button to non-owners (controllers) in domains table.
- Disallow WWW on search page.

## [1.0.0] - 2025-02-12

### Added

- Add versioning and ChangeLog to application
- ChangeLog modal accessible from clicking app version in footer
