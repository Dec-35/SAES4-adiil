import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.post('', async (req, res) => {
  var classe = req.body.classe;
  var email = req.session.email;

  if (classe && email) {
    if (classe === 'admin') {
      res.status(403).json({error: 'Vous ne pouvez pas faire ça'});
      console.log('Tentative de changement de classe en admin par ' + email);
      return;
    }

    if (classe.length > 3) {
      res.status(400).json({error: 'Veuillez entrer une classe valide'});
      return;
    }

    classe = classe.toUpperCase();

    classe = classe.toUpperCase();
    await pool.query(
      'UPDATE user SET category = ? WHERE email = ?',
      [classe, email],
      (err) => {
        if (err) {
          console.error('Impossible de changer la classe :', err);
          res.status(500).json({error: 'Impossible de changer la classe'});
          return;
        }
      }
    );
    req.session.category = classe;
    res.status(200).json({success: true});
  } else {
    res.status(400).json({error: 'Veuillez entrer une classe valide'});
  }
});

export default router;
