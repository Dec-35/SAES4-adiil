import express from 'express';
import multer from 'multer';
import fs from 'fs';

var storage = multer.diskStorage({
    destination: './public/products/',
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1]
        );
    },
});
const upload = multer({
    storage: storage
});
const router = express.Router();

import {
    pool
} from '../../server.js';

router.post('', async (req, res) => {
    try {
        if (!req.session.isLoggedIn || req.session.category !== 'admin') {
            //delete the uploaded file
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.redirect('/login?returnUrl=/admin/products');
            return;
        }

        const {
            id
        } = req.body; // Get the id from the request body

        if (!id) {
            res.status(403).json({
                success: false,
                message: 'No ID provided for deletion'
            });
            return;
        }

        await pool

            .query(
                'DELETE FROM product WHERE id = ?',
                [id]
            )
            .then(() => {
                res.status(200).json({
                    success: true,
                    message: 'Produit bien supprimé'
                });
            })
            .catch((err) => {
                console.error(
                    'Erreur lors du traitement de la requête SQL de suppression du produit :',
                    err
                );
                // Gérer l'erreur comme vous le souhaitez
                res.status(500).json({
                    success: false,
                    message: err
                });
                return;
            });
    } catch (err) {
        console.error('Erreur lors de la suppression du produit :', err);
        // Gérer l'erreur comme vous le souhaitez
        res.status(500).json({
            success: false,
            message: err
        });
    }
});

export default router;