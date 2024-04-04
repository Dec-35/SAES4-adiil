import express, {json} from 'express';
import fs from 'fs';
const router = express.Router();
import {
  fromURL,
  getUserGrade,
  getGradePrices,
  getPodium,
  ironprice,
  goldprice,
  diamantprice,
  getVersion,
} from '../server.js';
import e from 'express';

function getHomeImages() {
  //get all images from public/images/home
  const homeImages = fs.readdirSync('./public/images/home');
  //remove all files that don't have .jpg / .jpeg or .png extension
  homeImages.forEach((element, index) => {
    if (
      !element.endsWith('.jpg') &&
      !element.endsWith('.jpeg') &&
      !element.endsWith('.png') &&
      !element.endsWith('.webp') &&
      !element.endsWith('.JPG')
    ) {
      homeImages.splice(index, 1);
    }
  });

  return homeImages;
}

router.get('', async (req, res) => {
  try {
    if (!ironprice || !goldprice || !diamantprice) {
      await getGradePrices();
    }

    await getPodium(req);

    const userGrade = await getUserGrade(req.session.email);
    req.session.grade = userGrade;

    if (req.session.isLoggedIn) {
      console.log('User ' + req.session.email + ' is logged in');
    }

    const version = getVersion();
    const homeImages = getHomeImages();

    res.render('index', {
      username: req.session.username,
      cartSize: req.session.cart && req.session.cart.length,
      isLoggedIn: req.session.isLoggedIn,
      ironprice: ironprice,
      goldprice: goldprice,
      diamantprice: diamantprice,
      grade: userGrade,
      podium: req.session.podium,
      version,
      homeImages,
    });
    return;
  } catch (err) {
    console.error('Error showing home page');
    console.error('Error rendering index:', err);
    res
      .status(500)
      .send(
        'Internal Server Error : the server encountered an error trying to read the provided google calendar file.'
      );
    return;
  }
});
export default router;
