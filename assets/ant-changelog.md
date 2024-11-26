# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [8] - [XP9_LFTae8C0yvCb_DUJaC5LXaiZIbiGT1yY25X0JCg] - (2024-11-25)

### Added

- Release-Name Handler
  - Calls the IO Network Process to release the specified ArNS name that is registered to the ANT.
- Reassign-Name Handler
  - Calls the IO Network Process to assign a new ANT Process to the respective name - must be a name registered the ANT in question.
- Set-Description Handler
  - Allows for setting the description of the ANT
- Set-Keywords Handler
  - Allows for setting keywords on the ANT
- Set-Logo Handler
  - Allows for setting the logo of the ANT
- Add Approve-Primary-Name handler
  - Approves a primary name request on the specified IO process ID
- Add Remove-Primary-Names handler
  - Forwards a Remove-Primary-Names action to the specified IO process ID

### Changed

- Refactored handlers to use a util that codifies responses on calls.
- Added documentation with luadoc types for improved linting.
- Removed `Evolve` handler and SourceCodeTxId from state and state responses.

### Fixed

- Fixed the Remove-Record api to return appropriate notices on calls.

<!-- eslint-disable-next-line -->

## [7] - [p6svP-fOm1N9imdx9wF2h3u81Qbc7y-HLEGBDCCE3s4] - (2024-10-03)

### Changed

- Changed default landing page transaction ID.

## [6] - [pOh2yupSaQCrLI_-ah8tVTiusUdVNTxxeWTQQHNdf30] - (2024-09-30)

### Fixed

- ANT will now lower case undernames when provided to provide URL compatibility.

## [5] - [RuoUVJOCJOvSfvvi_tn0UPirQxlYdC4_odqmORASP8g] - (2024-09-25)

### Fixed

- Repaired evolve handler to allow ANTs to be used in AOS CLI

## [4] - [zeglqubvIKvBEZaxAUuenLGGtQ1pJp9LZjd5hDe0-J0] - (2024-09-24)

### Fixed

- Updated Credit and Debit notices to align with token spec [https://github.com/permaweb/aos/blob/main/blueprints/token.lua]

## [3] - [JqOo-V7uwJeRncbZrwLRGQUt2KO--RGDKI-mgfT7Bgc] - (2024-09-20)

### Fixed

- Repaired permission handling in Evolve handler to disallow modification of the SourceCodeTxId field by non-owners.

## [2] - [BVZZ0_ME8uq3zChN6bA6WsPmFhVpGDJ7Rb7l4qoGIDM] - (2024-08-20)

### Added

- Update ANT Registry with ANT ownership and controller roles on changes of those states.

## [1] - [Flwio4Lr08g6s6uim6lEJNnVGD9ylvz0_aafvpiL8FI] - (2024-07-12)

### Added

- Evolve capabilities and handlers.
