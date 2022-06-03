var PingPong = artifacts.require("./PingPong.sol");

module.exports = function (deployer) {
  deployer.deploy(PingPong);
};
