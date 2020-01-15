const express = require('./node_modules/express');
const app = express();
const bodyParser = require("./node_modules/body-parser");
const axios = require('./node_modules/axios').default;
const sha256 = require("./node_modules/js-sha256");
const request = require('request');
const fs = require('fs');
const pf = require('pathfinding');
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
get_all_paintings("KMSKA");

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
        let paintingPromise = new Promise(function (resolve) {
          //console.log(currentPaintingID);
          get_painting(currentPaintingID, resolve);
        });
        promiseList.push(paintingPromise);
      });

      //console.log(promiseList);
      Promise.all(promiseList).then(function (result) {
        paintingList = result;
        // console.log(paintingList);
      });

    })
    .catch(function (error) {
      console.log("ERROR")
      console.log(error);
    });
};

// get all data of a specific painting
function get_painting(resourceID, resolve) {
  let query = `user=${user}&function=get_resource_field_data&param1=${resourceID}`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (res) {
      painting.year = parseInt((res.data).filter(field => field.title = "Expiration date")[0].value.substr(0, 4));
      painting.title = (res.data).filter(field => field.name == "title")[0].value;
      painting.artist = (res.data).filter(field => field.name == "creator")[0].value;
      painting.info = (res.data).filter(field => field.name == "heritage")[0].value;
      painting.id = resourceID;
      var thisPainting = JSON.parse(JSON.stringify(painting));
      //console.log(painting);
      resolve(thisPainting);
      //get_image(resourceID, resolve);
    })
    .catch(function (error) {
      console.log("ERROR")
      console.log(error);
    });
};

// get all user collections
get_user_collections();

function get_user_collections() {
  let query = `user=${user}&function=get_user_collections`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (response) {
      //console.log(response);
    })
    .catch(function (error) {
      console.log("dit is een ERROR !!!!")
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
      console.log("dit is een ERROR !!!!")
      console.log(error);
    });
};

get_image(1003, "");
// get painting image
function get_image(resourceID, resolve) {
  let query = `user=${user}&function=get_resource_path&param1=${resourceID}&param2=false`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (res) {
    // console.log(painting);
      painting.image = res.data;
      get_tags(res.data, resourceID);
      // console.log(res.data);
      // resolve(resourceID);
    })
    .catch(function (error) {
      console.log("ERROR")
      console.log(error);
    });
};

// request is being used because this is required to use for the imagga api
function get_tags(imageUrl, resourceID) {
  request.get('https://api.imagga.com/v2/tags?image_url=' + encodeURIComponent(imageUrl), function (error, response, body) {
    //console.log('Status:', response.statusCode);
    //console.log('Headers:', JSON.stringify(response.headers));
    //console.log(body);
    set_tags(resourceID, JSON.stringify(body));
  }).auth('acc_43eee0e58e1c3e2', '68b590d5d60e210d6e44eb2287617ff4', true);
};

function set_tags(resourceID, tags){
  let query = `user=${user}&function=update_field&param1=${resourceID}&param2=25&param3=${tags}`;
  let signedRequestString = sha256(key + query);
  axios.post(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (res) {
      console.log(res);
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



















