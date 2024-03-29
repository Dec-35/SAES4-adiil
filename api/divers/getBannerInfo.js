import express from 'express';
const router = express.Router();
import {banner} from '../../server.js';

router.get('', async (req, res) => {
  try {
    res.json({
      success: true,
      isShown: banner.isShown,
      color: banner.color,
      textToShow: banner.text,
      link: banner.link,
      linkBody: banner.linkBody,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

export default router;
