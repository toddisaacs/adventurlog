var parser = require('xml2js');
const togeojson = require('togeojson');
/* 
 * Extracts the extended KML data into a Javascript array.
 * 
 * @param {XML} - KML data to be parsed.
 * @callback       - callback for each row of data processed.
 * 
 * @returns {Object[]} Placemarkers - The extended data of KML placemarkers 
 *         unmodified.  NOTE: XML attributes with spaces like 'Time UTC' will 
 *         be modified to replace spaces with '_' so its a valid javascript 
 *         property like 'time_utc'. All data is parsed as a string.
 * 
 *        Placemark data is nested as follows defined in http://www.opengis.net/kml/2.2
 *        <kml>
 *          <Document>
 *            <Folder>
 *              <Placemark>
 * 
 *        KML data structure                                      javascript data structure
 *        <Placemark> XML is coverted to javascript object
 *        <Placemark>                                             {
 *          <Timestamp>                                             timestamp: '2018-01-01T14:18:15Z',
 *            <when>2018-01-01T14:18:15Z</when>                     description: 'Heading to Mexico...',
 *          </Timestamp>                                            time_utc: '1/1/2018 2:18:15 PM',
 *          <description>Heading to Mexico...</description>         latitude: '26.698751',
 *          <ExtendedData>                                          ...
 *            <Data name="Time UTC">1/1/2018 2:18:15 PM</Data>      coordinates: '-82.292618,26.698751,26.7'
 *            <Data name="Latitude">26.698751</Data>              }
 *            ...
 *          </ExtendedData>
 *          <Point>  
 *            <coordinates>
 *              -82.292618,26.698751,26.7  
 *            </coordinates>
 *          </Point> 
 */   
exports.KMLDataExtract = (kml, callback) => {
  
  const placemarks = [];

  parser.parseString(kml.toString(), function(err, result) {
    let placemarkNodes = result['kml']['Document'][0].Folder[0].Placemark;
    
    placemarkNodes.forEach(placemark => {
      const combinedPlaceMark = {};

      let description = (placemark.description) ? placemark.description[0] : '';
      let timestamp = (placemark.TimeStamp) ? placemark.TimeStamp[0].when[0] : '';
      let coordinates = placemark.Point ? placemark.Point[0].coordinates[0] : '';

      combinedPlaceMark.description = description;
      combinedPlaceMark.timestamp = timestamp;
      combinedPlaceMark.coordinates = coordinates;

      //Extended Data
      if (placemark.ExtendedData) {
        placemark.ExtendedData.forEach(extendedData => {
          extendedData.Data.forEach(data => {
            let name = data.$.name.replace(/ /g,"_").toLowerCase();
            let value = data.value[0];
  
            combinedPlaceMark[name] = value;
          });
        });
      } //END ExtendedData

      //let caller know we have placemark
      if (callback) {
        callback(combinedPlaceMark);
      }
      console.log(combinedPlaceMark);
      placemarks.push(combinedPlaceMark);
    });
  });

  return placemarks;
};


exports.test = (kml) => {
  return togeojson.kml(kml);
}