const express = require('express');
const app = express();
var bodyParser = require("body-parser");
const axios = require('axios').default;
const sha256 = require("js-sha256");
const port = 3000;

var key = "2dadbed20e3367139efb39ccc110d335b1497f36f3bbbebc822ff90b9d637b85";


var query = "user=admin" + "&function=get_user_collections";
var signedRequestString = sha256(key + query);
console.log(signedRequestString);

axios.get( `http://minikmska.trial.resourcespace.com/api/?user=admin&function=get_user_collections&sign=${signedRequestString}`
).then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log("dit is een ERROR !!!!")
    console.log(error);
  });