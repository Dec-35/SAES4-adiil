import express from 'express';
import multer from 'multer';
import fs from 'fs';

var storage = multer.diskStorage({
  destination: './public/images/events/',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1]
    );
  },
});
const upload = multer({storage: storage});
const router = express.Router();

import {pool, generateEventId} from '../../server.js';

router.post('', upload.single('image'), async (req, res) => {
  try {
    if (!req.session.isLoggedIn || req.session.category !== 'admin') {
      //delete the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.redirect('/login?returnUrl=/admin');
      return;
    }

    if (req.body.length === 0) {
      res.status(403).json({success: false, message: 'No data provided'});
      return;
    }
    //extract data from multipart form
    const {eventName, eventDescription, eventDate, eventPrice, eventLocation} =
      req.body;

    if (
      !eventDate ||
      !eventName ||
      !eventDescription ||
      !eventPrice ||
      !eventLocation
    ) {
      //delete the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(403).json({success: false, message: 'Missing data'});
      return;
    }

    //sanitize the price, name and description
    const price = eventPrice.replace(',', '.');
    const name = eventName.trim();
    const description = eventDescription.trim();
    const location = eventLocation.trim();

    // Check if file was uploaded
    if (!req.file) {
      //send error message
      res.status(403).json({success: false, message: 'No image provided'});
      return;
    } else {
      // Access the uploaded file
      const uploadedFile = req.file;

      // Check if file is an image
      if (!uploadedFile.mimetype.startsWith('image/')) {
        //delete the uploaded file
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        res
          .status(403)
          .json({success: false, message: "Le fichier n'est pas une image"});
        return;
      } else {
        var imageName = uploadedFile.filename;
        const generatedId = generateEventId(new Date(eventDate), name);

        //insert the event into the database
        const query =
          'INSERT INTO event (id, name, description, date, price, image, location) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [
          generatedId,
          name,
          description,
          eventDate,
          price,
          `${imageName}`,
          location,
        ]);

        if (result.affectedRows === 1) {
          res.status(200).json({success: true, message: 'Événement créé'});

          //add the event to the ./public/ical/basic.ics file
          const event = generatedEvent(
            name,
            description,
            new Date(eventDate)
              .toISOString()
              .replace(/[-:]/g, '')
              .slice(0, -5) + 'Z',
            location,
            price,
            generatedId,
            imageName
          );

          const icsFilePath = './public/ical/basic.ics';
          let icsContent = fs.readFileSync(icsFilePath, 'utf8');
          // Find the position to append the new event
          const lastEventIndex = icsContent.lastIndexOf('END:VEVENT');
          const endCalendarIndex = icsContent.lastIndexOf('END:VCALENDAR');

          // Ensure the last event is followed by END:VCALENDAR
          if (lastEventIndex > -1 && endCalendarIndex > lastEventIndex) {
            // Append the new event
            icsContent =
              icsContent.slice(0, endCalendarIndex) +
              event +
              icsContent.slice(endCalendarIndex);
          }

          // Write the updated content back to the .ics file
          fs.writeFileSync(icsFilePath, icsContent, 'utf8');

          console.log('Event added successfully.');
        } else {
          //delete the uploaded file
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          res.status(500).json({
            success: false,
            message: "Erreur lors de la création de l'événement",
          });
        }
      }
    }
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Erreur lors de la création de l'événement :", err);
    // Gérer l'erreur comme vous le souhaitez
    res.status(500).json({success: false, message: err});
  }
});

function generatedEvent(
  name,
  description,
  date,
  location,
  price,
  id,
  imageName
) {
  return `BEGIN:VEVENT
DTSTART:${date}
DTEND:${date}
DTSTAMP:20240308T141026Z
UID:${id}
CREATED:20240308T141026Z
DESCRIPTION:<span>{description : ${description}}\, {prix : ${price}}\, {image:${imageName}}</span>
LAST-MODIFIED:20240315T192035Z
LOCATION:${location}
SEQUENCE:2
STATUS:CONFIRMED
SUMMARY:${name}
TRANSP:OPAQUE
END:VEVENT
`;
}

export default router;
