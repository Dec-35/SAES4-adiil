import express from 'express';
const router = express.Router();

import {pool} from '../../server.js';

router.get('', async (req, res) => {
  try {
    if (!req.session.isLoggedIn || req.session.category !== 'admin') {
      res.redirect('/login?returnUrl=/admin/products');
      return;
    }

    const [productSales] = await pool.query(
      'SELECT * FROM transactionContent JOIN transaction ON transactionContent.transaction_id = transaction.transaction_id RIGHT JOIN product ON transactionContent.product_id = product.id ORDER BY purchase_date DESC'
    );

    if (!Array.isArray(productSales)) {
      // Handle the case when the query did not return an array
      res
        .status(500)
        .json({success: false, message: 'Query did not return an array'});
      return;
    }

    //create an array for each product with the list of the sales (date, buyer)
    const products = [];
    for (const item of productSales) {
      const existingProductIndex = products.findIndex(
        (product) => product.id === item.id
      );

      if (existingProductIndex !== -1) {
        // Product already exists in the array, update the sales array
        products[existingProductIndex].sales.push({
          date: item.purchase_date,
          buyer: item.email,
          price: item.item_price,
          transaction_id: item.transaction_id,
          product_details: item.item_name.split('(')[1]
            ? item.item_name.split('(')[1].split(')')[0]
            : '',
        });
      } else {
        var [sizes] = await pool.query(
          'SELECT name FROM product_size WHERE product_id = ?',
          [item.id]
        );

        var [colors] = await pool.query(
          'SELECT color.name FROM product_color JOIN color ON product_color.color_id = color.id WHERE product_id = ?',
          [item.id]
        );

        products.push({
          id: item.id,
          name: item.name,
          image: item.image,
          description: item.description,
          price: item.price,
          release_date: item.release_date,
          is_promoted: item.is_promoted,
          expire_date: item.expire_date,
          confirm_threashold: item.confirm_threashold,
          colors: colors.map((color) => color.name),
          sizes: sizes.map((size) => size.name),
          sales: item.transaction_id
            ? [
                {
                  date: item.purchase_date,
                  buyer: item.email,
                  price: item.item_price,
                  transaction_id: item.transaction_id,
                  product_details: item.item_name.split('(')[1]
                    ? item.item_name.split('(')[1].split(')')[0]
                    : '',
                },
              ]
            : [],
        });
      }
    }

    res.status(200).json({success: true, products: products});
  } catch (err) {
    console.error('Erreur lors du traitement des requêtes SQL :', err);
    // Gérer l'erreur comme vous le souhaitez
    res.status(500).json({success: false, message: err.message});
  }
});

export default router;
