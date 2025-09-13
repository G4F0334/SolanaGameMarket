import express from 'express';
import { getWalletBalanceAPI } from './wallet.controller.js';

const router = express.Router();

// Получить баланс кошелька
router.get('/balance/:walletAddress', getWalletBalanceAPI);

export default router;
