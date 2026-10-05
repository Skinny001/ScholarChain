// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockUSDT {
    string public name = "Mock USDT"; string public symbol = "USDT"; uint8 public immutable decimals;
    uint256 public totalSupply; mapping(address => uint256) public balanceOf; mapping(address => mapping(address => uint256)) public allowance;
    constructor(uint8 decimals_) { decimals = decimals_; }
    function mint(address to, uint256 amount) external { balanceOf[to] += amount; totalSupply += amount; }
    function approve(address spender, uint256 amount) external returns (bool) { allowance[msg.sender][spender] = amount; return true; }
    function transfer(address to, uint256 amount) external returns (bool) { _move(msg.sender, to, amount); return true; }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) { require(allowance[from][msg.sender] >= amount, "allowance"); allowance[from][msg.sender] -= amount; _move(from, to, amount); return true; }
    function _move(address from, address to, uint256 amount) internal { require(balanceOf[from] >= amount, "balance"); balanceOf[from] -= amount; balanceOf[to] += amount; }
}
