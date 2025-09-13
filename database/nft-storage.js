import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NFT_DB_PATH = path.join(__dirname, 'nft-database.json');

// Загрузить NFT из файла
export const loadNFTDatabase = () => {
    try {
        if (!fs.existsSync(NFT_DB_PATH)) {
            console.log('📁 NFT database file not found, creating new one...');
            saveNFTDatabase([]);
            return [];
        }
        
        const data = fs.readFileSync(NFT_DB_PATH, 'utf8');
        const nfts = JSON.parse(data);
        console.log(`📚 Loaded ${nfts.length} NFTs from database`);
        return nfts;
    } catch (error) {
        console.error('❌ Error loading NFT database:', error);
        return [];
    }
};

// Сохранить NFT в файл
export const saveNFTDatabase = (nfts) => {
    try {
        // Убеждаемся, что директория существует
        const dbDir = path.dirname(NFT_DB_PATH);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        fs.writeFileSync(NFT_DB_PATH, JSON.stringify(nfts, null, 2));
        console.log(`💾 Saved ${nfts.length} NFTs to database`);
        return true;
    } catch (error) {
        console.error('❌ Error saving NFT database:', error);
        return false;
    }
};

// Добавить NFT в базу данных
export const addNFTToDatabase = (nft) => {
    try {
        const nfts = loadNFTDatabase();
        nfts.push(nft);
        saveNFTDatabase(nfts);
        console.log(`✅ Added NFT "${nft.name}" to database with ID ${nft.id}`);
        return true;
    } catch (error) {
        console.error('❌ Error adding NFT to database:', error);
        return false;
    }
};

// Обновить NFT в базе данных
export const updateNFTInDatabase = (nftId, updateData) => {
    try {
        const nfts = loadNFTDatabase();
        const nftIndex = nfts.findIndex(nft => nft.id == nftId || nft.id === parseInt(nftId));
        
        if (nftIndex === -1) {
            console.error(`❌ NFT with ID ${nftId} not found in database`);
            return false;
        }
        
        nfts[nftIndex] = { ...nfts[nftIndex], ...updateData, updated_at: new Date().toISOString() };
        saveNFTDatabase(nfts);
        console.log(`✅ Updated NFT "${nfts[nftIndex].name}" in database`);
        return true;
    } catch (error) {
        console.error('❌ Error updating NFT in database:', error);
        return false;
    }
};

// Получить следующий доступный ID
export const getNextNFTId = () => {
    try {
        const nfts = loadNFTDatabase();
        if (nfts.length === 0) return 1;
        
        const maxId = Math.max(...nfts.map(nft => parseInt(nft.id) || 0));
        return maxId + 1;
    } catch (error) {
        console.error('❌ Error getting next NFT ID:', error);
        return 1;
    }
};
