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

function get_user_collections() {
  let query = `user=${user}&function=get_user_collections`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (response) {
      console.log(response);
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
      console.log(response);
    })
    .catch(function (error) {
      console.log("dit is een ERROR !!!!")
      console.log(error);
    });
};

// get all data of a specific painting
function get_painting(resourceID) {
  let query = `user=${user}&function=get_resource_data&param1=${resourceID}`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log("dit is een ERROR !!!!")
      console.log(error);
    });
};

// get painting image
function get_image(resourceID) {
  let query = `user=${user}&function=get_resource_path&param1=${resourceID}&param2=false`;
  let signedRequestString = sha256(key + query);
  axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log("dit is een ERROR !!!!")
      console.log(error);
    });
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
    "type":"image",
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

function resetQuiz(){
  questionTypes = ["imageChooser", "practical"];
}

var group;

function saveGroup(data){
  group = data;
  console.log(group);
}

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());


app.get('/resetQuiz', (req, res) => res.send(resetQuiz()));
app.get('/getQuestion', (req, res) => res.send(get_Question()));

app.post('/saveGroup', (req, res) => (saveGroup(req.body)));


app.listen(port, () => console.log(`Listening on port ${port}!`));