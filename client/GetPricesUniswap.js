// https://docs.uniswap.org/protocol/reference/deployments

const { ethers } = require("ethers");
require("dotenv").config();

// Import the ABI (Application Binary Interface) for the Uniswap V3 Quoter contract
const {
  abi: QuoterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");

// Initialize the provider using a JSON-RPC URL from Alchemy, specified in the .env file
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL);

// Function to get the price quote for swapping an exact amount of one token for another
async function getPrice(addressFrom, addressTo, amountInHuman) {
  try {
    // Address of the Uniswap V3 Quoter contract
    const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"; // Uniswap V3 Quoter address

    // Create an instance of the Quoter contract
    const quoterContract = new ethers.Contract(
      quoterAddress,
      QuoterABI,
      provider
    );

    // Convert the human-readable input amount to the smallest unit (USDC has 6 decimals)
    const amountIn = ethers.utils.parseUnits(amountInHuman, 6);

    // Call the quoteExactInputSingle function to get the expected output amount
    const quoteAmountOut =
      await quoterContract.callStatic.quoteExactInputSingle(
        addressFrom, // Address of the input token (USDC)
        addressTo, // Address of the output token (WETH)
        3000, // Fee tier (0.3% fee)
        amountIn.toString(), // Amount of input tokens in the smallest unit, as a string
        0 // Price limit set to 0 to use the current pool price
      );

    // Convert the output amount to a human-readable format (WETH has 18 decimals)
    const amountOutHuman = ethers.utils.formatUnits(
      quoteAmountOut.toString(),
      18
    );
    return amountOutHuman; // Return the formatted output amount
  } catch (error) {
    console.error("Error getting price quote:", error);
    throw error;
  }
}

// Main function to execute the price quote
const main = async () => {
  const addressFrom = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC address
  const addressTo = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH address
  const amountInHuman = "2900"; // Input amount in human-readable format

  try {
    // Get the price quote for swapping the specified amount
    const amountOut = await getPrice(addressFrom, addressTo, amountInHuman);
    console.log(`Amount out for ${amountInHuman} USDC: ${amountOut} WETH`); // Output the amount received from the swap
  } catch (error) {
    console.error("Failed to get price quote:", error);
  }
};

main(); // Call the main function to execute the process
