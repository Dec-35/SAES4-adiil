import express from 'express';
const router = express.Router();

router.post('', async (req, res) => {
  //get an image from an event name
  const {query} = req.body;

  unsplash.search
    .getPhotos({query: query, lang: 'fr', oritentation: 'landscape'})
    .then((result) => {
      if (result.errors) {
        // handle error here
        console.log('error occurred: ', result.errors[0]);
        res.status(500).json({error: "Impossible de récupérer l'image"});
      } else {
        // handle success here
        if (result.response.results.length === 0) {
          res.status(404).json({error: 'Aucun résultat'});
          return;
        }

        const imageLink = result.response.results[0].urls.regular;
        const unsplashLink = result.response.results[0].links.html;
        const photographerName = result.response.results[0].user.name;
        const photographerLink = result.response.results[0].user.links.html;

        res.json({
          success: true,
          imageLink,
          unsplashLink,
          photographerName,
          photographerLink,
        });
      }
    });
});

export default router;
