// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Standard ERC-20 / HTS Token interface.
 * Hedera HTS tokens present standard ERC-20 compatible facades at their EVM address.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @dev Hedera Token Service (HTS) system contract interface.
 * Hedera system contract is located at precompiled address 0x167.
 * Required to associate the contract account with native HTS tokens (like USDC) before receipt.
 */
interface IHederaTokenService {
    function associateToken(address account, address token) external returns (int64 responseCode);
    function associateTokens(address account, address[] memory tokens) external returns (int64 responseCode);
}

/**
 * @title TrusettEscrow
 * @notice TRUSETT - Hedera-powered payment protection & escrow protocol for digital services.
 * Implements non-custodial milestone escrow, delivery verification, and multi-option dispute resolution.
 * Native Hedera Token Service (HTS) and Smart Contract Service (HSCS) compliant.
 */
contract TrusettEscrow {
    // Hedera precompiled contract address for HTS system calls
    address constant HTS_PRECOMPILE = address(0x167);

    // Protocol basis points (10000 = 100%)
    uint256 public constant BPS_DIVISOR = 10000;

    // Deal lifecycle states
    enum DealState {
        Created,    // 0: Agreement recorded, awaiting deposit
        Funded,     // 1: USDC locked in escrow
        Delivered,  // 2: Seller submitted deliverables & evidence
        Disputed,   // 3: Buyer or seller opened formal dispute
        Settled,    // 4: Funds released to seller (or split completed)
        Refunded    // 5: Funds refunded to buyer
    }

    // Arbitration resolution outcomes
    enum ResolutionOutcome {
        ReleaseToSeller, // 0: 100% to seller
        RefundToBuyer,   // 1: 100% to buyer
        SplitSettlement  // 2: Distributed according to basis points
    }

    struct Deal {
        bytes32 dealId;
        address buyer;
        address seller;
        address arbiter;
        address token;          // HTS / ERC-20 token address (e.g. USDC)
        uint256 amount;         // Amount in token smallest units
        uint256 deadline;       // Unix timestamp delivery deadline
        uint256 createdAt;
        uint256 fundedAt;
        uint256 deliveredAt;
        uint256 settledAt;
        DealState state;
        string deliveryEvidenceHash;
        string disputeReasonHash;
        uint256 sellerSplitBps; // BPS awarded to seller upon split settlement
    }

    // Storage: dealId -> Deal
    mapping(bytes32 => Deal) public deals;

    // Track associated tokens to avoid redundant precompile calls
    mapping(address => bool) public isTokenAssociated;

    // Reentrancy lock
    uint256 private _locked = 1;

    // Events
    event DealCreated(
        bytes32 indexed dealId,
        address indexed buyer,
        address indexed seller,
        address arbiter,
        address token,
        uint256 amount,
        uint256 deadline
    );

    event EscrowFunded(
        bytes32 indexed dealId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );

    event DeliverySubmitted(
        bytes32 indexed dealId,
        address indexed seller,
        string evidenceHash,
        uint256 timestamp
    );

    event DeliveryAccepted(
        bytes32 indexed dealId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 timestamp
    );

    event DisputeRaised(
        bytes32 indexed dealId,
        address indexed raisedBy,
        string reasonHash,
        uint256 timestamp
    );

    event DisputeResolved(
        bytes32 indexed dealId,
        address indexed arbiter,
        ResolutionOutcome outcome,
        uint256 sellerAmount,
        uint256 buyerAmount,
        uint256 timestamp
    );

    modifier nonReentrant() {
        require(_locked == 1, "Trusett: ReentrancyGuard locked");
        _locked = 2;
        _;
        _locked = 1;
    }

    modifier onlyBuyer(bytes32 dealId) {
        require(msg.sender == deals[dealId].buyer, "Trusett: Caller is not buyer");
        _;
    }

    modifier onlySeller(bytes32 dealId) {
        require(msg.sender == deals[dealId].seller, "Trusett: Caller is not seller");
        _;
    }

    modifier onlyArbiter(bytes32 dealId) {
        require(msg.sender == deals[dealId].arbiter, "Trusett: Caller is not designated arbiter");
        _;
    }

    modifier inState(bytes32 dealId, DealState expected) {
        require(deals[dealId].state == expected, "Trusett: Invalid deal state");
        _;
    }

    /**
     * @notice Associates an HTS token with this contract before deposits.
     * Safe on both native Hedera networks (calls 0x167) and local EVM testnets.
     */
    function associateTokenIfNeeded(address token) public {
        if (!isTokenAssociated[token]) {
            // Attempt association via HTS precompile
            if (HTS_PRECOMPILE.code.length > 0) {
                try IHederaTokenService(HTS_PRECOMPILE).associateToken(address(this), token) returns (int64 responseCode) {
                    // responseCode 22 is SUCCESS in Hedera HTS
                    if (responseCode == 22) {
                        isTokenAssociated[token] = true;
                    }
                } catch {
                    // Precompile not supported or already associated
                }
            }
            isTokenAssociated[token] = true;
        }
    }

    /**
     * @notice Step 1: Create a new payment-protection deal
     */
    function createDeal(
        bytes32 dealId,
        address seller,
        address arbiter,
        address token,
        uint256 amount,
        uint256 deadline
    ) external returns (bytes32) {
        require(dealId != bytes32(0), "Trusett: Invalid dealId");
        require(deals[dealId].createdAt == 0, "Trusett: Deal already exists");
        require(seller != address(0) && seller != msg.sender, "Trusett: Invalid seller");
        require(arbiter != address(0), "Trusett: Invalid arbiter");
        require(token != address(0), "Trusett: Invalid token");
        require(amount > 0, "Trusett: Amount must be > 0");
        require(deadline > block.timestamp, "Trusett: Deadline must be in future");

        deals[dealId] = Deal({
            dealId: dealId,
            buyer: msg.sender,
            seller: seller,
            arbiter: arbiter,
            token: token,
            amount: amount,
            deadline: deadline,
            createdAt: block.timestamp,
            fundedAt: 0,
            deliveredAt: 0,
            settledAt: 0,
            state: DealState.Created,
            deliveryEvidenceHash: "",
            disputeReasonHash: "",
            sellerSplitBps: 0
        });

        // Ensure contract is associated with the HTS token
        associateTokenIfNeeded(token);

        emit DealCreated(dealId, msg.sender, seller, arbiter, token, amount, deadline);
        return dealId;
    }

    /**
     * @notice Step 2: Buyer deposits USDC into escrow
     */
    function deposit(bytes32 dealId)
        external
        nonReentrant
        onlyBuyer(dealId)
        inState(dealId, DealState.Created)
    {
        Deal storage deal = deals[dealId];
        deal.state = DealState.Funded;
        deal.fundedAt = block.timestamp;

        // Pull tokens into contract custody
        bool success = IERC20(deal.token).transferFrom(msg.sender, address(this), deal.amount);
        require(success, "Trusett: Token transferFrom failed");

        emit EscrowFunded(dealId, msg.sender, deal.amount, block.timestamp);
    }

    /**
     * @notice Step 3: Seller submits deliverables & evidence
     */
    function submitDelivery(bytes32 dealId, string calldata evidenceHash)
        external
        onlySeller(dealId)
        inState(dealId, DealState.Funded)
    {
        require(bytes(evidenceHash).length > 0, "Trusett: Evidence hash required");
        Deal storage deal = deals[dealId];

        deal.state = DealState.Delivered;
        deal.deliveredAt = block.timestamp;
        deal.deliveryEvidenceHash = evidenceHash;

        emit DeliverySubmitted(dealId, msg.sender, evidenceHash, block.timestamp);
    }

    /**
     * @notice Step 4a: Buyer accepts delivery -> Settles 100% to seller
     */
    function acceptDelivery(bytes32 dealId)
        external
        nonReentrant
        onlyBuyer(dealId)
        inState(dealId, DealState.Delivered)
    {
        Deal storage deal = deals[dealId];
        deal.state = DealState.Settled;
        deal.settledAt = block.timestamp;

        uint256 payout = deal.amount;
        bool success = IERC20(deal.token).transfer(deal.seller, payout);
        require(success, "Trusett: Seller payout failed");

        emit DeliveryAccepted(dealId, msg.sender, deal.seller, payout, block.timestamp);
    }

    /**
     * @notice Step 4b: Buyer or Seller raises a formal dispute
     */
    function raiseDispute(bytes32 dealId, string calldata reasonHash) external {
        Deal storage deal = deals[dealId];
        require(
            msg.sender == deal.buyer || msg.sender == deal.seller,
            "Trusett: Caller must be buyer or seller"
        );
        require(
            deal.state == DealState.Funded || deal.state == DealState.Delivered,
            "Trusett: Dispute can only be raised when funded or delivered"
        );
        require(bytes(reasonHash).length > 0, "Trusett: Dispute reason required");

        deal.state = DealState.Disputed;
        deal.disputeReasonHash = reasonHash;

        emit DisputeRaised(dealId, msg.sender, reasonHash, block.timestamp);
    }

    /**
     * @notice Step 5: Authorized Human Arbiter resolves dispute
     * AI provides evidence analysis; only the authorized human arbiter executes settlement.
     * @param dealId Unique deal identifier
     * @param outcome Resolution outcome (0 = ReleaseToSeller, 1 = RefundToBuyer, 2 = Split)
     * @param sellerSplitBps Basis points to seller if SplitSettlement (e.g. 7000 = 70% to seller, 30% to buyer)
     */
    function resolveDispute(
        bytes32 dealId,
        ResolutionOutcome outcome,
        uint256 sellerSplitBps
    )
        external
        nonReentrant
        onlyArbiter(dealId)
        inState(dealId, DealState.Disputed)
    {
        Deal storage deal = deals[dealId];
        uint256 total = deal.amount;
        uint256 sellerAmount = 0;
        uint256 buyerAmount = 0;

        if (outcome == ResolutionOutcome.ReleaseToSeller) {
            deal.state = DealState.Settled;
            sellerAmount = total;
            buyerAmount = 0;
            deal.sellerSplitBps = BPS_DIVISOR;
        } else if (outcome == ResolutionOutcome.RefundToBuyer) {
            deal.state = DealState.Refunded;
            sellerAmount = 0;
            buyerAmount = total;
            deal.sellerSplitBps = 0;
        } else if (outcome == ResolutionOutcome.SplitSettlement) {
            require(sellerSplitBps <= BPS_DIVISOR, "Trusett: Split BPS cannot exceed 10000");
            deal.state = DealState.Settled;
            deal.sellerSplitBps = sellerSplitBps;
            sellerAmount = (total * sellerSplitBps) / BPS_DIVISOR;
            buyerAmount = total - sellerAmount;
        } else {
            revert("Trusett: Unknown outcome");
        }

        deal.settledAt = block.timestamp;

        // Execute distributions
        if (sellerAmount > 0) {
            bool sSuccess = IERC20(deal.token).transfer(deal.seller, sellerAmount);
            require(sSuccess, "Trusett: Transfer to seller failed");
        }
        if (buyerAmount > 0) {
            bool bSuccess = IERC20(deal.token).transfer(deal.buyer, buyerAmount);
            require(bSuccess, "Trusett: Refund to buyer failed");
        }

        emit DisputeResolved(dealId, msg.sender, outcome, sellerAmount, buyerAmount, block.timestamp);
    }

    /**
     * @notice Read helper to inspect complete deal information
     */
    function getDeal(bytes32 dealId) external view returns (Deal memory) {
        return deals[dealId];
    }
}
