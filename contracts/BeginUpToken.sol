// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


// Import standard ERC-20 implementation from OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Import Ownable contract to manage ownership and access control
import "@openzeppelin/contracts/access/Ownable.sol";

//Reward token contract 
contract BeginUpToken is ERC20, Ownable {
    address public minter; // Crowdfund contract address

    event MinterChanged(address indexed oldMinter, address indexed newMinter);

    constructor(address initialOwner)
        ERC20("BeginUp Reward Token", "BGP")
        Ownable(initialOwner)
    {}

    modifier onlyMinter() {
        require(msg.sender == minter, "BGP: caller is not minter");
        _;
    }

    function setMinter(address newMinter) external onlyOwner {
        require(newMinter != address(0), "BGP: zero address");
        emit MinterChanged(minter, newMinter);
        minter = newMinter;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "BGP: mint to zero");
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
