// Import the ethers library to interact with the Ethereum blockchain.
const { ethers } = require("ethers");
// Import dotenv to manage environment variables securely.
require("dotenv").config();

// Create a provider using the Alchemy URL from environment variables to connect to the Ethereum network.
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL);

// Define the address of the Uniswap V3 Factory contract, which is used to interact with liquidity pools.
const addressFactory = "0x1F98431c8aD98523631AE4a59f267346ea31F984"; // UniswapV3Factory address

// Define the Application Binary Interface (ABI) of the function to interact with in the smart contract.
const abi = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
];

// Create a contract object to interact with the Uniswap V3 Factory, linking the ABI and contract address with the provider.
const contractFactory = new ethers.Contract(addressFactory, abi, provider);

// Define the Ethereum addresses for WETH and ANKR tokens to be used in the getPool function.
const addressWETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const addressANKR = "0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4";

// Asynchronously retrieve the address of the pool for the given token pair and fee tier.
const getPool = async () => {
  const addressPool = await contractFactory.getPool(
    addressWETH,
    addressANKR,
    3000 // Fee tier, typically denoting 0.3% on Uniswap V3
  );
  // Log the pool address to the console for verification.
  console.log(addressPool);
};

// Execute the function to get the pool address.
getPool();
