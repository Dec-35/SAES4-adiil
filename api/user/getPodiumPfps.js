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
    if (!result.dc_id || !result.dc_pfp || result.dc_pfp === 'NULL') {
      listToReturn.push(null);
      continue;
    }
    const pfpUrl = `https://cdn.discordapp.com/avatars/${result.dc_id}/${result.dc_pfp}.jpg`;

    // Check if the image exists
    const response = await fetch(pfpUrl);
    if (!response.ok) {
      listToReturn.push(null);
      continue;
    }

    listToReturn.push(pfpUrl);
  }

  while (listToReturn.length < 3) {
    listToReturn.push(null);
  }

  res.status(200).json({success: true, images: listToReturn});
});

export default router;
