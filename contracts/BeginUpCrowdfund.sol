// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBeginUpCrowdfund {
    function mint(address to, uint256 amount) external;
}

contract BeginUpCrowdfund {
    
    function contribute(uint256 _campaignId) public payable {
        Campaign storage campaign = campaigns[_campaignId];

        require(block.timestamp < campaign.deadline, "Campaign is over");
        require(msg.value > 0, "Send some ETH");

        campaign.totalRaised += msg.value;
        contributions[_campaignId][msg.sender] += msg.value;

        uint256 rewardAmount = msg.value * 1000; // 1 ETH = 1000 tokens
        rewartdToken.mint(msg.sender, rewardAmount);

        emit ContributionReceived(_campaignId, msg.sender, msg.valuem, rewardAmount);

    }
}