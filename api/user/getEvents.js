import express from 'express';
const router = express.Router();
import fs from 'fs';
import ICAL from 'ical.js';

router.get('', async (req, res) => {
  try {
    const data = fs.readFileSync('./public/ical/basic.ics', 'utf8');

    const jcalData = ICAL.parse(data);
    // Assuming the main component is a VCALENDAR
    const comp = new ICAL.Component(jcalData);
    // Extract all VEVENT components from the VCALENDAR
    const jCal = comp.jCal;
    const vevents = [];

    for (const i in jCal[2]) {
      if (jCal[2][i][0] === 'vevent') {
        vevents.push(jCal[2][i][1]);
      }
    }

    var events = [];

    if (vevents.length > 0) {
      events = vevents.map((vevent) => {
        return {
          summary: vevent.find((x) => x[0] === 'summary')[3],
          start: new Date(vevent.find((x) => x[0] === 'dtstart')[3]),
          end: new Date(vevent.find((x) => x[0] === 'dtend')[3]),
          description: vevent.find((x) => x[0] === 'description')[3],
          location: vevent.find((x) => x[0] === 'location')[3],
          // Add other properties as needed
        };
      });
      console.debug('events to send : ', events);
    } else {
      console.log('No VEVENT components found in the VCALENDAR.');
      res.status(500).send('No VEVENT components found in the VCALENDAR.');
      return;
    }

    res.status(200).json({success: true, events: events});
  } catch (err) {
    console.error('Error getting events:', err);
    res.status(500).send('An error occurred');
  }
});

export default router;
