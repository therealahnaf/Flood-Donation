// requiring the contract
var fundForFloodVictims = artifacts.require("./fundForFloodVictims.sol");

// exporting as module 
 module.exports = function(deployer) {
  deployer.deploy(fundForFloodVictims);
 };
