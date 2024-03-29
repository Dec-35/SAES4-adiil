import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.get('', async (req, res) => {
  const [results] = await pool.query(
    'SELECT dc_id, dc_pfp FROM user WHERE username != ? ORDER BY xp DESC LIMIT 3',
    ['admin']
  );

  const listToReturn = [];

  for (const result of results) {
    if (!result.dc_id || !result.dc_pfp) {
      listToReturn.push(null);
      continue;
    }
    const pfpUrl = `https://cdn.discordapp.com/avatars/${result.dc_id}/${result.dc_pfp}.jpg`;
    listToReturn.push(pfpUrl);
  }

  while (listToReturn.length < 3) {
    listToReturn.push(null);
  }

  res.status(200).json({success: true, images: listToReturn});
});

export default router;
