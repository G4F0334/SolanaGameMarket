import express from "express";
import * as solanaController from "./solana.controller.js";

const router = express.Router();

/**
 * 🎮 Solana API Routes для Game Marketplace
 * Управление NFT и взаимодействие с блокчейном
 */

// 🔧 Инициализация и статус
router.post("/init", solanaController.initializeSolana);
router.get("/init", solanaController.initializeSolana); // Добавляем GET для простоты тестирования
router.get("/status", solanaController.getSolanaStatus);

// 🏪 Коллекции игр
router.post("/collection", solanaController.createGameCollection);

// 🎨 NFT операции
router.post("/mint-nft", solanaController.mintItemNFT);
router.post("/list-nft", solanaController.createNFTListing);
router.get("/nft/:mint", solanaController.getNFTMetadata);

// 💰 Кошелек
router.get("/wallet/balance", solanaController.getWalletBalance);

export default router;
