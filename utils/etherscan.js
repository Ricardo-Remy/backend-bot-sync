require("dotenv").config();

const moment = require("moment");
const axios = require("axios").default;

// Returns all transactions for block range
const fetchTransactions = async (proxyAddr, startBlock, endBlock) => {
  // Kovan api url
  try {
    // Address of contract of interest
    console.log(
      `Fetching Txs For ${proxyAddr} for blocks: ${startBlock}-${endBlock}`
    );

    const URL = `https://api-kovan.etherscan.io/api?module=account&action=txlist&address=${proxyAddr}&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=${process.env.ETHERSCAN_API}`;

    const response = await axios.get(URL);

    return response.data.result;
  } catch (error) {
    throw Error("Etherscan fetchTransactions", error);
  }
};

// Uses API to retrieve block number for timestamp
const getBlockForTime = async (timestamp) => {
  try {
    // Kovan api url
    const URL = `https://api-kovan.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${process.env.ETHERSCAN_API}`;

    const response = await axios.get(URL);

    return response.data.result;
  } catch (error) {
    throw Error("Etherscan getBlockForTime", error);
  }
};

// Main script
module.exports = async (proxyAddr, startBlock) => {
  try {
    const dateNow = moment();
    const dateStart = dateNow.clone().subtract(2, "days");

    // Use api to get block numbers for timestamps

    console.log("startBlock", startBlock);
    let endBlock = Number(await getBlockForTime(dateNow.unix()));
    console.log(`Start: ${dateStart.format()} ${startBlock}`);
    console.log(`End: ${dateNow.format()} ${endBlock}`);

    let txs = [];
    // Retrieve all txs in range (for max amt) using API
    while (startBlock < endBlock) {
      let endRange = startBlock + 99999999;
      let txsRange = await fetchTransactions(proxyAddr, startBlock, endRange);
      console.log(`No of txs: ${txsRange.length}`);
      txs = txs.concat(txsRange);
      startBlock = endRange + 1;
    }

    return txs;
  } catch (error) {
    throw Error("Etherscan global exported function", error);
  }
};
