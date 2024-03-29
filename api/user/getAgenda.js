import express from 'express';
const router = express.Router();
import fs from 'fs/promises';
import fetch from 'node-fetch';

router.get('', async (req, res) => {
  try {
    const category = req.session.category;

    // Read the ics/icals.json to get the url of the calendar.
    const jsonString = await fs.readFile('cals/icals.json', 'utf8');
    const icals = JSON.parse(jsonString);

    // Find the element with the matching category and get the url.
    const fetchUrlObj = icals.elements.find(
      (element) => element.classe === category
    );

    if (!fetchUrlObj) {
      res.status(404).send('Calendar URL not found for the given category.');
      return;
    }

    const fetchUrl = fetchUrlObj.url;

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      console.log('Failed to fetch iCal data');
      //check if the file exists
      try {
        const data = await fs.readFile(`cals/${category}.ics`, 'utf8');
        res.status(200).json({success: true, events: data, cached: true});
        return;
      } catch (err) {
        console.error('No cached file found for class: ', category);
        res.status(403).send('Api failed and no cached file found');
        return;
      }
    }

    const data = await response.text();
    //store the data in a file in case the calendar api is down
    await fs.writeFile(`cals/${category}.ics`, data, 'utf8');

    res.status(200).json({success: true, events: data, cached: false});
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).send('An error occurred');
  }
});

export default router;
