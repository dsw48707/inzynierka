import { Sequelize, DataTypes } from 'sequelize';

// Konfiguracja bazy SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

// Model: Sprzęt
const Asset = sequelize.define('Asset', {
    name: { type: DataTypes.STRING, allowNull: false },
    serialNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM('AVAILABLE', 'ASSIGNED', 'BROKEN'), defaultValue: 'AVAILABLE' },
    assignedTo: { type: DataTypes.STRING, allowNull: true } // Przechowujemy Imię Nazwisko z Azure
});

// Model: Historia zmian
const AssetHistory = sequelize.define('AssetHistory', {
    action: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    AssetId: { type: DataTypes.INTEGER, allowNull: false } // Klucz obcy
});

// Model: Zgłoszenia (NOWY)
const Issue = sequelize.define('Issue', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    priority: { type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH'), defaultValue: 'NORMAL' },
    status: { type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'CLOSED'), defaultValue: 'OPEN' },
    reportedBy: { type: DataTypes.STRING, allowNull: false },
    userEmail: { type: DataTypes.STRING, allowNull: true }
});

// Relacje
Asset.hasMany(AssetHistory, { onDelete: 'CASCADE' });
AssetHistory.belongsTo(Asset);

Asset.hasMany(Issue);
Issue.belongsTo(Asset);

// Synchronizacja bazy (używamy alter, żeby dodać nową tabelę bez usuwania danych)
sequelize.sync({ alter: true })
    .then(() => console.log("📦 Baza danych zsynchronizowana."))
    .catch(err => console.error("❌ Błąd bazy danych:", err));

export { sequelize, Asset, AssetHistory, Issue };