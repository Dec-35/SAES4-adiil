import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.post('', async (req, res) => {
  const query = req.body.sql;

  if (!req.session.isLoggedIn || req.session.category !== 'admin') {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  if (!query || query.length === 0) {
    res.status(400).json({results: 'Veuillez entrer une requête SQL'});
    return;
  }

  try {
    const [results] = await pool.query(query);

    res.status(200).json({success: true, results});
  } catch (err) {
    res
      .status(500)
      .json({results: 'Erreur lors du traitement de la requête SQL : ' + err});
  }
});

export default router;
