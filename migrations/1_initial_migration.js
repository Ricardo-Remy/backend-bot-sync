var Migrations = artifacts.require("./PingPong.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
