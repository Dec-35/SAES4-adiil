import express from 'express';
const router = express.Router();
import {pool, sendEmail, forgotten_passcodes} from '../../server.js';

router.post('', async (req, res) => {
  const {email} = req.body;

  // Check if the email already exists
  const [exists] = await pool.query(
    'SELECT * FROM user WHERE email = ?',
    [email],
    (err, results) => {
      if (err) {
        console.error('Impossible de récupérer le mail :', err);
        res.status(500).json({error: 'Impossible de récupérer le mail'});
        return;
      }
    }
  );

  if (exists.length === 0) {
    res.status(409).json({error: 'Email non utilisée'});
    return;
  }

  // Email found, send the passcode
  console.log('Sending forgotten password passcode email to ' + email + '...');
  const passcode = Math.floor(Math.random() * 1000000);

  //add the passcode to the forgotten_passcodes object
  forgotten_passcodes[email] = passcode;

  req.session.email = email;

  await sendEmail(
    email,
    "Vérification de réinitialisation de votre mot de passe de l'ADIIL",
    passcode,
    'réinitialisation de mot de passe'
  );

  res.status(200).json({success: true});
});

export default router;
