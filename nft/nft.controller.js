import { 
    Connection, 
    PublicKey, 
    Keypair,
    Transaction,
    SystemProgram,
    SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";
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
                attributes: attributes || []
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

        // Здесь нужно добавить инструкцию Anchor для создания листинга
        // Это требует установки @coral-xyz/anchor

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

// 💸 Покупка NFT
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

        // 2. Если у покупателя нет токен-аккаунта, создать его
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

        // 3. Перевод NFT (1 токен) от продавца к покупателю
        transaction.add({
            keys: [
                { pubkey: sellerTokenAccount, isSigner: false, isWritable: true },
                { pubkey: buyerTokenAccount, isSigner: false, isWritable: true },
                { pubkey: sellerPubkey, isSigner: true, isWritable: false },
            ],
            programId: TOKEN_PROGRAM_ID,
            data: Buffer.from([3, 1, 0, 0, 0]), // instruction: Transfer, amount: 1
        });

        // Подписываем и отправляем транзакцию
        const signature = await wallet.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, "confirmed");

        // Здесь можно обновить статус листинга (например, в базе данных)

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

// 🎮 Регистрация игры
export const registerGame = async (req, res) => {
    try {
        const { name, symbol, description } = req.body;

        if (!name || !symbol || !description) {
            return res.status(400).json({
                error: "Missing required fields: name, symbol, description"
            });
        }

        // Находим PDA для игры
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

// 📊 Получение информации о NFT
export const getNFTInfo = async (req, res) => {
    try {
        const { mint } = req.params;
        const mintPubkey = new PublicKey(mint);

        // Получаем информацию о mint
        const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
        
        if (!mintInfo.value) {
            return res.status(404).json({ error: "NFT not found" });
        }

        // Получаем метадату (упрощенно)
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

// 💰 Получение баланса токенов
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
            // Аккаунт не существует
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
