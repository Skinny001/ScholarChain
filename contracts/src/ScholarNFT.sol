// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC721Receiver {
    function onERC721Received(address, address, uint256, bytes calldata) external returns (bytes4);
}

/// @title ScholarNFT
/// @notice Non-transferable scholarship credentials issued by ScholarVault.
contract ScholarNFT {
    string public name = "ScholarChain Credential";
    string public symbol = "SCHOLAR";
    address public immutable vault;
    uint256 private _nextTokenId = 1;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => string) private _tokenUris;

    error NotVault();
    error NonTransferable();
    error TokenNotFound();

    event CredentialMinted(uint256 indexed tokenId, address indexed student, bytes32 indexed scholarshipId, string uri);

    modifier onlyVault() {
        if (msg.sender != vault) revert NotVault();
        _;
    }

    constructor(address vault_) { vault = vault_; }

    function mint(address student, bytes32 scholarshipId, string calldata uri) external onlyVault returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _owners[tokenId] = student;
        _balances[student] += 1;
        _tokenUris[tokenId] = uri;
        emit CredentialMinted(tokenId, student, scholarshipId, uri);
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        if (owner == address(0)) revert TokenNotFound();
        return owner;
    }

    function balanceOf(address owner) external view returns (uint256) { return _balances[owner]; }
    function tokenURI(uint256 tokenId) external view returns (string memory) { ownerOf(tokenId); return _tokenUris[tokenId]; }
    function approve(address, uint256) external pure { revert NonTransferable(); }
    function setApprovalForAll(address, bool) external pure { revert NonTransferable(); }
    function transferFrom(address, address, uint256) external pure { revert NonTransferable(); }
}
