/**
 * Copyright (C) 2022-2024 Permanent Data Solutions, Inc. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// src/constants.ts
var SECONDS_IN_A_YEAR = 31536e3;
var MAX_YEARS = 5;
var MAX_ALLOWED_DECIMALS = 6;
var MAX_NOTE_LENGTH = 256;
var MAX_GATEWAY_LABEL_LENGTH = 64;
var MAX_PORT_NUMBER = 65535;
var SECONDS_IN_GRACE_PERIOD = 1814400;
var RESERVED_ATOMIC_TX_ID = 'atomic';
var NETWORK_JOIN_STATUS = 'joined';
var NETWORK_LEAVING_STATUS = 'leaving';
var NETWORK_HIDDEN_STATUS = 'hidden';
var SHORT_NAME_RESERVATION_UNLOCK_TIMESTAMP = 17040924e5;
var BLOCKS_PER_DAY = 720;
var MAX_ALLOWED_EVOLUTION_DELAY = BLOCKS_PER_DAY * 30;
var MINIMUM_ALLOWED_NAME_LENGTH = 5;
var TENURE_WEIGHT_DAYS = 180;
var PERMABUY_LEASE_FEE_LENGTH = 10;
var ANNUAL_PERCENTAGE_FEE = 0.2;
var DEFAULT_UNDERNAME_COUNT = 10;
var UNDERNAME_LEASE_FEE_PERCENTAGE = 1e-3;
var UNDERNAME_PERMABUY_FEE_PERCENTAGE = 5e-3;
var MAX_ALLOWED_UNDERNAMES = 1e4;
var NON_CONTRACT_OWNER_MESSAGE = `Caller is not the owner of the ArNS!`;
var ARNS_NAME_MUST_BE_AUCTIONED_MESSAGE = 'Name must be auctioned.';
var ARNS_NAME_RESERVED_MESSAGE = 'Name is reserved.';
var ARNS_NAME_IN_AUCTION_MESSAGE = 'Name is currently in auction.';
var ARNS_NAME_AUCTION_EXPIRED_MESSAGE = 'Auction has expired.';
var INVALID_INPUT_MESSAGE = 'Invalid input for interaction';
var CALLER_NOT_VALID_OBSERVER_MESSAGE =
  'Cannot submit observation report because caller is not eligible to observe';
var DEFAULT_NUM_SAMPLED_BLOCKS = 3;
var DEFAULT_SAMPLED_BLOCKS_OFFSET = 50;
var NUM_OBSERVERS_PER_EPOCH = 4;
var NON_EXPIRED_ARNS_NAME_MESSAGE =
  'This name already exists in an active lease';
var ARNS_NAME_DOES_NOT_EXIST_MESSAGE =
  'Name does not exist in the ArNS Contract!';
var INSUFFICIENT_FUNDS_MESSAGE = 'Insufficient funds for this transaction.';
var INVALID_TARGET_MESSAGE = 'Invalid target specified';
var INVALID_YEARS_MESSAGE = `Invalid number of years. Must be an integer and less than or equal to ${MAX_YEARS}`;
var INVALID_NAME_EXTENSION_TYPE_MESSAGE = `This name has been permanently registered and its lease cannot be extended.`;
var INVALID_SHORT_NAME = `Name is less than ${MINIMUM_ALLOWED_NAME_LENGTH} characters. It will be available for auction after ${SHORT_NAME_RESERVATION_UNLOCK_TIMESTAMP}.`;
var MAX_UNDERNAME_MESSAGE = `Name has reached undername limit of ${MAX_ALLOWED_UNDERNAMES}`;
var AUCTION_SETTINGS = {
  floorPriceMultiplier: 1,
  startPriceMultiplier: 50,
  decayInterval: 30,
  // decrement every 30 blocks - approx every 1 hour
  decayRate: 0.0225,
  // 2.25% decay per interval
  auctionDuration: 10080,
  // approx 14 days long
};
var DEFAULT_EPOCH_BLOCK_LENGTH = 50;
var DEFAULT_START_HEIGHT = 0;
var MAX_TENURE_WEIGHT = 2;
var DEMAND_FACTORING_SETTINGS = {
  movingAvgPeriodCount: 7,
  periodBlockCount: 720,
  demandFactorBaseValue: 1,
  demandFactorMin: 0.5,
  demandFactorUpAdjustment: 0.05,
  demandFactorDownAdjustment: 0.025,
  stepDownThreshold: 3,
  // number of times at minimum allowed before resetting genesis fees (ultimately leads to 4 periods at the new fee, including the reset period)
  criteria: 'revenue',
};
var MIO_PER_IO = 1e6;
var ONE_MIO = 1 / MIO_PER_IO;

// src/types.ts
var PositiveFiniteInteger = class {
  constructor(positiveFiniteInteger) {
    this.positiveFiniteInteger = positiveFiniteInteger;
    if (
      !Number.isFinite(this.positiveFiniteInteger) ||
      !Number.isInteger(this.positiveFiniteInteger) ||
      this.positiveFiniteInteger < 0
    ) {
      throw new ContractError(
        `Number must be a non-negative integer value! ${positiveFiniteInteger}`,
      );
    }
  }
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') {
      this.toString();
    }
    return this.positiveFiniteInteger;
  }
  plus(positiveFiniteInteger) {
    return new PositiveFiniteInteger(
      this.positiveFiniteInteger + positiveFiniteInteger.positiveFiniteInteger,
    );
  }
  minus(positiveFiniteInteger) {
    return new PositiveFiniteInteger(
      this.positiveFiniteInteger - positiveFiniteInteger.positiveFiniteInteger,
    );
  }
  isGreaterThan(positiveFiniteInteger) {
    return (
      this.positiveFiniteInteger > positiveFiniteInteger.positiveFiniteInteger
    );
  }
  isGreaterThanOrEqualTo(positiveFiniteInteger) {
    return (
      this.positiveFiniteInteger >= positiveFiniteInteger.positiveFiniteInteger
    );
  }
  toString() {
    return `${this.positiveFiniteInteger}`;
  }
  valueOf() {
    return this.positiveFiniteInteger;
  }
  toJSON() {
    return this.positiveFiniteInteger;
  }
  equals(other) {
    return this.positiveFiniteInteger === other.positiveFiniteInteger;
  }
};
var BlockHeight = class extends PositiveFiniteInteger {
  // TODO: Improve upon this technique for sub-type discrimination
  type = 'BlockHeight';
  constructor(blockHeight) {
    super(blockHeight);
  }
};
var BlockTimestamp = class extends PositiveFiniteInteger {
  // TODO: Improve upon this technique for sub-type discrimination
  type = 'BlockTimestamp';
  constructor(blockTimestamp) {
    super(blockTimestamp);
  }
};
var IOToken = class {
  value;
  constructor(value) {
    this.value = +value.toFixed(MAX_ALLOWED_DECIMALS);
  }
  valueOf() {
    return this.value;
  }
};

// src/pricing.ts
function tallyNamePurchase(dfData, revenue) {
  const newDfData = cloneDemandFactoringData(dfData);
  newDfData.purchasesThisPeriod++;
  newDfData.revenueThisPeriod += revenue;
  return newDfData;
}
function updateDemandFactor(currentHeight, dfData, fees) {
  if (!shouldUpdateDemandFactor(currentHeight, dfData)) {
    return {
      demandFactoring: dfData,
      fees,
    };
  }
  const newDemandFactoringData = cloneDemandFactoringData(dfData);
  let updatedFees;
  const numNamesPurchasedInLastPeriod = dfData.purchasesThisPeriod;
  const mvgAvgOfTrailingNamePurchases = mvgAvgTrailingPurchaseCounts(dfData);
  const revenueInLastPeriod = dfData.revenueThisPeriod;
  const mvgAvgOfTrailingRevenue = mvgAvgTrailingRevenues(dfData);
  if (
    demandIsIncreasing({
      numNamesPurchasedInLastPeriod,
      mvgAvgOfTrailingNamePurchases,
      revenueInLastPeriod,
      mvgAvgOfTrailingRevenue,
      demandFactoringCriteria: DEMAND_FACTORING_SETTINGS.criteria,
    })
  ) {
    newDemandFactoringData.demandFactor *=
      1 + DEMAND_FACTORING_SETTINGS.demandFactorUpAdjustment;
  } else if (dfData.demandFactor > DEMAND_FACTORING_SETTINGS.demandFactorMin) {
    newDemandFactoringData.demandFactor *=
      1 - DEMAND_FACTORING_SETTINGS.demandFactorDownAdjustment;
  }
  if (
    newDemandFactoringData.demandFactor ===
    DEMAND_FACTORING_SETTINGS.demandFactorMin
  ) {
    if (
      ++newDemandFactoringData.consecutivePeriodsWithMinDemandFactor >=
      DEMAND_FACTORING_SETTINGS.stepDownThreshold
    ) {
      newDemandFactoringData.consecutivePeriodsWithMinDemandFactor = 0;
      newDemandFactoringData.demandFactor =
        DEMAND_FACTORING_SETTINGS.demandFactorBaseValue;
      updatedFees = Object.keys(fees).reduce((acc, nameLength) => {
        acc[nameLength] = Math.max(
          fees[nameLength] * DEMAND_FACTORING_SETTINGS.demandFactorMin,
          ONE_MIO,
        );
        return acc;
      }, {});
    }
  } else {
    newDemandFactoringData.consecutivePeriodsWithMinDemandFactor = 0;
  }
  const trailingPeriodIndex = demandFactorPeriodIndex(
    newDemandFactoringData.currentPeriod,
  );
  newDemandFactoringData.trailingPeriodPurchases[trailingPeriodIndex] =
    numNamesPurchasedInLastPeriod;
  newDemandFactoringData.trailingPeriodRevenues[trailingPeriodIndex] =
    revenueInLastPeriod;
  newDemandFactoringData.currentPeriod++;
  newDemandFactoringData.purchasesThisPeriod = 0;
  newDemandFactoringData.revenueThisPeriod = 0;
  return {
    demandFactoring: newDemandFactoringData,
    fees: updatedFees || fees,
  };
}
function shouldUpdateDemandFactor(currentHeight, dfData) {
  if (currentHeight.valueOf() === dfData.periodZeroBlockHeight) {
    return false;
  }
  const currentPeriod = periodAtHeight(
    currentHeight,
    new BlockHeight(dfData.periodZeroBlockHeight),
  );
  return currentPeriod > dfData.currentPeriod;
}
function demandIsIncreasing({
  numNamesPurchasedInLastPeriod,
  mvgAvgOfTrailingNamePurchases: mvgAvgOfTailingNamePurchases,
  revenueInLastPeriod,
  mvgAvgOfTrailingRevenue,
  demandFactoringCriteria,
}) {
  switch (demandFactoringCriteria) {
    case 'purchases':
      return (
        numNamesPurchasedInLastPeriod >= mvgAvgOfTailingNamePurchases &&
        numNamesPurchasedInLastPeriod !== 0
      );
    case 'revenue':
      return (
        revenueInLastPeriod >= mvgAvgOfTrailingRevenue &&
        revenueInLastPeriod !== 0
      );
  }
}
function periodAtHeight(height, periodZeroHeight) {
  return Math.floor(
    (height.valueOf() - periodZeroHeight.valueOf()) /
      DEMAND_FACTORING_SETTINGS.periodBlockCount,
  );
}
function demandFactorPeriodIndex(period) {
  return period % DEMAND_FACTORING_SETTINGS.movingAvgPeriodCount;
}
function mvgAvgTrailingPurchaseCounts(dfData) {
  return (
    dfData.trailingPeriodPurchases.reduce(
      (acc, periodPurchaseCount) => acc + periodPurchaseCount,
      0,
    ) / DEMAND_FACTORING_SETTINGS.movingAvgPeriodCount
  );
}
function mvgAvgTrailingRevenues(dfData) {
  return (
    dfData.trailingPeriodRevenues.reduce(
      (acc, periodRevenue) => acc + periodRevenue,
      0,
    ) / DEMAND_FACTORING_SETTINGS.movingAvgPeriodCount
  );
}
function cloneDemandFactoringData(dfData) {
  return {
    ...dfData,
    trailingPeriodPurchases: dfData.trailingPeriodPurchases.slice(),
    trailingPeriodRevenues: dfData.trailingPeriodRevenues.slice(),
  };
}
function calculateLeaseFee({ name, fees, years, demandFactoring }) {
  const initialNamePurchaseFee = fees[name.length.toString()];
  return (
    demandFactoring.demandFactor *
    (initialNamePurchaseFee +
      calculateAnnualRenewalFee({
        name,
        fees,
        years,
      }))
  );
}
function calculateAnnualRenewalFee({ name, fees, years }) {
  const initialNamePurchaseFee = fees[name.length.toString()];
  const nameAnnualRegistrationFee =
    initialNamePurchaseFee * ANNUAL_PERCENTAGE_FEE;
  const totalAnnualRenewalCost = nameAnnualRegistrationFee * years;
  return totalAnnualRenewalCost;
}
function calculatePermabuyFee({ name, fees, demandFactoring }) {
  const permabuyLeasePrice = calculateAnnualRenewalFee({
    name,
    fees,
    years: PERMABUY_LEASE_FEE_LENGTH,
  });
  return demandFactoring.demandFactor * permabuyLeasePrice;
}
function calculateRegistrationFee({
  type,
  name,
  fees,
  years,
  currentBlockTimestamp,
  demandFactoring,
}) {
  switch (type) {
    case 'lease':
      return calculateLeaseFee({
        name,
        fees,
        years,
        currentBlockTimestamp,
        demandFactoring,
      });
    case 'permabuy':
      return calculatePermabuyFee({
        name,
        fees,
        currentBlockTimestamp,
        demandFactoring,
      });
  }
}
function calculateUndernameCost({
  name,
  fees,
  increaseQty,
  type,
  demandFactoring,
  years,
}) {
  const initialNameFee = fees[name.length.toString()];
  const getUndernameFeePercentage = () => {
    switch (type) {
      case 'lease':
        return UNDERNAME_LEASE_FEE_PERCENTAGE;
      case 'permabuy':
        return UNDERNAME_PERMABUY_FEE_PERCENTAGE;
    }
  };
  const undernamePercentageFee = getUndernameFeePercentage();
  const totalFeeForQtyAndYears =
    initialNameFee * undernamePercentageFee * increaseQty * years;
  return demandFactoring.demandFactor * totalFeeForQtyAndYears;
}

// src/auctions.ts
function calculateMinimumAuctionBid({
  startHeight,
  startPrice,
  floorPrice,
  currentBlockHeight,
  decayInterval,
  decayRate,
}) {
  const blockIntervalsPassed = Math.max(
    0,
    Math.floor(
      (currentBlockHeight.valueOf() - startHeight.valueOf()) / decayInterval,
    ),
  );
  const dutchAuctionBid =
    startPrice * Math.pow(1 - decayRate, blockIntervalsPassed);
  return new IOToken(Math.max(floorPrice, dutchAuctionBid));
}
function getAuctionPrices({
  auctionSettings,
  startHeight,
  startPrice,
  floorPrice,
}) {
  const { auctionDuration, decayRate, decayInterval } = auctionSettings;
  const intervalCount = auctionDuration / decayInterval;
  const prices = {};
  for (let i = 0; i <= intervalCount; i++) {
    const intervalHeight = new BlockHeight(
      startHeight.valueOf() + i * decayInterval,
    );
    const price = calculateMinimumAuctionBid({
      startHeight,
      startPrice,
      floorPrice,
      currentBlockHeight: intervalHeight,
      decayInterval,
      decayRate,
    });
    prices[intervalHeight.valueOf()] = price.valueOf();
  }
  return prices;
}
function createAuctionObject({
  auctionSettings,
  fees,
  contractTxId,
  currentBlockHeight,
  currentBlockTimestamp,
  type,
  initiator,
  demandFactoring,
  name,
}) {
  const initialRegistrationFee = calculateRegistrationFee({
    name,
    fees,
    type,
    years: 1,
    currentBlockTimestamp,
    demandFactoring,
  });
  const calculatedFloorPrice =
    initialRegistrationFee * auctionSettings.floorPriceMultiplier;
  const startPrice =
    calculatedFloorPrice * auctionSettings.startPriceMultiplier;
  const endHeight =
    currentBlockHeight.valueOf() + auctionSettings.auctionDuration;
  return {
    initiator,
    // the balance that the floor price is decremented from
    contractTxId,
    startPrice,
    floorPrice: calculatedFloorPrice,
    // this is decremented from the initiators wallet, and could be higher than the precalculated floor
    startHeight: currentBlockHeight.valueOf(),
    // auction starts right away
    endHeight,
    // auction ends after the set duration
    type,
    ...(type === 'lease' ? { years: 1 } : {}),
    settings: auctionSettings,
  };
}
function getEndTimestampForAuction({ auction, currentBlockTimestamp }) {
  switch (auction.type) {
    case 'permabuy':
      return void 0;
    case 'lease':
      return new BlockTimestamp(
        currentBlockTimestamp.valueOf() + SECONDS_IN_A_YEAR * auction.years,
      );
    default:
      throw new ContractError('Invalid auction type');
  }
}

// src/utilities.ts
function isValidFQDN(fqdn) {
  const fqdnRegex = /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{1,63}$/;
  return fqdnRegex.test(fqdn);
}
function isValidArweaveBase64URL(base64URL) {
  const base64URLRegex = new RegExp('^[a-zA-Z0-9_-]{43}$');
  return base64URLRegex.test(base64URL);
}
function walletHasSufficientBalance(balances, wallet, qty) {
  return !!balances[wallet] && balances[wallet] >= qty;
}
function isNameInGracePeriod({ currentBlockTimestamp, record }) {
  if (!record.endTimestamp) return false;
  const recordIsExpired = currentBlockTimestamp.valueOf() > record.endTimestamp;
  return (
    recordIsExpired &&
    record.endTimestamp + SECONDS_IN_GRACE_PERIOD >
      currentBlockTimestamp.valueOf()
  );
}
function getMaxAllowedYearsExtensionForRecord({
  currentBlockTimestamp,
  record,
}) {
  if (!record.endTimestamp) {
    return 0;
  }
  if (
    currentBlockTimestamp.valueOf() >
    record.endTimestamp + SECONDS_IN_GRACE_PERIOD
  ) {
    return 0;
  }
  if (isNameInGracePeriod({ currentBlockTimestamp, record })) {
    return MAX_YEARS;
  }
  const yearsRemainingOnLease = Math.ceil(
    (record.endTimestamp.valueOf() - currentBlockTimestamp.valueOf()) /
      SECONDS_IN_A_YEAR,
  );
  return MAX_YEARS - yearsRemainingOnLease;
}
function getInvalidAjvMessage(validator, input, functionName) {
  return `${INVALID_INPUT_MESSAGE} for ${functionName}: ${validator.errors
    .map((e) => {
      const key = e.instancePath.replace('/', '');
      const value = input[key];
      return `${key} ('${value}') ${e.message}`;
    })
    .join(', ')}`;
}
function getEpochStart({ startHeight, epochBlockLength, height }) {
  return (
    getEpochEnd({ startHeight, epochBlockLength, height }) +
    1 -
    epochBlockLength
  );
}
function getEpochEnd({ startHeight, epochBlockLength, height }) {
  return (
    startHeight +
    epochBlockLength *
      (Math.floor((height - startHeight) / epochBlockLength) + 1) -
    1
  );
}
async function getEntropy(height) {
  let entropyBuffer = Buffer.alloc(0);
  for (let i = 0; i < DEFAULT_NUM_SAMPLED_BLOCKS; i++) {
    const offsetHeight =
      height - DEFAULT_SAMPLED_BLOCKS_OFFSET - i < 0
        ? 0
        : height - DEFAULT_SAMPLED_BLOCKS_OFFSET - i;
    const path = `/block/height/${offsetHeight}`;
    const data = await SmartWeave.safeArweaveGet(path);
    const indep_hash = data.indep_hash;
    if (!indep_hash || typeof indep_hash !== 'string') {
      throw new ContractError(`Block ${height - i} has no indep_hash`);
    }
    entropyBuffer = Buffer.concat([
      entropyBuffer,
      Buffer.from(indep_hash, 'base64url'),
    ]);
  }
  const hash = await SmartWeave.arweave.crypto.hash(entropyBuffer, 'SHA-256');
  return hash;
}
async function getPrescribedObservers(
  gateways,
  minNetworkJoinStakeAmount,
  gatewayLeaveLength,
  height,
) {
  const prescribedObservers2 = [];
  const weightedObservers = [];
  let totalCompositeWeight = 0;
  for (const address in gateways) {
    const gateway = gateways[address];
    const isWithinStartRange = gateway.start <= height;
    const isWithinEndRange =
      gateway.end === 0 || gateway.end - gatewayLeaveLength < height;
    if (isWithinStartRange && isWithinEndRange) {
      const stake = gateways[address].operatorStake;
      const stakeWeight = stake / minNetworkJoinStakeAmount;
      let tenureWeight =
        (+SmartWeave.block.height - gateways[address].start) /
        (TENURE_WEIGHT_DAYS * BLOCKS_PER_DAY);
      if (tenureWeight > MAX_TENURE_WEIGHT) {
        tenureWeight = MAX_TENURE_WEIGHT;
      }
      const gatewayRewardRatioWeight = 1;
      const observerRewardRatioWeight = 1;
      const compositeWeight =
        stakeWeight *
        tenureWeight *
        gatewayRewardRatioWeight *
        observerRewardRatioWeight;
      weightedObservers.push({
        gatewayAddress: address,
        observerAddress: gateway.observerWallet,
        stake,
        start: gateway.start,
        stakeWeight,
        tenureWeight,
        gatewayRewardRatioWeight,
        observerRewardRatioWeight,
        compositeWeight,
        normalizedCompositeWeight: compositeWeight,
      });
      totalCompositeWeight += compositeWeight;
    }
  }
  for (const weightedObserver of weightedObservers) {
    weightedObserver.normalizedCompositeWeight =
      weightedObserver.compositeWeight / totalCompositeWeight;
  }
  if (NUM_OBSERVERS_PER_EPOCH >= Object.keys(weightedObservers).length) {
    return weightedObservers;
  }
  const entropy = await getEntropy(height);
  const usedIndexes = /* @__PURE__ */ new Set();
  let hash = await SmartWeave.arweave.crypto.hash(entropy, 'SHA-256');
  for (let i = 0; i < NUM_OBSERVERS_PER_EPOCH; i++) {
    const random = hash.readUInt32BE(0) / 4294967295;
    let cumulativeNormalizedCompositeWeight = 0;
    for (let index = 0; index < weightedObservers.length; index++) {
      {
        cumulativeNormalizedCompositeWeight +=
          weightedObservers[index].normalizedCompositeWeight;
        if (random <= cumulativeNormalizedCompositeWeight) {
          if (!usedIndexes.has(index)) {
            prescribedObservers2.push(weightedObservers[index]);
            usedIndexes.add(index);
            break;
          }
        }
      }
      hash = await SmartWeave.arweave.crypto.hash(hash, 'SHA-256');
    }
  }
  return prescribedObservers2;
}
function isExistingActiveRecord({ record, currentBlockTimestamp }) {
  if (!record) return false;
  if (record.type === 'permabuy') {
    return true;
  }
  if (record.type === 'lease') {
    return (
      record.endTimestamp &&
      (record.endTimestamp > currentBlockTimestamp.valueOf() ||
        isNameInGracePeriod({ currentBlockTimestamp, record }))
    );
  }
  return false;
}
function isShortNameRestricted({ name, currentBlockTimestamp }) {
  return (
    name.length < MINIMUM_ALLOWED_NAME_LENGTH &&
    currentBlockTimestamp.valueOf() < SHORT_NAME_RESERVATION_UNLOCK_TIMESTAMP
  );
}
function isActiveReservedName({ caller, reservedName, currentBlockTimestamp }) {
  if (!reservedName) return false;
  const target = reservedName.target;
  const endTimestamp = reservedName.endTimestamp;
  const permanentlyReserved = !target && !endTimestamp;
  if (permanentlyReserved) {
    return true;
  }
  const callerNotTarget = !caller || target !== caller;
  const notExpired =
    endTimestamp && endTimestamp > currentBlockTimestamp.valueOf();
  if (callerNotTarget && notExpired) {
    return true;
  }
  return false;
}
function isNameAvailableForAuction({
  name,
  record,
  reservedName,
  caller,
  currentBlockTimestamp,
}) {
  return (
    !isExistingActiveRecord({ record, currentBlockTimestamp }) &&
    !isActiveReservedName({ reservedName, caller, currentBlockTimestamp }) &&
    !isShortNameRestricted({ name, currentBlockTimestamp })
  );
}
function isNameRequiredToBeAuction({ name, type }) {
  return type === 'permabuy' && name.length < 12;
}
function assertAvailableRecord({
  caller,
  name,
  records,
  reserved,
  currentBlockTimestamp,
}) {
  if (
    isExistingActiveRecord({
      record: records[name],
      currentBlockTimestamp,
    })
  ) {
    throw new ContractError(NON_EXPIRED_ARNS_NAME_MESSAGE);
  }
  if (
    isActiveReservedName({
      caller,
      reservedName: reserved[name],
      currentBlockTimestamp,
    })
  ) {
    throw new ContractError(ARNS_NAME_RESERVED_MESSAGE);
  }
  if (isShortNameRestricted({ name, currentBlockTimestamp })) {
    throw new ContractError(INVALID_SHORT_NAME);
  }
}
function calculateExistingAuctionBidForCaller({
  caller,
  auction,
  submittedBid,
  requiredMinimumBid,
}) {
  let finalBid = submittedBid
    ? Math.min(submittedBid, requiredMinimumBid.valueOf())
    : requiredMinimumBid.valueOf();
  if (caller === auction.initiator) {
    finalBid -= auction.floorPrice;
  }
  return new IOToken(finalBid);
}
function isGatewayJoined({ gateway, currentBlockHeight }) {
  if (!gateway) return false;
  return (
    gateway.status === 'joined' && gateway.end > currentBlockHeight.valueOf()
  );
}
function isGatewayHidden({ gateway }) {
  if (!gateway) return false;
  return gateway.status === 'hidden';
}
function isGatewayEligibleToBeRemoved({ gateway, currentBlockHeight }) {
  return (
    gateway.status === 'leaving' && gateway.end <= currentBlockHeight.valueOf()
  );
}
function isGatewayEligibleToLeave({
  gateway,
  currentBlockHeight,
  registrySettings,
}) {
  if (!gateway) return false;
  const joinedForMinimum =
    currentBlockHeight.valueOf() >=
    gateway.start + registrySettings.minGatewayJoinLength;
  const isActiveOrHidden =
    isGatewayJoined({ gateway, currentBlockHeight }) ||
    isGatewayHidden({ gateway });
  return joinedForMinimum && isActiveOrHidden;
}
function calculateYearsBetweenTimestamps({ startTimestamp, endTimestamp }) {
  const yearsRemainingFloat =
    (endTimestamp.valueOf() - startTimestamp.valueOf()) / SECONDS_IN_A_YEAR;
  return +yearsRemainingFloat.toFixed(2);
}
function unsafeDecrementBalance(
  balances,
  address,
  amount,
  removeIfZero = true,
) {
  balances[address] -= amount;
  if (removeIfZero && balances[address] === 0) {
    delete balances[address];
  }
}
function incrementBalance(balances, address, amount) {
  if (address in balances) {
    balances[address] += amount;
  } else {
    balances[address] = amount;
  }
}
function safeTransfer({ balances, fromAddr, toAddr, qty }) {
  if (fromAddr === toAddr) {
    throw new ContractError(INVALID_TARGET_MESSAGE);
  }
  if (balances[fromAddr] === null || isNaN(balances[fromAddr])) {
    throw new ContractError(`Caller balance is not defined!`);
  }
  if (!walletHasSufficientBalance(balances, fromAddr, qty)) {
    throw new ContractError(INSUFFICIENT_FUNDS_MESSAGE);
  }
  incrementBalance(balances, toAddr, qty);
  unsafeDecrementBalance(balances, fromAddr, qty);
}

