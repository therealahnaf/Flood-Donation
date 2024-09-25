// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract fundForFloodVictims {
    address payable private accountSylhet; //fundraiser for sylhet zone
    address payable private accountChittagongSouth; //fundraiser for ctg south zone
    address payable private accountChittagongNorth; //fundraiser for ctg north zone

    struct Donor {
        //struct for donor
        string name;
        string mobile;
        bool registrationStatus;
    }

    mapping(address => Donor) private donors; //to store donor info based on eth add

    // to capture events
    event occurEvent(uint indexed _candidateId);
    uint private count;

    // fundraiser accounts with predefined addresses from ganache
    constructor() {
        accountSylhet = payable(0xeEEee2Ac81bE99e404727e74dD760A4b9E373321);
        accountChittagongSouth = payable(
            0x8a0dC8B5604292c301b410C15b5F6A965DDb0c32
        );
        accountChittagongNorth = payable(
            0x732f350E3556c44463a0F6adF8D6c4156E593B28
        );

        count = 0;
    }

    // donor registration
    function DonorRegistration(
        string memory name,
        string memory mobile
    ) public {
        address addr = msg.sender;

        require(!donors[addr].registrationStatus, "Already registered!");
        require(
            addr != accountSylhet &&
                addr != accountChittagongSouth &&
                addr != accountChittagongNorth,
            "Fundraiser account can not register as a donor."
        );
        require(bytes(name).length > 0, "Name must be provided.");
        require(bytes(mobile).length > 0, "Provide mobile number");

        donors[addr] = Donor({
            name: name,
            mobile: mobile,
            registrationStatus: true
        });

        count += 1;
        emit occurEvent(count);
    }

    // make donation
    function Donate(string memory mobile, string memory zone) public payable {
        require(
            sha256(abi.encodePacked(donors[msg.sender].mobile)) ==
                sha256(abi.encodePacked(mobile)),
            "Mobile number doesn't match!"
        );

        if (
            sha256(abi.encodePacked(zone)) == sha256(abi.encodePacked("sylhet"))
        ) {
            accountSylhet.transfer(msg.value);
        } else if (
            sha256(abi.encodePacked(zone)) ==
            sha256(abi.encodePacked("chittagong_south"))
        ) {
            accountChittagongSouth.transfer(msg.value);
        } else if (
            sha256(abi.encodePacked(zone)) ==
            sha256(abi.encodePacked("chittagong_north"))
        ) {
            accountChittagongNorth.transfer(msg.value);
        } else {
            revert("Invalid zone");
        }

        count += 1;
        emit occurEvent(count);
    }

    // total donation
    function getDonationInfo() public view returns (uint, uint, uint, uint) {
        return (
            accountSylhet.balance,
            accountChittagongSouth.balance,
            accountChittagongNorth.balance,
            accountSylhet.balance +
                accountChittagongSouth.balance +
                accountChittagongNorth.balance
        );
    }

    //donor info
    function getDonorInfo(
        address addr
    ) public view returns (string memory, string memory) {
        require(donors[addr].registrationStatus, "Invalid donor.");
        return (donors[addr].name, donors[addr].mobile);
    }
}
