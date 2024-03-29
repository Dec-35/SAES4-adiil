import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.post('', async (req, res) => {
  //return a list of users that match the query
  const {value, eventId} = req.body;

  if (!req.session.isLoggedIn || req.session.category !== 'admin') {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  const [usernameResults] = await pool.query(
    'SELECT email, username FROM user WHERE username LIKE ?',
    ['%' + value + '%'],
    (err) => {
      if (err) {
        console.error('Impossible de récupérer les utilisateurs :', err);
        res
          .status(500)
          .json({error: 'Impossible de récupérer les utilisateurs'});
        return;
      }
    }
  );

  const [emailResults] = await pool.query(
    'SELECT email, username FROM user WHERE email LIKE ? AND username NOT IN (SELECT username FROM user WHERE username LIKE ?)',
    ['%' + value + '%', '%' + value + '%'],
    (err) => {
      if (err) {
        console.error('Impossible de récupérer les utilisateurs :', err);
        res
          .status(500)
          .json({error: 'Impossible de récupérer les utilisateurs'});
        return;
      }
    }
  );

  if (!eventId) {
    res
      .status(200)
      .json({success: true, results: usernameResults.concat(emailResults)});
    return;
  }
  const [inscriptionResults] = await pool.query(
    'SELECT user FROM inscription WHERE event_id = ?',
    [eventId],
    (err) => {
      if (err) {
        console.error('Impossible de récupérer les inscriptions :', err);
        res
          .status(500)
          .json({error: 'Impossible de récupérer les inscriptions'});
        return;
      }
    }
  );

  const results = usernameResults.concat(emailResults);
  const inscriptionList = inscriptionResults.map((inscription) => {
    return inscription.user;
  });

  res.status(200).json({success: true, results, inscriptions: inscriptionList});
});

export default router;
