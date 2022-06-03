require("dotenv").config();

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");

const MyContract = require("../build/contracts/PingPong.json");

const providerUrl = new HDWalletProvider(
  process.env.MNEMONIC,
  `https://kovan.infura.io/v3/${process.env.PROJECT_ID}`
);

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 600 });

const previousTransactions = require("../utils/etherscan.js");

module.exports = async () => {
  // Instantiate web3 in new variable
  const web3 = new Web3(providerUrl);

  // Instantiate Contract
  const contract = new web3.eth.Contract(
    MyContract.abi,
    process.env.CONTRACT_ADDRESS
  );

  try {
    // Get account
    const addresses = await web3.eth.getAccounts();

    const initialContractBlock = process.env.INITIAL_CONTRACT_BLOCK;
    const valueCachedBlock = myCache.get("block");

    // Check if block of last event has already been cached or default to initialContractBlock
    const cachedBlock =
      valueCachedBlock === undefined
        ? initialContractBlock
        : valueCachedBlock.lastEventBlockNumber;

    // Get kleros previous transactions
    const klerosPreviousTransactions = await previousTransactions(
      process.env.KLEROS_CONTRACT_ADDRESS,
      cachedBlock
    );

    // Filter past transactionHash
    const getKlerosTransactionHash = klerosPreviousTransactions.map(
      (el) => el.hash
    );

    // Get past events "Pong"
    const getPastEvents = await contract.getPastEvents("Pong", {
      fromBlock: cachedBlock,
    });

    // Get the raw data event hash from Ping transactions
    const pongFilteredPastEvents = getPastEvents.map((el) => el.raw.data);

    // Compare pong's last event raw data to check missing events from ping
    const findMissingHash = getKlerosTransactionHash.filter(
      (el) => !pongFilteredPastEvents.includes(el)
    );

    // Remove possible duplicates
    const sanitizedMissingHash = [...new Set(findMissingHash)];
    console.log("sanitizedMissingHash", sanitizedMissingHash);

    // Get lastBlocknumber to save in cache or fallback to contract deployed blockNumber
    const lastEventBlockNumber = !getPastEvents.length
      ? initialContractBlock
      : getPastEvents[getPastEvents.length - 1].blockNumber;

    // save in cache
    myCache.set("block", { lastEventBlockNumber }, 300);

    // Timer helper function
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    // Loop through sanitizedMissingHash
    // Check receipt transaction from cached block or default if transaction is not pending

    for (let i = 0; i < sanitizedMissingHash.length; i++) {
      const hashIndex = sanitizedMissingHash[i];
      // Check previous transactions if it is not pending
      const missingHashTransactionStatus =
        sanitizedMissingHash.length > 0 &&
        (await web3.eth.getTransactionReceipt(hashIndex));

      console.log("missingHashTransactionStatus", missingHashTransactionStatus);
      // Check if missing transactions and no pending transaction
      if (
        sanitizedMissingHash.length > 0 &&
        missingHashTransactionStatus.status === true
      ) {
        // Send pong event
        const pongEvent = await contract.methods
          .pong(hashIndex)
          .send({ from: addresses[0] }, async (err, res) => {
            if (err) console.log("[Error] - inside Pong loop", err);
          });

        // Get transaction receipt
        const getReceiptPongEvent = await web3.eth.getTransactionReceipt(
          pongEvent.transactionHash
        );

        // Wait for the block to be mined
        if (getReceiptPongEvent === null) await timer(10000);
        if (getReceiptPongEvent.status === true)
          console.log(`Transaction-${hashIndex}-mined`);

        // Verify transactionr receipt validity before delay the next call to 5 seconds
      }
    }
  } catch (error) {
    throw Error("Bot", error);
  }
};
