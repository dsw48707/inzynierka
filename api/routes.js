import express from 'express';
import { Asset, AssetHistory } from './db.js';

const router = express.Router();

router.get('/assets', async (req, res) => {
    const assets = await Asset.findAll();
    res.json(assets);
});

router.post('/assets', async (req, res) => {
    try {
        const { name, category, serialNumber, status, assignedTo } = req.body;
        
        const newAsset = await Asset.create({ name, category, serialNumber, status, assignedTo });
        
        await AssetHistory.create({
            action: 'UTWORZENIE',
            description: `Dodano: ${category} ${name} (${status})`,
            AssetId: newAsset.id
        });

        res.json(newAsset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/assets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const oldAsset = await Asset.findByPk(id);
        if (!oldAsset) return res.status(404).json({ error: 'Nie znaleziono' });

        const changes = [];
        // Sprawdzamy zmiany
        if (req.body.name !== oldAsset.name) changes.push(`Zmiana modelu: ${oldAsset.name} -> ${req.body.name}`);
        if (req.body.category !== oldAsset.category) changes.push(`Zmiana kategorii: ${oldAsset.category} -> ${req.body.category}`);
        if (req.body.status !== oldAsset.status) changes.push(`Zmiana statusu: ${oldAsset.status} -> ${req.body.status} (Przypisano do: ${req.body.assignedTo || 'Brak'})`);
        if (req.body.assignedTo !== oldAsset.assignedTo) changes.push(`Zmiana użytkownika: ${oldAsset.assignedTo} -> ${req.body.assignedTo}`);

        await Asset.update(req.body, { where: { id } });

        if (changes.length > 0) {
            await AssetHistory.create({
                action: 'EDYCJA',
                description: changes.join(', '),
                AssetId: id
            });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/assets/:id', async (req, res) => {
    await Asset.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
});

router.get('/assets/:id/history', async (req, res) => {
    const history = await AssetHistory.findAll({ 
        where: { AssetId: req.params.id },
        order: [['createdAt', 'DESC']]
    });
    res.json(history);
});
// W pliku api/routes.js

// Zamiast app.get wpisz router.get
// Zamiast '/api/dashboard-stats' wpisz '/dashboard-stats'
router.get('/dashboard-stats', async (req, res) => {
  try {
    const total = await Asset.count();
    const available = await Asset.count({ where: { status: 'AVAILABLE' } });
    const assigned = await Asset.count({ where: { status: 'ASSIGNED' } });
    const broken = await Asset.count({ where: { status: 'BROKEN' } });
    
    const recent = await Asset.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    res.json({ total, available, assigned, broken, recent });
  } catch (err) {
    console.error("Błąd dashboardu:", err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});
export default router;