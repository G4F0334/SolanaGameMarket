import express from "express";
import {
    createGameNFT,
    createListing,
    registerGame,
    getNFTInfo,
    getTokenBalance,
    buyNFT,
    getAllNFTs,
    getFeaturedNFTs,
    purchaseNFT,
    getUserOwnedNFTs,
    getUserListedNFTs,
    listNFTForSale,
    unlistNFT,
    getNFTById,
    createUserNFT
} from "./nft.controller.js";

const router = express.Router();

// NFT операции
router.post("/create", createGameNFT);           // Создать NFT
router.post("/create-user", createUserNFT);     // Создать пользовательский NFT
router.get("/info/:mint", getNFTInfo);           // Получить информацию о NFT
router.get("/balance/:mint/:owner", getTokenBalance); // Получить баланс токенов с owner
router.get("/balance/:mint", getTokenBalance);   // Получить баланс токенов без owner

// Каталог и популярные NFT (только на продаже)
router.get("/list", getAllNFTs);                 // Получить все NFT на продаже (для каталога)
router.get("/featured", getFeaturedNFTs);        // Получить популярные NFT на продаже
router.get("/:nftId", getNFTById);               // Получить NFT по ID

// Пользовательские NFT
router.get("/user/:userAddress/owned", getUserOwnedNFTs);    // NFT в коллекции пользователя
router.get("/user/:userAddress/listed", getUserListedNFTs); // NFT пользователя на продаже

// Покупка и продажа
router.post("/purchase", purchaseNFT);           // Купить NFT
router.post("/list-for-sale", listNFTForSale);  // Выставить NFT на продажу
router.post("/unlist", unlistNFT);              // Снять NFT с продажи

// Старые эндпойнты (оставляем для совместимости)
router.post("/listing/create", createListing);   // Создать листинг
router.post("/listing/buy", buyNFT);           // Купить NFT
router.post("/game/register", registerGame);     // Зарегистрировать игру

export default router;