// src/actions/read/auction.ts
var getAuction = (state, { caller, input: { name, type = 'lease' } }) => {
  const { records, auctions, settings, fees, reserved } = state;
  const formattedName = name.toLowerCase().trim();
  const auction = auctions[formattedName];
  if (!auction) {
    const auctionSettings = settings.auctions;
    const currentBlockTimestamp = new BlockTimestamp(
      +SmartWeave.block.timestamp,
    );
    const currentBlockHeight = new BlockHeight(+SmartWeave.block.height);
    const auctionObject = createAuctionObject({
      auctionSettings,
      type,
      name,
      fees,
      currentBlockTimestamp,
      demandFactoring: state.demandFactoring,
      currentBlockHeight,
      contractTxId: void 0,
      initiator: void 0,
    });
    const prices2 = getAuctionPrices({
      auctionSettings,
      startHeight: currentBlockHeight,
      // set it to the current block height
      startPrice: auctionObject.startPrice,
      floorPrice: auctionObject.floorPrice,
    });
    const record = records[formattedName];
    const reservedName = reserved[formattedName];
    const isAvailableForAuction = isNameAvailableForAuction({
      caller,
      name: formattedName,
      record,
      reservedName,
      currentBlockTimestamp,
    });
    const isRequiredToBeAuctioned2 = isNameRequiredToBeAuction({
      name: formattedName,
      type,
    });
    return {
      result: {
        name: formattedName,
        isActive: false,
        isAvailableForAuction,
        isRequiredToBeAuctioned: isRequiredToBeAuctioned2,
        minimumBid: auctionObject.floorPrice,
        // since its not active yet, the minimum bid is the floor price
        ...auctionObject,
        prices: prices2,
      },
    };
  }
  const {
    startHeight,
    floorPrice,
    startPrice,
    settings: existingAuctionSettings,
  } = auction;
  const expirationHeight =
    startHeight + existingAuctionSettings.auctionDuration;
  const isRequiredToBeAuctioned = isNameRequiredToBeAuction({
    name: formattedName,
    type: auction.type,
  });
  const prices = getAuctionPrices({
    auctionSettings: existingAuctionSettings,
    startHeight: new BlockHeight(startHeight),
    startPrice,
    // TODO: use IO class class
    floorPrice,
  });
  const minimumBid = calculateMinimumAuctionBid({
    startHeight: new BlockHeight(startHeight),
    startPrice,
    floorPrice,
    currentBlockHeight: new BlockHeight(+SmartWeave.block.height),
    decayInterval: existingAuctionSettings.decayInterval,
    decayRate: existingAuctionSettings.decayRate,
  });
  return {
    result: {
      name: formattedName,
      isActive: expirationHeight >= +SmartWeave.block.height,
      isAvailableForAuction: false,
      isRequiredToBeAuctioned,
      minimumBid: minimumBid.valueOf(),
      ...auction,
      prices,
    },
  };
};

