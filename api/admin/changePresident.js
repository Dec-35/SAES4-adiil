import express from 'express';
const router = express.Router();

router.post('', async (req, res) => {
  if (!req.session.isLoggedIn || req.session.category !== 'admin') {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  if (!req.body.president) {
    res.status(400).json({error: 'Veuillez entrer un nom valide'});
    return;
  }

  const president = req.body.president;

  process.env.OWNER = president;

  res.status(200).json({success: true});
});

export default router;
