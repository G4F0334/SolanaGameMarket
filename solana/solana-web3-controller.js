import { solanaWeb3Client } from "./solana-web3-client.js";
import Item from "../items/item.entity.js";

/**
 * 🎮 Контроллер для Solana Web3.js NFT операций
 * Полная интеграция с созданием NFT и marketplace
 */

// POST /api/solana/web3/init - Инициализация Web3 клиента
export const initializeWeb3Client = async (req, res) => {
    try {
        const { 
            privateKey = "2RKCYkDs8AaQSMfukkAnStwSMz36gWT7m8f73izpcpCh", 
            network = "devnet", 
            customRpcUrl 
        } = req.body || {};

        console.log("🚀 Инициализация Solana Web3 клиента...");

        const result = await solanaWeb3Client.initialize(privateKey, network, customRpcUrl);

        res.status(200).json({
            success: true,
            message: "🎮 Solana Web3 клиент успешно инициализирован!",
            data: {
                wallet: result.wallet,
                balance: result.balance,
                network: result.network,
                rpcUrl: result.rpcUrl,
                initialized: true,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("❌ Ошибка инициализации Web3 клиента:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка инициализации Solana Web3 клиента",
            error: error.message
        });
    }
};

// GET /api/solana/web3/status - Статус клиента
export const getWeb3Status = async (req, res) => {
    try {
        if (!solanaWeb3Client.initialized) {
            return res.status(400).json({
                success: false,
                message: "Web3 клиент не инициализирован",
                data: {
                    initialized: false
                }
            });
        }

        const balance = await solanaWeb3Client.getBalance();
        const connected = await solanaWeb3Client.checkConnection();
        const version = await solanaWeb3Client.getVersion();

        res.status(200).json({
            success: true,
            data: {
                initialized: true,
                wallet: solanaWeb3Client.wallet.publicKey.toString(),
                balance,
                connected,
                network: solanaWeb3Client.network,
                version,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("❌ Ошибка получения статуса:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения статуса Web3 клиента",
            error: error.message
        });
    }
};

// POST /api/solana/web3/create-collection - Создание коллекции
export const createGameCollection = async (req, res) => {
    try {
        if (!solanaWeb3Client.initialized) {
            return res.status(400).json({
                success: false,
                message: "Web3 клиент не инициализирован. Сначала вызовите /api/solana/web3/init"
            });
        }

        const {
            name,
            symbol,
            description,
            uri,
            game,
            type = "Gaming Collection"
        } = req.body;

        if (!name || !symbol) {
            return res.status(400).json({
                success: false,
                message: "Поля name и symbol обязательны"
            });
        }

        console.log("🎮 Создание коллекции:", name);

        const collectionData = {
            name,
            symbol,
            description: description || `NFT коллекция для игры ${name}`,
            uri: uri || "",
            game,
            type
        };

        const result = await solanaWeb3Client.createCollection(collectionData);

        res.status(200).json({
            success: true,
            message: `🎨 Коллекция "${name}" успешно создана!`,
            data: {
                collectionMint: result.collectionMint,
                transaction: result.transaction,
                name: result.name,
                symbol: result.symbol,
                explorer: `https://explorer.solana.com/address/${result.collectionMint}?cluster=${solanaWeb3Client.network}`,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("❌ Ошибка создания коллекции:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка создания коллекции",
            error: error.message
        });
    }
};

// POST /api/solana/web3/mint-nft - Создание NFT для игрового предмета
export const mintGameItemNFT = async (req, res) => {
    try {
        if (!solanaWeb3Client.initialized) {
            return res.status(400).json({
                success: false,
                message: "Web3 клиент не инициализирован. Сначала вызовите /api/solana/web3/init"
            });
        }

        const {
            itemId,
            collectionMint,
            metadataUri,
            customName,
            customSymbol,
            customDescription,
            customImage
        } = req.body;

        let nftData;

        // Если передан itemId, получаем данные из базы
        if (itemId) {
            const item = await Item.findByPk(itemId);
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: `Предмет с ID ${itemId} не найден`
                });
            }

            nftData = {
                name: customName || item.name,
                symbol: customSymbol || "ITEM",
                description: customDescription || item.description || `NFT для игрового предмета ${item.name}`,
                image: customImage || item.image,
                game: item.game,
                type: item.type,
                rarity: item.rarity,
                level: item.level,
                stats: item.stats,
                metadataUri
            };

            console.log("🎨 Создание NFT для предмета:", item.name, "(ID:", itemId, ")");
        } else {
            // Создаем NFT с кастомными данными
            nftData = {
                name: customName || "Game Item NFT",
                symbol: customSymbol || "ITEM",
                description: customDescription || "Игровой предмет NFT",
                image: customImage,
                metadataUri
            };

            console.log("🎨 Создание кастомного NFT:", nftData.name);
        }

        if (!nftData.name) {
            return res.status(400).json({
                success: false,
                message: "Не указано название NFT (name)"
            });
        }

        const result = await solanaWeb3Client.createGameItemNFT(nftData, collectionMint);

        // Если NFT создавался для предмета из БД, обновляем запись
        if (itemId) {
            await Item.update(
                {
                    nft: {
                        mint: result.nftMint,
                        transaction: result.transaction,
                        collection: collectionMint,
                        explorer: result.explorer,
                        createdAt: new Date().toISOString()
                    }
                },
                { where: { id: itemId } }
            );

            console.log("✅ Предмет в БД обновлен с NFT информацией");
        }

        res.status(200).json({
            success: true,
            message: `🎨 NFT "${nftData.name}" успешно создан!`,
            data: {
                itemId: itemId || null,
                nftMint: result.nftMint,
                transaction: result.transaction,
                metadata: result.metadata,
                collectionMint: result.collectionMint,
                explorer: result.explorer,
                network: solanaWeb3Client.network,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("❌ Ошибка создания NFT:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка создания NFT",
            error: error.message
        });
    }
};

// GET /api/solana/web3/nft/:mint - Получение информации о NFT
export const getNFTInfo = async (req, res) => {
    try {
        if (!solanaWeb3Client.initialized) {
            return res.status(400).json({
                success: false,
                message: "Web3 клиент не инициализирован"
            });
        }

        const { mint } = req.params;

        if (!mint) {
            return res.status(400).json({
                success: false,
                message: "Не указан mint адрес NFT"
            });
        }

        const result = await solanaWeb3Client.getNFTInfo(mint);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("❌ Ошибка получения информации о NFT:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения информации о NFT",
            error: error.message
        });
    }
};

// GET /api/solana/web3/balance - Баланс кошелька
export const getWalletBalance = async (req, res) => {
    try {
        if (!solanaWeb3Client.initialized) {
            return res.status(400).json({
                success: false,
                message: "Web3 клиент не инициализирован"
            });
        }

        const balance = await solanaWeb3Client.getBalance();

        res.status(200).json({
            success: true,
            data: {
                publicKey: solanaWeb3Client.wallet.publicKey.toString(),
                balance,
                balanceLamports: balance * 1000000000,
                network: solanaWeb3Client.network,
                explorer: `https://explorer.solana.com/address/${solanaWeb3Client.wallet.publicKey.toString()}?cluster=${solanaWeb3Client.network}`
            }
        });

    } catch (error) {
        console.error("❌ Ошибка получения баланса:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка получения баланса кошелька",
            error: error.message
        });
    }
};

// POST /api/solana/web3/send-sol - Отправка SOL (для тестирования)
export const sendSOL = async (req, res) => {
    try {
        if (!solanaWeb3Client.initialized) {
            return res.status(400).json({
                success: false,
                message: "Web3 клиент не инициализирован"
            });
        }

        const { toAddress, amount } = req.body;

        if (!toAddress || !amount) {
            return res.status(400).json({
                success: false,
                message: "Поля toAddress и amount обязательны"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Сумма должна быть больше 0"
            });
        }

        const result = await solanaWeb3Client.sendSOL(toAddress, amount);

        res.status(200).json({
            success: true,
            message: `💸 Отправлено ${amount} SOL на адрес ${toAddress}`,
            data: result
        });

    } catch (error) {
        console.error("❌ Ошибка отправки SOL:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка отправки SOL",
            error: error.message
        });
    }
};

// POST /api/solana/web3/batch-mint - Массовое создание NFT
export const batchMintNFTs = async (req, res) => {
    try {
        if (!solanaWeb3Client.initialized) {
            return res.status(400).json({
                success: false,
                message: "Web3 клиент не инициализирован"
            });
        }

        const { itemIds, collectionMint } = req.body;

        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Необходимо указать массив itemIds"
            });
        }

        if (itemIds.length > 10) {
            return res.status(400).json({
                success: false,
                message: "За раз можно создать максимум 10 NFT"
            });
        }

        console.log(`🎨 Массовое создание NFT для ${itemIds.length} предметов...`);

        const results = [];
        const errors = [];

        for (const itemId of itemIds) {
            try {
                const item = await Item.findByPk(itemId);
                if (!item) {
                    errors.push({ itemId, error: "Предмет не найден" });
                    continue;
                }

                const nftData = {
                    name: item.name,
                    symbol: "ITEM",
                    description: item.description || `NFT для игрового предмета ${item.name}`,
                    image: item.image,
                    game: item.game,
                    type: item.type,
                    rarity: item.rarity,
                    level: item.level,
                    stats: item.stats
                };

                const result = await solanaWeb3Client.createGameItemNFT(nftData, collectionMint);

                // Обновляем предмет в БД
                await Item.update(
                    {
                        nft: {
                            mint: result.nftMint,
                            transaction: result.transaction,
                            collection: collectionMint,
                            explorer: result.explorer,
                            createdAt: new Date().toISOString()
                        }
                    },
                    { where: { id: itemId } }
                );

                results.push({
                    itemId,
                    nftMint: result.nftMint,
                    transaction: result.transaction,
                    explorer: result.explorer
                });

                console.log(`✅ NFT создан для предмета ${itemId}: ${result.nftMint}`);

            } catch (error) {
                console.error(`❌ Ошибка создания NFT для предмета ${itemId}:`, error);
                errors.push({ itemId, error: error.message });
            }
        }

        res.status(200).json({
            success: true,
            message: `🎨 Создано ${results.length} NFT из ${itemIds.length} предметов`,
            data: {
                successful: results,
                errors,
                totalRequested: itemIds.length,
                totalCreated: results.length,
                totalErrors: errors.length
            }
        });

    } catch (error) {
        console.error("❌ Ошибка массового создания NFT:", error);
        res.status(500).json({
            success: false,
            message: "Ошибка массового создания NFT",
            error: error.message
        });
    }
};
