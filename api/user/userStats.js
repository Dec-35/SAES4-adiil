import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.get('', async (req, res) => {
    if (!req.session.isLoggedIn) {
        res.redirect('/login');
        return;
      }
    
      //get the user's grade
      const [gradeResults] = await pool.query(
        'SELECT grade FROM user WHERE user.email = ?',
        [req.session.email],
        (err) => {
          if (err) {
            console.error('Impossible de récupérer le grade :', err);
            res.status(500).json({error: 'Impossible de récupérer le grade'});
            return;
          }
        }
      );
    
      if (!ironprice || !goldprice || !diamantprice) {
        await getGradePrices();
      }
    
      if (gradeResults.length === 0) {
        var grade = 'None';
      } else var grade = gradeResults['0'].grade;
      req.session.grade = grade;
    
      res.render('userGrade', {
        grade: req.session.grade,
      });


});

