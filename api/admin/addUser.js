import express from 'express';
const router = express.Router();
import {pool, addUserToEventWithXp} from '../../server.js';
import {v4 as uuidv4} from 'uuid';

router.post('', async (req, res) => {
  const {email, eventId, xp} = req.body;

  if (!req.session.isLoggedIn || req.session.category !== 'admin') {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  if (req.session.category !== 'admin') {
    res.status(403).json({error: 'Vous ne pouvez pas faire ça'});
    console.log(
      'Tentative illégale d ajout de participant par ' + req.session.email
    );
    return;
  }

  //if the user is already in the database, add him to the event, else create a new user and add him to the event
  const [exists] = await pool.query(
    'SELECT * FROM user WHERE email = ?',
    [email],
    (err, results) => {
      if (err) {
        console.error('Impossible de créer le compte :', err);
        res.status(500).json({error: 'Impossible de créer le compte'});
        return;
      }
    }
  );
  if (exists.length === 0) {
    await pool.query(
      'INSERT INTO user (username, password, email, category) VALUES (?, ?, ?, ?)',
      [email, 'default', email, '11A'],
      (err) => {
        if (err) {
          console.error('Impossible de créer le compte :', err);
          res.status(500).json({error: 'Impossible de créer le compte '});
          return;
        }
      }
    );
  }

  let [item] = await pool.query(
    'SELECT * FROM event WHERE id = ?',
    [eventId],
    (err, results) => {
      if (err) {
        console.error('Impossible de trouver l evenement :', err);
        res.status(500).json({error: 'Impossible de trouver l evenement'});
        return;
      }
    }
  );

  if (item.length === 0) {
    res.status(404).json({error: 'Impossible de trouver l evenement'});
    return;
  }
  item = item[0];

  item.type = 'event';

  //create a valid transaction to reference
  const transactionId = uuidv4();

  await pool.query(
    'INSERT INTO transaction (transaction_id, email, validated, total_price, purchase_date) VALUES (?, ?, ?, ?, ?)',
    [transactionId, email, 1, item.price, new Date()],
    (err) => {
      if (err) {
        console.error('Impossible de créer la transaction :', err);
        res.status(500).json({error: 'Impossible de créer la transaction'});
        return;
      }
    }
  );

  var success = await addUserToEventWithXp(email, item, xp, transactionId, req);
  if (!success) {
    res.status(500).send('An error occurred');
    return;
  }
  res.status(200).json({success: true});
});

export default router;
