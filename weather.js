/* cSpell:disable */
var rp = require('request-promise');

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
  }
  return 'authorized';
}

function getWeather (context, callback) {
  var lat = context.data.lat;
  var lon = context.data.lon;
  var geonames = context.secrets.GEONAME;

  var conditionsURL = 'http://api.geonames.org/findNearByWeatherJSON?lat=' + lat + '&lng=' + lon + '&username=' + geonames;

  var getConditions = {
    uri: conditionsURL,
    json: true
  };

  console.log(conditionsURL);
  rp(getConditions)
    .then(function (response) {
      console.log(response);
      callback(null, response);
    })
    .catch(function (err) {
      callback(err);
    });
}

// lint spacer

module.exports =
  function (context, callback) {
    var isAuth = auth(context);

    console.log(isAuth);
    if (isAuth !== 'authorized') {
      callback(null, isAuth);
    }
    getWeather(context, callback);
  };
