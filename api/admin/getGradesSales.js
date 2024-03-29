import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.get('', async (req, res) => {
  if (!req.session.isLoggedIn || req.session.category !== 'admin') {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  const [gradesResults] = await pool.query(
    'SELECT name AS "grade", COUNT(email) AS "nbGrades" FROM user JOIN grade ON grade.id = user.grade GROUP BY grade'
  );

  const grades = gradesResults.map((result) => {
    return {
      name: result.grade,
      sales: result.nbGrades,
    };
  });

  res.json({success: true, grades: grades});
});

export default router;
