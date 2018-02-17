// 'use strict'

// http://aa.usno.navy.mil/data/docs/api.php
// import rp from 'request-promise'
var rp = require('request-promise');

var weather = {};

function createWeatherObj (temperature, humidity, windDirection, windSpeed, weatherCondition) {
  weather.wind_direction = windDirection;
  weather.wind_speed = windSpeed;
  weather.temp = temperature;
  weather.humidity = humidity;
  weather.conditions = weatherCondition;
  return weather;
}

// lint spacer

module.exports =
  function (context, callback) {
    var lat = context.data.lat;
    var lon = context.data.lon;
    var geonames = context.secrets.GEONAME;

    var auth = ''
    auth = context.headers['authorization'];

    if(auth === undefined){
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

    var conditionsURL = 'http://api.geonames.org/findNearByWeatherJSON?lat=' + lat + '&lng=' + lon + '&username=' + geonames;
    

    var getConditions = {
      uri: conditionsURL,
      json: true
    };

    console.log(conditionsURL);
    rp(getConditions)
      .then(function (response) {
        console.log(response)
        callback(null,response)
        // callback(null, createWeatherObj(response.weatherObservation.temperature, response.weatherObservation.humidity, response.weatherObservation.windDirection, response.weatherObservation.windSpeed, response.weatherObservation.weatherCondition))
        return;
      })
      .catch(function (err) {
        callback(err);
        return; 
      })
  }

