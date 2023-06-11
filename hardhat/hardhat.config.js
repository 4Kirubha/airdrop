require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.18",
  networks:{
    goerli:{
      url: "https://goerli.infura.io/v3/e9cf275f1ddc4b81aa62c5aa0b11ac0f",
      accounts: [''],
    },
  },
};