const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(); // Берет первый аккаунт из Hardhat
    
    const CROWDFUND_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const ABI = ["function createCampaign(string title, uint256 goal, uint256 duration) public"];
    
    const contract = new ethers.Contract(CROWDFUND_ADDRESS, ABI, signer);

    console.log("Создаю тестовые проекты...");
    const tx = await contract.createCampaign("Cyberpunk RPG", ethers.parseEther("10"), 3600);
    await tx.wait();
    console.log("✅ Проект создан! Теперь обнови страницу сайта.");
}

main();