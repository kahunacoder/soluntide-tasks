var rp = require('request-promise');
/* cSpell:disable */

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

function commonKeys (arr, obj) {
  var results = [];
  for (var val of arr) {
    for (var objItem of obj) {
      if (val === objItem.value) {
        results.push(objItem);
      }
    }
  }
  return results;
}

function extractCountries (response) {
  var tempArray = response.split('=').map(String);
  var temp = tempArray[1];
  var split2 = temp.split(';').map(String);
  return JSON.parse(split2[0]);
}

function lookupCountries (context, callback) {
  var geonames = context.secrets.GEONAME;
  var gdURL = 'http://api.geonames.org/export/geonamesData.js?username=' + geonames;
  var chooseCountries = [ {'value': 'AD', 'label': 'Andorra'}, {'value': 'AE', 'label': 'United Arab Emirates'}, {'value': 'AF', 'label': 'Afghanistan'}, {'value': 'AG', 'label': 'Antigua and Barbuda'}, {'value': 'AI', 'label': 'Anguilla'}, {'value': 'AL', 'label': 'Albania'}, {'value': 'AM', 'label': 'Armenia'}, {'value': 'AN', 'label': 'Netherlands Antilles'}, {'value': 'AO', 'label': 'Angola'}, {'value': 'AQ', 'label': 'Antarctica'}, {'value': 'AR', 'label': 'Argentina'}, {'value': 'AS', 'label': 'American Samoa'}, {'value': 'AT', 'label': 'Austria'}, {'value': 'AU', 'label': 'Australia'}, {'value': 'AW', 'label': 'Aruba'}, {'value': 'AX', 'label': 'Aland Islands'}, {'value': 'AZ', 'label': 'Azerbaijan'}, {'value': 'BA', 'label': 'Bosnia and Herzegovina'}, {'value': 'BB', 'label': 'Barbados'}, {'value': 'BD', 'label': 'Bangladesh'}, {'value': 'BE', 'label': 'Belgium'}, {'value': 'BF', 'label': 'Burkina Faso'}, {'value': 'BG', 'label': 'Bulgaria'}, {'value': 'BH', 'label': 'Bahrain'}, {'value': 'BI', 'label': 'Burundi'}, {'value': 'BJ', 'label': 'Benin'}, {'value': 'BM', 'label': 'Bermuda'}, {'value': 'BN', 'label': 'Brunei'}, {'value': 'BO', 'label': 'Bolivia'}, {'value': 'BR', 'label': 'Brazil'}, {'value': 'BS', 'label': 'Bahamas'}, {'value': 'BT', 'label': 'Bhutan'}, {'value': 'BV', 'label': 'Bouvet Island'}, {'value': 'BW', 'label': 'Botswana'}, {'value': 'BY', 'label': 'Belarus'}, {'value': 'BZ', 'label': 'Belize'}, {'value': 'CA', 'label': 'Canada'}, {'value': 'CC', 'label': 'Cocos Islands'}, {'value': 'CD', 'label': 'The Democratic Republic Of Congo'}, {'value': 'CF', 'label': 'Central African Republic'}, {'value': 'CG', 'label': 'Congo'}, {'value': 'CH', 'label': 'Switzerland'}, {'value': 'CI', 'label': 'Côte d\'Ivoire'}, {'value': 'CK', 'label': 'Cook Islands'}, {'value': 'CL', 'label': 'Chile'}, {'value': 'CM', 'label': 'Cameroon'}, {'value': 'CN', 'label': 'China'}, {'value': 'CO', 'label': 'Colombia'}, {'value': 'CR', 'label': 'Costa Rica'}, {'value': 'CS', 'label': 'Serbia and Montenegro'}, {'value': 'CU', 'label': 'Cuba'}, {'value': 'CV', 'label': 'Cape Verde'}, {'value': 'CX', 'label': 'Christmas Island'}, {'value': 'CY', 'label': 'Cyprus'}, {'value': 'CZ', 'label': 'Czech Republic'}, {'value': 'DE', 'label': 'Germany'}, {'value': 'DJ', 'label': 'Djibouti'}, {'value': 'DK', 'label': 'Denmark'}, {'value': 'DM', 'label': 'Dominica'}, {'value': 'DO', 'label': 'Dominican Republic'}, {'value': 'DZ', 'label': 'Algeria'}, {'value': 'EC', 'label': 'Ecuador'}, {'value': 'EE', 'label': 'Estonia'}, {'value': 'EG', 'label': 'Egypt'}, {'value': 'EH', 'label': 'Western Sahara'}, {'value': 'ER', 'label': 'Eritrea'}, {'value': 'ES', 'label': 'Spain'}, {'value': 'ET', 'label': 'Ethiopia'}, {'value': 'FI', 'label': 'Finland'}, {'value': 'FJ', 'label': 'Fiji'}, {'value': 'FK', 'label': 'Falkland Islands'}, {'value': 'FM', 'label': 'Micronesia'}, {'value': 'FO', 'label': 'Faroe Islands'}, {'value': 'FR', 'label': 'France'}, {'value': 'GA', 'label': 'Gabon'}, {'value': 'GB', 'label': 'United Kingdom'}, {'value': 'GD', 'label': 'Grenada'}, {'value': 'GE', 'label': 'Georgia'}, {'value': 'GF', 'label': 'French Guiana'}, {'value': 'GH', 'label': 'Ghana'}, {'value': 'GI', 'label': 'Gibraltar'}, {'value': 'GL', 'label': 'Greenland'}, {'value': 'GM', 'label': 'Gambia'}, {'value': 'GN', 'label': 'Guinea'}, {'value': 'GP', 'label': 'Guadeloupe'}, {'value': 'GQ', 'label': 'Equatorial Guinea'}, {'value': 'GR', 'label': 'Greece'}, {'value': 'GS', 'label': 'South Georgia And The South Sandwich Islands'}, {'value': 'GT', 'label': 'Guatemala'}, {'value': 'GU', 'label': 'Guam'}, {'value': 'GW', 'label': 'Guinea-Bissau'}, {'value': 'GY', 'label': 'Guyana'}, {'value': 'HK', 'label': 'Hong Kong'}, {'value': 'HM', 'label': 'Heard Island And McDonald Islands'}, {'value': 'HN', 'label': 'Honduras'}, {'value': 'HR', 'label': 'Croatia'}, {'value': 'HT', 'label': 'Haiti'}, {'value': 'HU', 'label': 'Hungary'}, {'value': 'ID', 'label': 'Indonesia'}, {'value': 'IE', 'label': 'Ireland'}, {'value': 'IL', 'label': 'Israel'}, {'value': 'IN', 'label': 'India'}, {'value': 'IO', 'label': 'British Indian Ocean Territory'}, {'value': 'IQ', 'label': 'Iraq'}, {'value': 'IR', 'label': 'Iran'}, {'value': 'IS', 'label': 'Iceland'}, {'value': 'IT', 'label': 'Italy'}, {'value': 'JM', 'label': 'Jamaica'}, {'value': 'JO', 'label': 'Jordan'}, {'value': 'JP', 'label': 'Japan'}, {'value': 'KE', 'label': 'Kenya'}, {'value': 'KG', 'label': 'Kyrgyzstan'}, {'value': 'KH', 'label': 'Cambodia'}, {'value': 'KI', 'label': 'Kiribati'}, {'value': 'KM', 'label': 'Comoros'}, {'value': 'KN', 'label': 'Saint Kitts And Nevis'}, {'value': 'KP', 'label': 'North Korea'}, {'value': 'KR', 'label': 'South Korea'}, {'value': 'KW', 'label': 'Kuwait'}, {'value': 'KY', 'label': 'Cayman Islands'}, {'value': 'KZ', 'label': 'Kazakhstan'}, {'value': 'LA', 'label': 'Laos'}, {'value': 'LB', 'label': 'Lebanon'}, {'value': 'LC', 'label': 'Saint Lucia'}, {'value': 'LI', 'label': 'Liechtenstein'}, {'value': 'LK', 'label': 'Sri Lanka'}, {'value': 'LR', 'label': 'Liberia'}, {'value': 'LS', 'label': 'Lesotho'}, {'value': 'LT', 'label': 'Lithuania'}, {'value': 'LU', 'label': 'Luxembourg'}, {'value': 'LV', 'label': 'Latvia'}, {'value': 'LY', 'label': 'Libya'}, {'value': 'MA', 'label': 'Morocco'}, {'value': 'MC', 'label': 'Monaco'}, {'value': 'MD', 'label': 'Moldova'}, {'value': 'MG', 'label': 'Madagascar'}, {'value': 'MH', 'label': 'Marshall Islands'}, {'value': 'MK', 'label': 'Macedonia'}, {'value': 'ML', 'label': 'Mali'}, {'value': 'MM', 'label': 'Myanmar'}, {'value': 'MN', 'label': 'Mongolia'}, {'value': 'MO', 'label': 'Macao'}, {'value': 'MP', 'label': 'Northern Mariana Islands'}, {'value': 'MQ', 'label': 'Martinique'}, {'value': 'MR', 'label': 'Mauritania'}, {'value': 'MS', 'label': 'Montserrat'}, {'value': 'MT', 'label': 'Malta'}, {'value': 'MU', 'label': 'Mauritius'}, {'value': 'MV', 'label': 'Maldives'}, {'value': 'MW', 'label': 'Malawi'}, {'value': 'MX', 'label': 'Mexico'}, {'value': 'MY', 'label': 'Malaysia'}, {'value': 'MZ', 'label': 'Mozambique'}, {'value': 'NA', 'label': 'Namibia'}, {'value': 'NC', 'label': 'New Caledonia'}, {'value': 'NE', 'label': 'Niger'}, {'value': 'NF', 'label': 'Norfolk Island'}, {'value': 'NG', 'label': 'Nigeria'}, {'value': 'NI', 'label': 'Nicaragua'}, {'value': 'NL', 'label': 'Netherlands'}, {'value': 'NO', 'label': 'Norway'}, {'value': 'NP', 'label': 'Nepal'}, {'value': 'NR', 'label': 'Nauru'}, {'value': 'NU', 'label': 'Niue'}, {'value': 'NZ', 'label': 'New Zealand'}, {'value': 'OM', 'label': 'Oman'}, {'value': 'PA', 'label': 'Panama'}, {'value': 'PE', 'label': 'Peru'}, {'value': 'PF', 'label': 'French Polynesia'}, {'value': 'PG', 'label': 'Papua New Guinea'}, {'value': 'PH', 'label': 'Philippines'}, {'value': 'PK', 'label': 'Pakistan'}, {'value': 'PL', 'label': 'Poland'}, {'value': 'PM', 'label': 'Saint Pierre And Miquelon'}, {'value': 'PN', 'label': 'Pitcairn'}, {'value': 'PR', 'label': 'Puerto Rico'}, {'value': 'PS', 'label': 'Palestine'}, {'value': 'PT', 'label': 'Portugal'}, {'value': 'PW', 'label': 'Palau'}, {'value': 'PY', 'label': 'Paraguay'}, {'value': 'QA', 'label': 'Qatar'}, {'value': 'RE', 'label': 'Reunion'}, {'value': 'RO', 'label': 'Romania'}, {'value': 'RU', 'label': 'Russia'}, {'value': 'RW', 'label': 'Rwanda'}, {'value': 'SA', 'label': 'Saudi Arabia'}, {'value': 'SB', 'label': 'Solomon Islands'}, {'value': 'SC', 'label': 'Seychelles'}, {'value': 'SD', 'label': 'Sudan'}, {'value': 'SE', 'label': 'Sweden'}, {'value': 'SG', 'label': 'Singapore'}, {'value': 'SH', 'label': 'Saint Helena'}, {'value': 'SI', 'label': 'Slovenia'}, {'value': 'SJ', 'label': 'Svalbard And Jan Mayen'}, {'value': 'SK', 'label': 'Slovakia'}, {'value': 'SL', 'label': 'Sierra Leone'}, {'value': 'SM', 'label': 'San Marino'}, {'value': 'SN', 'label': 'Senegal'}, {'value': 'SO', 'label': 'Somalia'}, {'value': 'SR', 'label': 'Suriname'}, {'value': 'ST', 'label': 'Sao Tome And Principe'}, {'value': 'SV', 'label': 'El Salvador'}, {'value': 'SY', 'label': 'Syria'}, {'value': 'SZ', 'label': 'Swaziland'}, {'value': 'TC', 'label': 'Turks And Caicos Islands'}, {'value': 'TD', 'label': 'Chad'}, {'value': 'TF', 'label': 'French Southern Territories'}, {'value': 'TG', 'label': 'Togo'}, {'value': 'TH', 'label': 'Thailand'}, {'value': 'TJ', 'label': 'Tajikistan'}, {'value': 'TK', 'label': 'Tokelau'}, {'value': 'TL', 'label': 'Timor-Leste'}, {'value': 'TM', 'label': 'Turkmenistan'}, {'value': 'TN', 'label': 'Tunisia'}, {'value': 'TO', 'label': 'Tonga'}, {'value': 'TR', 'label': 'Turkey'}, {'value': 'TT', 'label': 'Trinidad and Tobago'}, {'value': 'TV', 'label': 'Tuvalu'}, {'value': 'TW', 'label': 'Taiwan'}, {'value': 'TZ', 'label': 'Tanzania'}, {'value': 'UA', 'label': 'Ukraine'}, {'value': 'UG', 'label': 'Uganda'}, {'value': 'UM', 'label': 'United States Minor Outlying Islands'}, {'value': 'US', 'label': 'United States'}, {'value': 'UY', 'label': 'Uruguay'}, {'value': 'UZ', 'label': 'Uzbekistan'}, {'value': 'VA', 'label': 'Vatican'}, {'value': 'VC', 'label': 'Saint Vincent And The Grenadines'}, {'value': 'VE', 'label': 'Venezuela'}, {'value': 'VG', 'label': 'British Virgin Islands'}, {'value': 'VI', 'label': 'U.S. Virgin Islands'}, {'value': 'VN', 'label': 'Vietnam'}, {'value': 'VU', 'label': 'Vanuatu'}, {'value': 'WF', 'label': 'Wallis And Futuna'}, {'value': 'WS', 'label': 'Samoa'}, {'value': 'YE', 'label': 'Yemen'}, {'value': 'YT', 'label': 'Mayotte'}, {'value': 'ZA', 'label': 'South Africa'}, {'value': 'ZM', 'label': 'Zambia'}, {'value': 'ZW', 'label': 'Zimbabwe'} ];

  var getGD = {
    uri: gdURL,
    json: false
  };

  rp(getGD)
    .then(function (response) {
      // console.log(response);
      var validCountries = extractCountries(response);
      // console.log(validCountries);
      var matchedCountries = commonKeys(validCountries, chooseCountries);
      // console.log(matchedCountries);
      callback(null, matchedCountries);
    })
    .catch(function (err) {
      callback(err);
    });
}

module.exports =
  function (context, callback) {
    var isAuth = auth(context);

    console.log(isAuth);
    if (isAuth !== 'authorized') {
      callback(null, isAuth);
    }
    lookupCountries(context, callback);
  };
