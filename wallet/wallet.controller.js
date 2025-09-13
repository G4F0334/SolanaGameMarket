// Mock система балансов пользователей (в реальном приложении это была бы база данных)
const mockWalletBalances = new Map([
    ["FXDeGrKqiNKhEo8SCuW1UhLQvGm4kqyUp8DJTmVVBJQL", 10.0], // Тестовый кошелек с балансом
    ["4JgfqG3GhbXSm5j3pDCa8d8FiQTLT6nmEohtawD77zq9", 5.0],
    ["B8fxFZpZT5mJmVB2JVwvZ8N1q2KW3sS4R9XgMp7YDfEa", 15.0],
    ["7YrqFQWGzEv3m1sRN8QdK4Hx5jGpT2W9LcVnX6BkMfP3", 8.0],
    ["9MpKzQ5WnBvR2fG8YdN3jXc1sTbH7LwE6VqZmP4RkA2D", 12.0]
]);

// Получить баланс кошелька
export const getWalletBalance = (walletAddress) => {
    return mockWalletBalances.get(walletAddress) || 0;
};

// Обновить баланс кошелька
export const setWalletBalance = (walletAddress, newBalance) => {
    mockWalletBalances.set(walletAddress, Math.max(0, newBalance));
    return mockWalletBalances.get(walletAddress);
};

// Перевести SOL между кошельками
export const transferSOL = (fromAddress, toAddress, amount) => {
    const fromBalance = getWalletBalance(fromAddress);
    const toBalance = getWalletBalance(toAddress);
    
    if (fromBalance < amount) {
        throw new Error(`Insufficient balance. Required: ${amount} SOL, Available: ${fromBalance} SOL`);
    }
    
    setWalletBalance(fromAddress, fromBalance - amount);
    setWalletBalance(toAddress, toBalance + amount);
    
    console.log(`💰 SOL Transfer: ${amount} SOL from ${fromAddress} to ${toAddress}`);
    console.log(`📊 New balances - From: ${getWalletBalance(fromAddress)} SOL, To: ${getWalletBalance(toAddress)} SOL`);
    
    return {
        success: true,
        fromBalance: getWalletBalance(fromAddress),
        toBalance: getWalletBalance(toAddress),
        transferAmount: amount
    };
};

// API endpoint для получения баланса кошелька
export const getWalletBalanceAPI = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Wallet address is required"
            });
        }
        
        const balance = getWalletBalance(walletAddress);
        
        res.json({
            success: true,
            balance,
            walletAddress
        });
    } catch (error) {
        console.error("❌ Error getting wallet balance:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get wallet balance",
            error: error.message
        });
    }
};

export { mockWalletBalances };
