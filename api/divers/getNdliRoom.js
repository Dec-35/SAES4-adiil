import express from 'express';
import fs from 'fs/promises';
const router = express.Router();

router.get('', async (req, res) => {
  const name = req.headers.name;
  if (!name || name === '' || name === ' ') {
    res.json({
      success: false,
      reason: 'Aucun nom fourni',
    });
    return;
  }

  try {
    const results = await getRoom(name);
    if (results.length === 0) {
      res.json({
        success: false,
        reason: 'Aucun membre avec ce nom trouvé',
      });
      return;
    }
    res.json({
      success: true,
      results: results,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

async function getRoom(name) {
  //get the room from the members of each team
  const file = await fs.readFile('./ndli/teams.json');
  const teams = JSON.parse(file);

  var results = [];
  teams.forEach((team) => {
    team.members.forEach((member) => {
      if (
        member.toLowerCase() === name.toLowerCase() ||
        member.toLowerCase().includes(name.toLowerCase())
      ) {
        results.push({member: member, room: team.room});
      }
    });
  });
  return results;
}

export default router;
