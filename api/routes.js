import express from 'express';
import { Asset, AssetHistory, Issue } from './db.js'; // Upewnij się, że importujemy Issue!

const router = express.Router();

// --- ZASOBY (ASSETS) ---

// Pobierz wszystko
router.get('/assets', async (req, res) => {
    const assets = await Asset.findAll();
    res.json(assets);
});

// Dodaj sprzęt
router.post('/assets', async (req, res) => {
    try {
        const { name, serialNumber, status, assignedTo } = req.body;
        const newAsset = await Asset.create({ name, serialNumber, status, assignedTo });
        
        // Log do historii
        await AssetHistory.create({
            action: 'UTWORZENIE',
            description: `Dodano sprzęt: ${name} (${status})`,
            AssetId: newAsset.id
        });

        res.json(newAsset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Edytuj sprzęt
router.put('/assets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const oldAsset = await Asset.findByPk(id);
        if (!oldAsset) return res.status(404).json({ error: 'Nie znaleziono' });

        const changes = [];
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

// Usuń sprzęt
router.delete('/assets/:id', async (req, res) => {
    await Asset.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
});

// --- HISTORIA ---

router.get('/assets/:id/history', async (req, res) => {
    const history = await AssetHistory.findAll({ 
        where: { AssetId: req.params.id },
        order: [['createdAt', 'DESC']]
    });
    res.json(history);
});

// --- ZGŁOSZENIA (ISSUES) - NOWOŚĆ ---

// Pobierz zgłoszenia (z dołączonym info o sprzęcie)
router.get('/issues', async (req, res) => {
    try {
        const issues = await Issue.findAll({ 
            include: Asset,
            order: [['createdAt', 'DESC']]
        });
        res.json(issues);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Dodaj zgłoszenie
router.post('/issues', async (req, res) => {
    try {
        const { title, description, priority, AssetId, reportedBy, userEmail } = req.body;
        const newIssue = await Issue.create({
            title, description, priority, AssetId, reportedBy, userEmail
        });
        res.json(newIssue);
    } catch (err) {
        res.status(400).json({ error: "Błąd tworzenia zgłoszenia." });
    }
});

// Aktualizuj status zgłoszenia
router.put('/issues/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await Issue.update({ status }, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;