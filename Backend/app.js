const express = require('./node_modules/express');
const app = express();
const bodyParser = require("./node_modules/body-parser");
const axios = require('./node_modules/axios').default;
const sha256 = require("./node_modules/js-sha256");
const request = require('request');
const fs = require('fs');
//  const pf = require('pathfinding');
const port = 3000;
let key = "2dadbed20e3367139efb39ccc110d335b1497f36f3bbbebc822ff90b9d637b85";
let user = "admin";
let paintingsIDs = [];
let painting = {
  id: 0,
  title: "",
  artist: "",
  year: 0,
  image: "",
  info: [],
  tags: []
};
let paintingList = [];

// get paintings by a search word
// KMSKA for all paintings || room_A to get all paintings of the room
//get_all_paintings("KMSKA");

fullSetup();

function fullSetup(){
  
  let promise1 = new Promise(function(resolve, reject){
    setup(["1004"], resolve);
  });
  let promise2 = new Promise(function(resolve, reject){
    setup(["1010"], resolve);
  });
  let promise3 = new Promise(function(resolve, reject){
    setup(["1011"], resolve);
  });
  let promise4 = new Promise(function(resolve, reject){
    setup(["1012"], resolve);
  });

  let promises = [promise1, promise2, promise3, promise4];

  Promise.all(promises).then(function(result){
    console.log(result);
  })

}


//this function saves the tags into the database: doesn't have to be done everytime, only when new paintings were added
function setup(idList, resolveSetup){ //=> needs an array of the new id's 
  let imagePromises = [];
  let imagePromise;
  let imagesList = [];
  idList.forEach(function(id){
    imagePromise = new Promise(function(resolve, reject){
      get_image(id, resolve, reject, painting);
    });
    imagePromises.push(imagePromise);
  });

Promise.all(imagePromises).then(function(result){
  result.forEach(function(p){
    let paintingObject = {image: p.image, id: p.id}
    imagesList.push(paintingObject);
  });

  //console.log(imagesList);

  imagesList.forEach(function(object){
    get_tags(object.image, object.id, resolveSetup); 
  });


});

}

function get_all_paintings(search) {
  let query = `user=${user}&function=do_search&param1=${search}`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (res) {
      res.data.forEach(responsePainting => {
        paintingsIDs.push(responsePainting.ref);
      });

      //console.log(paintingsIDs);
      let promiseList = [];

      paintingsIDs.forEach(currentPaintingID => {
        let paintingPromise = new Promise(function (resolve, reject) {
          //console.log(currentPaintingID);
          get_painting(currentPaintingID, resolve, reject);
        });
        promiseList.push(paintingPromise);
      });

      //console.log(promiseList);
      Promise.all(promiseList).then(function (result) {
        paintingList = result;
        console.log(result);
      });

    })
    .catch(function (error) {
      console.log("ERROR")
      console.log(error);
    });
};

// get all data of a specific painting
function get_painting(resourceID, resolve, reject) {
  painting = {};
  let query = `user=${user}&function=get_resource_field_data&param1=${resourceID}`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (res) {
      painting.year = parseInt((res.data).filter(field => field.title = "Expiration date")[0].value.substr(0, 4));
      painting.title = (res.data).filter(field => field.name == "title")[0].value;
      painting.artist = (res.data).filter(field => field.name == "creator")[0].value;
      painting.info = (res.data).filter(field => field.name == "heritage")[0].value;
      painting.id = resourceID;
      painting.tags = (res.data).filter(field => field.name == "notes")[0].value;
      //console.log(res);
      let thisPainting = JSON.parse(JSON.stringify(painting));
      get_image(resourceID, resolve, reject, thisPainting);
    })
    .catch(function (error) {
      console.log("ERROR")
      console.log(error);
    });
};

// get all user collections
//get_user_collections();

function get_user_collections() {
  let query = `user=${user}&function=get_user_collections`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (response) {
      //console.log(response);
    })
    .catch(function (error) {
      console.log("Try Again...")
      console.log(error);
    });
};

// get all public collections
function get_collections() {
  let query = `user=${user}&function=search_public_collections`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (response) {
      //console.log(response);
    })
    .catch(function (error) {
      console.log("better luck next time :-) ")
      console.log(error);
    });
};

