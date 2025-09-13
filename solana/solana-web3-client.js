import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    clusterApiUrl
} from "@solana/web3.js";
import {
    createUmi
} from "@metaplex-foundation/umi-bundle-defaults";
import {
    generateSigner,
    keypairIdentity,
    publicKey,
    sol,
    percentAmount,
    transactionBuilder,
    some
} from "@metaplex-foundation/umi";
import {
    createNft,
    mplTokenMetadata,
    findMetadataPda,
    createMetadataAccountV3,
    createMasterEditionV3
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

/**
 * 🎮 Solana Web3.js клиент для создания NFT
 * Поддерживает создание NFT через Metaplex и работу с marketplace
 */
class SolanaWeb3Client {
    constructor() {
        this.connection = null;
        this.wallet = null;
        this.umi = null;
        this.initialized = false;
        this.network = "devnet"; // devnet, testnet, mainnet-beta
    }

    /**
     * Инициализация клиента с вашим приватным ключом
     * @param {string} privateKey - Приватный ключ (ваш: 2RKCYkDs8AaQSMfukkAnStwSMz36gWT7m8f73izpcpCh)
     * @param {string} network - Сеть Solana (devnet/testnet/mainnet-beta)
     * @param {string} customRpcUrl - Кастомный RPC URL (опционально)
     */
    async initialize(privateKey = "2RKCYkDs8AaQSMfukkAnStwSMz36gWT7m8f73izpcpCh", network = "devnet", customRpcUrl = null) {
        try {
            console.log("🚀 Инициализация Solana Web3 клиента...");
            
            this.network = network;
            
            // Настройка подключения к сети
            const rpcUrl = customRpcUrl || this.getRpcUrl(network);
            this.connection = new Connection(rpcUrl, "confirmed");
            
            // Создание кошелька из приватного ключа
            const secretKey = bs58.decode(privateKey);
            this.wallet = Keypair.fromSecretKey(secretKey);
            
            console.log("💰 Адрес кошелька:", this.wallet.publicKey.toString());
            
            // Инициализация Umi для Metaplex
            this.umi = createUmi(rpcUrl);
            
            // Создаем keypair для Umi из того же секретного ключа
            const umiKeypair = this.umi.eddsa.createKeypairFromSecretKey(secretKey);
            this.umi.use(keypairIdentity(umiKeypair));
            this.umi.use(mplTokenMetadata());
            
            this.initialized = true;
            
            // Проверяем баланс
            const balance = await this.getBalance();
            console.log("💵 Баланс кошелька:", balance, "SOL");
            
            if (balance < 0.01) {
                console.log("⚠️  Низкий баланс! Рекомендуется пополнить кошелек");
                if (network === "devnet") {
                    console.log("💡 Для devnet можете получить тестовые SOL: solana airdrop 2", this.wallet.publicKey.toString(), "--url devnet");
                }
            }
            
            return {
                success: true,
                wallet: this.wallet.publicKey.toString(),
                balance,
                network: this.network,
                rpcUrl
            };
            
        } catch (error) {
            console.error("❌ Ошибка инициализации Solana клиента:", error);
            throw error;
        }
    }

    /**
     * Получить RPC URL для сети
     */
    getRpcUrl(network) {
        switch (network) {
            case "devnet":
                return clusterApiUrl("devnet");
            case "testnet":
                return clusterApiUrl("testnet");
            case "mainnet-beta":
                return clusterApiUrl("mainnet-beta");
            default:
                return clusterApiUrl("devnet");
        }
    }

    /**
     * Получить баланс кошелька в SOL
     */
    async getBalance() {
        if (!this.connection || !this.wallet) {
            throw new Error("Клиент не инициализирован");
        }
        
        const balance = await this.connection.getBalance(this.wallet.publicKey);
        return balance / LAMPORTS_PER_SOL;
    }

    /**
     * Создать коллекцию NFT для игры
     * @param {Object} collectionData - Данные коллекции
     */
    async createCollection(collectionData) {
        if (!this.initialized) {
            throw new Error("Клиент не инициализирован");
        }

        try {
            console.log("🎮 Создание NFT коллекции:", collectionData.name);

            const collectionSigner = generateSigner(this.umi);

            const createCollectionTx = await createNft(this.umi, {
                mint: collectionSigner,
                name: collectionData.name,
                symbol: collectionData.symbol,
                uri: collectionData.uri || "",
                sellerFeeBasisPoints: percentAmount(5), // 5% роялти
                isCollection: true,
                creators: some([
                    {
                        address: this.umi.identity.publicKey,
                        verified: true,
                        share: 100,
                    },
                ]),
            });

            const result = await createCollectionTx.sendAndConfirm(this.umi);
            
            console.log("✅ Коллекция создана!");
            console.log("🔗 Collection Mint:", collectionSigner.publicKey);
            console.log("📄 Транзакция:", bs58.encode(result.signature));

            return {
                success: true,
                collectionMint: collectionSigner.publicKey,
                transaction: bs58.encode(result.signature),
                name: collectionData.name,
                symbol: collectionData.symbol
            };

        } catch (error) {
            console.error("❌ Ошибка создания коллекции:", error);
            throw error;
        }
    }

    /**
     * Создать NFT для игрового предмета
     * @param {Object} nftData - Данные NFT
     * @param {string} collectionMint - Адрес коллекции (опционально)
     */
    async createGameItemNFT(nftData, collectionMint = null) {
        if (!this.initialized) {
            throw new Error("Клиент не инициализирован");
        }

        try {
            console.log("🎨 Создание NFT для игрового предмета:", nftData.name);

            const nftSigner = generateSigner(this.umi);

            // Подготавливаем метаданные для игрового предмета
            const metadata = {
                name: nftData.name,
                symbol: nftData.symbol || "ITEM",
                description: nftData.description || "Игровой предмет NFT",
                image: nftData.image || "",
                attributes: [
                    {
                        trait_type: "Game",
                        value: nftData.game || "Unknown Game"
                    },
                    {
                        trait_type: "Type",
                        value: nftData.type || "item"
                    },
                    {
                        trait_type: "Rarity",
                        value: nftData.rarity || "common"
                    },
                    {
                        trait_type: "Level",
                        value: nftData.level?.toString() || "1"
                    }
                ],
                properties: {
                    category: "image",
                    files: nftData.image ? [
                        {
                            uri: nftData.image,
                            type: "image/png"
                        }
                    ] : [],
                    creators: [
                        {
                            address: this.wallet.publicKey.toString(),
                            share: 100
                        }
                    ]
                }
            };

            // Добавляем игровые характеристики в атрибуты
            if (nftData.stats) {
                Object.entries(nftData.stats).forEach(([key, value]) => {
                    metadata.attributes.push({
                        trait_type: key.charAt(0).toUpperCase() + key.slice(1),
                        value: value.toString()
                    });
                });
            }

            // Создаем NFT конфигурацию
            const nftConfig = {
                mint: nftSigner,
                name: nftData.name,
                symbol: nftData.symbol || "ITEM",
                uri: nftData.metadataUri || "", // URI к JSON метаданным
                sellerFeeBasisPoints: percentAmount(5), // 5% роялти
                creators: some([
                    {
                        address: this.umi.identity.publicKey,
                        verified: true,
                        share: 100,
                    },
                ]),
            };

            // Если есть коллекция, добавляем её
            if (collectionMint) {
                nftConfig.collection = some({
                    key: publicKey(collectionMint),
                    verified: false,
                });
            }

            const createNftTx = await createNft(this.umi, nftConfig);
            const result = await createNftTx.sendAndConfirm(this.umi);

            console.log("✅ NFT создан!");
            console.log("🔗 NFT Mint:", nftSigner.publicKey);
            console.log("📄 Транзакция:", bs58.encode(result.signature));

            return {
                success: true,
                nftMint: nftSigner.publicKey,
                transaction: bs58.encode(result.signature),
                metadata,
                collectionMint,
                explorer: `https://explorer.solana.com/address/${nftSigner.publicKey}?cluster=${this.network}`
            };

        } catch (error) {
            console.error("❌ Ошибка создания NFT:", error);
            throw error;
        }
    }

    /**
     * Получить информацию о NFT
     * @param {string} mintAddress - Адрес mint NFT
     */
    async getNFTInfo(mintAddress) {
        if (!this.initialized) {
            throw new Error("Клиент не инициализирован");
        }

        try {
            const mintPublicKey = new PublicKey(mintAddress);
            
            // Получаем информацию о mint
            const mintInfo = await this.connection.getParsedAccountInfo(mintPublicKey);
            
            if (!mintInfo.value) {
                throw new Error("NFT не найден");
            }

            // Получаем метаданные
            const [metadataPda] = await findMetadataPda(this.umi, {
                mint: publicKey(mintAddress)
            });

            console.log("📄 Информация о NFT:", mintAddress);

            return {
                success: true,
                mint: mintAddress,
                metadataPda: metadataPda,
                mintInfo: mintInfo.value,
                explorer: `https://explorer.solana.com/address/${mintAddress}?cluster=${this.network}`
            };

        } catch (error) {
            console.error("❌ Ошибка получения информации о NFT:", error);
            throw error;
        }
    }

    /**
     * Проверить статус подключения
     */
    async checkConnection() {
        if (!this.connection) {
            return false;
        }

        try {
            await this.connection.getSlot();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Получить версию сети
     */
    async getVersion() {
        if (!this.connection) {
            throw new Error("Клиент не инициализирован");
        }

        return await this.connection.getVersion();
    }

    /**
     * Отправить SOL (для тестирования)
     * @param {string} toAddress - Адрес получателя
     * @param {number} amount - Количество SOL
     */
    async sendSOL(toAddress, amount) {
        if (!this.initialized) {
            throw new Error("Клиент не инициализирован");
        }

        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: this.wallet.publicKey,
                    toPubkey: new PublicKey(toAddress),
                    lamports: amount * LAMPORTS_PER_SOL,
                })
            );

            const signature = await this.connection.sendTransaction(transaction, [this.wallet]);
            await this.connection.confirmTransaction(signature);

            console.log("💸 SOL отправлен!");
            console.log("📄 Транзакция:", signature);

            return {
                success: true,
                signature,
                amount,
                from: this.wallet.publicKey.toString(),
                to: toAddress
            };

        } catch (error) {
            console.error("❌ Ошибка отправки SOL:", error);
            throw error;
        }
    }
}

// Создаем экземпляр клиента
export const solanaWeb3Client = new SolanaWeb3Client();

export default SolanaWeb3Client;
