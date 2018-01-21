const kmlparse = require('../kmlparse');
var multer  = require('multer');
var upload = multer();
const  xmldom = require('xmldom');
const togeojson = require('togeojson');
const uuid = require('uuid');


const mongoose = require('mongoose');
const PlaceMarker = mongoose.model('PlaceMarker');
const Adventure = mongoose.model('Adventure');


const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    console.log(file.originalname);
    const isKmlExtension = file.originalname.endsWith('.kml');
    //const isKml = file.mimetype.startsWith('application/octet-stream');
    if (isKmlExtension) {
      console.log("call next");
      next(null, true); // tell the Node chain we are good by passing null as first value
    } else {
      console.log("error");
      next({ message: 'That file type isn\'t allowed!, Make sure you have a KML file with ".kml" extension.' }, false);
    }
  }
};

/* 
 * Uploads a multipart form data 'kml' and stores in memory and places a reference 
 * on the request for the next middleware to consume. (req.file)
 * */
exports.uploadKml = multer(multerOptions).single('kml');

exports.test = (req, res) => {
  res.send("worked");
}


exports.fetchAdventure = async (req, res, next) => {
  console.log("Adventure " + req.body.adventureId)
  const id = req.body.adventureId;
  const adventure = await Adventure.find({
      _id: id
  });

  req.body.adventure = adventure;
  next();
}
// {
//   "name": "Sergio Guerrero (4555718)",
//   "description": "",
//   "timestamp": "2018-01-01T14:18:15Z",
//   "velocity": "9.0700 km/h",
//   "elevation": "26.70 m from MSL",
//   "location": {
//       "type": "Point",
//       "coordinates": [
//           -82.292618,
//           26.698751,
//           26.7
//       ]
//   }
// },
exports.makePlacemarkerFromKML = async (req, res, next) => {
  

  if (!req.file || !req.body.adventureId) {
    res.send('no file or adventure ');
    //next(); // no file skip to next item in middleware chain
  } else {
    const adventureId = req.body.adventureId;
   
    //converts to an array of 'features'
    const converted = kmlparse.test((new xmldom.DOMParser()).parseFromString(req.file.buffer.toString(), 'text/xml'));

    let features = converted.features;

    //console.log(placemarkers);
   const routeId = uuid.v4();

    const placemarkers = features.map((geojson) => {
      const location = geojson.geometry;
      let placemarker = {};

      //only convert Points for now
  
        
      placemarker.adventure = adventureId;
      placemarker.routeId = routeId;
      placemarker.name= (geojson.properties.Name) ? geojson.properties.Name : '';
      placemarker.description = (geojson.properties.description) ? geojson.properties.description : '';
      placemarker.timestamp = (geojson.properties.timestamp) ? geojson.properties.timestamp : '';
      placemarker.velocity = (geojson.properties.Velocity) ? geojson.properties.Velocity : '';
      placemarker.elevation = (geojson.properties.Elevation) ? geojson.properties.Elevation : '';
      
      //just use the lat & lng
      if (location && location.coordinates.length > 2)  {
        location.coordinates = location.coordinates.slice(0,2);
      }
        
      placemarker.location = location;
      
      return placemarker;

    }).filter(placemark => placemark.location.type === 'Point');
    
    req.body.placemarkers = placemarkers;
    next();

  }
}



/*
 * transforms KML data (req.file) to Mongo location data along with other placemarker fields.  Adds the
 * placemarkers to the request for next middle ware to consume. (req.placemarkers)
 */
// exports.makePlacemarkerFromKML = async (req, res, next) => {
//   if (!req.file) {
//     next(); // no file skip to next item in middleware chain
//   } else {
//     const placemarkers = [];

//     kmlparse.KMLDataExtract(req.file.buffer, (placemarker) => {
//       const {timestamp, name, description, elevation, velocity, latitude, longitude} = placemarker;
//       const lat = (latitude) ? parseFloat(latitude) : 0
//       const lng = (longitude) ? parseFloat(longitude) : 0 
//       const mongoLocation = {type: "Point", coordinates: [lng, lat]};

//       const marker = {timestamp, name, description, elevation, velocity, location: mongoLocation};

//       placemarkers.push(marker);
//     });

//     req.body.placemarkers = placemarkers;
//     next();
//   }
// }


/*
 * Processes req.body.placemarkers and adds them to the database.
 */ 
exports.insertPlacemarkers = async (req, res) => {
  try {
    //await PlaceMarker.insertMany(req.body.placemarkers);
    await PlaceMarker.insertMany(req.body.placemarkers);
    console.log('👍 Done!');
    res.json(req.body.placemarkers);
  } catch (e) {
    console.log('\n👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n');
    console.log(e);
    res.send(e);
  }
};

exports.test = async (req, res, next) => {

  const converted = kmlparse.test((new xmldom.DOMParser()).parseFromString(req.file.buffer.toString(), 'text/xml'))
 res.json(converted);
}

exports.insertPlacemarker = async (req, res) => {
  const placemarker = await (new PlaceMarker(req.body)).save();
  res.json(placemarker); 
}

exports.getPlacemarker = async (req, res) => {
  const placemarker = await PlaceMarker.findById({
    _id: req.params.id
  })
  res.json(placemarker); 
}

exports.getPlacemarkers = async (req, res) => {
  const adventureId = req.params.id;

  const placemarker = await PlaceMarker.find({
    adventure: adventureId
  })
  res.json(placemarker); 
}
