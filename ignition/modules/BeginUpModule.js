const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BeginUpModule", (m) => {
  const deployer = m.getAccount(0);
  const token = m.contract("BeginUpToken", [deployer]);
  const crowdfund = m.contract("BeginUpCrowdfund", [token]);

  m.call(token, "setMinter", [crowdfund]);
  
  return { token, crowdfund };
});