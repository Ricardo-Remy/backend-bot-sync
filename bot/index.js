require("dotenv").config();

const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");

const MyContract = require("../build/contracts/PingPong.json");

const providerUrl = new HDWalletProvider(
  process.env.MNEMONIC,
  `https://kovan.infura.io/v3/${process.env.PROJECT_ID}`
);

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 300 });

module.exports = async () => {
  // Instantiate web3 in new variable
  const web3 = new Web3(providerUrl);

  // Instantiate Contract
  const contract = new web3.eth.Contract(
    MyContract.abi,
    process.env.KLEROS_CONTRACT_ADDRESS
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

    // Get past events "Ping"
    const getPastEventsPing = await contract.getPastEvents("Ping", {
      fromBlock: cachedBlock,
    });

    // Get past events "Pong"
    const getPastEventsPong = await contract.getPastEvents("Pong", {
      fromBlock: cachedBlock,
    });

    // Get the transaction hash of ping past events
    const pingFilteredPastEvents = getPastEventsPing.map(
      (el) => el.transactionHash
    );

    // Get the raw data event hash from Pong transactions
    const pongFilteredPastEvents = getPastEventsPong.map((el) => el.raw.data);

    // Verify pings missing hash in past pongs events
    const sanitizedMissingHash = [
      ...new Set(
        pingFilteredPastEvents.filter(
          (el) => !pongFilteredPastEvents.includes(el)
        )
      ),
    ];
    console.log("sanitizedMissingHash", sanitizedMissingHash);

    // Get lastBlocknumber to save in cache or fallback to contract deployed blockNumber

    // Get the block from the deployed contract till the last pong event

    const lastEventBlockNumber = !getPastEventsPong.length
      ? initialContractBlock
      : pongFilteredPastEvents[pongFilteredPastEvents.length - 1].blockNumber;

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
