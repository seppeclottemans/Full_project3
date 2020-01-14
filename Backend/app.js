const express = require('./node_modules/express');
const app = express();
const bodyParser = require("./node_modules/body-parser");
const axios = require('./node_modules/axios').default;
const sha256 = require("./node_modules/js-sha256");
const port = 3000;

let key = "2dadbed20e3367139efb39ccc110d335b1497f36f3bbbebc822ff90b9d637b85";
let user = "admin";

// get all user collections
get_user_collections();
function get_user_collections(){
  let query = `user=${user}&function=get_user_collections`;
  let signedRequestString = sha256(key + query);
  axios.get( `http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`
).then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log("dit is een ERROR !!!!")
    console.log(error);
  });
};

// get all public collections
function get_collections(){
  let query = `user=${user}&function=search_public_collections`;
  let signedRequestString = sha256(key + query);
  axios.get( `http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`
).then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log("dit is een ERROR !!!!")
    console.log(error);
  });
};

// get all data of a specific painting
function get_painting(resourceID){
  let query = `user=${user}&function=get_resource_data&param1=${resourceID}`;
  let signedRequestString = sha256(key + query);
  axios.get( `http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`
).then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log("dit is een ERROR !!!!")
    console.log(error);
  });
};

// get painting image
function get_image(resourceID){
  let query = `user=${user}&function=get_resource_path&param1=${resourceID}&param2=false`;
  let signedRequestString = sha256(key + query);
  axios.get( `http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`
).then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log("dit is een ERROR !!!!")
    console.log(error);
  });
};

