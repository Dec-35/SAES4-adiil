import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.get('', async (req, res) => {
  const itemsToSend = [];
  var promises = [];

  const cart = req.session.cart || [];

  for (const item of cart) {
    if (item.type === 'event') {
      const query = 'SELECT * FROM event WHERE id = ?';
      const params = [item.id];
      const callback = (err) => {
        if (err) {
          console.error('Impossible de récupérer les events du panier :', err);
          reject(err);
        }
      };

      const [eventResults] = await pool.query(query, params, callback);

      if (eventResults.length === 0) {
        res.status(404).json({error: "Impossible de trouver l'évènement"});
        return;
      }

      const event = eventResults[0];

      itemsToSend.push({
        identifier: {
          id: event.id,
          type: 'event',
        },
        name: event.name,
        price: Number(
          (event.price * (req.session.grade === 'Diamant' ? 0.9 : 1)).toFixed(2)
        ),
        quantity: 1,
      });
    } else if (item.type === 'grade') {
      const query = 'SELECT * FROM grade WHERE id = ?';
      const params = [item.id];
      const callback = (err) => {
        if (err) {
          console.error('Impossible de récupérer les grades du panier :', err);
          reject(err);
        }
      };

      const [gradeResults] = await pool.query(query, params, callback);

      if (gradeResults.length === 0) {
        res.status(404).json({error: 'Impossible de trouver le grade'});
        return;
      }

      const grade = gradeResults[0];

      itemsToSend.push({
        identifier: {
          id: grade.id,
          type: 'grade',
        },
        name: grade.name,
        price: grade.price,
        quantity: 1,
      });
    } else if (item.type === 'product') {
      const query = 'SELECT * FROM product WHERE id = ?';
      const params = [item.id];
      const callback = (err) => {
        if (err) {
          console.error(
            'Impossible de récupérer les produits du panier :',
            err
          );
          reject(err);
        }
      };

      const [productResults] = await pool.query(query, params, callback);

      if (productResults.length === 0) {
        res.status(404).json({error: 'Impossible de trouver le produit'});
        return;
      }

      const product = productResults[0];

      itemsToSend.push({
        identifier: {
          id: product.id,
          type: 'product',
        },
        name: product.name,
        size: item.size,
        price: Number(
          (product.price * (req.session.grade === 'Diamant' ? 0.9 : 1)).toFixed(
            2
          )
        ),
        quantity: 1,
      });
    }
  }

  //wait until all the promises are resolved

  res.status(200).json({success: true, items: itemsToSend});
});
export default router;
