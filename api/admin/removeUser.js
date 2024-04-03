import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.post('', async (req, res) => {
  const {email, eventId, type} = req.body;
  let eventPrice;

  if (!req.session.isLoggedIn || req.session.category !== 'admin') {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  if (type === 'event') {
    //get the event price
    const [eventResults] = await pool.query(
      'SELECT * FROM event WHERE id = ?',
      [eventId],
      (err) => {
        if (err) {
          console.error('Impossible de récupérer l event :', err);
          res.status(500).json({error: 'Impossible de récupérer l event'});
          return;
        }
      }
    );
    if (eventResults.length === 0) {
      res.status(404).json({error: "Impossible de trouver l'evenement"});
      return;
    }
    eventPrice = eventResults['0'].price;

    await pool.query(
      'DELETE FROM inscription WHERE event_id = ? AND user = ?',
      [eventId, email],
      (err) => {
        if (err) {
          console.error('Impossible de supprimer le participant :', err);
          res
            .status(500)
            .json({error: 'Impossible de supprimer le participant'});
          return;
        }
      }
    );
  } else if (type === 'product') {
    //set is_canceled to 1 in the transactionContent table
    await pool.query(
      'UPDATE transactionContent JOIN transaction ON transactionContent.transaction_id = transaction.transaction_id SET is_canceled = 1 WHERE product_id = ? AND email = ?',
      [eventId, email],
      (err) => {
        if (err) {
          console.error('Impossible de supprimer le produit :', err);
          res.status(500).json({error: 'Impossible de supprimer le produit'});
          return;
        }
      }
    );

    eventPrice = 1;
  } else {
    res.status(400).json({error: 'Type inconnu'});
    return;
  }

  //also remove the user's xp
  var xpToRemove =
    eventPrice > 0 ? process.env.XP_AMOUNT : process.env.XP_AMOUNT / 5;

  await pool.query(
    'UPDATE user SET xp = xp - ? WHERE email = ?',
    [xpToRemove, email],
    (err) => {
      if (err) {
        console.error('Impossible de changer l xp :', err);
        res.status(500).json({error: 'Impossible de changer l xp'});
        return;
      }
    }
  );
  req.session.xp -= parseInt(xpToRemove);
  res.status(200).json({success: true});
});

export default router;
