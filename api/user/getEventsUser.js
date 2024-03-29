import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.get('', async (req, res) => {
  if (!req.session.isLoggedIn || req.session.email === undefined) {
    res.status(200).json({success: true, events: []});
    return;
  }

  const [userEvents] = await pool.query(
    'SELECT event.name, event.date FROM event JOIN inscription ON inscription.event_id = event.id WHERE inscription.user = ?',
    [req.session.email],
    (err) => {
      if (err) {
        console.error('Impossible de récupérer les events :', err);
        res.status(500).json({error: 'Impossible de récupérer les events'});
        return;
      }
    }
  );

  res.status(200).json({success: true, events: userEvents});
});

export default router;
