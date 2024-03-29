import express from 'express';
const router = express.Router();
import {banner} from '../../server.js';

router.post('', async (req, res) => {
  try {
    const {showBanner, color, textToShow, link, linkBody} = req.body;
    banner.isShown = showBanner;
    banner.color = color;
    banner.text = textToShow;
    banner.link = link;
    banner.linkBody = linkBody;

    res.json({success: true});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

export default router;
