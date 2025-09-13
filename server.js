import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nftRoutes from "./nft/nft.routes.js";
import { initializeNFTController } from "./nft/nft.controller.js";

// Load environment variables
dotenv.config();

// 🚀 Создаем Express приложение
const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 Solana Configuration
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY || "2RKCYkDs8AaQSMfukkAnStwSMz36gWT7m8f73izpcpCh";

let solanaConnection;
let wallet;

// 🛡️ Безопасность и middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? ["https://yourdomain.com"] 
        : ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"]
}));
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🚦 Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Слишком много запросов, попробуйте позже",
    },
});
app.use("/api/", limiter);

// 🎨 ASCII арт
const asciiArt = `
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🎮 SOLANA GAME MARKETPLACE API 🎮                       ║
  ║                                                           ║
  ║   🔥 NFT Gaming Items Marketplace                         ║
  ║   🔥 Powered by Solana Blockchain                         ║
  ║   🔥 Create, Trade, Dominate                              ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
`;

// 🏠 Главная страница
app.get("/", (req, res) => {
    res.json({
        message: "🎮 Solana Game Marketplace API",
        version: "1.0.0",
        endpoints: {
            health: "/api/health",
            solana: "/api/solana/*",
            docs: "/api/docs"
        },
        blockchain: {
            network: "Solana Devnet",
            wallet: wallet ? wallet.publicKey.toString() : "Not connected"
        }
    });
});

// 🪙 Solana API Routes
app.get("/api/solana/wallet", (req, res) => {
    if (!wallet) {
        return res.status(500).json({ error: "Wallet not initialized" });
    }
    
    res.json({
        publicKey: wallet.publicKey.toString(),
        network: SOLANA_RPC_URL
    });
});

// 🎨 NFT API Routes
app.use("/api/nft", nftRoutes);

app.get("/api/solana/balance", async (req, res) => {
    try {
        if (!solanaConnection || !wallet) {
            return res.status(500).json({ error: "Solana not initialized" });
        }

        const balance = await solanaConnection.getBalance(wallet.publicKey);
        
        res.json({
            publicKey: wallet.publicKey.toString(),
            balance: balance / 1000000000, // Convert lamports to SOL
            lamports: balance
        });
    } catch (error) {
        console.error("Error getting balance:", error);
        res.status(500).json({ error: "Failed to get balance" });
    }
});

app.get("/api/solana/connection", async (req, res) => {
    try {
        if (!solanaConnection) {
            return res.status(500).json({ error: "Solana connection not initialized" });
        }

        const version = await solanaConnection.getVersion();
        const slot = await solanaConnection.getSlot();
        
        res.json({
            rpcUrl: SOLANA_RPC_URL,
            version,
            slot,
            status: "Connected"
        });
    } catch (error) {
        console.error("Error checking connection:", error);
        res.status(500).json({ error: "Failed to check connection" });
    }
});

// 🏥 Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const healthData = {
            status: "OK",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            solana: {
                connected: !!solanaConnection,
                wallet: wallet ? wallet.publicKey.toString() : null
            }
        };

        if (solanaConnection) {
            try {
                await solanaConnection.getSlot();
                healthData.solana.rpc_status = "Connected";
            } catch (error) {
                healthData.solana.rpc_status = "Disconnected";
            }
        }

        res.json(healthData);
    } catch (error) {
        res.status(500).json({
            status: "ERROR",
            error: error.message
        });
    }
});

// 📚 API Documentation
app.get("/api/docs", (req, res) => {
    res.json({
        title: "🎮 Solana Game Marketplace API",
        version: "1.0.0",
        endpoints: {
            general: {
                "GET /": "API information",
                "GET /api/health": "Health check",
                "GET /api/docs": "This documentation"
            },
            solana: {
                "GET /api/solana/wallet": "Get wallet info",
                "GET /api/solana/balance": "Get wallet balance",
                "GET /api/solana/connection": "Get connection info"
            },
            nft: {
                "POST /api/nft/create": "Create new NFT",
                "GET /api/nft/info/:mint": "Get NFT information",
                "GET /api/nft/balance/:mint/:owner?": "Get token balance",
                "POST /api/nft/listing/create": "Create marketplace listing",
                "POST /api/nft/game/register": "Register new game"
            }
        },
        examples: {
            wallet: "curl http://localhost:3000/api/solana/wallet",
            balance: "curl http://localhost:3000/api/solana/balance",
            health: "curl http://localhost:3000/api/health",
            createNFT: "curl -X POST http://localhost:3000/api/nft/create -H 'Content-Type: application/json' -d '{\"name\":\"Dragon Sword\",\"symbol\":\"DSWD\",\"description\":\"Legendary gaming sword\"}'",
            registerGame: "curl -X POST http://localhost:3000/api/nft/game/register -H 'Content-Type: application/json' -d '{\"name\":\"Epic Quest\",\"symbol\":\"EQ\",\"description\":\"Amazing RPG game\"}'"
        }
    });
});

