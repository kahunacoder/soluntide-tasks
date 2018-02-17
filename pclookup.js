var rp = require('request-promise');

// lint spacer

module.exports =
  function (context, callback) {
    var postalcode = context.data.postalcode;
    var country = context.data.country;
    var geonames = context.secrets.GEONAME;

    var auth = '';
    auth = context.headers['authorization'];

    if (auth === undefined) {
      callback(null, 'User not authorized!');
      return;
    }

    var tokenDiff = 0;

    var token = new Buffer(context.headers['authorization'], 'base64').toString('ascii');
    var splitToken = token.split('-');
    var tokenDate = new Date(parseInt(splitToken[0]) * 1000);
    var serverDate = new Date();
    tokenDiff = (serverDate - tokenDate) / 1000;

    if (isNaN(tokenDiff) || tokenDiff > 600) {
      callback(null, 'Request timed out!');
      return;
    }

    var postalCodeLookup = 'http://api.geonames.org/postalCodeLookupJSON?postalcode=' + postalcode + '&country=' + country + '&username=' + geonames;
    var tzURL = 'http://api.geonames.org/timezoneJSON?username=' + geonames;
    console.log(postalCodeLookup);
    var getPC = {
      uri: postalCodeLookup,
      json: true
    };

    rp(getPC)
      .then(function (response) {
        var places = response;
        tzURL = tzURL + '&lat=' + places.postalcodes[0].lat + '&lng=' + places.postalcodes[0].lng;
        console.log(tzURL);
        rp(tzURL, {uri: tzURL, json: true})
          .then(function (tzresponse) {
            for (var place of places.postalcodes) {
              place.countryName = tzresponse.countryName;
              place.timezoneId = tzresponse.timezoneId;
            }
            callback(null, places);
          })
          .catch(function (err) {
            callback(null, err);
          });
      })
      .catch(function (err) {
        callback(null, err);
      });
  };
