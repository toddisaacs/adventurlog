var fs = require('fs');
var parser = require('xml2js');

/* 
 * Extracts the extended KML data into a JSON array.
 * 
 * @param {string} - KML data to be parsed.
 * @callback       - callback for each row of data processed.
 * 
 * @returns {Object[]} Placemarkers - The extended data of KML placemarkers 
 *         unmodified.  NOTE: XML attributes with spaces like 'Time UTC' will 
 *         be modified to replace spaces with '_' so its a valid javascript 
 *         property like 'time_utc'. 
 */
exports.KMLDataExtract = (kml, callback) => {
  
  const placemarks = [];

  parser.parseString(kml, function(err, result) {
    let placemarkNodes = result['kml']['Document'][0].Folder[0].Placemark;

    placemarkNodes.forEach(placemark => {
      if (!placemark.ExtendedData) return;

      placemark.ExtendedData.forEach(extendedData => {
        const placemark = {};
        extendedData.Data.forEach(data => {

          let name = data.$.name.replace(/ /g,"_").toLowerCase();
          let value = data.value[0];

          placemark[name] = value;
        });

        if (callback) {
          callback(placemark);
        }
    
      });
    });
  })

  return placemarks;
}
