const bot = require("./bot/index.js");

const run = async () => {
  try {
    console.log("Send Request");
    await bot();
  } catch (error) {
    throw Error("Global", error);
  }
};

// Run Bot every 5min
// setInterval(() => run(), 300000);
// Run Bot every 2min
setInterval(() => run(), 120000);
