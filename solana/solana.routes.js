import express from "express";
import * as solanaController from "./solana.controller.js";
import * as solanaWeb3Controller from "./solana-web3-controller.js";

const router = express.Router();

router.post("/init", solanaController.initializeSolana);
router.get("/init", solanaController.initializeSolana);
router.get("/status", solanaController.getSolanaStatus);

router.post("/collection", solanaController.createGameCollection);

router.post("/mint-nft", solanaController.mintItemNFT);
router.post("/list-nft", solanaController.createNFTListing);
router.get("/nft/:mint", solanaController.getNFTMetadata);

router.get("/wallet/balance", solanaController.getWalletBalance);

router.post("/web3/init", solanaWeb3Controller.initializeWeb3Client);
router.get("/web3/status", solanaWeb3Controller.getWeb3Status);

router.post("/web3/create-collection", solanaWeb3Controller.createGameCollection);

router.post("/web3/mint-nft", solanaWeb3Controller.mintGameItemNFT);
router.post("/web3/batch-mint", solanaWeb3Controller.batchMintNFTs);
router.get("/web3/nft/:mint", solanaWeb3Controller.getNFTInfo);

router.get("/web3/balance", solanaWeb3Controller.getWalletBalance);
router.post("/web3/send-sol", solanaWeb3Controller.sendSOL);

export default router;
