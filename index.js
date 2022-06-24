const bot = require("./bot/index.js");

const run = async () => {
  try {
    await bot();
  } catch (error) {
    throw Error("Global", error);
  }
};

// Run Bot every min
setInterval(() => run(), 60000);
