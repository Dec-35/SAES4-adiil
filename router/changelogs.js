import express from 'express';
const router = express.Router();
import {readdirSync, readFileSync} from '../server.js';

router.get('/:version', async (req, res) => {
  const version = req.params.version;

  //get all the versions available in chronological order
  var changelogs = readdirSync('./public/changelogs');

  if (!changelogs.includes(`${version}.txt`)) {
    return res.redirect('/changelogs');
  }

  const changelog = readFileSync(`./public/changelogs/${version}.txt`, 'utf-8');

  res.render('changelog', {
    version,
    changelog,
  });
});
export default router;