// 🚫 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "🤔 Endpoint not found",
        message: "The requested endpoint does not exist",
        hint: "Check /api/docs for available endpoints"
    });
});

// 💥 Error handler
app.use((error, req, res, next) => {
    console.error("🚨 Server Error:", error);
    res.status(500).json({
        error: "💥 Internal Server Error",
        message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
        timestamp: new Date().toISOString(),
    });
});

// 🔗 Initialize Solana Connection
const initializeSolana = async () => {
    try {
        console.log("🔗 Initializing Solana connection...");
        
        // Create connection
        solanaConnection = new Connection(SOLANA_RPC_URL, "confirmed");
        
        // Initialize wallet from private key
        let privateKeyArray;
        try {
            // If it's an array string, parse it
            if (SOLANA_PRIVATE_KEY.startsWith('[')) {
                privateKeyArray = JSON.parse(SOLANA_PRIVATE_KEY);
                console.log(`🔍 Parsed array with ${privateKeyArray.length} elements`);
                
                // Ensure it's a Uint8Array of correct size
                if (privateKeyArray.length !== 64) {
                    throw new Error(`Invalid key length: ${privateKeyArray.length}, expected 64`);
                }
                
                privateKeyArray = new Uint8Array(privateKeyArray);
            } else {
                // Try to decode as base58 first
                privateKeyArray = bs58.decode(SOLANA_PRIVATE_KEY);
                console.log(`🔍 Decoded base58 with ${privateKeyArray.length} bytes`);
            }
        } catch (error) {
            console.error("❌ Invalid private key format:", error.message);
            console.log("💡 Expected format: [num1,num2,...] array of 64 numbers or base58 string");
            return false;
        }
        
        wallet = Keypair.fromSecretKey(privateKeyArray);
        
        // Initialize NFT controller with connection and wallet
        initializeNFTController(solanaConnection, wallet);
        
        // Test connection
        const version = await solanaConnection.getVersion();
        console.log("✅ Solana connection established");
        console.log(`📡 RPC: ${SOLANA_RPC_URL}`);
        console.log(`🔑 Wallet: ${wallet.publicKey.toString()}`);
        console.log(`🌐 Version: ${version["solana-core"]}`);
        
        return true;
    } catch (error) {
        console.error("❌ Failed to initialize Solana:", error.message);
        console.log("🔍 Debug info:");
        console.log("  - SOLANA_PRIVATE_KEY length:", SOLANA_PRIVATE_KEY.length);
        console.log("  - SOLANA_PRIVATE_KEY preview:", SOLANA_PRIVATE_KEY.substring(0, 50) + "...");
        return false;
    }
};

// 🚀 Server startup flag to prevent multiple initializations
let isServerStarted = false;

// 🚀 Start server function
const startServer = async () => {
    if (isServerStarted) {
        console.log("⚠️  Server already started, skipping...");
        return;
    }
    
    try {
        console.log(asciiArt);
        console.log("🔄 Starting Solana Game Marketplace...\n");

        // Initialize Solana
        await initializeSolana();

        // Start server
        const server = app.listen(PORT, () => {
            console.log("🎉 SERVER STARTED SUCCESSFULLY! 🎉\n");
            console.log(`🌐 Server running on: http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`🪙 Solana Wallet: http://localhost:${PORT}/api/solana/wallet`);
            console.log(`\n🎮 Ready to handle Solana gaming transactions!`);
            console.log("🔥 Let's build the future of gaming! 🔥\n");
        });

        isServerStarted = true;
        return server;
    } catch (error) {
        console.error("💥 Failed to start server:", error);
        process.exit(1);
    }
};

// 🎯 Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
    
    try {
        if (solanaConnection) {
            console.log("🔌 Closing Solana connection...");
        }
        console.log("✅ Shutdown complete. Goodbye!");
        process.exit(0);
    } catch (error) {
        console.error("💥 Error during shutdown:", error);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// 🚀 Start the server only once
if (!isServerStarted) {
    startServer();
}

export default app;
