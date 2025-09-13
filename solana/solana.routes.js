import express from "express";
import * as solanaController from "./solana.controller.js";
import * as solanaWeb3Controller from "./solana-web3-controller.js";

const router = express.Router();

/**
 * 🎮 Solana API Routes для Game Marketplace
 * Управление NFT и взаимодействие с блокчейном
 */

// 🔧 Инициализация и статус (старый Umi клиент)
router.post("/init", solanaController.initializeSolana);
router.get("/init", solanaController.initializeSolana); // Добавляем GET для простоты тестирования
router.get("/status", solanaController.getSolanaStatus);

// 🏪 Коллекции игр (старый Umi клиент)
router.post("/collection", solanaController.createGameCollection);

// 🎨 NFT операции (старый Umi клиент)
router.post("/mint-nft", solanaController.mintItemNFT);
router.post("/list-nft", solanaController.createNFTListing);
router.get("/nft/:mint", solanaController.getNFTMetadata);

// 💰 Кошелек (старый Umi клиент)
router.get("/wallet/balance", solanaController.getWalletBalance);

// ✨ НОВЫЕ WEB3.JS ROUTES ✨
// 🔧 Web3 инициализация и статус
router.post("/web3/init", solanaWeb3Controller.initializeWeb3Client);
router.get("/web3/status", solanaWeb3Controller.getWeb3Status);

// 🏪 Web3 коллекции
router.post("/web3/create-collection", solanaWeb3Controller.createGameCollection);

// 🎨 Web3 NFT операции
router.post("/web3/mint-nft", solanaWeb3Controller.mintGameItemNFT);
router.post("/web3/batch-mint", solanaWeb3Controller.batchMintNFTs);
router.get("/web3/nft/:mint", solanaWeb3Controller.getNFTInfo);

// 💰 Web3 кошелек
router.get("/web3/balance", solanaWeb3Controller.getWalletBalance);
router.post("/web3/send-sol", solanaWeb3Controller.sendSOL);

export default router;
