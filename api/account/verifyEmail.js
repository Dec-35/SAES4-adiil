import express from 'express';
const router = express.Router();
import {pool, sendEmail, passcodes} from '../../server.js';

router.post('', async (req, res) => {
  var {email} = req.body;

  if (!email) {
    res.status(400).json({error: 'Email manquant'});
    return;
  }

  // Check if the email already exists
  const [exists] = await pool.query(
    'SELECT * FROM user WHERE email = ?',
    [email],
    (err) => {
      if (err) {
        console.error('Impossible de créer le compte :', err);
        res.status(500).json({error: 'Impossible de créer le compte'});
        return;
      }
    }
  );

  if (exists.length > 0) {
    res.status(409).json({error: 'Email déjà utilisée'});
    return;
  }

  email = email.toLowerCase();

  //check if the email is the correct pattern (firstname.lastname.etu@univ-lemans.fr)
  const pattern = /^[a-z]+.[a-z]+.etu@univ-lemans.fr$/;
  if (!pattern.test(email)) {
    res.status(400).json({error: 'Email invalide'});
    return;
  }

  const passcode = Math.floor(Math.random() * 1000000);

  passcodes[email] = passcode;

  await sendEmail(
    email,
    "Vérification de votre inscription à l'ADIIL",
    passcode,
    'inscription'
  );

  res.status(200).json({success: true});
});

export default router;
