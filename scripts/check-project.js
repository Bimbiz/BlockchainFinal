const hre = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const CROWDFUND_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Checking", deployer.address, "---");

  const token = await hre.ethers.getContractAt("BeginUpToken", TOKEN_ADDRESS);
  const crowdfund = await hre.ethers.getContractAt(
    "BeginUpCrowdfund",
    CROWDFUND_ADDRESS,
  );

  console.log("\n1. Creating a new campaign...");
  const createTx = await crowdfund.createCampaign(
    "Test Project",
    hre.ethers.parseEther("10"),
    3600,
  );
  await createTx.wait();
  console.log("Campaign created!");

  console.log("\n2. Contributing to the campaign...");
  const contributeTx = await crowdfund.contribute(1, {
    value: hre.ethers.parseEther("1.0"),
  });
  await contributeTx.wait();
  console.log("Contribution made!");

  const balance = await token.balanceOf(deployer.address);
  console.log("\n3. Checking reward balance:");
  console.log(
    `Your BGP balance: ${hre.ethers.formatUnits(balance, 18)} tokens`,
  );

  const campaign = await crowdfund.campaigns(1);
  console.log(`\n4. Campaign status #1:`);
  console.log(
    `Got ${hre.ethers.formatEther(
      campaign.totalRaised,
    )} ETH / ${hre.ethers.formatEther(campaign.goal)} ETH`,
  );

  const allCampaigns = await crowdfund.getAllCampaigns();
  console.log(`\n5. All campaigns:`);

  allCampaigns.forEach((c, i) => {
    console.log(`Campaign ${i + 1}: ${c.title}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
