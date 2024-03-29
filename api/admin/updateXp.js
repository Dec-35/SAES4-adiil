import express from 'express';
const router = express.Router();

router.post('', async (req, res) => {
  if (!req.session.isLoggedIn || req.session.category !== 'admin') {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  if (!req.body.xpAmount || isNaN(req.body.xpAmount) || req.body.xpAmount < 0) {
    res.status(400).json({error: 'Veuillez entrer un nombre valide'});
    return;
  }

  var xpAmount = req.body.xpAmount;

  process.env.XP_AMOUNT = xpAmount;

  res.status(200).json({success: true});
});

export default router;
