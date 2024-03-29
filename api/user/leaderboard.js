import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.get('', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT username, xp, category, dc_pfp, dc_id FROM user WHERE category IS NOT NULL AND category IN ('11A','11B', '12C', '12D','21A','21B', '22C', '22D', '31A','31B', '32C', '32D' ) ORDER BY xp DESC"
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({message: 'No rows found'});
    }
  } catch (err) {
    res.status(500).json(err.stack);
  }
});

export default router;
