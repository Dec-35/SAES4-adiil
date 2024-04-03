import express from 'express';
const router = express.Router();
import {pool} from '../../server.js';

router.get('', async (req, res) => {
  if (!req.session.isLoggedIn) {
    res.status(403).json({error: 'Accès refusé'});
    return;
  }

  const [purchasesResults] = await pool.query(
    'SELECT purchase_date, item_name, item_price, event_id, grade_id, product_id, is_canceled FROM transactioncontent JOIN transaction ON transaction.transaction_id = transactioncontent.transaction_id WHERE email = ?',
    [req.session.email]
  );

  await Promise.all(
    purchasesResults.map(async (purchase) => {
      //check if it is an event, grade or product using the event_id, grade_id and product_id (is null if not applicable)
      const type =
        purchase.event_id !== null
          ? 'event'
          : purchase.grade_id !== null
          ? 'grade'
          : 'product';
      purchase.type = type;
      switch (type) {
        case 'event':
          const [event] = await pool.query(
            'SELECT date, description, image, location FROM event WHERE id = ?',
            [purchase.event_id]
          );
          purchase.eventDate = event[0].date;
          purchase.description = event[0].description;
          purchase.image = '/images/events/' + event[0].image;
          purchase.location = event[0].location;
          break;

        case 'grade':
          switch (purchase.grade_id) {
            case 0:
              purchase.description =
                "Avantages : Compétitions de code, Accès aux bénéfices du parrainage (bonus d'xp)";
              purchase.image =
                'https://media.forgecdn.net/avatars/362/344/637529102794456266.png';
              break;
            case 1:
              purchase.description =
                'Avantages : Avantages Iron, Evénements privés, Soirées privées du BDE';
              purchase.image = '/graphics/Gold_Ingot_JE4_BE2.png';
              break;
            case 2:
              purchase.description =
                "Avantages : Avantages Gold, -10% sur tous les événements du BDE, 1 bon d'achat de 10€ sur l'entièreté du site, Valable à l'année";
              purchase.image = '/graphics/11-2-minecraft-diamond.png';
              break;
            default:
              break;
          }
          break;

        case 'product':
          const [product] = await pool.query(
            'SELECT description, image FROM product WHERE id = ?',
            [purchase.product_id]
          );
          purchase.description = product[0].description;
          purchase.image = '/products/' + product[0].image;
          break;

        default:
          break;
      }
    })
  );

  res.status(200).json({success: true, purchases: purchasesResults});
});

export default router;
