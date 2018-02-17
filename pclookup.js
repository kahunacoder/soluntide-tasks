var rp = require('request-promise');
/* cSpell:disable */

// lint spacer

function auth (context) {
  var header = '';
  header = context.headers['authorization'];
  if (header === undefined) {
    return 'User not authorized!';
  }

  var tokenDiff = 0;

  var token = Buffer.from(context.headers['authorization'], 'base64').toString('ascii');
  var splitToken = token.split('-');
  var tokenDate = new Date(parseInt(splitToken[0]) * 1000);
  var serverDate = new Date();
  tokenDiff = (serverDate - tokenDate) / 1000;

  if (isNaN(tokenDiff) || tokenDiff > 600) {
    return 'Authorization timed out!';
    // return 'tokendiff = ' + tokenDiff;
  }
  return 'authorized';
}

function lookupPc (context, callback) {
  var postalcode = context.data.postalcode;
  var country = context.data.country;
  var geonames = context.secrets.GEONAME;

  var postalCodeLookup = 'http://api.geonames.org/postalCodeLookupJSON?postalcode=' + postalcode + '&country=' + country + '&username=' + geonames;

  console.log(postalCodeLookup);
  var getPC = {
    uri: postalCodeLookup,
    json: true
  };

  rp(getPC)
    .then(function (response) {
      getTimezone(context, callback, response);
    })
    .catch(function (err) {
      callback(null, err);
    });
}

function getTimezone (context, callback, places) {
  var geonames = context.secrets.GEONAME;
  var tzURL = 'http://api.geonames.org/timezoneJSON?username=' + geonames;

  tzURL = tzURL + '&lat=' + places.postalcodes[0].lat + '&lng=' + places.postalcodes[0].lng;
  console.log(tzURL);
  rp(tzURL, {uri: tzURL, json: true})
    .then(function (tzresponse) {
      for (var place of places.postalcodes) {
        place.countryName = tzresponse.countryName;
        place.timezoneId = tzresponse.timezoneId;
      }
      getDatums(context, callback, places);
    })
    .catch(function (err) {
      callback(null, err);
    });
}

function getDatums (context, callback, places) {
  var worldTidesKey = context.secrets.WORLDTIDES;
  var tideURL = 'http://www.worldtides.info/api?datums&lat=' + places.postalcodes[0].lat + '&lon=' + places.postalcodes[0].lng + '&key=' + worldTidesKey;

  console.log(tideURL);
  rp(tideURL, {uri: tideURL, json: true})
    .then(function (response) {
      for (var tideDatums of response.datums) {
        if (tideDatums.name === 'MLW') {
          var tidalMLW = tideDatums.height;
        }
        if (tideDatums.name === 'MHW') {
          var tidalMHW = tideDatums.height;
        }
      }
      places.postalcodes.tidalMLW = tidalMLW;
      places.postalcodes.tidalMHW = tidalMHW;
      callback(null, places);
    })
    .catch(function (err) {
      callback(null, err);
    });
}

module.exports =
  function (context, callback) {
    var isAuth = auth(context);

    console.log(isAuth);
    if (isAuth !== 'authorized') {
      callback(null, isAuth);
    }

    lookupPc(context, callback);
  };
