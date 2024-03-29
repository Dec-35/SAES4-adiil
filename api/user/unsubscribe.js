import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.post('', async (req, res) => {
  try {
    var email = req.session.email;
    //get the price of the grade
    const [gradeResults] = await pool.query(
      'SELECT price FROM grade JOIN user ON grade.id = user.grade WHERE email = ?',
      [email],
      (err) => {
        if (err) {
          res.status(500).json({success: false});
          return;
        }
      }
    );
    const gradePrice = gradeResults[0].price;

    await pool.query(
      'UPDATE user SET grade = NULL WHERE email = ?',
      [email],
      (err, result) => {
        if (err) {
          res.status(500).json({success: false});
          return;
        }
      }
    );

    //remove the user from the usersToRenew table
    await pool.query(
      'DELETE FROM usersToRenew WHERE user = ?',
      [email],
      (err, result) => {
        if (err) {
          res.status(500).json({success: false});
          return;
        }
      }
    );

    var xpToRemove =
      gradePrice > 0 ? process.env.XP_AMOUNT : process.env.XP_AMOUNT / 5;

    //remove xp from the user
    await pool.query(
      'UPDATE user SET xp = xp - ? WHERE email = ?',
      [xpToRemove, email],
      (err, result) => {
        if (err) {
          res.status(500).json({success: false});
          return;
        }
      }
    );
    req.session.xp -= parseInt(xpToRemove);

    res.status(200).json({success: true});
    return;
  } catch {
    res.status(403).json({error: 'Erreur lors de la suppression du grade'});
  }
});

export default router;
