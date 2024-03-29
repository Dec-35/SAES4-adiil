import express from 'express';
const router = express.Router();

router.get('', async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect('/login?returnUrl=/calendar');
    return;
  }

  res.render('calendar', {
    username: req.session.username,
    category: req.session.category,
    cartSize: req.session.cart && req.session.cart.length,
    isLoggedIn: req.session.isLoggedIn,
  });
});
export default router;