// src/actions/read/balance.ts
var balance = async (state, { input: { target } }) => {
  const balances = state.balances;
  if (typeof target !== 'string') {
    throw new ContractError('Must specify target to get balance for');
  }
  if (typeof balances[target] !== 'number') {
    throw new ContractError('Cannot get balance, target does not exist');
  }
  return {
    result: {
      target,
      balance: balances[target],
    },
  };
};

// src/actions/read/gateways.ts
var getGateway = async (state, { input: { target } }) => {
  const { gateways = {} } = state;
  if (!(target in gateways)) {
    throw new ContractError('This target does not have a registered gateway.');
  }
  const gatewayObj = gateways[target];
  return {
    result: gatewayObj,
  };
};
var getGatewayTotalStake = async (state, { input: { target } }) => {
  const { gateways = {} } = state;
  if (!(target in gateways)) {
    throw new ContractError('This target does not have a registered gateway.');
  }
  const gatewayTotalStake = gateways[target].operatorStake;
  return {
    result: gatewayTotalStake,
  };
};
var getGatewayRegistry = async (state) => {
  const { gateways = {} } = state;
  return {
    result: gateways,
  };
};
var getRankedGatewayRegistry = async (state) => {
  const { gateways = {} } = state;
  const filteredGateways = {};
  Object.keys(gateways).forEach((address) => {
    if (gateways[address].status === NETWORK_JOIN_STATUS) {
      filteredGateways[address] = gateways[address];
    }
  });
  const rankedGateways = {};
  Object.keys(filteredGateways)
    .sort((addressA, addressB) => {
      const gatewayA = filteredGateways[addressA];
      const gatewayB = filteredGateways[addressB];
      const totalStakeA = gatewayA.operatorStake;
      const totalStakeB = gatewayB.operatorStake;
      return totalStakeB - totalStakeA;
    })
    .forEach((address) => {
      rankedGateways[address] = filteredGateways[address];
    });
  return {
    result: rankedGateways,
  };
};

// src/actions/read/observation.ts
var prescribedObserver = async (state, { input: { target, height } }) => {
  const { settings, gateways } = state;
  if (!height) {
    height = +SmartWeave.block.height;
  }
  const currentEpochStartHeight = getEpochStart({
    startHeight: DEFAULT_START_HEIGHT,
    epochBlockLength: DEFAULT_EPOCH_BLOCK_LENGTH,
    height,
  });
  const prescribedObservers2 = await getPrescribedObservers(
    gateways,
    settings.registry.minNetworkJoinStakeAmount,
    settings.registry.gatewayLeaveLength,
    currentEpochStartHeight,
  );
  if (
    prescribedObservers2.some(
      (observer) =>
        observer.gatewayAddress === target ||
        observer.observerAddress === target,
    )
  ) {
    return { result: true };
  } else {
    return { result: false };
  }
};
var prescribedObservers = async (state, { input: { height } }) => {
  const { settings, gateways } = state;
  if (!height) {
    height = +SmartWeave.block.height;
  }
  const currentEpochStartHeight = getEpochStart({
    startHeight: DEFAULT_START_HEIGHT,
    epochBlockLength: DEFAULT_EPOCH_BLOCK_LENGTH,
    height,
  });
  const prescribedObservers2 = await getPrescribedObservers(
    gateways,
    settings.registry.minNetworkJoinStakeAmount,
    settings.registry.gatewayLeaveLength,
    currentEpochStartHeight,
  );
  return { result: prescribedObservers2 };
};

