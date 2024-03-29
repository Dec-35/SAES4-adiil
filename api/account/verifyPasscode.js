import express from 'express';
const router = express.Router();
import {forgotten_enteredPasscodes, forgotten_passcodes} from '../../server.js';

router.post('', async (req, res) => {
  const {passcode} = req.body;
  const email = req.session.email;

  forgotten_enteredPasscodes[email] = parseInt(passcode);

  if (passcode != forgotten_passcodes[email]) {
    res.status(403).json({error: 'Code incorrect'});
    return;
  }

  req.session.passcode = passcode;

  res.status(200).json({success: true});
});

export default router;
