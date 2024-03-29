import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.post('', async (req, res) => {
  if (!req.session.isLoggedIn || req.session.category !== 'admin') {
    res.redirect('/login?returnUrl=/admin/products');
    return;
  }

  const {productId, buyer, options} = req.body;

  if (!productId || !buyer) {
    res.status(403).json({success: false, message: 'Missing data'});
    return;
  }

  //add a new transaction and new transactionContent
  //create unique transaction id from the current date and time
  const date = new Date();
  let transactionId = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
  transactionId = transactionId + ' (paiement liquide)';
  //get the price of the product
  const [product] = await pool.query('SELECT * FROM product WHERE id = ?', [
    productId,
  ]);

  //check if the buyer exists
  const [user] = await pool.query('SELECT * FROM user WHERE email = ?', [
    buyer,
  ]);

  if (user.length === 0) {
    //create the user
    await pool.query('INSERT INTO user (email, username) VALUES (?, ?)', [
      buyer,
      buyer,
    ]);
  }

  //add the transaction
  await pool
    .query(
      'INSERT INTO transaction (transaction_id, email, purchase_date, total_price) VALUES (?, ?, ?, ?)',
      [transactionId, buyer, date, product[0].price]
    )
    .then(async () => {
      let prodcutName = product[0].name;
      if (options && options !== '') {
        prodcutName = `${prodcutName} (${options})`;
      }
      //add the transactionContent
      await pool.query(
        'INSERT INTO transactionContent (transaction_id, product_id, item_name, item_price) VALUES (?, ?, ?, ?)',
        [transactionId, productId, prodcutName, product[0].price]
      );

      //add xp to the buyer
      await pool.query('UPDATE user SET xp = xp + ? WHERE email = ?', [
        process.env.XP_AMOUNT,
        buyer,
      ]);

      res.status(200).json({success: true, message: 'Produit ajouté'});
    })
    .catch((err) => {
      console.error(
        'Erreur lors du traitement des requêtes SQL d ajout de transaction:',
        err
      );
      // Gérer l'erreur comme vous le souhaitez
      res.status(500).json({success: false, message: err});
      return;
    });
});

export default router;
