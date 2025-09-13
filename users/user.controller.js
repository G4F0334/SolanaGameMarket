import User from '../database/user-model.js';
import { sequelize } from '../database/database.js';

const mockUsersDatabase = [
    {
        id: "1",
        username: "GameMaster",
        walletAddress: "B8fxFZpZT5mJmVB2JVwvZ8N1q2KW3sS4R9XgMp7YDfEa",
        joinDate: "2024-01-15",
        avatar: null,
        stats: {
            nftsOwned: 0,
            nftsSold: 0,
            totalVolume: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "2", 
        username: "TechNinja",
        walletAddress: "7YrqFQWGzEv3m1sRN8QdK4Hx5jGpT2W9LcVnX6BkMfP3",
        joinDate: "2024-02-10",
        avatar: null,
        stats: {
            nftsOwned: 0,
            nftsSold: 0,
            totalVolume: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "4",
        username: "ElvenArcher",
        walletAddress: "9MpKzQ5WnBvR2fG8YdN3jXc1sTbH7LwE6VqZmP4RkA2D",
        joinDate: "2024-02-05",
        avatar: null,
        stats: {
            nftsOwned: 0,
            nftsSold: 0,
            totalVolume: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

// Получить пользователя по адресу кошелька
export const getUserByWallet = (walletAddress) => {
    return mockUsersDatabase.find(user => user.walletAddress === walletAddress);
};

// Получить пользователя по никнейму
export const getUserByUsername = (username) => {
    return mockUsersDatabase.find(user => user.username === username);
};

// Получить никнейм по адресу кошелька
export const getUsernameByWallet = (walletAddress) => {
    const user = getUserByWallet(walletAddress);
    return user ? user.username : null;
};

// Создать или обновить пользователя
export const createOrUpdateUser = async (req, res) => {
    try {
        // Инициализируем базу данных
        await sequelize.sync({ force: false });
        
        const { username, walletAddress } = req.body;

        if (!username || !walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Username and wallet address are required"
            });
        }

        // Проверяем, не занят ли никнейм другим пользователем
        const existingUserByUsername = await User.findOne({ where: { username } });
        if (existingUserByUsername && existingUserByUsername.walletAddress !== walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Username already taken"
            });
        }

        // Ищем или создаем пользователя
        const [user, created] = await User.findOrCreate({
            where: { walletAddress },
            defaults: {
                username,
                joinDate: new Date(),
                nftsOwned: 0,
                nftsSold: 0,
                totalVolume: 0
            }
        });
        
        // Если пользователь уже существовал, обновляем его никнейм
        if (!created && user.username !== username) {
            user.username = username;
            await user.save();
        }

        console.log(`👤 User ${user.username} (${walletAddress}) ${created ? 'created' : 'updated'}`);

        res.json({
            success: true,
            user: {
                id: user.id.toString(),
                username: user.username,
                walletAddress: user.walletAddress,
                joinDate: new Date(user.joinDate).toLocaleDateString('ru-RU', { 
                    year: 'numeric', 
                    month: 'long' 
                }) + ' г.',
                stats: {
                    nftsOwned: user.nftsOwned || 0,
                    nftsSold: user.nftsSold || 0,
                    totalVolume: user.totalVolume || 0
                }
            }
        });
    } catch (error) {
        console.error("❌ Error creating/updating user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create/update user",
            error: error.message
        });
    }
};

// Получить профиль пользователя
export const getUserProfile = async (req, res) => {
    try {
        // Инициализируем базу данных
        await sequelize.sync({ force: false });
        
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Wallet address is required"
            });
        }

        const user = await User.findOne({ where: { walletAddress } });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id.toString(),
                username: user.username,
                walletAddress: user.walletAddress,
                joinDate: new Date(user.joinDate).toLocaleDateString('ru-RU', { 
                    year: 'numeric', 
                    month: 'long' 
                }) + ' г.',
                stats: {
                    nftsOwned: user.nftsOwned || 0,
                    nftsSold: user.nftsSold || 0,
                    totalVolume: user.totalVolume || 0
                }
            }
        });
    } catch (error) {
        console.error("❌ Error getting user profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get user profile",
            error: error.message
        });
    }
};

// Получить статистику пользователя
export const updateUserStats = (walletAddress, statsUpdate) => {
    const user = getUserByWallet(walletAddress);
    if (user) {
        user.stats = { ...user.stats, ...statsUpdate };
        user.updated_at = new Date().toISOString();
    }
};

export { mockUsersDatabase };
