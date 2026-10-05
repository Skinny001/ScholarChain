// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 { function decimals() external view returns (uint8); function transfer(address, uint256) external returns (bool); function transferFrom(address, address, uint256) external returns (bool); function balanceOf(address) external view returns (uint256); }
interface IScholarNFT { function mint(address, bytes32, string calldata) external returns (uint256); }

/// @title ScholarVault
/// @notice Escrow and milestone accounting for verified scholarships.
contract ScholarVault {
    enum Status { Active, Completed, Cancelled, Expired }
    struct Tranche { uint256 amount; bool released; }
    struct Scholarship { address student; address verifier; uint256 target; uint256 raised; uint256 withdrawn; uint64 deadline; Status status; bytes32 metadataHash; }
    struct Report { uint64 timestamp; address author; bytes32 reportHash; string uri; }

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    IERC20 public immutable token;
    IScholarNFT public immutable credential;
    address public admin;
    bool public paused;
    uint256 public nextScholarshipId;
    mapping(bytes32 => bool) private _roles;
    mapping(uint256 => Scholarship) public scholarships;
    mapping(uint256 => Tranche[]) public tranches;
    mapping(uint256 => Report[]) public reports;
    mapping(uint256 => mapping(address => uint256)) public donorContributions;

    error Unauthorized(); error Paused(); error InvalidInput(); error InvalidState(); error TransferFailed();
    event ScholarshipCreated(uint256 indexed id, address indexed student, uint256 target, uint64 deadline);
    event Donated(uint256 indexed id, address indexed donor, uint256 amount);
    event ReportSubmitted(uint256 indexed id, bytes32 reportHash, string uri);
    event TrancheReleased(uint256 indexed id, uint256 indexed tranche, uint256 amount);
    event ScholarshipCancelled(uint256 indexed id);
    event PausedStateChanged(bool paused_);

    modifier onlyAdmin() { if (msg.sender != admin) revert Unauthorized(); _; }
    modifier onlyVerifier() { if (!_roles[VERIFIER_ROLE] && msg.sender != admin) revert Unauthorized(); _; }
    modifier whenActive(uint256 id) { if (paused) revert Paused(); if (scholarships[id].status != Status.Active) revert InvalidState(); _; }

    constructor(address token_, address credential_) { admin = msg.sender; token = IERC20(token_); credential = IScholarNFT(credential_); _roles[ADMIN_ROLE] = true; }
    function grantVerifier(address verifier) external onlyAdmin { if (verifier == address(0)) revert InvalidInput(); _roles[keccak256(abi.encode(VERIFIER_ROLE, verifier))] = true; }
    function revokeVerifier(address verifier) external onlyAdmin { delete _roles[keccak256(abi.encode(VERIFIER_ROLE, verifier))]; }
    function isVerifier(address verifier) public view returns (bool) { return verifier == admin || _roles[keccak256(abi.encode(VERIFIER_ROLE, verifier))]; }
    function createScholarship(address student, uint256 target, uint64 deadline, uint256[] calldata trancheAmounts, bytes32 metadataHash) external onlyVerifier returns (uint256 id) { if (student == address(0) || target == 0 || deadline <= block.timestamp || trancheAmounts.length == 0) revert InvalidInput(); uint256 total; for (uint256 i; i < trancheAmounts.length; i++) total += trancheAmounts[i]; if (total != target) revert InvalidInput(); id = nextScholarshipId++; scholarships[id] = Scholarship(student, msg.sender, target, 0, 0, deadline, Status.Active, metadataHash); for (uint256 i; i < trancheAmounts.length; i++) tranches[id].push(Tranche(trancheAmounts[i], false)); emit ScholarshipCreated(id, student, target, deadline); }
    function donate(uint256 id, uint256 amount) external whenActive(id) { if (amount == 0 || block.timestamp > scholarships[id].deadline) revert InvalidInput(); if (!token.transferFrom(msg.sender, address(this), amount)) revert TransferFailed(); scholarships[id].raised += amount; donorContributions[id][msg.sender] += amount; emit Donated(id, msg.sender, amount); }
    function submitReport(uint256 id, bytes32 reportHash, string calldata uri) external whenActive(id) { if (msg.sender != scholarships[id].student || reportHash == bytes32(0)) revert Unauthorized(); reports[id].push(Report(uint64(block.timestamp), msg.sender, reportHash, uri)); emit ReportSubmitted(id, reportHash, uri); }
    function releaseTranche(uint256 id, uint256 trancheId) external onlyVerifier whenActive(id) { if (trancheId >= tranches[id].length) revert InvalidInput(); Tranche storage tranche = tranches[id][trancheId]; if (tranche.released || reports[id].length <= trancheId) revert InvalidState(); tranche.released = true; scholarships[id].withdrawn += tranche.amount; if (!token.transfer(scholarships[id].student, tranche.amount)) revert TransferFailed(); emit TrancheReleased(id, trancheId, tranche.amount); }
    function cancel(uint256 id) external onlyAdmin whenActive(id) { scholarships[id].status = Status.Cancelled; emit ScholarshipCancelled(id); }
    function pause(bool value) external onlyAdmin { paused = value; emit PausedStateChanged(value); }
    function reportCount(uint256 id) external view returns (uint256) { return reports[id].length; }
    function trancheCount(uint256 id) external view returns (uint256) { return tranches[id].length; }
}
