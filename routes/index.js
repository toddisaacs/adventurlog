const express = require('express');
const router = express.Router();
const placemarkerController = require('../controllers/placemarkerController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', (req, res) => {
  res.send('Hey! It works!');
});

router.post('/upload/kml', 
  placemarkerController.uploadKml,
  catchErrors(placemarkerController.extractPlacemarkersFromKML),
  catchErrors(placemarkerController.insertPlacemarkers)
)
  
module.exports = router;
