import express from 'express';
const router = express.Router();
import {pool, addUserToEventWithXp, deleteItemFromCart} from '../../server.js';
import {v4 as uuidv4} from 'uuid';

router.post('', async (req, res) => {
  const listOfItems = req.body.items;
  let totalPrice = 0;

  if (
    !req.session.isLoggedIn ||
    !req.session.cart ||
    req.session.cart.length === 0
  ) {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  for (var element of listOfItems) {
    //for each item, get its actual info (the user could have sent a wrong price / name)
    var itemResults = [];
    if (element.identifier.type === 'event') {
      [itemResults] = await pool.query(
        'SELECT * FROM event WHERE id = ?',
        [element.identifier.id],
        (err) => {
          if (err) {
            console.error('Impossible de récupérer les events :', err);
            return;
          }
        }
      );
    } else if (element.identifier.type === 'grade') {
      [itemResults] = await pool.query(
        'SELECT * FROM grade WHERE id = ?',
        [element.identifier.id],
        (err) => {
          if (err) {
            console.error('Impossible de récupérer les grades :', err);
            return;
          }
        }
      );
    } else if (element.identifier.type === 'product') {
      [itemResults] = await pool.query(
        'SELECT * FROM product WHERE id = ?',
        [element.identifier.id],
        (err) => {
          if (err) {
            console.error('Impossible de récupérer les produits :', err);
            return;
          }
        }
      );
    }

    if (itemResults.length === 0) {
      res.status(404).json({error: 'Impossible de trouver l evenement'});
      return;
    }

    const price = itemResults['0'].price;

    element.price = price;
    totalPrice += price;
    element.name =
      itemResults['0'].name +
      (element.size != '' ? '(' + element.size + ')' : '');
  }

  const email = req.session.email;

  //create a transaction
  const insertedID = uuidv4();
  //here, we manually put validated to 1 since there is no payment gateway nor verification
  await pool.query(
    'INSERT INTO transaction (transaction_id, email, total_price, validated) VALUES (?, ?, ?, ?)',
    [insertedID, req.session.email, totalPrice, 1],
    (err) => {
      console.log('Entering callback');
      if (err) {
        console.error('Impossible d ajouter la transaction :', err);
        res.status(500).send('Impossible d ajouter la transaction');
        return;
      }
    }
  );

  //add xp and grade/event to user
  for (var element of listOfItems) {
    var success = await addUserToEventWithXp(
      email,
      {
        type: element.identifier.type,
        id: element.identifier.id,
        name: element.name,
        price: element.price,
      },
      element.price == 0 ? process.env.XP_AMOUNT / 5 : process.env.XP_AMOUNT,
      insertedID,
      req
    );
    if (!success) {
      req.session.cart = [];
      res.status(500).send('An error occurred');
      return;
    } else {
      deleteItemFromCart(req, {
        type: element.identifier.type,
        id: element.identifier.id,
      });
    }
  }

  // Clear the cart
  req.session.cart = [];
  res.status(200).json({success: true});
});

export default router;