// src/validations.js
var validateAuctionBid = validate10;
var pattern0 = new RegExp('^(submitAuctionBid|buyRecord)$', 'u');
var pattern1 = new RegExp(
  '^([a-zA-Z0-9][a-zA-Z0-9-]{0,49}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
  'u',
);
var pattern2 = new RegExp('^(lease|permabuy)$', 'u');
var pattern3 = new RegExp('^(atomic|[a-zA-Z0-9-_]{43})$', 'u');
function validate10(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.name === void 0) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property 'name'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.function !== void 0) {
      let data0 = data.function;
      if (typeof data0 === 'string') {
        if (!pattern0.test(data0)) {
          const err1 = {
            instancePath: instancePath + '/function',
            schemaPath: '#/properties/function/pattern',
            keyword: 'pattern',
            params: { pattern: '^(submitAuctionBid|buyRecord)$' },
            message: 'must match pattern "^(submitAuctionBid|buyRecord)$"',
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
      } else {
        const err2 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.name !== void 0) {
      let data1 = data.name;
      if (typeof data1 === 'string') {
        if (!pattern1.test(data1)) {
          const err3 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/pattern',
            keyword: 'pattern',
            params: {
              pattern:
                '^([a-zA-Z0-9][a-zA-Z0-9-]{0,49}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
            },
            message:
              'must match pattern "^([a-zA-Z0-9][a-zA-Z0-9-]{0,49}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$"',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.qty !== void 0) {
      let data2 = data.qty;
      if (typeof data2 == 'number' && isFinite(data2)) {
        if (data2 < 0 || isNaN(data2)) {
          const err5 = {
            instancePath: instancePath + '/qty',
            schemaPath: '#/properties/qty/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + '/qty',
          schemaPath: '#/properties/qty/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.type !== void 0) {
      let data3 = data.type;
      if (typeof data3 === 'string') {
        if (!pattern2.test(data3)) {
          const err7 = {
            instancePath: instancePath + '/type',
            schemaPath: '#/properties/type/pattern',
            keyword: 'pattern',
            params: { pattern: '^(lease|permabuy)$' },
            message: 'must match pattern "^(lease|permabuy)$"',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/type',
          schemaPath: '#/properties/type/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.contractTxId !== void 0) {
      let data4 = data.contractTxId;
      if (typeof data4 === 'string') {
        if (!pattern3.test(data4)) {
          const err9 = {
            instancePath: instancePath + '/contractTxId',
            schemaPath: '#/properties/contractTxId/pattern',
            keyword: 'pattern',
            params: { pattern: '^(atomic|[a-zA-Z0-9-_]{43})$' },
            message: 'must match pattern "^(atomic|[a-zA-Z0-9-_]{43})$"',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/contractTxId',
          schemaPath: '#/properties/contractTxId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate10.errors = vErrors;
  return errors === 0;
}
var validateBuyRecord = validate11;
function validate11(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.name === void 0) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property 'name'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.function === void 0) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'function' },
        message: "must have required property 'function'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.function !== void 0) {
      let data0 = data.function;
      if (typeof data0 !== 'string') {
        const err2 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      if ('buyRecord' !== data0) {
        const err3 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/const',
          keyword: 'const',
          params: { allowedValue: 'buyRecord' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.name !== void 0) {
      let data1 = data.name;
      if (typeof data1 === 'string') {
        if (!pattern1.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/pattern',
            keyword: 'pattern',
            params: {
              pattern:
                '^([a-zA-Z0-9][a-zA-Z0-9-]{0,49}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
            },
            message:
              'must match pattern "^([a-zA-Z0-9][a-zA-Z0-9-]{0,49}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.contractTxId !== void 0) {
      let data2 = data.contractTxId;
      if (typeof data2 === 'string') {
        if (!pattern3.test(data2)) {
          const err6 = {
            instancePath: instancePath + '/contractTxId',
            schemaPath: '#/properties/contractTxId/pattern',
            keyword: 'pattern',
            params: { pattern: '^(atomic|[a-zA-Z0-9-_]{43})$' },
            message: 'must match pattern "^(atomic|[a-zA-Z0-9-_]{43})$"',
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/contractTxId',
          schemaPath: '#/properties/contractTxId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.years !== void 0) {
      let data3 = data.years;
      if (
        !(
          typeof data3 == 'number' &&
          !(data3 % 1) &&
          !isNaN(data3) &&
          isFinite(data3)
        )
      ) {
        const err8 = {
          instancePath: instancePath + '/years',
          schemaPath: '#/properties/years/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      if (typeof data3 == 'number' && isFinite(data3)) {
        if (data3 > 5 || isNaN(data3)) {
          const err9 = {
            instancePath: instancePath + '/years',
            schemaPath: '#/properties/years/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 5 },
            message: 'must be <= 5',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data3 < 1 || isNaN(data3)) {
          const err10 = {
            instancePath: instancePath + '/years',
            schemaPath: '#/properties/years/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      }
    }
    if (data.type !== void 0) {
      let data4 = data.type;
      if (typeof data4 === 'string') {
        if (!pattern2.test(data4)) {
          const err11 = {
            instancePath: instancePath + '/type',
            schemaPath: '#/properties/type/pattern',
            keyword: 'pattern',
            params: { pattern: '^(lease|permabuy)$' },
            message: 'must match pattern "^(lease|permabuy)$"',
          };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = {
          instancePath: instancePath + '/type',
          schemaPath: '#/properties/type/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.auction !== void 0) {
      if (typeof data.auction !== 'boolean') {
        const err13 = {
          instancePath: instancePath + '/auction',
          schemaPath: '#/properties/auction/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  validate11.errors = vErrors;
  return errors === 0;
}
var validateExtendRecord = validate12;
function validate12(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.name === void 0) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property 'name'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.years === void 0) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'years' },
        message: "must have required property 'years'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === 'function' || key0 === 'name' || key0 === 'years')) {
        const err2 = {
          instancePath,
          schemaPath: '#/additionalProperties',
          keyword: 'additionalProperties',
          params: { additionalProperty: key0 },
          message: 'must NOT have additional properties',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.function !== void 0) {
      let data0 = data.function;
      if (typeof data0 !== 'string') {
        const err3 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if ('extendRecord' !== data0) {
        const err4 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/const',
          keyword: 'const',
          params: { allowedValue: 'extendRecord' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.name !== void 0) {
      let data1 = data.name;
      if (typeof data1 === 'string') {
        if (!pattern1.test(data1)) {
          const err5 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/pattern',
            keyword: 'pattern',
            params: {
              pattern:
                '^([a-zA-Z0-9][a-zA-Z0-9-]{0,49}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
            },
            message:
              'must match pattern "^([a-zA-Z0-9][a-zA-Z0-9-]{0,49}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$"',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.years !== void 0) {
      let data2 = data.years;
      if (
        !(
          typeof data2 == 'number' &&
          !(data2 % 1) &&
          !isNaN(data2) &&
          isFinite(data2)
        )
      ) {
        const err7 = {
          instancePath: instancePath + '/years',
          schemaPath: '#/properties/years/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      if (typeof data2 == 'number' && isFinite(data2)) {
        if (data2 > 5 || isNaN(data2)) {
          const err8 = {
            instancePath: instancePath + '/years',
            schemaPath: '#/properties/years/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 5 },
            message: 'must be <= 5',
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (data2 < 1 || isNaN(data2)) {
          const err9 = {
            instancePath: instancePath + '/years',
            schemaPath: '#/properties/years/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      }
    }
  } else {
    const err10 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err10];
    } else {
      vErrors.push(err10);
    }
    errors++;
  }
  validate12.errors = vErrors;
  return errors === 0;
}
var validateIncreaseUndernameCount = validate13;
function validate13(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.name === void 0) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property 'name'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.qty === void 0) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'qty' },
        message: "must have required property 'qty'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === 'function' || key0 === 'name' || key0 === 'qty')) {
        const err2 = {
          instancePath,
          schemaPath: '#/additionalProperties',
          keyword: 'additionalProperties',
          params: { additionalProperty: key0 },
          message: 'must NOT have additional properties',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.function !== void 0) {
      let data0 = data.function;
      if (typeof data0 !== 'string') {
        const err3 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if ('increaseUndernameCount' !== data0) {
        const err4 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/const',
          keyword: 'const',
          params: { allowedValue: 'increaseUndernameCount' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.name !== void 0) {
      let data1 = data.name;
      if (typeof data1 === 'string') {
        if (!pattern1.test(data1)) {
          const err5 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/properties/name/pattern',
            keyword: 'pattern',
            params: {
              pattern:
                '^([a-zA-Z0-9][a-zA-Z0-9-]{0,49}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$',
            },
            message:
              'must match pattern "^([a-zA-Z0-9][a-zA-Z0-9-]{0,49}[a-zA-Z0-9]|[a-zA-Z0-9]{1})$"',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/properties/name/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.qty !== void 0) {
      let data2 = data.qty;
      if (typeof data2 == 'number' && isFinite(data2)) {
        if (data2 > 9990 || isNaN(data2)) {
          const err7 = {
            instancePath: instancePath + '/qty',
            schemaPath: '#/properties/qty/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 9990 },
            message: 'must be <= 9990',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (data2 < 1 || isNaN(data2)) {
          const err8 = {
            instancePath: instancePath + '/qty',
            schemaPath: '#/properties/qty/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      } else {
        const err9 = {
          instancePath: instancePath + '/qty',
          schemaPath: '#/properties/qty/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
  } else {
    const err10 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err10];
    } else {
      vErrors.push(err10);
    }
    errors++;
  }
  validate13.errors = vErrors;
  return errors === 0;
}
var validateJoinNetwork = validate14;
var schema15 = {
  $id: '#/definitions/joinNetwork',
  type: 'object',
  properties: {
    function: { type: 'string', const: 'joinNetwork' },
    qty: { type: 'number', minimum: 1 },
    fqdn: {
      type: 'string',
      pattern: '^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{1,63}$',
    },
    port: { type: 'number', minimum: 0, maximum: 65535 },
    protocol: { type: 'string', pattern: '^(http|https)$' },
    properties: { type: 'string', pattern: '^[a-zA-Z0-9_-]{43}$' },
    note: { type: 'string', pattern: '^.{1,256}$' },
    label: { type: 'string', pattern: '^.{1,64}$' },
    observerWallet: { type: 'string', pattern: '^(|[a-zA-Z0-9_-]{43})$' },
  },
  required: [
    'function',
    'qty',
    'fqdn',
    'port',
    'protocol',
    'properties',
    'note',
    'label',
  ],
  additionalProperties: false,
};
var func2 = Object.prototype.hasOwnProperty;
var pattern9 = new RegExp(
  '^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{1,63}$',
  'u',
);
var pattern10 = new RegExp('^(http|https)$', 'u');
var pattern11 = new RegExp('^[a-zA-Z0-9_-]{43}$', 'u');
var pattern12 = new RegExp('^.{1,256}$', 'u');
var pattern13 = new RegExp('^.{1,64}$', 'u');
var pattern14 = new RegExp('^(|[a-zA-Z0-9_-]{43})$', 'u');
function validate14(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.function === void 0) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'function' },
        message: "must have required property 'function'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.qty === void 0) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'qty' },
        message: "must have required property 'qty'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.fqdn === void 0) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'fqdn' },
        message: "must have required property 'fqdn'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.port === void 0) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'port' },
        message: "must have required property 'port'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.protocol === void 0) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'protocol' },
        message: "must have required property 'protocol'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.properties === void 0) {
      const err5 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'properties' },
        message: "must have required property 'properties'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.note === void 0) {
      const err6 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'note' },
        message: "must have required property 'note'",
      };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    if (data.label === void 0) {
      const err7 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'label' },
        message: "must have required property 'label'",
      };
      if (vErrors === null) {
        vErrors = [err7];
      } else {
        vErrors.push(err7);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!func2.call(schema15.properties, key0)) {
        const err8 = {
          instancePath,
          schemaPath: '#/additionalProperties',
          keyword: 'additionalProperties',
          params: { additionalProperty: key0 },
          message: 'must NOT have additional properties',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.function !== void 0) {
      let data0 = data.function;
      if (typeof data0 !== 'string') {
        const err9 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      if ('joinNetwork' !== data0) {
        const err10 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/const',
          keyword: 'const',
          params: { allowedValue: 'joinNetwork' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.qty !== void 0) {
      let data1 = data.qty;
      if (typeof data1 == 'number' && isFinite(data1)) {
        if (data1 < 1 || isNaN(data1)) {
          const err11 = {
            instancePath: instancePath + '/qty',
            schemaPath: '#/properties/qty/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
          };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = {
          instancePath: instancePath + '/qty',
          schemaPath: '#/properties/qty/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.fqdn !== void 0) {
      let data2 = data.fqdn;
      if (typeof data2 === 'string') {
        if (!pattern9.test(data2)) {
          const err13 = {
            instancePath: instancePath + '/fqdn',
            schemaPath: '#/properties/fqdn/pattern',
            keyword: 'pattern',
            params: {
              pattern: '^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{1,63}$',
            },
            message:
              'must match pattern "^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{1,63}$"',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
      } else {
        const err14 = {
          instancePath: instancePath + '/fqdn',
          schemaPath: '#/properties/fqdn/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.port !== void 0) {
      let data3 = data.port;
      if (typeof data3 == 'number' && isFinite(data3)) {
        if (data3 > 65535 || isNaN(data3)) {
          const err15 = {
            instancePath: instancePath + '/port',
            schemaPath: '#/properties/port/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 65535 },
            message: 'must be <= 65535',
          };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
        if (data3 < 0 || isNaN(data3)) {
          const err16 = {
            instancePath: instancePath + '/port',
            schemaPath: '#/properties/port/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
      } else {
        const err17 = {
          instancePath: instancePath + '/port',
          schemaPath: '#/properties/port/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.protocol !== void 0) {
      let data4 = data.protocol;
      if (typeof data4 === 'string') {
        if (!pattern10.test(data4)) {
          const err18 = {
            instancePath: instancePath + '/protocol',
            schemaPath: '#/properties/protocol/pattern',
            keyword: 'pattern',
            params: { pattern: '^(http|https)$' },
            message: 'must match pattern "^(http|https)$"',
          };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
      } else {
        const err19 = {
          instancePath: instancePath + '/protocol',
          schemaPath: '#/properties/protocol/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.properties !== void 0) {
      let data5 = data.properties;
      if (typeof data5 === 'string') {
        if (!pattern11.test(data5)) {
          const err20 = {
            instancePath: instancePath + '/properties',
            schemaPath: '#/properties/properties/pattern',
            keyword: 'pattern',
            params: { pattern: '^[a-zA-Z0-9_-]{43}$' },
            message: 'must match pattern "^[a-zA-Z0-9_-]{43}$"',
          };
          if (vErrors === null) {
            vErrors = [err20];
          } else {
            vErrors.push(err20);
          }
          errors++;
        }
      } else {
        const err21 = {
          instancePath: instancePath + '/properties',
          schemaPath: '#/properties/properties/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.note !== void 0) {
      let data6 = data.note;
      if (typeof data6 === 'string') {
        if (!pattern12.test(data6)) {
          const err22 = {
            instancePath: instancePath + '/note',
            schemaPath: '#/properties/note/pattern',
            keyword: 'pattern',
            params: { pattern: '^.{1,256}$' },
            message: 'must match pattern "^.{1,256}$"',
          };
          if (vErrors === null) {
            vErrors = [err22];
          } else {
            vErrors.push(err22);
          }
          errors++;
        }
      } else {
        const err23 = {
          instancePath: instancePath + '/note',
          schemaPath: '#/properties/note/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
    if (data.label !== void 0) {
      let data7 = data.label;
      if (typeof data7 === 'string') {
        if (!pattern13.test(data7)) {
          const err24 = {
            instancePath: instancePath + '/label',
            schemaPath: '#/properties/label/pattern',
            keyword: 'pattern',
            params: { pattern: '^.{1,64}$' },
            message: 'must match pattern "^.{1,64}$"',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
      } else {
        const err25 = {
          instancePath: instancePath + '/label',
          schemaPath: '#/properties/label/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
    }
    if (data.observerWallet !== void 0) {
      let data8 = data.observerWallet;
      if (typeof data8 === 'string') {
        if (!pattern14.test(data8)) {
          const err26 = {
            instancePath: instancePath + '/observerWallet',
            schemaPath: '#/properties/observerWallet/pattern',
            keyword: 'pattern',
            params: { pattern: '^(|[a-zA-Z0-9_-]{43})$' },
            message: 'must match pattern "^(|[a-zA-Z0-9_-]{43})$"',
          };
          if (vErrors === null) {
            vErrors = [err26];
          } else {
            vErrors.push(err26);
          }
          errors++;
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/observerWallet',
          schemaPath: '#/properties/observerWallet/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
  } else {
    const err28 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err28];
    } else {
      vErrors.push(err28);
    }
    errors++;
  }
  validate14.errors = vErrors;
  return errors === 0;
}
var validateTransferToken = validate15;
var pattern15 = new RegExp('^[a-zA-Z0-9-_]{43}$', 'u');
function validate15(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.target === void 0) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'target' },
        message: "must have required property 'target'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.qty === void 0) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'qty' },
        message: "must have required property 'qty'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === 'function' || key0 === 'target' || key0 === 'qty')) {
        const err2 = {
          instancePath,
          schemaPath: '#/additionalProperties',
          keyword: 'additionalProperties',
          params: { additionalProperty: key0 },
          message: 'must NOT have additional properties',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.function !== void 0) {
      let data0 = data.function;
      if (typeof data0 !== 'string') {
        const err3 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if ('transfer' !== data0) {
        const err4 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/const',
          keyword: 'const',
          params: { allowedValue: 'transfer' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.target !== void 0) {
      let data1 = data.target;
      if (typeof data1 === 'string') {
        if (!pattern15.test(data1)) {
          const err5 = {
            instancePath: instancePath + '/target',
            schemaPath: '#/properties/target/pattern',
            keyword: 'pattern',
            params: { pattern: '^[a-zA-Z0-9-_]{43}$' },
            message: 'must match pattern "^[a-zA-Z0-9-_]{43}$"',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + '/target',
          schemaPath: '#/properties/target/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.qty !== void 0) {
      let data2 = data.qty;
      if (typeof data2 == 'number' && isFinite(data2)) {
        if (data2 < 1 || isNaN(data2)) {
          const err7 = {
            instancePath: instancePath + '/qty',
            schemaPath: '#/properties/qty/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/qty',
          schemaPath: '#/properties/qty/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
  } else {
    const err9 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate15.errors = vErrors;
  return errors === 0;
}
var validateSaveObservations = validate16;
function validate16(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data } = {},
) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.failedGateways === void 0) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'failedGateways' },
        message: "must have required property 'failedGateways'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.observerReportTxId === void 0) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'observerReportTxId' },
        message: "must have required property 'observerReportTxId'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (
        !(
          key0 === 'function' ||
          key0 === 'observerReportTxId' ||
          key0 === 'failedGateways'
        )
      ) {
        const err2 = {
          instancePath,
          schemaPath: '#/additionalProperties',
          keyword: 'additionalProperties',
          params: { additionalProperty: key0 },
          message: 'must NOT have additional properties',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.function !== void 0) {
      let data0 = data.function;
      if (typeof data0 !== 'string') {
        const err3 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if ('saveObservations' !== data0) {
        const err4 = {
          instancePath: instancePath + '/function',
          schemaPath: '#/properties/function/const',
          keyword: 'const',
          params: { allowedValue: 'saveObservations' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.observerReportTxId !== void 0) {
      let data1 = data.observerReportTxId;
      if (typeof data1 === 'string') {
        if (!pattern15.test(data1)) {
          const err5 = {
            instancePath: instancePath + '/observerReportTxId',
            schemaPath: '#/properties/observerReportTxId/pattern',
            keyword: 'pattern',
            params: { pattern: '^[a-zA-Z0-9-_]{43}$' },
            message: 'must match pattern "^[a-zA-Z0-9-_]{43}$"',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + '/observerReportTxId',
          schemaPath: '#/properties/observerReportTxId/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.failedGateways !== void 0) {
      let data2 = data.failedGateways;
      if (Array.isArray(data2)) {
        if (data2.length < 0) {
          const err7 = {
            instancePath: instancePath + '/failedGateways',
            schemaPath: '#/properties/failedGateways/minItems',
            keyword: 'minItems',
            params: { limit: 0 },
            message: 'must NOT have fewer than 0 items',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (typeof data3 === 'string') {
            if (!pattern15.test(data3)) {
              const err8 = {
                instancePath: instancePath + '/failedGateways/' + i0,
                schemaPath: '#/properties/failedGateways/items/pattern',
                keyword: 'pattern',
                params: { pattern: '^[a-zA-Z0-9-_]{43}$' },
                message: 'must match pattern "^[a-zA-Z0-9-_]{43}$"',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
          } else {
            const err9 = {
              instancePath: instancePath + '/failedGateways/' + i0,
              schemaPath: '#/properties/failedGateways/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        let i1 = data2.length;
        let j0;
        if (i1 > 1) {
          const indices0 = {};
          for (; i1--; ) {
            let item0 = data2[i1];
            if (typeof item0 !== 'string') {
              continue;
            }
            if (typeof indices0[item0] == 'number') {
              j0 = indices0[item0];
              const err10 = {
                instancePath: instancePath + '/failedGateways',
                schemaPath: '#/properties/failedGateways/uniqueItems',
                keyword: 'uniqueItems',
                params: { i: i1, j: j0 },
                message:
                  'must NOT have duplicate items (items ## ' +
                  j0 +
                  ' and ' +
                  i1 +
                  ' are identical)',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
              break;
            }
            indices0[item0] = i1;
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/failedGateways',
          schemaPath: '#/properties/failedGateways/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
  }
  validate16.errors = vErrors;
  return errors === 0;
}

// src/actions/write/submitAuctionBid.ts
var AuctionBid = class {
  name;
  qty;
  type;
  contractTxId;
  years;
  constructor(input) {
    if (!validateAuctionBid(input)) {
      throw new ContractError(
        getInvalidAjvMessage(validateAuctionBid, input, 'auctionBid'),
      );
    }
    const {
      name,
      qty,
      type = 'lease',
      contractTxId = RESERVED_ATOMIC_TX_ID,
    } = input;
    this.name = name.trim().toLowerCase();
    this.qty = qty;
    this.type = type;
    this.contractTxId =
      contractTxId === RESERVED_ATOMIC_TX_ID
        ? SmartWeave.transaction.id
        : contractTxId;
    if (this.type === 'lease') {
      this.years = 1;
    }
  }
};
var submitAuctionBid = (state, { caller, input }) => {
  const updatedBalances = {
    [SmartWeave.contract.id]: state.balances[SmartWeave.contract.id] || 0,
    [caller]: state.balances[caller] || 0,
  };
  const updatedRecords = {};
  const { name, qty: submittedBid, type, contractTxId } = new AuctionBid(input);
  const currentBlockTimestamp = new BlockTimestamp(+SmartWeave.block.timestamp);
  const currentBlockHeight = new BlockHeight(+SmartWeave.block.height);
  assertAvailableRecord({
    caller,
    name,
    records: state.records,
    reserved: state.reserved,
    currentBlockTimestamp,
  });
  if (state.auctions[name]) {
    const existingAuction = state.auctions[name];
    updatedBalances[existingAuction.initiator] =
      state.balances[existingAuction.initiator] || 0;
    if (currentBlockHeight.valueOf() > existingAuction.endHeight) {
      throw new ContractError(ARNS_NAME_AUCTION_EXPIRED_MESSAGE);
    }
    const currentRequiredMinimumBid = calculateMinimumAuctionBid({
      startHeight: new BlockHeight(existingAuction.startHeight),
      startPrice: existingAuction.startPrice,
      floorPrice: existingAuction.floorPrice,
      currentBlockHeight,
      decayRate: existingAuction.settings.decayRate,
      decayInterval: existingAuction.settings.decayInterval,
    });
    if (submittedBid && submittedBid < currentRequiredMinimumBid.valueOf()) {
      throw new ContractError(
        `The bid (${submittedBid} IO) is less than the current required minimum bid of ${currentRequiredMinimumBid.valueOf()} IO.`,
      );
    }
    const finalBidForCaller = calculateExistingAuctionBidForCaller({
      auction: existingAuction,
      submittedBid,
      caller,
      requiredMinimumBid: currentRequiredMinimumBid,
    });
    if (
      !walletHasSufficientBalance(
        state.balances,
        caller,
        finalBidForCaller.valueOf(),
      )
    ) {
      throw new ContractError(INSUFFICIENT_FUNDS_MESSAGE);
    }
    const endTimestamp = getEndTimestampForAuction({
      auction: existingAuction,
      currentBlockTimestamp,
    });
    updatedRecords[name] = {
      contractTxId,
      // only update the new contract tx id
      type: existingAuction.type,
      startTimestamp: +SmartWeave.block.timestamp,
      // overwrite initial start timestamp
      undernames: DEFAULT_UNDERNAME_COUNT,
      // only include timestamp on lease, endTimestamp is easy in this situation since it was a second interaction that won it
      ...(endTimestamp && {
        endTimestamp: endTimestamp.valueOf(),
      }),
      purchasePrice: currentRequiredMinimumBid.valueOf(),
      // the total amount paid for the name
    };
    incrementBalance(
      updatedBalances,
      SmartWeave.contract.id,
      currentRequiredMinimumBid.valueOf(),
    );
    unsafeDecrementBalance(
      updatedBalances,
      caller,
      finalBidForCaller.valueOf(),
      false,
    );
    if (caller !== existingAuction.initiator) {
      incrementBalance(
        updatedBalances,
        existingAuction.initiator,
        existingAuction.floorPrice,
      );
    }
    const balances2 = {
      ...state.balances,
      ...updatedBalances,
    };
    Object.keys(updatedBalances)
      .filter((address) => updatedBalances[address] === 0)
      .forEach((address) => delete balances2[address]);
    const records = {
      ...state.records,
      ...updatedRecords,
    };
    const { [name]: _2, ...auctions2 } = state.auctions;
    Object.assign(state, {
      auctions: auctions2,
      balances: balances2,
      records,
      demandFactoring: tallyNamePurchase(
        state.demandFactoring,
        currentRequiredMinimumBid.valueOf(),
      ),
    });
    return { state };
  }
  const currentAuctionSettings = state.settings.auctions;
  const initialAuctionBid = createAuctionObject({
    name,
    type,
    fees: state.fees,
    auctionSettings: currentAuctionSettings,
    currentBlockTimestamp,
    demandFactoring: state.demandFactoring,
    currentBlockHeight,
    initiator: caller,
    contractTxId,
  });
  if (
    !walletHasSufficientBalance(
      state.balances,
      caller,
      initialAuctionBid.floorPrice,
    )
  ) {
    throw new ContractError(INSUFFICIENT_FUNDS_MESSAGE);
  }
  unsafeDecrementBalance(
    updatedBalances,
    caller,
    initialAuctionBid.floorPrice,
    false,
  );
  const { [name]: _, ...reserved } = state.reserved;
  const auctions = {
    ...state.auctions,
    [name]: initialAuctionBid,
  };
  const balances = {
    ...state.balances,
    ...updatedBalances,
  };
  Object.keys(updatedBalances)
    .filter((address) => updatedBalances[address] === 0)
    .forEach((address) => delete balances[address]);
  Object.assign(state, {
    auctions,
    balances,
    reserved,
  });
  return { state };
};

// src/actions/write/buyRecord.ts
var BuyRecord = class {
  name;
  contractTxId;
  years;
  type;
  auction;
  qty;
  constructor(input) {
    if (!validateBuyRecord(input)) {
      throw new ContractError(
        getInvalidAjvMessage(validateBuyRecord, input, 'buyRecord'),
      );
    }
    const {
      name,
      contractTxId = RESERVED_ATOMIC_TX_ID,
      years = 1,
      type = 'lease',
      auction = false,
    } = input;
    this.name = name.trim().toLowerCase();
    this.contractTxId =
      contractTxId === RESERVED_ATOMIC_TX_ID
        ? SmartWeave.transaction.id
        : contractTxId;
    this.years = years;
    this.type = type;
    this.auction = auction;
  }
};
var buyRecord = (state, { caller, input }) => {
  const { balances, records, reserved, fees, auctions } = state;
  const { name, contractTxId, years, type, auction } = new BuyRecord(input);
  const currentBlockTimestamp = new BlockTimestamp(+SmartWeave.block.timestamp);
  if (auction) {
    return submitAuctionBid(state, {
      caller,
      input,
    });
  }
  if (auctions[name]) {
    throw new ContractError(ARNS_NAME_IN_AUCTION_MESSAGE);
  }
  assertAvailableRecord({
    caller,
    name,
    records,
    reserved,
    currentBlockTimestamp,
  });
  if (isNameRequiredToBeAuction({ name, type })) {
    throw new ContractError(ARNS_NAME_MUST_BE_AUCTIONED_MESSAGE);
  }
  const endTimestamp =
    type === 'lease'
      ? currentBlockTimestamp.valueOf() + SECONDS_IN_A_YEAR * years
      : void 0;
  const totalRegistrationFee = calculateRegistrationFee({
    name,
    fees,
    years,
    type,
    currentBlockTimestamp,
    demandFactoring: state.demandFactoring,
  });
  if (!walletHasSufficientBalance(balances, caller, totalRegistrationFee)) {
    throw new ContractError(
      `Caller balance not high enough to purchase this name for ${totalRegistrationFee} token(s)!`,
    );
  }
  safeTransfer({
    balances,
    fromAddr: caller,
    toAddr: SmartWeave.contract.id,
    qty: totalRegistrationFee,
  });
  records[name] = {
    contractTxId,
    type,
    startTimestamp: +SmartWeave.block.timestamp,
    undernames: DEFAULT_UNDERNAME_COUNT,
    purchasePrice: totalRegistrationFee,
    // only include timestamp on lease
    ...(endTimestamp && { endTimestamp }),
  };
  if (reserved[name]) {
    delete state.reserved[name];
  }
  state.demandFactoring = tallyNamePurchase(
    state.demandFactoring,
    totalRegistrationFee,
  );
  return { state };
};

// src/actions/write/extendRecord.ts
var ExtendRecord = class {
  function = 'extendRecord';
  name;
  years;
  constructor(input) {
    if (!validateExtendRecord(input)) {
      throw new ContractError(
        getInvalidAjvMessage(validateExtendRecord, input, 'extendRecord'),
      );
    }
    const { name, years } = input;
    this.name = name.trim().toLowerCase();
    this.years = years;
  }
};
var extendRecord = async (state, { caller, input }) => {
  const { balances, records, fees } = state;
  const currentBlockTimestamp = new BlockTimestamp(+SmartWeave.block.timestamp);
  const { name, years } = new ExtendRecord(input);
  const record = records[name];
  if (
    !balances[caller] ||
    balances[caller] == void 0 ||
    balances[caller] == null ||
    isNaN(balances[caller])
  ) {
    throw new ContractError(INSUFFICIENT_FUNDS_MESSAGE);
  }
  assertRecordCanBeExtended({
    record,
    currentBlockTimestamp,
    years,
  });
  const demandFactor = state.demandFactoring.demandFactor;
  const totalExtensionAnnualFee =
    demandFactor *
    calculateAnnualRenewalFee({
      name,
      fees,
      years,
    });
  if (!walletHasSufficientBalance(balances, caller, totalExtensionAnnualFee)) {
    throw new ContractError(INSUFFICIENT_FUNDS_MESSAGE);
  }
  safeTransfer({
    balances: state.balances,
    fromAddr: caller,
    toAddr: SmartWeave.contract.id,
    qty: totalExtensionAnnualFee,
  });
  state.records[name].endTimestamp += SECONDS_IN_A_YEAR * years;
  state.demandFactoring = tallyNamePurchase(
    state.demandFactoring,
    totalExtensionAnnualFee,
  );
  return { state };
};
function assertRecordCanBeExtended({ record, currentBlockTimestamp, years }) {
  if (
    !isExistingActiveRecord({
      record,
      currentBlockTimestamp,
    })
  ) {
    if (!record) {
      throw new ContractError(ARNS_NAME_DOES_NOT_EXIST_MESSAGE);
    }
    throw new ContractError(
      `This name has expired and must renewed before its undername support can be extended.`,
    );
  }
  if (record.type === 'permabuy') {
    throw new ContractError(INVALID_NAME_EXTENSION_TYPE_MESSAGE);
  }
  if (
    years >
    getMaxAllowedYearsExtensionForRecord({ currentBlockTimestamp, record })
  ) {
    throw new ContractError(INVALID_YEARS_MESSAGE);
  }
}

// src/actions/write/increaseUndernameCount.ts
var IncreaseUndernameCount = class {
  function = 'increaseUndernameCount';
  name;
  qty;
  constructor(input) {
    if (!validateIncreaseUndernameCount(input)) {
      throw new ContractError(
        getInvalidAjvMessage(
          validateIncreaseUndernameCount,
          input,
          'increaseUndernameCount',
        ),
      );
    }
    const { name, qty } = input;
    this.name = name.trim().toLowerCase();
    this.qty = qty;
  }
};
var increaseUndernameCount = async (state, { caller, input }) => {
  const { name, qty } = new IncreaseUndernameCount(input);
  const { balances, records } = state;
  const record = records[name];
  const currentBlockTimestamp = new BlockTimestamp(+SmartWeave.block.timestamp);
  assertRecordCanIncreaseUndernameCount({
    record,
    qty,
    currentBlockTimestamp,
  });
  const { endTimestamp, type, undernames: existingUndernames } = record;
  const yearsRemaining = endTimestamp
    ? calculateYearsBetweenTimestamps({
        startTimestamp: currentBlockTimestamp,
        endTimestamp: new BlockTimestamp(endTimestamp),
      })
    : PERMABUY_LEASE_FEE_LENGTH;
  const incrementedUndernames = existingUndernames + qty;
  const additionalUndernameCost = calculateUndernameCost({
    name,
    fees: state.fees,
    increaseQty: qty,
    type,
    demandFactoring: state.demandFactoring,
    years: yearsRemaining,
  });
  if (!walletHasSufficientBalance(balances, caller, additionalUndernameCost)) {
    throw new ContractError(
      `${INSUFFICIENT_FUNDS_MESSAGE}: caller has ${balances[
        caller
      ].toLocaleString()} but needs to have ${additionalUndernameCost.toLocaleString()} to pay for this undername increase of ${qty} for ${name}.`,
    );
  }
  state.records[name].undernames = incrementedUndernames;
  safeTransfer({
    balances: state.balances,
    fromAddr: caller,
    toAddr: SmartWeave.contract.id,
    qty: additionalUndernameCost,
  });
  return { state };
};
function assertRecordCanIncreaseUndernameCount({
  record,
  qty,
  currentBlockTimestamp,
}) {
  if (
    !isExistingActiveRecord({
      record,
      currentBlockTimestamp,
    })
  ) {
    if (!record) {
      throw new ContractError(ARNS_NAME_DOES_NOT_EXIST_MESSAGE);
    }
    throw new ContractError(
      `This name has expired and must renewed before its undername support can be extended.`,
    );
  }
  if (record.undernames + qty > MAX_ALLOWED_UNDERNAMES) {
    throw new ContractError(MAX_UNDERNAME_MESSAGE);
  }
}

// src/actions/read/price.ts
function getPriceForInteraction(state, { caller, input }) {
  let fee;
  const { interactionName: _, ...parsedInput } = {
    ...input,
    function: input.interactionName,
  };
  switch (input.interactionName) {
    case 'buyRecord': {
      const { name, years, type, auction } = new BuyRecord(parsedInput);
      if (auction) {
        return getPriceForInteraction(state, {
          caller,
          input: {
            ...input,
            function: 'submitAuctionBid',
          },
        });
      }
      assertAvailableRecord({
        caller,
        name,
        records: state.records,
        reserved: state.reserved,
        currentBlockTimestamp: new BlockTimestamp(+SmartWeave.block.timestamp),
      });
      fee = calculateRegistrationFee({
        name,
        fees: state.fees,
        type,
        years,
        currentBlockTimestamp: new BlockTimestamp(+SmartWeave.block.timestamp),
        demandFactoring: state.demandFactoring,
      });
      break;
    }
    case 'submitAuctionBid': {
      const { name } = new AuctionBid(parsedInput);
      const auction = state.auctions[name];
      assertAvailableRecord({
        caller,
        name,
        records: state.records,
        reserved: state.reserved,
        currentBlockTimestamp: new BlockTimestamp(+SmartWeave.block.timestamp),
      });
      if (!auction) {
        const newAuction = createAuctionObject({
          name,
          currentBlockTimestamp: new BlockTimestamp(
            +SmartWeave.block.timestamp,
          ),
          currentBlockHeight: new BlockHeight(+SmartWeave.block.height),
          fees: state.fees,
          auctionSettings: state.settings.auctions,
          demandFactoring: state.demandFactoring,
          type: 'lease',
          initiator: caller,
          contractTxId: SmartWeave.transaction.id,
        });
        fee = newAuction.floorPrice;
        break;
      }
      const minimumAuctionBid = calculateMinimumAuctionBid({
        startHeight: new BlockHeight(auction.startHeight),
        currentBlockHeight: new BlockHeight(+SmartWeave.block.height),
        startPrice: auction.startPrice,
        floorPrice: auction.floorPrice,
        decayInterval: auction.settings.decayInterval,
        decayRate: auction.settings.decayRate,
      });
      fee = minimumAuctionBid.valueOf();
      break;
    }
    case 'extendRecord': {
      const { name, years } = new ExtendRecord(parsedInput);
      const record = state.records[name];
      assertRecordCanBeExtended({
        record,
        currentBlockTimestamp: new BlockTimestamp(+SmartWeave.block.timestamp),
        years,
      });
      fee = calculateAnnualRenewalFee({ name, years, fees: state.fees });
      break;
    }
    case 'increaseUndernameCount': {
      const { name, qty } = new IncreaseUndernameCount(parsedInput);
      const record = state.records[name];
      assertRecordCanIncreaseUndernameCount({
        record,
        qty,
        currentBlockTimestamp: new BlockTimestamp(+SmartWeave.block.timestamp),
      });
      const { endTimestamp, type } = record;
      const yearsRemaining = endTimestamp
        ? calculateYearsBetweenTimestamps({
            startTimestamp: new BlockTimestamp(+SmartWeave.block.timestamp),
            endTimestamp: new BlockTimestamp(endTimestamp),
          })
        : PERMABUY_LEASE_FEE_LENGTH;
      fee = calculateUndernameCost({
        name,
        fees: state.fees,
        type,
        years: yearsRemaining,
        increaseQty: qty,
        demandFactoring: state.demandFactoring,
      });
      break;
    }
    default:
      throw new ContractError(
        `Invalid function provided. Available options are 'buyRecord', 'extendRecord', and 'increaseUndernameCount'.`,
      );
  }
  return {
    result: {
      input,
      // TODO: make this mIO
      price: fee,
    },
  };
}

// src/actions/read/record.ts
var getRecord = async (state, { input: { name } }) => {
  const records = state.records;
  if (typeof name !== 'string') {
    throw new ContractError('Must specify the ArNS Name');
  }
  if (!(name in records)) {
    throw new ContractError('This name does not exist');
  }
  const arnsName = records[name];
  return {
    result: {
      name,
      ...arnsName,
    },
  };
};

// src/actions/write/decreaseOperatorStake.ts
var decreaseOperatorStake = async (state, { caller, input }) => {
  const { settings, gateways = {} } = state;
  const { registry: registrySettings } = settings;
  const { qty } = input;
  if (!(caller in gateways)) {
    throw new ContractError("This Gateway's wallet is not registered");
  }
  if (gateways[caller].status === NETWORK_LEAVING_STATUS) {
    throw new ContractError(
      'This Gateway is in the process of leaving the network and cannot have its stake adjusted',
    );
  }
  if (
    gateways[caller].operatorStake - qty <
    registrySettings.minNetworkJoinStakeAmount
  ) {
    throw new ContractError(
      `${qty} is not enough operator stake to maintain the minimum of ${registrySettings.minNetworkJoinStakeAmount}`,
    );
  }
  gateways[caller].operatorStake -= qty;
  gateways[caller].vaults.push({
    balance: qty,
    start: +SmartWeave.block.height,
    end:
      +SmartWeave.block.height + registrySettings.operatorStakeWithdrawLength,
  });
  state.gateways = gateways;
  return { state };
};

// src/actions/write/evolve.ts
var evolve = async (state, { caller, input: { value } }) => {
  const owner = state.owner;
  if (caller !== owner) {
    throw new ContractError(NON_CONTRACT_OWNER_MESSAGE);
  }
  state.evolve = value.toString();
  return { state };
};

// src/actions/write/evolveState.ts
var evolveState = async (state, { caller }) => {
  const owner = state.owner;
  if (caller !== owner) {
    throw new ContractError(NON_CONTRACT_OWNER_MESSAGE);
  }
  state.settings.auctions = AUCTION_SETTINGS;
  state.demandFactoring = {
    periodZeroBlockHeight: +SmartWeave.block.height,
    currentPeriod: 0,
    trailingPeriodPurchases: [0, 0, 0, 0, 0, 0, 0],
    trailingPeriodRevenues: [0, 0, 0, 0, 0, 0, 0],
    purchasesThisPeriod: 0,
    revenueThisPeriod: 0,
    demandFactor: DEMAND_FACTORING_SETTINGS.demandFactorBaseValue,
    consecutivePeriodsWithMinDemandFactor: 0,
  };
  state.lastTickedHeight = +SmartWeave.block.height;
  return { state };
};

// src/actions/write/increaseOperatorStake.ts
var increaseOperatorStake = async (state, { caller, input }) => {
  const { gateways = {}, balances } = state;
  const { qty } = input;
  if (!(caller in gateways)) {
    throw new ContractError("This Gateway's wallet is not registered");
  }
  if (gateways[caller].status === NETWORK_LEAVING_STATUS) {
    throw new ContractError(
      'This Gateway is in the process of leaving the network and cannot have its stake adjusted',
    );
  }
  if (
    !balances[caller] ||
    balances[caller] == void 0 ||
    balances[caller] == null ||
    isNaN(balances[caller])
  ) {
    throw new ContractError(`Caller balance is not defined!`);
  }
  if (balances[caller] < qty) {
    throw new ContractError(
      `Caller balance not high enough to stake ${qty} token(s)!`,
    );
  }
  unsafeDecrementBalance(state.balances, caller, qty);
  state.gateways[caller].operatorStake += qty;
  return { state };
};

// src/actions/write/joinNetwork.ts
var JoinNetwork = class {
  qty;
  fqdn;
  label;
  note;
  properties;
  protocol;
  port;
  observerWallet;
  constructor(input) {
    if (!validateJoinNetwork(input)) {
      throw new ContractError(
        getInvalidAjvMessage(validateJoinNetwork, input, 'joinNetwork'),
      );
    }
    const {
      qty,
      label,
      port,
      fqdn,
      note,
      protocol,
      properties,
      observerWallet,
    } = input;
    this.qty = qty;
    this.label = label;
    this.port = port;
    this.protocol = protocol;
    this.properties = properties;
    this.fqdn = fqdn;
    this.note = note;
    this.observerWallet = observerWallet;
  }
};
var joinNetwork = async (state, { caller, input }) => {
  const { balances, gateways = {}, settings } = state;
  const { registry: registrySettings } = settings;
  const { qty, observerWallet, ...gatewaySettings } = new JoinNetwork(input);
  if (
    !balances[caller] ||
    balances[caller] == void 0 ||
    balances[caller] == null ||
    isNaN(balances[caller])
  ) {
    throw new ContractError(`Caller balance is not defined!`);
  }
  if (balances[caller] < qty) {
    throw new ContractError(INSUFFICIENT_FUNDS_MESSAGE);
  }
  if (qty < registrySettings.minNetworkJoinStakeAmount) {
    throw new ContractError(
      `Quantity must be greater than or equal to the minimum network join stake amount ${registrySettings.minNetworkJoinStakeAmount}.`,
    );
  }
  if (caller in gateways) {
    throw new ContractError("This Gateway's wallet is already registered");
  }
  unsafeDecrementBalance(state.balances, caller, qty);
  state.gateways[caller] = {
    operatorStake: qty,
    observerWallet: observerWallet || caller,
    // if no observer wallet is provided, we add the caller by default
    vaults: [],
    settings: {
      ...gatewaySettings,
    },
    status: NETWORK_JOIN_STATUS,
    start: +SmartWeave.block.height,
    // TODO: timestamp vs. height
    end: 0,
  };
  return { state };
};

// src/actions/write/leaveNetwork.ts
var leaveNetwork = async (state, { caller }) => {
  const settings = state.settings.registry;
  const gateways = state.gateways;
  const currentBlockHeight = new BlockHeight(+SmartWeave.block.height);
  if (!gateways[caller]) {
    throw new ContractError('This target is not a registered gateway.');
  }
  if (
    !isGatewayEligibleToLeave({
      gateway: gateways[caller],
      currentBlockHeight,
      registrySettings: settings,
    })
  ) {
    throw new ContractError(
      `The gateway is not eligible to leave the network. It must be joined for a minimum of ${settings.minGatewayJoinLength} blocks and can not already be leaving the network. Current status: ${gateways[caller].status}`,
    );
  }
  const endHeight = +SmartWeave.block.height + settings.gatewayLeaveLength;
  gateways[caller].vaults.push({
    balance: gateways[caller].operatorStake,
    start: +SmartWeave.block.height,
    end: endHeight,
  });
  for (const vault of gateways[caller].vaults) {
    vault.end = endHeight;
  }
  gateways[caller].operatorStake = 0;
  gateways[caller].end = +SmartWeave.block.height + settings.gatewayLeaveLength;
  gateways[caller].status = NETWORK_LEAVING_STATUS;
  state.gateways = gateways;
  return { state };
};

// src/actions/write/saveObservations.ts
var SaveObservations = class {
  observerReportTxId;
  failedGateways;
  constructor(input) {
    if (!validateSaveObservations(input)) {
      throw new ContractError(
        getInvalidAjvMessage(
          validateSaveObservations,
          input,
          'saveObservations',
        ),
      );
    }
    const { observerReportTxId, failedGateways } = input;
    this.observerReportTxId = observerReportTxId;
    this.failedGateways = failedGateways;
  }
};
var saveObservations = async (state, { caller, input }) => {
  const { observations, gateways, settings } = state;
  const { observerReportTxId, failedGateways } = new SaveObservations(input);
  const currentEpochStartHeight = getEpochStart({
    startHeight: DEFAULT_START_HEIGHT,
    epochBlockLength: DEFAULT_EPOCH_BLOCK_LENGTH,
    height: +SmartWeave.block.height,
  });
  const observingGatewayArray = Object.entries(gateways).find(
    ([gatewayAddress, gateway]) =>
      gatewayAddress === caller || gateway.observerWallet === caller,
  );
  if (!observingGatewayArray) {
    throw new ContractError(CALLER_NOT_VALID_OBSERVER_MESSAGE);
  }
  const [observingGatewayAddress, observingGateway] = observingGatewayArray;
  if (observingGateway.start > currentEpochStartHeight) {
    throw new ContractError(CALLER_NOT_VALID_OBSERVER_MESSAGE);
  }
  const prescribedObservers2 = await getPrescribedObservers(
    gateways,
    settings.registry.minNetworkJoinStakeAmount,
    settings.registry.gatewayLeaveLength,
    currentEpochStartHeight,
  );
  if (
    !prescribedObservers2.find(
      (prescribedObserver2) =>
        prescribedObserver2.gatewayAddress === observingGatewayAddress ||
        prescribedObserver2.gatewayAddress === observingGateway.observerWallet,
    )
  ) {
    throw new ContractError(CALLER_NOT_VALID_OBSERVER_MESSAGE);
  }
  if (!observations[currentEpochStartHeight]) {
    observations[currentEpochStartHeight] = {
      failureSummaries: {},
      reports: {},
    };
  }
  for (const observedFailedGatewayAddress of failedGateways) {
    const failedGateway = gateways[observedFailedGatewayAddress];
    if (
      !failedGateway ||
      failedGateway.start > currentEpochStartHeight ||
      failedGateway.status !== NETWORK_JOIN_STATUS
    ) {
      continue;
    }
    const existingObservationInEpochForGateway =
      observations[currentEpochStartHeight].failureSummaries[
        observedFailedGatewayAddress
      ];
    if (existingObservationInEpochForGateway) {
      if (
        existingObservationInEpochForGateway.includes(observingGatewayAddress)
      ) {
        continue;
      }
      existingObservationInEpochForGateway.push(observingGatewayAddress);
      continue;
    }
    observations[currentEpochStartHeight].failureSummaries[
      observedFailedGatewayAddress
    ] = [observingGatewayAddress];
  }
  state.observations[currentEpochStartHeight].reports[observingGatewayAddress] =
    observerReportTxId;
  return { state };
};

// src/actions/write/tick.ts
function tickInternal({ currentBlockHeight, currentBlockTimestamp, state }) {
  const updatedState = state;
  const { demandFactoring: prevDemandFactoring, fees: prevFees } = state;
  Object.assign(
    updatedState,
    updateDemandFactor(currentBlockHeight, prevDemandFactoring, prevFees),
  );
  Object.assign(
    updatedState,
    tickAuctions({
      currentBlockHeight,
      currentBlockTimestamp,
      records: updatedState.records,
      auctions: updatedState.auctions,
      demandFactoring: updatedState.demandFactoring,
    }),
  );
  Object.assign(
    updatedState,
    tickGatewayRegistry({
      currentBlockHeight,
      gateways: updatedState.gateways,
      balances: updatedState.balances,
    }),
  );
  Object.assign(
    updatedState,
    tickRecords({
      currentBlockTimestamp,
      records: updatedState.records,
    }),
  );
  Object.assign(
    updatedState,
    tickReservedNames({
      currentBlockTimestamp,
      reservedNames: updatedState.reserved,
    }),
  );
  Object.assign(updatedState, {
    lastTickedHeight: currentBlockHeight.valueOf(),
  });
  return updatedState;
}
function tickRecords({ currentBlockTimestamp, records }) {
  const updatedRecords = Object.keys(records).reduce((acc, key) => {
    const record = records[key];
    if (isExistingActiveRecord({ record, currentBlockTimestamp })) {
      acc[key] = record;
    }
    return acc;
  }, {});
  return {
    records: updatedRecords,
  };
}
function tickReservedNames({ currentBlockTimestamp, reservedNames }) {
  const activeReservedNames = Object.keys(reservedNames).reduce((acc, key) => {
    const reservedName = reservedNames[key];
    if (
      isActiveReservedName({
        caller: void 0,
        reservedName,
        currentBlockTimestamp,
      })
    ) {
      acc[key] = reservedName;
    }
    return acc;
  }, {});
  return {
    reserved: activeReservedNames,
  };
}
function tickGatewayRegistry({ currentBlockHeight, gateways, balances }) {
  const updatedBalances = {};
  const updatedRegistry = Object.keys(gateways).reduce((acc, key) => {
    const gateway = gateways[key];
    if (
      isGatewayEligibleToBeRemoved({
        gateway,
        currentBlockHeight,
      })
    ) {
      if (!updatedBalances[key]) {
        updatedBalances[key] = balances[key] ?? 0;
      }
      for (const vault of gateway.vaults) {
        incrementBalance(updatedBalances, key, vault.balance);
      }
      incrementBalance(updatedBalances, key, gateway.operatorStake);
      return acc;
    }
    const updatedVaults = [];
    for (const vault of gateway.vaults) {
      if (vault.end <= currentBlockHeight.valueOf()) {
        if (!updatedBalances[key]) {
          updatedBalances[key] = balances[key] ?? 0;
        }
        incrementBalance(updatedBalances, key, vault.balance);
      } else {
        updatedVaults.push(vault);
      }
    }
    acc[key] = {
      ...gateway,
      vaults: updatedVaults,
    };
    return acc;
  }, {});
  const newBalances = Object.keys(updatedBalances).length
    ? { ...balances, ...updatedBalances }
    : balances;
  return {
    gateways: updatedRegistry,
    balances: newBalances,
  };
}
function tickAuctions({
  currentBlockHeight,
  currentBlockTimestamp,
  records,
  auctions,
  demandFactoring,
}) {
  const updatedRecords = {};
  let updatedDemandFactoring = cloneDemandFactoringData(demandFactoring);
  const updatedAuctions = Object.keys(auctions).reduce((acc, key) => {
    const auction = auctions[key];
    if (auction.endHeight >= currentBlockHeight.valueOf()) {
      acc[key] = auction;
      return acc;
    }
    const getEndTimestamp = () => {
      switch (auction.type) {
        case 'permabuy':
          return {};
        case 'lease':
          return {
            endTimestamp:
              +auction.years * SECONDS_IN_A_YEAR +
              currentBlockTimestamp.valueOf(),
          };
      }
    };
    const endTimestamp = getEndTimestamp();
    updatedRecords[key] = {
      type: auction.type,
      contractTxId: auction.contractTxId,
      startTimestamp: currentBlockTimestamp.valueOf(),
      undernames: DEFAULT_UNDERNAME_COUNT,
      ...endTimestamp,
      purchasePrice: auction.floorPrice,
    };
    updatedDemandFactoring = tallyNamePurchase(
      updatedDemandFactoring,
      auction.floorPrice,
    );
    return acc;
  }, {});
  const newRecords = Object.keys(updatedRecords).length
    ? {
        ...records,
        ...updatedRecords,
      }
    : records;
  return {
    auctions: updatedAuctions,
    records: newRecords,
    demandFactoring: updatedDemandFactoring,
  };
}
var tick = async (state) => {
  const interactionHeight = new BlockHeight(+SmartWeave.block.height);
  if (interactionHeight.valueOf() === state.lastTickedHeight) {
    return { state };
  }
  if (interactionHeight.valueOf() < state.lastTickedHeight) {
    throw new ContractError(
      `Interaction height ${interactionHeight} is less than last ticked height ${state.lastTickedHeight}`,
    );
  }
  let updatedState = {
    ...state,
  };
  for (
    let tickHeight = state.lastTickedHeight + 1;
    tickHeight <= interactionHeight.valueOf();
    tickHeight++
  ) {
    const currentBlockHeight = new BlockHeight(tickHeight);
    const safeBlock = await SmartWeave.safeArweaveGet(
      `/block/height/${tickHeight}`,
    );
    const currentBlockTimestamp = new BlockTimestamp(safeBlock.timestamp);
    updatedState = tickInternal({
      currentBlockHeight,
      currentBlockTimestamp,
      state: updatedState,
    });
  }
  return { state: updatedState };
};

// src/actions/write/transferTokens.ts
var TransferToken = class {
  target;
  qty;
  constructor(input) {
    if (!validateTransferToken(input)) {
      throw new ContractError(
        getInvalidAjvMessage(validateTransferToken, input, 'transferToken'),
      );
    }
    const { target, qty } = input;
    this.target = target;
    this.qty = qty;
  }
};
var transferTokens = async (state, { caller, input }) => {
  const { balances } = state;
  const { target, qty } = new TransferToken(input);
  safeTransfer({
    balances,
    fromAddr: caller,
    toAddr: target,
    qty,
  });
  return { state };
};

// src/actions/write/updateGatewaySettings.ts
var updateGatewaySettings = async (state, { caller, input }) => {
  const { gateways = {} } = state;
  const {
    label,
    fqdn,
    port,
    protocol,
    properties,
    note,
    status,
    observerWallet,
  } = input;
  if (!(caller in gateways)) {
    throw new ContractError('This caller does not have a registered gateway.');
  }
  if (label) {
    if (typeof label !== 'string' || label.length > MAX_GATEWAY_LABEL_LENGTH) {
      throw new ContractError('Label format not recognized.');
    } else {
      gateways[caller].settings.label = label;
    }
  }
  if (port) {
    if (!Number.isInteger(port) || port > MAX_PORT_NUMBER) {
      throw new ContractError('Invalid port number.');
    } else {
      gateways[caller].settings.port = port;
    }
  }
  if (protocol) {
    if (!(protocol === 'http' || protocol === 'https')) {
      throw new ContractError('Invalid protocol, must be http or https.');
    } else {
      gateways[caller].settings.protocol = protocol;
    }
  }
  if (fqdn) {
    const isFQDN = isValidFQDN(fqdn);
    if (typeof fqdn !== 'string' || !isFQDN) {
      throw new ContractError(
        'Please provide a fully qualified domain name to access this gateway',
      );
    } else {
      gateways[caller].settings.fqdn = fqdn;
    }
  }
  if (properties) {
    if (!isValidArweaveBase64URL(properties)) {
      throw new ContractError(
        'Invalid property.  Must be a valid Arweave transaction ID.',
      );
    } else {
      gateways[caller].settings.properties = properties;
    }
  } else if (properties === '') {
    gateways[caller].settings.properties = properties;
  }
  if (note || note === '') {
    if (typeof note !== 'string') {
      throw new ContractError('Note format not recognized.');
    }
    if (note.length > MAX_NOTE_LENGTH) {
      throw new ContractError('Note is too long.');
    } else {
      gateways[caller].settings.note = note;
    }
  }
  if (status) {
    if (!(status === NETWORK_HIDDEN_STATUS || status === NETWORK_JOIN_STATUS)) {
      throw new ContractError(
        `Invalid gateway status, must be set to ${NETWORK_HIDDEN_STATUS} or ${NETWORK_JOIN_STATUS}`,
      );
    } else {
      gateways[caller].status = status;
    }
  }
  if (observerWallet) {
    if (!isValidArweaveBase64URL(observerWallet)) {
      throw new ContractError(
        'Invalid observer wallet address.  Must be a valid Arweave Wallet Address.',
      );
    } else {
      gateways[caller].observerWallet = observerWallet;
    }
  }
  state.gateways[caller] = gateways[caller];
  return { state };
};

// src/contract.ts
async function handle(state, action) {
  const input = action.input;
  if (input.function === 'evolve') {
    return evolve(state, action);
  }
  if (input.function === 'evolveState') {
    return evolveState(state, action);
  }
  if (input.function === 'tick') {
    return tick(state);
  }
  const { state: tickedState } = await tick(state);
  switch (input.function) {
    case 'transfer':
      return transferTokens(tickedState, action);
    case 'buyRecord':
      return buyRecord(tickedState, action);
    case 'extendRecord':
      return extendRecord(tickedState, action);
    case 'increaseUndernameCount':
      return increaseUndernameCount(tickedState, action);
    case 'balance':
      return balance(tickedState, action);
    case 'record':
      return getRecord(tickedState, action);
    case 'gateway':
      return getGateway(tickedState, action);
    case 'prescribedObserver':
      return prescribedObserver(tickedState, action);
    case 'prescribedObservers':
      return prescribedObservers(tickedState, action);
    case 'gatewayTotalStake':
      return getGatewayTotalStake(tickedState, action);
    case 'gatewayRegistry':
      return getGatewayRegistry(tickedState);
    case 'rankedGatewayRegistry':
      return getRankedGatewayRegistry(tickedState);
    case 'joinNetwork':
      return joinNetwork(tickedState, action);
    case 'leaveNetwork':
      return leaveNetwork(tickedState, action);
    case 'increaseOperatorStake':
      return increaseOperatorStake(tickedState, action);
    case 'decreaseOperatorStake':
      return decreaseOperatorStake(tickedState, action);
    case 'updateGatewaySettings':
      return updateGatewaySettings(tickedState, action);
    case 'submitAuctionBid':
      return submitAuctionBid(tickedState, action);
    case 'auction':
      return getAuction(tickedState, action);
    case 'saveObservations':
      return saveObservations(tickedState, action);
    case 'priceForInteraction':
      return getPriceForInteraction(tickedState, action);
    default:
      throw new ContractError(
        `No function supplied or function not recognized: "${input.function}"`,
      );
  }
}
