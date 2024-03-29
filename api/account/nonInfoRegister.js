import express from 'express';
const router = express.Router();
import {pool, setSessionItems} from '../../server.js';

router.post('', async (req, res) => {
  const defaultXp = process.env.DEFAULT_XP;
  const name = req.body.name;

  //check if the name already exists in the users table
  const [exists] = await pool.query(
    'SELECT * FROM user WHERE username = ?',
    [name],
    (err, results) => {
      if (err) {
        console.error('Impossible de créer le compte :', err);
        res.status(500).json({error: 'Impossible de créer le compte'});
        return;
      }
    }
  );

  if (exists.length > 0) {
    res.status(409).json({error: 'Nom déjà utilisé'});
    return;
  }

  // Name not found, create new user with blank attributes except for the name
  console.log('Creating new temp user with name ' + name + '...');

  await pool.query(
    'INSERT INTO user (email, username) VALUES (?,?)',
    [name, name],
    (err) => {
      if (err) {
        console.error('Impossible de créer l utilisateur temporaire :', err);
        res.status(500).json({error: 'Impossible de créer l utilisateur'});
        return;
      }
    }
  );

  await setSessionItems(req, name, 'temp', name, defaultXp, null);

  res.status(200).json({success: true});
});

export default router;
