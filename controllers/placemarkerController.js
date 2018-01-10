const kmlparse = require('../kmlparse');
var multer  = require('multer');
var upload = multer();

const PlaceMarker = require('../models/PlaceMarker');


const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isKmlExtension = file.originalname.endsWith('.kml');
    const isKml = file.mimetype.startsWith('application/octet-stream');
    if (isKml && isKmlExtension) {
      next(null, true); // tell the Node chain we are good by passing null as first value
    } else {
      next({ message: 'That file type isn\'t allowed!, Make sure you have a KML file with ".kml" extension.' }, false);
    }
  }
};

/* 
 * Uploads a multipart form data 'kml' and stores in memory and places a reference 
 * on the request for the next middleware to consume. (req.file)
 */ 
exports.uploadKml = multer(multerOptions).single('kml');


/*
 * transforms KML data (req.file) to Mongo location data along with other placemarker fields.  Adds the
 * placemarkers to the request for next middle ware to consume. (req.placemarkers)
 */
exports.extractPlacemarkersFromKML = async (req, res, next) => {
  if (!req.file) {
    next(); // no file skip to next item in middleware chain
  } else {
    const placemarkers = [];

    kmlparse.KMLDataExtract(req.file.buffer.toString(), (placemarker) => {
      const {time_utc, name, elevation, velocity, latitude, longitude} = placemarker;
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const mongoLocation = {type: "Point", coordinates: [lng, lat]};
      const marker = {timestamp: time_utc, title: name, elevation, velocity, location: mongoLocation};

      //console.log(marker);

      placemarkers.push(marker);
    });

    req.body.placemarkers = placemarkers;
    next()
  }
}


/*
 * Processes req.body.placemarkers and adds them to the database.
 */ 
exports.insertPlacemarkers = async (req, res) => {
  try {
    await PlaceMarker.insertMany(req.body.placemarkers);
    console.log('👍 Done!');
    res.json(req.body.placemarkers);
  } catch (e) {
    console.log('\n👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n');
    console.log(e);
    res.send(e);
  }

  
};