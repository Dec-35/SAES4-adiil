import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.post('', async (req, res) => {
  const {username, avatar} = req.body;
  const id = req.body.id;

  if (!req.session.isLoggedIn) {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  const email = req.session.email;

  await pool.query(
    'UPDATE user SET dc_id = ?, dc_pfp = ?, dc_username = ? WHERE email = ?',
    [id, avatar, username, email],
    (err) => {
      if (err) {
        console.error('Impossible de changer les infos :', err);
        res.status(500).json({error: 'Impossible de changer les infos'});
        return;
      }
    }
  );

  if (req.session.grade) {
    const roles = {
      Iron: '1148935846809063445',
      Gold: '1148935833110454282',
      Diamant: '1148935845353619488',
    };

    //update the users role in the discord server
    await fetch('http://bdeinfo.fr:3001/assignRole', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: id,
        roleId: roles[req.session.grade],
        clientApiKey: process.env.USER_API_KEY,
      }),
    }).then((res) => {
      if (!res.ok) {
        console.error('Error assigning role:', res);
      }
    });
  }

  res.status(200).json({success: true});
});

export default router;
