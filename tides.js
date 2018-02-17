// 'use strict'
// http://aa.usno.navy.mil/data/docs/api.php
var rp = require('request-promise');
var moment = require('moment');
var distance = require('google-distance');
var daily = {};

var extremes = [];
var tidalMLW = '';
var tidalMHW = '';
var tidalLAT = '';
var tidalHAT = '';
var tidalStation = '';
var tideResponse = {};
var tideDistance = '';


function createDailyObj () {
  daily.lastSeen = moment().format('YYYY-MM-DD');
  // var counter = 0;
  // for (var tideDaily of extremes) {
  //   if (tideDaily.type == 'High') {
  //     extremes[counter].height = tideDaily.height + tidalMHW;
  //   }
  //   if (tideDaily.type == 'Low') {
  //     extremes[counter].height = tideDaily.height - tidalMLW;
  //     console.log(extremes[counter].height);
  //   }
  //   counter++;
  // }
  daily.tides = extremes;
  daily.tidalStation = tidalStation;
  daily.tideDistance = tideDistance;
  daily.tideResponse = tideResponse;
  daily.tidalMLW = tidalMLW;
  daily.tidalMHW = tidalMHW;
  daily.tidalLAT = tidalLAT;
  daily.tidalHAT = tidalHAT;
 // console.log(daily);
  return daily;
}

// lint spacer

module.exports =
  function (context, callback) {

    var date = context.data.date;
    var lat = context.data.lat;
    var lon = context.data.lon;
    // var tz = context.data.tz;
    var worldTidesKey = context.secrets.WORLDTIDES;
    // var wundeground = context.secrets.WUNDERGROUND;

    var auth = '';
    auth = context.headers['authorization'];

    if (auth === undefined) {
      callback('User not authorized!');
      return;
    }

    var tokenDiff = 0;

    var token = new Buffer(context.headers['authorization'], 'base64').toString('ascii');
    var splitToken = token.split('-');
    var tokenDate = new Date(parseInt(splitToken[0]) * 1000);
    var serverDate = new Date();
    tokenDiff = (serverDate - tokenDate) / 1000;

    if (isNaN(tokenDiff) || tokenDiff > 600) {
      callback('Request timed out!');
      return;
    }
    
    var d = new Date(date);
    d.setHours(0, 0, 0, 0);
    var epoch = d.getTime() / 1000;
    // var length = 604800; // 7 days
    var length = 86400; // 1 day
    
    var tideURL = 'http://www.worldtides.info/api?stationDistance=100&extremes&datums&start=' + date + '&length=' + length + '&lat=' + lat + '&lon=' + lon + '&key=' + worldTidesKey;
    // var tideURL = 'http://www.worldtides.info/api?stationDistance=100&heights&datums&lat=' + lat + '&lon=' + lon + '&key=' + worldTidesKey;
    console.log(tideURL);



    var getTides = {
      uri: tideURL,
      json: true
    };

    rp(getTides)
      .then(function (response) {
        // console.log(response.datums)
        // for (var tideDaily of response.extremes) {
        //   // createTidesObj(tideDaily);
        //   var tide = {};
        //   tide.type = tideDaily.type;
        //   tide.height = tideDaily.height;
        //   tide.date = tideDaily.date;
        //   tide.dt = tideDaily.dt;
        //   extremes.push(tide);
        // }
        for (var tideDatums of response.datums) {
          // createTidesObj(tideDaily);
          var average = {};
          if (tideDatums.name == 'MLW') {
            tidalMLW =  tideDatums.height;
          }
          if (tideDatums.name == 'MHW') {
            tidalMHW =  tideDatums.height;
          }
          if (tideDatums.name == 'LAT') {
            tidalLAT =  tideDatums.height;
          }
          if (tideDatums.name == 'HAT') {
            tidalHAT =  tideDatums.height;
          }
          // averages.push(average);
        }
        tidalStation = response.station;
        tideResponse = response;
        extremes = response.extremes

        distance.get(
        {
          index: 1,
          origin: response.requestLat + ',' + response.requestLon,
          destination: response.responseLat + ',' + response.responseLon,
          units: 'imperial'
        },
        function(err, data) {
          if (err) {
            callback(null, createDailyObj());
            console.log('distance' + err);
          }
          else {
            distanceFunction(data);
            return data;
          }
        });
        function distanceFunction(result) {
           console.log(result); // use the result for manipulation
           tideDistance = result.distance;
           callback(null, createDailyObj());
        }

      })
      .catch(function (err) {
        // callback(null, createDailyObj(tz));
        callback('tides '+err);
      });
  };
