import express from 'express';
import { createOrUpdateUser, getUserProfile } from './user.controller.js';

const router = express.Router();

// Создать или обновить пользователя
router.post('/profile', createOrUpdateUser);

// Получить профиль пользователя
router.get('/profile/:walletAddress', getUserProfile);

export default router;
