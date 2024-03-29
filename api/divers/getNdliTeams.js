import express from 'express';
import fs from 'fs/promises';
const router = express.Router();

router.get('', async(req, res) => {
    const id = req.headers.room;

    try {
        const teams = await getTeamsForRoom(id);
        res.json({
            success: true,
            teams: teams,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
})

async function getTeamsForRoom(id) {
    const file = await fs.readFile('./ndli/teams.json');
    const teams = JSON.parse(file);
    const teamsForRoom = teams.filter((team) => {
        return team.room === id;
    });
    return teamsForRoom;
}

export default router;