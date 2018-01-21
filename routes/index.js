const express = require('express');
const router = express.Router();
const placemarkerController = require('../controllers/placemarkerController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const adventureController = require('../controllers/adventureController');

const { catchErrors } = require('../handlers/errorHandlers');


router.get('/', (req, res) => {
  res.render('index', { title: 'Welcome' });
});

router.post('/upload/kml', 
  placemarkerController.uploadKml,
  catchErrors(placemarkerController.makePlacemarkerFromKML),
  catchErrors(placemarkerController.insertPlacemarkers)
);
  
router.post('/upload/kmltest', 
  placemarkerController.uploadKml,
  catchErrors(placemarkerController.test)
);


router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/register', userController.registerForm);
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
);



router.post('/login', authController.login);

router.post('/api/adventures', 
  adventureController.upload,
  catchErrors(adventureController.createAdventure));
  
router.get('/api/adventures/search', catchErrors(adventureController.searchAdventures));
router.get('/api/adventures/near', catchErrors(adventureController.searchNear));
router.get('/api/adventures/:id', adventureController.getAdventureById);

router.post('/api/placemarkers',catchErrors(placemarkerController.insertPlacemarker));
router.get('/api/placemarkers/:id',catchErrors(placemarkerController.getPlacemarker));
module.exports = router;
