import express from 'express';
const router = express.Router();
import {passcodes, enteredPasscodes} from '../server.js';

router.get('', async (req, res) => {
  const isVerified =
    req.session.tempemail &&
    passcodes[req.session.tempemail] &&
    enteredPasscodes[req.session.tempemail] &&
    passcodes[req.session.tempemail] === enteredPasscodes[req.session.tempemail];

  res.render('login', {
    verifiedRegisterEmail: isVerified,
    cartSize: req.session.cart && req.session.cart.length,
    isLoggedIn: req.session.isLoggedIn,
  });
});
export default router;
