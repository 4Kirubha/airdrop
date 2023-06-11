//SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20,Ownable{

    uint _totalSupply = 50000 ether; 
    uint public noOfTokens = 10 ether;
    bool public airDropStarted;
    mapping(uint => bool) public claimed;
    uint256 public airDropID; 
    address[] public nftHolders;

    constructor()ERC20("Nuthan","NTH"){}

    function mintAirDrop(address[] calldata holders) public onlyOwner{
        airDropStarted = true;
        require(totalSupply() <= _totalSupply,"All tokens were minted");
        airDropID = airDropID + 1;
        for(uint i = 0 ; i < holders.length;i++){
            if(!claimed[i]){
                claimed[i] = true;
                _mint(holders[i],noOfTokens);
            emit Transfer(address(0),holders[i],noOfTokens);
            }
        }
    }
}