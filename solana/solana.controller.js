import { umiClient } from "./umi-client.js";
import Item from "../items/item.entity.js";

export const initializeSolana = async (req, res) => {
    try {
        // Обрабатываем как POST, так и GET запросы
        const { rpcUrl, keypairPath } = req.body || {};

        await umiClient.initialize(
            rpcUrl || process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
            keypairPath || process.env.SOLANA_KEYPAIR_PATH
        );

        const balance = await umiClient.getWalletBalance();
        const isConnected = await umiClient.checkConnection();

        res.status(200).json({
            success: true,
            message: "Solana клиент успешно инициализирован",
            data: {
                wallet: umiClient.umi.identity.publicKey,
                balance: balance.balance,
                connected: isConnected,
                rpcUrl: rpcUrl || process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
            },
        });
    } catch (error) {
        console.error("❌ Ошибка инициализации Solana:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка инициализации Solana клиента",
            error: error.message,
        });
    }
};

// GET /api/solana/status - Проверка статуса подключения
export const getSolanaStatus = async (req, res) => {
    try {
        if (!umiClient.initialized) {
            return res.status(400).json({
                success: false,
                message: "Solana клиент не инициализирован",
            });
        }

        const balance = await umiClient.getWalletBalance();
        const isConnected = await umiClient.checkConnection();

        res.status(200).json({
            success: true,
            data: {
                initialized: umiClient.initialized,
                wallet: umiClient.umi.identity.publicKey,
                balance: balance.balance,
                connected: isConnected,
            },
        });
    } catch (error) {
        console.error("❌ Ошибка получения статуса:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения статуса Solana",
            error: error.message,
        });
    }
};

// POST /api/solana/collection - Создание коллекции для игры
export const createGameCollection = async (req, res) => {
    try {
        if (!umiClient.initialized) {
            return res.status(400).json({
                success: false,
                message: "Solana клиент не инициализирован",
            });
        }

        const { name, symbol, description, image, type, genre, developer } = req.body;

        if (!name || !symbol) {
            return res.status(400).json({
                success: false,
                message: "Название и символ коллекции обязательны",
            });
        }

        const gameData = {
            name,
            symbol,
            description,
            image,
            type,
            genre,
            developer,
        };

        const result = await umiClient.createGameCollection(gameData);

        if (result.success) {
            res.status(201).json({
                success: true,
                message: result.message,
                data: {
                    collectionMint: result.collectionMint,
                    metadata: result.metadata,
                },
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Ошибка создания коллекции",
                error: result.error,
            });
        }
    } catch (error) {
        console.error("❌ Ошибка создания коллекции:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка создания коллекции игры",
            error: error.message,
        });
    }
};

// POST /api/solana/mint-nft - Создание NFT для игрового предмета
export const mintItemNFT = async (req, res) => {
    try {
        if (!umiClient.initialized) {
            return res.status(400).json({
                success: false,
                message: "Solana клиент не инициализирован",
            });
        }

        const { itemId, collectionMint } = req.body;

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "ID предмета обязателен",
            });
        }

        // Получаем предмет из базы данных
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Предмет не найден",
            });
        }

        // Проверяем, что у предмета еще нет NFT
        if (item.nft) {
            return res.status(400).json({
                success: false,
                message: "У этого предмета уже есть NFT",
            });
        }

        const itemData = {
            name: item.name,
            description: item.description,
            image: item.image,
            type: item.type,
            rarity: item.rarity,
            level: item.level,
            game: item.game,
            stats: item.stats,
        };

        const result = await umiClient.createItemNFT(itemData, collectionMint);

        if (result.success) {
            // Обновляем предмет в базе данных
            await item.update({
                nft: {
                    mint: result.itemMint,
                    collectionMint: result.collectionMint,
                    metadata: result.metadata,
                    createdAt: new Date(),
                },
            });

            res.status(201).json({
                success: true,
                message: result.message,
                data: {
                    itemId: item.id,
                    itemMint: result.itemMint,
                    collectionMint: result.collectionMint,
                    metadata: result.metadata,
                },
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Ошибка создания NFT",
                error: result.error,
            });
        }
    } catch (error) {
        console.error("❌ Ошибка создания NFT:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка создания NFT предмета",
            error: error.message,
        });
    }
};

// POST /api/solana/list-nft - Создание листинга для продажи NFT
export const createNFTListing = async (req, res) => {
    try {
        if (!umiClient.initialized) {
            return res.status(400).json({
                success: false,
                message: "Solana клиент не инициализирован",
            });
        }

        const { itemId, price } = req.body;

        if (!itemId || !price) {
            return res.status(400).json({
                success: false,
                message: "ID предмета и цена обязательны",
            });
        }

        // Получаем предмет из базы данных
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Предмет не найден",
            });
        }

        if (!item.nft || !item.nft.mint) {
            return res.status(400).json({
                success: false,
                message: "У предмета нет NFT для продажи",
            });
        }

        const result = await umiClient.createListing(item.nft.mint, price);

        if (result.success) {
            // Обновляем предмет в базе данных
            await item.update({
                listing: {
                    id: result.listingId,
                    price: price,
                    seller: result.seller,
                    active: true,
                    createdAt: new Date(),
                },
            });

            res.status(201).json({
                success: true,
                message: result.message,
                data: {
                    itemId: item.id,
                    listingId: result.listingId,
                    nftMint: result.nftMint,
                    price: price,
                    seller: result.seller,
                },
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Ошибка создания листинга",
                error: result.error,
            });
        }
    } catch (error) {
        console.error("❌ Ошибка создания листинга:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка создания листинга NFT",
            error: error.message,
        });
    }
};

// GET /api/solana/nft/:mint - Получение метаданных NFT
export const getNFTMetadata = async (req, res) => {
    try {
        if (!umiClient.initialized) {
            return res.status(400).json({
                success: false,
                message: "Solana клиент не инициализирован",
            });
        }

        const { mint } = req.params;

        if (!mint) {
            return res.status(400).json({
                success: false,
                message: "Адрес mint NFT обязателен",
            });
        }

        const result = await umiClient.getNFTMetadata(mint);

        if (result.success) {
            res.status(200).json({
                success: true,
                data: {
                    mint: result.mint,
                    metadata: result.metadata,
                },
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Ошибка получения метаданных NFT",
                error: result.error,
            });
        }
    } catch (error) {
        console.error("❌ Ошибка получения метаданных:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения метаданных NFT",
            error: error.message,
        });
    }
};

// GET /api/solana/wallet/balance - Получение баланса кошелька
export const getWalletBalance = async (req, res) => {
    try {
        if (!umiClient.initialized) {
            return res.status(400).json({
                success: false,
                message: "Solana клиент не инициализирован",
            });
        }

        const result = await umiClient.getWalletBalance();

        if (result.success) {
            res.status(200).json({
                success: true,
                data: {
                    publicKey: result.publicKey,
                    balance: result.balance,
                    balanceLamports: result.balanceLamports,
                },
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Ошибка получения баланса",
                error: result.error,
            });
        }
    } catch (error) {
        console.error("❌ Ошибка получения баланса:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения баланса кошелька",
            error: error.message,
        });
    }
};
