import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.get('', async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  const email = req.session.email;
  //get the discord id and the pfp id from the user database

  const [results] = await pool.query(
    'SELECT dc_username, dc_id, dc_pfp FROM user WHERE email = ?',
    [email],
    (err) => {
      if (err) {
        console.error('Impossible de récupérer les infos :', err);
        res.status(500).json({error: 'Impossible de récupérer les infos'});
        return;
      }
    }
  );

  if (results.length === 0) {
    res.status(204).send();
    return;
  }

  const dc_id = results[0].dc_id;
  const dc_pfp = results[0].dc_pfp;
  const dc_username = results[0].dc_username;

  if (!dc_id || !dc_pfp || !dc_username) {
    res.status(204).send();
    return;
  }

  const pfpUrl = `https://cdn.discordapp.com/avatars/${dc_id}/${dc_pfp}.jpg`;

  res.status(200).json({success: true, pfp: pfpUrl, username: dc_username});
});

export default router;
