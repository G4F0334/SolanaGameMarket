import { 
    Connection, 
    PublicKey, 
    Keypair,
    Transaction,
    SystemProgram,
    SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";
import { getUsernameByWallet, getUserByWallet, mockUsersDatabase } from '../users/user.controller.js';
import { transferSOL, getWalletBalance } from '../wallet/wallet.controller.js';
import NFT from '../database/nft-model.js';
import User from '../database/user-model.js';
import { sequelize } from '../database/database.js';

// Инициализация базы данных и создание тестовых данных
const initDatabase = async () => {
    try {
        // Синхронизируем модели с базой данных
        await sequelize.sync({ force: false });
        console.log('✅ Database models synchronized');
        
        // Проверяем есть ли данные в базе
        const nftCount = await NFT.count();
        const userCount = await User.count();
        
        if (userCount === 0) {
            // Создаем тестовых пользователей
            await User.bulkCreate([
                {
                    username: "GameMaster",
                    walletAddress: "B8fxFZpZT5mJmVB2JVwvZ8N1q2KW3sS4R9XgMp7YDfEa",
                    joinDate: "2024-01-15"
                },
                {
                    username: "TechNinja",
                    walletAddress: "7YrqFQWGzEv3m1sRN8QdK4Hx5jGpT2W9LcVnX6BkMfP3",
                    joinDate: "2024-02-10"
                },
                {
                    username: "ElvenArcher",
                    walletAddress: "9MpKzQ5WnBvR2fG8YdN3jXc1sTbH7LwE6VqZmP4RkA2D",
                    joinDate: "2024-03-05"
                }
            ]);
            console.log('✅ Test users created');
        }
        
        if (nftCount === 0) {
            console.log('📊 Database is clean - no NFTs found');
            console.log('💡 NFTs will be created when users create them');
        }
        
        console.log(`📊 Database initialized: ${userCount} users, ${nftCount} NFTs`);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
};

// Инициализируем базу данных при загрузке модуля
initDatabase();

// Получить все NFT на продаже (для каталога)
export const getAllNFTs = async (req, res) => {
    try {
        // Получаем NFT из PostgreSQL со статусом FOR_SALE или LISTED_FOR_SALE
        const nfts = await NFT.findAll({
            where: {
                status: ['FOR_SALE', 'LISTED_FOR_SALE']
            },
            order: [['created_at', 'DESC']]
        });

        // Добавляем информацию о никнейме продавца
        const nftsWithUserInfo = await Promise.all(nfts.map(async (nft) => {
            const nftData = nft.toJSON();
            const seller = await User.findOne({ where: { walletAddress: nftData.seller } });
            
            return {
                ...nftData,
                sellerUsername: seller ? seller.username : nftData.seller,
                ownerAddress: nftData.owner || nftData.seller
            };
        }));

        res.json({
            success: true,
            nfts: nftsWithUserInfo
        });
    } catch (error) {
        console.error("❌ Error getting NFT list:", error);
        res.status(500).json({
            error: "Failed to get NFT list",
            message: error.message
        });
    }
};

// Получить популярные NFT для главной страницы (только те, что на продаже)
export const getFeaturedNFTs = async (req, res) => {
    try {
        // Получаем популярные NFT из PostgreSQL
        const nfts = await NFT.findAll({
            where: {
                status: ['FOR_SALE', 'LISTED_FOR_SALE']
            },
            order: [['price', 'DESC']], // Сортируем по цене для "популярности"
            limit: 4
        });

        // Добавляем информацию о никнейме продавца
        const nftsWithUserInfo = await Promise.all(nfts.map(async (nft) => {
            const nftData = nft.toJSON();
            const seller = await User.findOne({ where: { walletAddress: nftData.seller } });
            
            return {
                ...nftData,
                sellerUsername: seller ? seller.username : nftData.seller,
                ownerAddress: nftData.owner || nftData.seller
            };
        }));

        res.json({
            success: true,
            nfts: nftsWithUserInfo
        });
    } catch (error) {
        console.error("❌ Error getting featured NFTs:", error);
        res.status(500).json({
            error: "Failed to get featured NFTs",
            message: error.message
        });
    }
};

// Получить NFT пользователя в коллекции (не на продаже)
export const getUserOwnedNFTs = async (req, res) => {
    try {
        const { userAddress } = req.params;
        
        if (!userAddress) {
            return res.status(400).json({
                success: false,
                message: "User address is required"
            });
        }

        // Получаем NFT из PostgreSQL, принадлежащие пользователю и не выставленные на продажу
        const ownedNFTs = await NFT.findAll({
            where: {
                owner: userAddress,
                status: 'OWNED'
            }
        });

        res.json({
            success: true,
            nfts: ownedNFTs
        });
    } catch (error) {
        console.error("❌ Error getting user owned NFTs:", error);
        res.status(500).json({
            error: "Failed to get user owned NFTs",
            message: error.message
        });
    }
};

// Получить NFT пользователя на продаже
export const getUserListedNFTs = async (req, res) => {
    try {
        const { userAddress } = req.params;
        
        if (!userAddress) {
            return res.status(400).json({
                success: false,
                message: "User address is required"
            });
        }

        // Получаем NFT из PostgreSQL, выставленные пользователем на продажу
        const listedNFTs = await NFT.findAll({
            where: {
                owner: userAddress,
                status: 'LISTED_FOR_SALE'
            }
        });

        res.json({
            success: true,
            nfts: listedNFTs
        });
    } catch (error) {
        console.error("❌ Error getting user listed NFTs:", error);
        res.status(500).json({
            error: "Failed to get user listed NFTs",
            message: error.message
        });
    }
};

// Покупка NFT с реальным переводом SOL
export const purchaseNFT = async (req, res) => {
    try {
        const { nftId, buyerAddress } = req.body;
        
        if (!nftId || !buyerAddress) {
            return res.status(400).json({
                success: false,
                message: "NFT ID and buyer address are required"
            });
        }

        // Найти NFT в PostgreSQL базе данных
        const nft = await NFT.findByPk(nftId);
        
        if (!nft) {
            return res.status(404).json({
                success: false,
                message: "NFT not found"
            });
        }

        // Проверить, что NFT доступен для покупки
        if (nft.status !== "FOR_SALE" && nft.status !== "LISTED_FOR_SALE") {
            return res.status(400).json({
                success: false,
                message: "NFT is not available for sale"
            });
        }

        // Проверить, что покупатель не является владельцем
        if (nft.owner === buyerAddress || nft.seller === buyerAddress) {
            return res.status(400).json({
                success: false,
                message: "You cannot buy your own NFT"
            });
        }

        // Проверяем баланс покупателя в нашей системе
        const buyerBalance = getWalletBalance(buyerAddress);
        
        if (buyerBalance < nft.price) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Required: ${nft.price} SOL, Available: ${buyerBalance} SOL`
            });
        }

        try {
            // Определяем продавца (владельца NFT)
            const sellerAddress = nft.owner || nft.seller;
            
            // Выполняем перевод SOL
            const transferResult = transferSOL(buyerAddress, sellerAddress, nft.price);
            
            if (!transferResult.success) {
                throw new Error("Transfer failed");
            }

            // Обновить статус NFT в PostgreSQL - теперь принадлежит покупателю
            await nft.update({
                owner: buyerAddress,
                status: "OWNED"
            });
            
            console.log(`🛒 Purchase successful: NFT ${nftId} bought by ${buyerAddress} for ${nft.price} SOL`);
            console.log(`💰 SOL transferred from ${buyerAddress} (${transferResult.fromBalance} SOL) to ${sellerAddress} (${transferResult.toBalance} SOL)`);
            
            res.json({
                success: true,
                message: `NFT ${nft.name} successfully purchased for ${nft.price} SOL`,
                transaction: `tx_${Date.now()}`,
                purchaseId: `purchase_${Date.now()}`,
                nft: nft.toJSON(),
                priceTransferred: nft.price,
                buyerNewBalance: transferResult.fromBalance,
                sellerNewBalance: transferResult.toBalance
            });
            
        } catch (transferError) {
            console.error("❌ Transfer error:", transferError);
            return res.status(400).json({
                success: false,
                message: transferError.message || "Failed to process SOL transfer"
            });
        }
        
    } catch (error) {
        console.error("❌ Error purchasing NFT:", error);
        res.status(500).json({
            success: false,
            message: "Failed to purchase NFT"
        });
    }
};

// Выставить NFT на продажу
export const listNFTForSale = async (req, res) => {
    try {
        const { nftId, price, sellerAddress } = req.body;
        
        if (!nftId || !price || !sellerAddress) {
            return res.status(400).json({
                success: false,
                message: "NFT ID, price and seller address are required"
            });
        }

        // Найти NFT в PostgreSQL базе данных
        const nft = await NFT.findByPk(nftId);
        
        if (!nft) {
            return res.status(404).json({
                success: false,
                message: "NFT not found"
            });
        }

        // Проверить, что NFT принадлежит продавцу
        if (nft.owner !== sellerAddress) {
            return res.status(403).json({
                success: false,
                message: "You can only list your own NFTs"
            });
        }

        // Проверить, что NFT не уже на продаже
        if (nft.status === "LISTED_FOR_SALE" || nft.status === "FOR_SALE") {
            return res.status(400).json({
                success: false,
                message: "NFT is already listed for sale"
            });
        }

        // Обновить статус NFT в PostgreSQL
        await nft.update({
            price: parseFloat(price),
            status: "LISTED_FOR_SALE",
            seller: sellerAddress
        });
        
        console.log(`📦 NFT listed: ${nft.name} by ${sellerAddress} for ${price} SOL`);
        
        res.json({
            success: true,
            message: `NFT ${nft.name} successfully listed for sale`,
            nft: nft.toJSON()
        });
    } catch (error) {
        console.error("❌ Error listing NFT:", error);
        res.status(500).json({
            success: false,
            message: "Failed to list NFT for sale"
        });
    }
};

// Снять NFT с продажи
export const unlistNFT = async (req, res) => {
    try {
        const { nftId, ownerAddress } = req.body;
        
        if (!nftId || !ownerAddress) {
            return res.status(400).json({
                success: false,
                message: "NFT ID and owner address are required"
            });
        }

        // Найти NFT в PostgreSQL базе данных
        const nft = await NFT.findByPk(nftId);
        
        if (!nft) {
            return res.status(404).json({
                success: false,
                message: "NFT not found"
            });
        }

        // Проверить, что NFT принадлежит владельцу
        if (nft.owner !== ownerAddress) {
            return res.status(403).json({
                success: false,
                message: "You can only unlist your own NFTs"
            });
        }

        // Проверить, что NFT на продаже
        if (nft.status !== "LISTED_FOR_SALE") {
            return res.status(400).json({
                success: false,
                message: "NFT is not listed for sale"
            });
        }

        // Обновить статус NFT в PostgreSQL
        await nft.update({
            status: "OWNED"
        });
        
        console.log(`🚫 NFT unlisted: ${nft.name} by ${ownerAddress}`);
        
        res.json({
            success: true,
            message: `NFT ${nft.name} successfully unlisted`,
            nft: nft.toJSON()
        });
    } catch (error) {
        console.error("❌ Error unlisting NFT:", error);
        res.status(500).json({
            success: false,
            message: "Failed to unlist NFT"
        });
    }
};

import Item from "../items/item.entity.js";
import { 
    createMint,
    createAccount,
    mintTo,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import BN from "bn.js";

// Константы из вашего Anchor программы
const MARKETPLACE_PROGRAM_ID = new PublicKey("5YogrduE2HdMcbY3irEB97esXDzjYCXHpMBvHqQAXA4w");

// Получение подключения и кошелька из глобальных переменных (из server.js)
let connection;
let wallet;

export const initializeNFTController = (solanaConnection, solanaWallet) => {
    connection = solanaConnection;
    wallet = solanaWallet;
};

// 🎮 Создание NFT для игрового предмета
export const createGameNFT = async (req, res) => {
    try {
        const { name, symbol, description, image, attributes } = req.body;

        if (!name || !symbol || !description) {
            return res.status(400).json({
                error: "Missing required fields: name, symbol, description"
            });
        }

        console.log("🎨 Creating NFT:", { name, symbol, description });

        // 1. Создаем новый mint для NFT
        const mintKeypair = Keypair.generate();
        console.log("🔑 Generated mint:", mintKeypair.publicKey.toString());

        // 2. Создаем mint аккаунт
        const mint = await createMint(
            connection,
            wallet,
            wallet.publicKey, // mint authority
            wallet.publicKey, // freeze authority
            0 // decimals (0 для NFT)
        );

        console.log("✅ Mint created:", mint.toString());

        // 3. Создаем ассоциированный токен аккаунт для владельца
        const ownerTokenAccount = await getAssociatedTokenAddress(
            mint,
            wallet.publicKey
        );

        // 4. Создаем транзакцию для создания ассоциированного токен аккаунта
        const transaction = new Transaction();
        
        // Добавляем инструкцию для создания ассоциированного токен аккаунта
        transaction.add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey, // payer
                ownerTokenAccount, // associatedToken
                wallet.publicKey, // owner
                mint // mint
            )
        );

        // 5. Отправляем транзакцию
        const signature = await connection.sendTransaction(transaction, [wallet]);
        await connection.confirmTransaction(signature);

        // 6. Минтим 1 NFT токен
        await mintTo(
            connection,
            wallet,
            mint,
            ownerTokenAccount,
            wallet.publicKey,
            1 // amount (1 для NFT)
        );

        console.log("🎉 NFT created successfully!");


        const item = await Item.create({
            name,
            image: image || "https://via.placeholder.com/300",
            game: "default", // Можно доработать для передачи игры
            type: "nft",
            description,
            nft: mint.toString()
        });

        res.json({
            success: true,
            nft: {
                mint: mint.toString(),
                owner: wallet.publicKey.toString(),
                ownerTokenAccount: ownerTokenAccount.toString(),
                signature,
                name,
                symbol,
                description,
                image: image || "https://via.placeholder.com/300",
                attributes: attributes || [],
                dbId: item.id
            }
        });

    } catch (error) {
        console.error("❌ Error creating NFT:", error);
        res.status(500).json({
            error: "Failed to create NFT",
            message: error.message
        });
    }
};

// 🏪 Создание листинга в marketplace
export const createListing = async (req, res) => {
    try {
        const { nftMint, price } = req.body;

        if (!nftMint || !price) {
            return res.status(400).json({
                error: "Missing required fields: nftMint, price"
            });
        }

        const mintPubkey = new PublicKey(nftMint);
        const priceInLamports = new BN(price * 1000000000); // Convert SOL to lamports

        // Находим PDA для листинга
        const [listingPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("listing"), mintPubkey.toBuffer()],
            MARKETPLACE_PROGRAM_ID
        );

        console.log("🏪 Creating listing:", {
            mint: nftMint,
            price,
            listing: listingPDA.toString()
        });

        res.json({
            success: true,
            listing: {
                address: listingPDA.toString(),
                nftMint,
                price,
                seller: wallet.publicKey.toString(),
                status: "created"
            }
        });

    } catch (error) {
        console.error("❌ Error creating listing:", error);
        res.status(500).json({
            error: "Failed to create listing",
            message: error.message
        });
    }
};
export const buyNFT = async (req, res) => {
    try {
        const { nftMint, seller, price } = req.body;
        if (!nftMint || !seller || !price) {
            return res.status(400).json({
                error: "Missing required fields: nftMint, seller, price"
            });
        }

        const mintPubkey = new PublicKey(nftMint);
        const sellerPubkey = new PublicKey(seller);
        const buyerPubkey = wallet.publicKey;
        const priceInLamports = new BN(price * 1000000000); // SOL -> lamports

        // Получаем адрес ассоциированного токен-аккаунта продавца и покупателя
        const sellerTokenAccount = await getAssociatedTokenAddress(mintPubkey, sellerPubkey);
        const buyerTokenAccount = await getAssociatedTokenAddress(mintPubkey, buyerPubkey);

        // Создаем транзакцию: 1) перевод SOL продавцу, 2) перевод NFT покупателю
        const transaction = new Transaction();

        // 1. Перевод SOL продавцу
        transaction.add(SystemProgram.transfer({
            fromPubkey: buyerPubkey,
            toPubkey: sellerPubkey,
            lamports: priceInLamports.toNumber(),
        }));

        const buyerTokenAccountInfo = await connection.getAccountInfo(buyerTokenAccount);
        if (!buyerTokenAccountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    buyerPubkey,
                    buyerTokenAccount,
                    buyerPubkey,
                    mintPubkey
                )
            );
        }

        transaction.add({
            keys: [
                { pubkey: sellerTokenAccount, isSigner: false, isWritable: true },
                { pubkey: buyerTokenAccount, isSigner: false, isWritable: true },
                { pubkey: sellerPubkey, isSigner: true, isWritable: false },
            ],
            programId: TOKEN_PROGRAM_ID,
            data: Buffer.from([3, 1, 0, 0, 0]),
        });

        const signature = await wallet.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, "confirmed");


        res.json({
            success: true,
            message: "NFT успешно куплен!",
            signature
        });
    } catch (error) {
        console.error("❌ Error buying NFT:", error);
        res.status(500).json({
            error: "Failed to buy NFT",
            message: error.message
        });
    }
};

export const registerGame = async (req, res) => {
    try {
        const { name, symbol, description } = req.body;

        if (!name || !symbol || !description) {
            return res.status(400).json({
                error: "Missing required fields: name, symbol, description"
            });
        }

        const [gamePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("game"), wallet.publicKey.toBuffer()],
            MARKETPLACE_PROGRAM_ID
        );

        console.log("🎮 Registering game:", {
            name,
            symbol,
            description,
            game: gamePDA.toString()
        });

        res.json({
            success: true,
            game: {
                address: gamePDA.toString(),
                name,
                symbol,
                description,
                authority: wallet.publicKey.toString(),
                status: "registered"
            }
        });

    } catch (error) {
        console.error("❌ Error registering game:", error);
        res.status(500).json({
            error: "Failed to register game",
            message: error.message
        });
    }
};

export const getNFTInfo = async (req, res) => {
    try {
        const { mint } = req.params;
        const mintPubkey = new PublicKey(mint);

        const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
        
        if (!mintInfo.value) {
            return res.status(404).json({ error: "NFT not found" });
        }

        const [metadataAddress] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                mpl.PROGRAM_ID.toBuffer(),
                mintPubkey.toBuffer(),
            ],
            mpl.PROGRAM_ID
        );

        const metadataInfo = await connection.getAccountInfo(metadataAddress);

        res.json({
            success: true,
            nft: {
                mint: mint,
                metadata: metadataAddress.toString(),
                mintInfo: mintInfo.value.data,
                hasMetadata: !!metadataInfo
            }
        });

    } catch (error) {
        console.error("❌ Error getting NFT info:", error);
        res.status(500).json({
            error: "Failed to get NFT info",
            message: error.message
        });
    }
};

export const getTokenBalance = async (req, res) => {
    try {
        const { mint, owner } = req.params;
        const mintPubkey = new PublicKey(mint);
        const ownerPubkey = owner ? new PublicKey(owner) : wallet.publicKey;

        const tokenAccount = await getAssociatedTokenAddress(
            mintPubkey,
            ownerPubkey
        );

        try {
            const balance = await connection.getTokenAccountBalance(tokenAccount);
            
            res.json({
                success: true,
                balance: {
                    mint: mint,
                    owner: ownerPubkey.toString(),
                    tokenAccount: tokenAccount.toString(),
                    amount: balance.value.amount,
                    decimals: balance.value.decimals,
                    uiAmount: balance.value.uiAmount
                }
            });
        } catch (error) {
            res.json({
                success: true,
                balance: {
                    mint: mint,
                    owner: ownerPubkey.toString(),
                    tokenAccount: tokenAccount.toString(),
                    amount: "0",
                    decimals: 0,
                    uiAmount: 0
                }
            });
        }

    } catch (error) {
        console.error("❌ Error getting token balance:", error);
        res.status(500).json({
            error: "Failed to get token balance",
            message: error.message
        });
    }
};

// Получить NFT по ID
export const getNFTById = async (req, res) => {
    try {
        const { nftId } = req.params;
        
        if (!nftId) {
            return res.status(400).json({
                success: false,
                message: "NFT ID is required"
            });
        }

        // Найти NFT в PostgreSQL базе данных
        const nft = await NFT.findByPk(nftId);
        
        if (!nft) {
            console.log(`NFT with ID ${nftId} not found`);
            return res.status(404).json({
                success: false,
                message: "NFT not found"
            });
        }

        const nftData = nft.toJSON();

        // Добавляем информацию о никнейме продавца
        const seller = await User.findOne({ where: { walletAddress: nftData.seller } });
        const nftWithUserInfo = {
            ...nftData,
            sellerUsername: seller ? seller.username : nftData.seller,
            ownerAddress: nftData.owner || nftData.seller
        };

        res.json({
            success: true,
            nft: nftWithUserInfo
        });
    } catch (error) {
        console.error("❌ Error getting NFT by ID:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get NFT",
            error: error.message
        });
    }
};

// Создать пользовательский NFT
export const createUserNFT = async (req, res) => {
    try {
        // Инициализируем базу данных
        await initDatabase();
        
        const { name, description, price, image, userAddress, type, game, rarity } = req.body;
        
        console.log('Creating new NFT:', { name, description, price, userAddress, type, game, rarity });
        
        // Валидация данных
        if (!name || !description || !price || !image || !userAddress || !type || !game || !rarity) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields' 
            });
        }
        
        if (price <= 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Price must be greater than 0' 
            });
        }
        
        // Проверяем, что пользователь существует в PostgreSQL
        console.log('Looking for user with address:', userAddress);
        const user = await User.findOne({ where: { walletAddress: userAddress } });
        console.log('Found user:', user ? user.toJSON() : 'null');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }
        
        // Создаем новый NFT в PostgreSQL
        const newNFT = await NFT.create({
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            image,
            game: game,
            type: type,
            rarity: rarity,
            nft: `UserNFT${Date.now()}...`,
            seller: userAddress,
            owner: userAddress,
            status: "OWNED"
        });

        console.log('NFT created successfully in PostgreSQL:', newNFT.toJSON());
        
        // Добавляем информацию о пользователе
        const nftWithUserInfo = {
            ...newNFT.toJSON(),
            sellerUsername: user.username || userAddress
        };
        
        res.status(201).json({
            success: true,
            nft: nftWithUserInfo
        });
    } catch (error) {
        console.error('❌ Error creating NFT:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};


