// 'use strict'
// http://aa.usno.navy.mil/data/docs/api.php
/* cSpell:disable */
var rp = require('request-promise');
var moment = require('moment');
var distance = require('google-distance');

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

function getTides (context, callback) {
  var epoch = context.data.epoch;
  var lat = context.data.lat;
  var lon = context.data.lon;
  var worldTidesKey = context.secrets.WORLDTIDES;
  var length = 604800; // 7 days
  // var length = 86400; // 1 day

  var tideURL = 'http://www.worldtides.info/api?stationDistance=100&extremes&start=' + epoch + '&length=' + length + '&lat=' + lat + '&lon=' + lon + '&key=' + worldTidesKey;
  console.log(tideURL);

  var getTides = {
    uri: tideURL,
    json: true
  };

  rp(getTides)
    .then(function (response) {
      var daily = {};
      daily.lastSeen = moment().format('YYYY-MM-DD');
      daily.tidalStation = response.station;
      daily.tideResponse = response;
      daily.extremes = response.extremes;
      daily.tideDistance = getDistance(response);
      callback(null, daily);
    })
    .catch(function (err) {
      callback(null, 'tides ' + err);
    });
}

function getDistance (response) {
  distance.get(
    {
      index: 1,
      origin: response.requestLat + ',' + response.requestLon,
      destination: response.responseLat + ',' + response.responseLon,
      units: 'imperial'
    },
    function (err, data) {
      if (err) {
        console.log('distance' + err);
      }
      else {
        distanceFunction(data);
        return data;
      }
    });
}

function distanceFunction (result) {
  // console.log(result); // use the result for manipulation
  var tideDistance = result.distance;
  return tideDistance;
}

// function createDailyObj () {
//   daily.lastSeen = moment().format('YYYY-MM-DD');
//   // var counter = 0;
//   // for (var tideDaily of extremes) {
//   //   if (tideDaily.type == 'High') {
//   //     extremes[counter].height = tideDaily.height + tidalMHW;
//   //   }
//   //   if (tideDaily.type == 'Low') {
//   //     extremes[counter].height = tideDaily.height - tidalMLW;
//   //     console.log(extremes[counter].height);
//   //   }
//   //   counter++;
//   // }
//   daily.tides = extremes;
//   daily.tidalStation = tidalStation;
//   daily.tideDistance = tideDistance;
//   daily.tideResponse = tideResponse;
//   daily.tidalMLW = tidalMLW;
//   daily.tidalMHW = tidalMHW;
//   daily.tidalLAT = tidalLAT;
//   daily.tidalHAT = tidalHAT;
//   // console.log(daily);
//   return daily;
// }

// lint spacer

module.exports =
  function (context, callback) {
    var isAuth = auth(context);
    console.log(isAuth);
    if (isAuth !== 'authorized') {
      callback(null, isAuth);
    }
    getTides(context, callback);
  };
