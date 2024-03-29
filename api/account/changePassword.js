import express from 'express';
const router = express.Router();
import {
  pool,
  forgotten_enteredPasscodes,
  forgotten_passcodes,
} from '../../server.js';

async function changePassword(req, res) {
  const {password1, password2, passcode} = req.body;

  if (passcode != req.session.passcode) {
    res.status(403).json({error: 'Code incorrect'});
    return;
  }

  const email = req.session.email;

  delete forgotten_enteredPasscodes[email];
  delete forgotten_passcodes[email];

  if (password1 !== password2) {
    res.status(403).json({error: 'Les mots de passe ne correspondent pas'});
    return;
  }

  await pool.query(
    'UPDATE user SET password = ? WHERE email = ?',
    [password1, email],
    (err) => {
      if (err) {
        console.error('Impossible de changer le mot de passe :', err);
        res.status(500).json({error: 'Impossible de changer le mot de passe'});
        return;
      }
    }
  );

  res.status(200).json({success: true});
}

router.post('', changePassword);

export default router;
