// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import { StoryProtocolGateway } from "@storyprotocol/periphery/StoryProtocolGateway.sol";
import { IStoryProtocolGateway as ISPG } from "@storyprotocol/periphery/interfaces/IStoryProtocolGateway.sol";
import { ISPGNFT } from "@storyprotocol/periphery/interfaces/ISPGNFT.sol";

/// @notice Register an NFT as an IP Account.
contract IPARegistrar {
    StoryProtocolGateway public immutable SPG;
    ISPGNFT public immutable SPG_NFT;

    // you can get the addresses for these 
    // here: https://docs.story.foundation/docs/deployed-smart-contracts
    constructor(address storyProtocolGateway) {
        SPG = StoryProtocolGateway(storyProtocolGateway);
        // Create a new NFT collection via SPG
        SPG_NFT = ISPGNFT(
            SPG.createCollection(
                ISPGNFT.InitParams({
                  name: "Test Collection",
                  symbol: "TEST",
                  baseURI: "https://test-base-uri.com/",
                  maxSupply: 1000,
                  mintFee: 0,
                  mintFeeToken: address(0),
                  mintFeeRecipient: address(this),
                  owner: address(this),
                  mintOpen: true,
                  isPublicMinting: false
                })
            )
        );
    }

  /// @notice Mint an IP NFT and register it as an IP Account via Story Protocol Gateway (periphery).
  /// @dev Requires the collection to be created via SPG (createCollection).
  function spgMintIp() external returns (address ipId, uint256 tokenId) {
        (ipId, tokenId) = SPG.mintAndRegisterIp(
            address(SPG_NFT),
            msg.sender,
            ISPG.IPMetadata({
                ipMetadataURI: "https://ipfs.io/ipfs/QmZHfQdFA2cb3ASdmeGS5K6rZjz65osUddYMURDx21bT73",
                ipMetadataHash: keccak256(
                    abi.encodePacked(
                        "{'title':'My IP Asset','description':'This is a test IP asset','ipType':'','relationships':[],'createdAt':'','watermarkImg':'https://picsum.photos/200','creators':[],'media':[],'attributes':[{'key':'Rarity','value':'Legendary'}],'tags':[]}"
                    )
                ),
                nftMetadataURI: "https://ipfs.io/ipfs/QmRL5PcK66J1mbtTZSw1nwVqrGxt98onStx6LgeHTDbEey",
                nftMetadataHash: keccak256(
                    abi.encodePacked(
                        "{'name':'Test NFT','description':'This is a test NFT','image':'https://picsum.photos/200'}"
                    )
                )
            })
        );
    }
}