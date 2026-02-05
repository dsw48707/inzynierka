import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false
    }
);

const Asset = sequelize.define('Asset', {
    name: { type: DataTypes.STRING, allowNull: false },
    serialNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM('AVAILABLE', 'ASSIGNED', 'BROKEN'), defaultValue: 'AVAILABLE' },
    assignedTo: { type: DataTypes.STRING, allowNull: true }
});

const AssetHistory = sequelize.define('AssetHistory', {
    action: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    AssetId: { type: DataTypes.INTEGER, allowNull: false }
});

Asset.hasMany(AssetHistory, { onDelete: 'CASCADE' });
AssetHistory.belongsTo(Asset);

sequelize.sync({ alter: true });

export { sequelize, Asset, AssetHistory };