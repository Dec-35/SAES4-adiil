import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.get('', async (req, res) => {
  let eventsToSend = [];

  if (req.session.cart !== undefined) {
    //create a const cart with all the events with type 'event'
    const cart = req.session.cart.filter((event) => event.type === 'event');
    if (cart.length != 0) {
      let paramList = '';
      cart.forEach((event) => {
        paramList += event.id + ',';
      });
      paramList = paramList.slice(0, -1);

      const [cartEvents] = await pool.query(
        `SELECT name, date FROM event WHERE id IN (${paramList})`
      );

      eventsToSend = cartEvents.map((event) => {
        return {
          event: event,
          isCart: true,
        };
      });
    }
  }

  if (!req.session.isLoggedIn || req.session.email === undefined) {
    res.status(200).json({success: true, events: eventsToSend});
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

  eventsToSend = eventsToSend.concat(
    userEvents.map((event) => {
      return {
        event: event,
        isCart: false,
      };
    })
  );

  res.status(200).json({success: true, events: eventsToSend});
});

export default router;
