import express from "express";
import {
    createGameNFT,
    createListing,
    registerGame,
    getNFTInfo,
    getTokenBalance,
    buyNFT
} from "./nft.controller.js";

const router = express.Router();

// 🎨 NFT маршруты
router.post("/create", createGameNFT);           // Создать NFT
router.get("/info/:mint", getNFTInfo);           // Получить информацию о NFT
router.get("/balance/:mint/:owner", getTokenBalance); // Получить баланс токенов с owner
router.get("/balance/:mint", getTokenBalance);   // Получить баланс токенов без owner

// 🏪 Marketplace маршруты
router.post("/listing/create", createListing);   // Создать листинг
router.post("/listing/buy", buyNFT);           // Купить NFT

// 🎮 Game маршруты
router.post("/game/register", registerGame);     // Зарегистрировать игру

export default router;
