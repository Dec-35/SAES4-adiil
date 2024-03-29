import express from 'express';
const router = express.Router();
import {enteredPasscodes, passcodes} from '../../server.js';

router.post('', async (req, res) => {
  let {passcode, email} = req.body;
  email = email.toLowerCase();
  enteredPasscodes[email] = parseInt(passcode);

  if (passcode != '' + passcodes[email]) {
    delete enteredPasscodes[email];
    delete passcodes[email];

    res.status(403).json({error: 'Code incorrect'});
    return;
  }

  req.session.email = email;

  res.json({success: true});
});

export default router;
