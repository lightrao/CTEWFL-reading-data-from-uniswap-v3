// Import the ethers library for interacting with the Ethereum blockchain
const { ethers } = require("ethers");
// Import the Pool class from the Uniswap V3 SDK
const { Pool } = require("@uniswap/v3-sdk");
// Import the Token class from the Uniswap SDK core utilities
const { Token } = require("@uniswap/sdk-core");
// Import the ABI for the Uniswap V3 Pool contract
const {
  abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
// Load environment variables from a .env file
require("dotenv").config();

// Create a provider connected to an Ethereum node using the Alchemy URL from environment variables
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL);

// Define the address of the specific Uniswap V3 pool contract
const poolAddress = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";

// Create an instance of the Uniswap V3 pool contract using the ethers.Contract class
const poolContract = new ethers.Contract(
  poolAddress,
  IUniswapV3PoolABI,
  provider
);

// Function to fetch immutable parameters of the pool
async function getPoolImmutables() {
  // Fetch multiple immutable parameters of the pool in parallel
  const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] =
    await Promise.all([
      poolContract.factory(), // Address of the factory contract
      poolContract.token0(), // Address of the first token in the pool
      poolContract.token1(), // Address of the second token in the pool
      poolContract.fee(), // Fee tier of the pool
      poolContract.tickSpacing(), // Tick spacing of the pool
      poolContract.maxLiquidityPerTick(), // Maximum liquidity per tick
    ]);

  // Create an object containing the immutable parameters
  const immutables = {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  };
  // Return the object
  return immutables;
}

// Function to fetch the current state of the pool
async function getPoolState() {
  // Fetch the current liquidity and slot0 state variables of the pool in parallel
  const [liquidity, slot] = await Promise.all([
    poolContract.liquidity(), // Current liquidity of the pool
    poolContract.slot0(), // State variables including current price, tick, etc.
  ]);

  // Create an object containing the current state variables of the pool
  const PoolState = {
    liquidity, // Current liquidity
    sqrtPriceX96: slot[0], // Current square root price
    tick: slot[1], // Current tick
    observationIndex: slot[2], // Observation index
    observationCardinality: slot[3], // Observation cardinality
    observationCardinalityNext: slot[4], // Next observation cardinality
    feeProtocol: slot[5], // Fee protocol
    unlocked: slot[6], // Whether the pool is unlocked
  };

  // Return the object
  return PoolState;
}

// Main function to execute the script
async function main() {
  // Fetch both immutable parameters and current state of the pool in parallel
  const [immutables, state] = await Promise.all([
    getPoolImmutables(),
    getPoolState(),
  ]);

  // Create instances of the Token class for both tokens in the pool
  const TokenA = new Token(3, immutables.token0, 6, "USDC", "USD Coin"); // USDC token
  const TokenB = new Token(3, immutables.token1, 18, "WETH", "Wrapped Ether"); // Wrapped Ether token

  // Create an instance of the Pool class using the fetched parameters
  const poolExample = new Pool(
    TokenA, // Token A (USDC)
    TokenB, // Token B (WETH)
    immutables.fee, // Fee tier
    state.sqrtPriceX96.toString(), // Current square root price
    state.liquidity.toString(), // Current liquidity
    state.tick // Current tick
  );
  // Log the Pool instance to the console
  console.log(poolExample);
}

// Execute the main function
main();
