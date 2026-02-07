// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


interface IBeginUpToken {
    function mint(address to, uint256 amount) external;
}

contract BeginUpCrowdfund {
    struct Campaign {
        string title;
        uint256 goal;
        uint256 deadline;
        uint256 totalRaised;
    }

    IBeginUpToken public rewardToken;
    uint256 public campaignCount;
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    event CampaignCreated(uint256 id, string title, uint256 goal, uint256 deadline);
    event ContributionReceived(uint256 id, address contributor, uint256 amount, uint256 rewardAmount);

    constructor(address _tokenAddress) {
        rewardToken = IBeginUpToken(_tokenAddress);
    }

    function createCampaign(string memory _title, uint256 _goal, uint256 _duration) public {
        campaignCount++;
        uint256 deadline = block.timestamp + _duration;
        
        campaigns[campaignCount] = Campaign({
            title: _title,
            goal: _goal,
            deadline: deadline,
            totalRaised: 0
        });

        emit CampaignCreated(campaignCount, _title, _goal, deadline);
    }

    function contribute(uint256 _campaignId) public payable {
        Campaign storage campaign = campaigns[_campaignId];

        require(block.timestamp < campaign.deadline, "Campaign is over");
        require(msg.value > 0, "Send some ETH");

        campaign.totalRaised += msg.value;
        contributions[_campaignId][msg.sender] += msg.value;

        uint256 rewardAmount = msg.value * 1000; 

        rewardToken.mint(msg.sender, rewardAmount);

        emit ContributionReceived(_campaignId, msg.sender, msg.value, rewardAmount);
    }

    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](campaignCount);
        for (uint256 i = 1; i <= campaignCount; i++) {
            allCampaigns[i - 1] = campaigns[i];
        }
        return allCampaigns;
    }
}