const {ethers} = require("hardhat");

async function main() {
  const tokenContract = await ethers.getContractFactory("Token");
  const deployedTokenContract = await tokenContract.deploy();
  await deployedTokenContract.deployed();
  console.log("TOKEN ADDRESS", deployedTokenContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
