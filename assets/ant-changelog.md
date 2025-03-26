# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [18] - [PMuRmTA2YQFK6kBx2ym2xq3XfRGAZZYnvqUV4siElVc] - (2025-3-25)

### Fixed

- Modified `Send` to validate message tags before sending.

## [17] - [BkdvmeNW3Hz3b37cUAa5RoUW_NI83EIsLDmboU1vH6A] - (2025-3-13)

### Changed

- Added Logo to initialize state handling.

## [16] - [OO2ewZKq4AHoqGQmYUIl-NhJ-llQyFJ3ha4Uf4-w5RI] - (2025-2-10)

## Changed

- Increased stack memory and initial memory on modules to 3MiB and 4MiB
  respectively.

## [15] - [s9drxRd-ylbJVtAi14tGmF7e42kA69PgfKUtgtmvAmU] - (2025-2-10)

## Added

- Priority property on Set-Record API. Allows for Owner and Controllers to set
  the Priority of the undername to be served by ar.io gateways, and will be used
  to determine which undernames are served within the undername limit of the
  base arns name.

## [14] - [W2sHFPAZ86BJLrU-HPp2P7twdlmbFJbckbCe42ETX-4] - (2025-2-05)

### Fixed

- Added msg.reply to all APIs
- Switch to Handlers.prepend instead of Handlers.once for backwards
  compatibility in `_boot` Handler.

## [13] - [zh4at_Y_GKJMD3SOkZ5Yx7mG2JRRLc89huEOspPtHq4] - (2025-1-29)

### Fixed

- Removed print with ID in Handler wrapper since ID can be null on dry runs.

## [12] - [mwCMAjglwV_96oEMEIi5epg_QXElOMzEcLkCUeQyGGo] - (2025-1-28)

### Changed

- Adjusts min and max allowed TTLs to 60 (1 minute) and 86400 (1 day),
  respetively. Defaults to 900 seconds (15 mins).
- Removed limit on undernames of 10k records.

### Added

- Boot mechanism for initializing state and sending notices to ANT Registry and
  Owner

## [11] - [1YqVEdJDvcpQ6qEWXYBEaVqB_NzAz4qPAsnUqLf5m3I] - (2025-1-24)

### Fixed

- Undername creation has been fixed to enable creation of one character
  undernames.
- Token API responses updated to spec

## [10] - [k9tQkbnFYZOGp6ist1yFuaqk_wOkzM5KUSNDtWzCLtg] - (2025-1-14)

### Changed

- Updated build process to compile a WASM binary as well as the bundled Lua code
- Updated testing to use our own WASM binary instead of an AOS fixture

## [9] - [16_FyX-V2QU0RPSh1GIaEETSaUjNb0oVjCFpVbAfQq4] - (2024-12-4)

### Changed

- Added Ethereum address support.
- Added Allow-Unsafe-Addresses flag to allow skipping of address validation for
  future compatibility with different signature algorithms for the following API
  methods:
  - Transfer
  - Add-Controller
  - Balance
  - Approve-Primary-Name

## [8] - [XP9_LFTae8C0yvCb_DUJaC5LXaiZIbiGT1yY25X0JCg] - (2024-11-25)

### Added

- Release-Name Handler
  - Calls the IO Network Process to release the specified ArNS name that is
    registered to the ANT.
- Reassign-Name Handler
  - Calls the IO Network Process to assign a new ANT Process to the respective
    name - must be a name registered the ANT in question.
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
- Update ID checks to use appropriate regexs and check both arweave and ethereum
  addresses

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

- Updated Credit and Debit notices to align with token spec
  [https://github.com/permaweb/aos/blob/main/blueprints/token.lua]

## [3] - [JqOo-V7uwJeRncbZrwLRGQUt2KO--RGDKI-mgfT7Bgc] - (2024-09-20)

### Fixed

- Repaired permission handling in Evolve handler to disallow modification of the
  SourceCodeTxId field by non-owners.

## [2] - [BVZZ0_ME8uq3zChN6bA6WsPmFhVpGDJ7Rb7l4qoGIDM] - (2024-08-20)

### Added

- Update ANT Registry with ANT ownership and controller roles on changes of
  those states.

## [1] - [Flwio4Lr08g6s6uim6lEJNnVGD9ylvz0_aafvpiL8FI] - (2024-07-12)

### Added

- Evolve capabilities and handlers.
