import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.get('/', async (req, res) => {
  const events = new Array();

  if (!req.session.isLoggedIn || req.session.category !== 'admin') {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  // Récupérer les événements de la base de données

  const eventsQuery = 'SELECT * FROM event';
  const [eventsResults] = await pool.query(eventsQuery);

  const fetchInscriptions = async (eventId) => {
    const inscriptionsQuery = 'SELECT user FROM inscription WHERE event_id = ?';
    const [inscriptionResults] = await pool.query(inscriptionsQuery, [eventId]);
    return inscriptionResults.map((result) => result.user);
  };

  // Récupérer les inscriptions pour chaque événement
  for (const eventResult of eventsResults) {
    const eventId = eventResult.id;

    const users = await fetchInscriptions(eventId);

    events.push({
      id: eventId,
      name: eventResult.name,
      price: eventResult.price,
      date: eventResult.date,
      users: users,
    });
  }

  res.json({success: true, events: events});
});

export default router;