// get painting image
function get_image(resourceID, resolve, reject, currentPainting) {
  let query = `user=${user}&function=get_resource_path&param1=${resourceID}&param2=false`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (res) {
      //console.log(currentPainting);
      currentPainting.image = res.data;
      currentPainting.id = resourceID;
      let thisPainting = JSON.parse(JSON.stringify(currentPainting));
      resolve(thisPainting);

      //get_tags(res.data, resourceID, resolve, reject);
    })
    .catch(function (error) {
      console.log("ERROR")
      console.log(error);
    });
};

// request is being used because this is required to use for the imagga api
function get_tags(imageUrl, resourceID, resolve) {
  setTimeout(function(){
    request.get('https://api.imagga.com/v2/tags?image_url=' + encodeURIComponent(imageUrl), function (error, response, body) {
      //console.log(body);
    console.log(response.statusCode);
      if(response.statusCode == "200"){
        let result = JSON.parse(body).result;
        let tagList = [];
        for(let i = 0; i < 5; i++){
          tagList.push(result.tags[i].tag.en);
        }
        //console.log(tagList);
        resolve(tagList);
        //set_tags(resourceID, tagList, resolve);
      }
    }).auth('acc_43eee0e58e1c3e2', '68b590d5d60e210d6e44eb2287617ff4', true);
  }, 1000);
};

function set_tags(resourceID, tags, resolve){
  let query = `user=${user}&function=update_field&param1=${resourceID}&param2=25&param3=${tags}`;
  let signedRequestString = sha256(key + query);
  axios.post(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (res) {
      //console.log(res);
      painting.tags = tags;
      console.log(painting);
      var thisPainting = JSON.parse(JSON.stringify(painting));
      //resolve();
      resolve(thisPainting);
    })
    .catch(function (error) {
      console.log("ERROR")
      console.log(error);
    });
}

function write_json(newData) {
  fs.readFile('json/paintings.json', function (err, data) {
    let json = JSON.parse(data);
    json.paintings.push(painting);
    fs.writeFile("json/paintings.json", JSON.stringify(json), function (err, result) {
      if (err) console.log('error', err);
    });
  })
  //console.log(painting);
};


//CHOOSE IMAGES FOR QUIZ

//function that chooses something from an array
function chooseOneFromList(array) {
  return array[Math.floor(Math.random() * array.length)];
}

//make a question
function get_Question() {
  var questionType = chooseOneFromList(questionTypes);

  if (questionType == "practical") {
    questionTypes = ["imageChooser"];
    question = chooseOneFromList(practicalQuestions);
    return question;

  } else {

    return get_imageQuestion();

  }


}

function get_imageQuestion() {
  //get an image question
  var images = [];
  for (var i = 0; i < 4; i++) {
    images[i] = chooseOneFromList(dummyImages);
  }

  var question = {
    "type": "image",
    "questionString": "Choose an image",
    "answers": images
  }

  return question;
}



var questionTypes = ["imageChooser", "practical"];

var practicalQuestions = [{
  "type": "practical",
  "questionString": "How long do you want to stay in the museum?",
  "answers": ["30 minutes or less", "30 minutes - 1 hour", "1 hour - 2 hours", "2+ hours"]
}]

var dummyImages = [{
    "id": 1,
    "url": "https://via.placeholder.com/350x150",
    "tags": ["impressionism", "sea", "blue"]
  },
  {
    "id": 2,
    "url": "https://via.placeholder.com/350x150",
    "tags": ["Vlaamse Primitieven", "woman", "red"]
  },
  {
    "id": 3,
    "url": "https://via.placeholder.com/350x150",
    "tags": ["surrealism", "man", "child"]
  },
  {
    "id": 4,
    "url": "https://via.placeholder.com/350x150",
    "tags": ["impressionism", "bridge", "green"]
  },
  {
    "id": 5,
    "url": "https://via.placeholder.com/350x150",
    "tags": ["Vlaamse Primitieven", "child", "wings"]
  }
]

function resetQuiz() {
  questionTypes = ["imageChooser", "practical"];
}

var group;

function saveGroup(data) {
  group = data;
  console.log(group);
}

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({
  extended: true
}));
// parse application/json
app.use(bodyParser.json());


app.get('/resetQuiz', (req, res) => res.send(resetQuiz()));
app.get('/getQuestion', (req, res) => res.send(get_Question()));

app.post('/saveGroup', (req, res) => (saveGroup(req.body)));


app.listen(port, () => console.log(`Listening on port ${port}!`));



















