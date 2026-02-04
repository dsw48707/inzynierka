import express from 'express';
import cors from 'cors';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import { sequelize } from './db.js';
import routes from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});


const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('--- Baza MySQL połączona ---');
        app.listen(PORT, () => {
            console.log(`--- Serwer działa na porcie ${PORT} ---`);
        });
    } catch (e) {
        console.error('Błąd:', e);
    }
};

start();