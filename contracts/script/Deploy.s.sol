// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ScholarVault.sol";
import "../src/ScholarNFT.sol";
import "../test/mocks/MockUSDT.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Precompute addresses to solve circular dependency
        uint64 nonce = vm.getNonce(deployer);
        address predictedVaultAddress = vm.computeCreateAddress(deployer, nonce); // Nonce for Vault deployment (if MockUSDT is not deployed here, wait. If MockUSDT is deployed, nonce increases)
        address predictedNFTAddress = vm.computeCreateAddress(deployer, nonce + 1);
        
        // Check if we need to deploy MockUSDT
        address usdtAddr = vm.envOr("NEXT_PUBLIC_USDT_ADDRESS", address(0));
        
        if (usdtAddr == address(0)) {
            // Recompute nonces if we deploy MockUSDT first
            predictedVaultAddress = vm.computeCreateAddress(deployer, nonce + 1);
            predictedNFTAddress = vm.computeCreateAddress(deployer, nonce + 2);
            
            MockUSDT usdt = new MockUSDT(6);
            usdtAddr = address(usdt);
            console.log("Deployed MockUSDT at:", usdtAddr);
        }

        ScholarVault vault = new ScholarVault(usdtAddr, predictedNFTAddress);
        require(address(vault) == predictedVaultAddress, "Vault address mismatch");

        ScholarNFT nft = new ScholarNFT(address(vault));
        require(address(nft) == predictedNFTAddress, "NFT address mismatch");

        vm.stopBroadcast();

        console.log("ScholarVault deployed at:", address(vault));
        console.log("ScholarNFT deployed at:", address(nft));
    }
}
