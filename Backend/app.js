import route from './route.js';
import Painting from './painting.js';
const express = require('./node_modules/express');
const app = express();
const bodyParser = require("./node_modules/body-parser");
const axios = require('./node_modules/axios').default;
const sha256 = require("./node_modules/js-sha256");
const request = require('request');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const recombee = require('recombee-api-client');
const rqs = recombee.requests;
const uuidv4 = require('uuid/v4');
let ObjectId = require('mongodb').ObjectID;

//  const pf = require('pathfinding');
const port = 3000;
let recourceSpaceKey = "2dadbed20e3367139efb39ccc110d335b1497f36f3bbbebc822ff90b9d637b85";
let recourceSpaceUser = "admin";
const mongoUsername = '1920PROJECTDB001';
const mongoPassword = 97354681;
let db;

// Connection URL
const mongoUrl = `mongodb://${mongoUsername}:${mongoPassword}@172.20.0.54:27017/?authMechanism=DEFAULT&authSource=${mongoUsername}`;

// Database Name
const dbName = mongoUsername;

// Create a new MongoClient
const myMongoClientclient = new MongoClient(mongoUrl);

// Use connect method to connect to the Server
myMongoClientclient.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    db = myMongoClientclient.db(dbName);
});

let paintingsIDs = [];
let painting = new Painting(0, "", "", 0, "", [], [], []);
let paintingList = [];
const artLocations = {
    locations: [
        [0, 0],
        [2, 1],
        [4, 1],
        [4, 4],
        [2, 4],
        [2, 2],
        [7, 1],
        [9, 1],
        [10, 2],
        [10, 4],
        [8, 4],
        [7, 7],
        [7, 9],
        [5, 10],
        [3, 10],
        [3, 7]
    ],
    id: [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1012, 1013, 1014, 1015, 1016]
};
let routeOrdered = [];

//MAKE THE ROUTE = ordered list of paintings

function get_route(recomms, resolveAll) { //recomms = array of painting id's, unordered
    //console.log(recomms);
    let route = [];
    let orderedIDs = [];
    let promiseList = [];
    let promiseList2 = [];
    let paintingLocations = {
        id: recomms,
        locations: []
    }

    recomms.forEach(function (recom) {
        let promise = new Promise(function (resolve, reject) {
            get_painting(recom, resolve, reject);
        });

        promiseList.push(promise);
    });

    Promise.all(promiseList).then(function (result) {
        result.forEach(function (paint) {
            //get the locations for each of the paintings
            paintingLocations.locations.push(paint.coordinates);
        });

        //calculate the route
        calculateClosest([0, 0], paintingLocations, orderedIDs);
        routeOrdered.pop();

        //get the images from each painting in the route
        routeOrdered.forEach(function (recom) {
            let promise = new Promise(function (resolve, reject) {
                get_image(recom, resolve, reject, new Painting());
            });

            promiseList2.push(promise);
        });

        Promise.all(promiseList2).then(function (result) {
            route.push(result);
            resolveAll(route[0]);
        });


    });



};

function calculateClosest(currentPosition, unusedPositions, orderedList) {
    //console.log(currentPosition);
    if (currentPosition != unusedPositions.locations[0]) {
        let closestPositionID = route.closestArt(currentPosition, unusedPositions);
        orderedList.push(closestPositionID);
        let index = unusedPositions.id.indexOf(closestPositionID);
        unusedPositions.id.splice(index, 1);
        let closestPosition = unusedPositions.locations.splice(index, 1);
        // console.log(closestPosition);
        // console.log(unusedPositions);
        // console.log(orderedList);
        calculateClosest(closestPosition[0], unusedPositions, orderedList);
    } else {
        routeOrdered = orderedList;

    }
}

// get paintings by a search word
// KMSKA for all paintings || room_A to get all paintings of the room
//get_all_paintings("KMSKA");

//setup("1004");

//this function saves the tags into the database: doesn't have to be done everytime, only when new paintings were added
function setup(id) { //=> you just run the function once per added painting
    new Promise(function (resolve, reject) {
        get_image(id, resolve, reject, painting);
    }).then(function (result) {
        let paintingObject = {
            image: result.image,
            id: result.id
        }
        console.log(paintingObject)

        let tags = get_tags(paintingObject.image, paintingObject.id);
        console.log(tags);
    });

};





function get_all_paintings(search, resolveAll) {
    paintingsIDs = [];


    let query = `user=${recourceSpaceUser}&function=do_search&param1=${search}`;
    let signedRequestString = sha256(recourceSpaceKey + query);

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
                resolveAll(paintingList);
            });

        })
        .catch(function (error) {
            console.log("Thinking of unicorns?")
            console.log(error);
        });

};

// get all data of a specific painting
function get_painting(resourceID, resolve, reject) {

    painting = {};
    let query = `user=${recourceSpaceUser}&function=get_resource_field_data&param1=${resourceID}`;
    let signedRequestString = sha256(recourceSpaceKey + query);
    axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (res) {
            painting.year = parseInt((res.data).filter(field => field.title = "Expiration date")[0].value.substr(0, 4));
            painting.title = (res.data).filter(field => field.name == "title")[0].value;
            painting.artist = (res.data).filter(field => field.name == "creator")[0].value;
            painting.info = (res.data).filter(field => field.name == "heritage")[0].value;
            painting.id = resourceID;
            painting.tags = (res.data).filter(field => field.name == "notes")[0].value;
            painting.coordinates = (res.data).filter(field => field.name == "source")[0].value.split(",");
            //console.log(res);
            let thisPainting = JSON.parse(JSON.stringify(painting));
            get_image(resourceID, resolve, reject, thisPainting);

        })
        .catch(function (error) {
            console.log("Maybe you should try to take a nap")
            console.log(error);
        });
};

// get painting image
function get_image(resourceID, resolve, reject, currentPainting) {

    let query = `user=${recourceSpaceUser}&function=get_resource_path&param1=${resourceID}&param2=false`;
    let signedRequestString = sha256(recourceSpaceKey + query);
    axios.get(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (res) {
            //console.log(currentPainting);
            currentPainting.image = res.data;
            currentPainting.id = resourceID;
            let thisPainting = JSON.parse(JSON.stringify(currentPainting));
            resolve(thisPainting);

            //get_tags(res.data, resourceID, resolve, reject);

        })
        .catch(function (error) {
            console.log("Try Again...")
            console.log(error);
        });
};

// request is being used because this is required to use for the imagga api
function get_tags(imageUrl, resourceID) {

    setTimeout(function () {
        request.get('https://api.imagga.com/v2/tags?image_url=' + encodeURIComponent(imageUrl), function (error, response, body) {
            //console.log(body);
            //console.log(response.statusCode);
            if (response.statusCode == "200") {
                let result = JSON.parse(body).result;
                let tagList = [];
                for (let i = 0; i < 5; i++) {
                    tagList.push(result.tags[i].tag.en);
                }
                console.log(tagList);
                return tagList;
            }
        }).auth('acc_43eee0e58e1c3e2', '68b590d5d60e210d6e44eb2287617ff4', true);
    }, 1000);
};

function set_tags(resourceID, tags) {
    let query = `user=${recourceSpaceUser}&function=update_field&param1=${resourceID}&param2=25&param3=${tags}`;
    let signedRequestString = sha256(recourceSpaceKey + query);
    axios.post(`http://minikmska.trial.resourcespace.com/api/?${query}&sign=${signedRequestString}`).then(function (res) {
            console.log("added" + resourceID);
        })
        .catch(function (error) {
            console.log("Well, maybe you should try something else...")
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

let questionTypes = ["practical"];

let practicalQuestions = [{
    "type": "practical",
    "questionString": "How long do you want to stay in the museum?",
    "answers": ["30 minutes or less", "30 minutes - 1 hour", "1 hour - 2 hours", "2+ hours"]
}];

//make a question
function get_Question(resolveFull, answer) {
    let question;
    let questionType = chooseOneFromList(questionTypes);

    if (questionType == "practical") {
        questionTypes = ["imageChooser"];
        question = chooseOneFromList(practicalQuestions);
        resolveFull(question);
    } else {
        new Promise(function (resolve) {
            get_imageQuestion(resolve, answer.id, answer.userId)
        }).then(function (result) {
            resolveFull(result);
        })
    }
}

function get_imageQuestion(resolve, answerID, userID) {

    var promise = new Promise(function (resolve) {
        get_all_paintings("KMSKA", resolve)
    }).then(function () {
        //console.log(paintings);
        //get an image question
        let images = [];

        client.send(new rqs.RecommendItemsToItem(answerID, userID, 4, {
            /*optional parameters */
        })).then(function (response) {
            for (let i = 0; i < 4; i++) {
                let painting = paintingList.filter(element => element.id == response.recomms[i].id)[0];
                images.push(painting);
            }
            let question = {
                "type": "image",
                "questionString": "Choose an artwork",
                "answers": images
            }

            resolve(question);
        });
    });
}

function resetQuiz() {
    questionTypes = ["practical"];
}

//SAVE THE GROUP AS A USER
let group;

function saveGroup(data, resolveAll) {

    group = data;
    //group.id = uuidv4();
    //console.log(group);
    new Promise(function (resolve, reject) {
        send_purchases(group, resolve);
    }).then(function (result) {
        resolveAll(result);
    });
}

function setupGroup(resolveAll) {
    let id = uuidv4();
    //console.log(group);
    client.send(new rqs.AddUser(id), function(){
        resolveAll(id);
    });
}

//RECOMBEE RECOMMENDATIONS

const client = new recombee.ApiClient('erasmus-community-college-brussels-dev', "c2kpeay9E09tBs2vNTX0LLexqa6gKU020qqpIViJwpgHWMccspZb11pGVpEPDAhp");

//making the product list - only has to be done once

//setup_productList();
function setup_productList() {
    //this function creates the necessary fields we need for the products (paintings)
    client.send(new rqs.AddItemProperty('title', 'string')).then((response) => {
            return client.send(new rqs.AddItemProperty('tags', 'set'));
        })
        .then((response) => {
            return client.send(new rqs.AddItemProperty('image', 'image'));
        })
        .catch((error) => {
            console.log("something went wrong with the product setup");
        });
}

new Promise(function (resolve) {

    get_all_paintings("KMSKA", resolve)
}).then(function () {
    //you just fill in the index of the painting you want to add to the productlist
    //console.log(paintingList[0]);
    // setup_painting(paintingList[0]);
});

function setup_painting(painting) {
    let paintingTitle = painting.title;
    let paintingTags = painting.tags.split(',');
    let paintingImage = painting.image;
    let paintingArtist = painting.artist;
    let paintingInfo = painting.info.split(',');
    let paintingStyle;
    for (let i = 0; i < paintingInfo.length; i++) {
        if (paintingInfo[i] != "KMSKA" && paintingInfo[i] != "room_A" && paintingInfo[i] != "room_B" && paintingInfo[i] != "room_C") {
            paintingStyle = paintingInfo[i];
        }
    }

    client.send(new rqs.SetItemValues(painting.id,
            // values
            {
                title: paintingTitle,
                tags: paintingTags,
                image: paintingImage,
                artist: paintingArtist,
                style: paintingStyle
            },
            // optional parameters
            {
                cascadeCreate: true
            }
        ),
        (err, response) => {
            console.log(err);
            //console.log(response);
        });

};

function send_purchases(group, resolveAll) {
    //console.log(group.answers.images);

    let promises = [];

    group.answers.images.forEach(function (image) {
        //console.log(image);
        let newPromise = new Promise(function (resolve, reject) {
            send_purchase(group.id, image, resolve);
        });
        promises.push(newPromise);
    });

    Promise.all(promises).then(function (result) {
        new Promise(function (resolve, reject) {
            getRecommendations(group, resolve);
        }).then(function (result) {
            resolveAll(result.recomms);
        });
    });

}

function send_purchase(id, image, resolve) {

    client.send(new rqs.AddPurchase(id, image, {
            cascadeCreate: true
        }),
        (err, response) => {
            //console.log(image);
            resolve();
        }
    );
}

let recommAmount;

function getRecommendations(group, resolve) {

    //console.log(group);
    if (group.answers.practical[0] == "30 minutes or less") {
        recommAmount = 3;
    } else if (group.answers.practical[0] == "30 minutes - 1 hour") {
        recommAmount = 4;
    } else if (group.answers.practical[0] == "1 hour - 2 hours") {
        recommAmount = 5;
    } else {
        recommAmount = 6;
    }
    client.send(new rqs.RecommendItemsToUser(group.id, recommAmount),
        (err, recommended) => {
            //console.log(recommended);
            resolve(recommended);
        }
    );
}

//APP PATHS (Express)
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

app.post('/getQuestion', (req, res) => (
    new Promise(function (resolve) {
        get_Question(resolve, req.body);
    }).then(function (result) {
        res.send(result);
    })
));
app.post('/getPaintings', (req, res) => (
    new Promise(function (resolve) {
        get_all_paintings();
    }).then(function (result) {
        res.send(result);
    })
));

app.post('/saveGroup', (req, res) => (
    new Promise(function (resolve) {
        saveGroup(req.body, resolve);
    }).then(function (result) {
        res.send(result);
    })
));

app.get('/setupGroup', (req, res) => (
    new Promise(function (resolve) {
        setupGroup(resolve);
    }).then(function (result) {
        res.send(result);
    })
));

app.post('/getRoute', (req, res) => (
    //console.log(req.body.selectedPaintings)
    new Promise(function (resolve) {
        get_route(req.body.selectedPaintings, resolve);
    }).then(function (result) {
        res.send(result);
    })
));

app.get('/getRouteMongo/:id', (req, res) => {
    const collection = db.collection('routes');
    const selectedRoute = collection.findOne({"_id": ObjectId(req.params.id)}, function(err, result) {
        if (err) throw err;
        res.json(result);
      });
});

app.get('/getAllRoutesMongo', (req, res) => {
    const collection = db.collection('routes');
    collection.find({}).toArray(function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});

app.post('/create-route', (req, res) => {
    const collection = db.collection('routes');
    const route = {
        name: req.body.name,
        rating: req.body.rating,
        number_of_ratings: req.body.number_of_ratings,
        images: req.body.images,
        paintingsIDs: req.body.paintingsIDs,
        info: req.body.info
    }
    collection.insertOne(route);
    res.json(route);
});

app.post('/update_rating/:id', (req, res) => {
    const collection = db.collection('routes');

    const selectedRoute = collection.findOne({"_id": ObjectId(req.params.id)}, function(err, result) {
        if (err) throw err;
        let recievedRating = JSON.parse(req.body.rating);
        let changedRoute = result;
        changedRoute.rating = ((result.rating * result.number_of_ratings) + recievedRating) / (result.number_of_ratings + 1);
        changedRoute.number_of_ratings = result.number_of_ratings + 1;
        collection.updateMany(
            {"_id": ObjectId(req.params.id)}, // Filter
            {$set:{"rating": changedRoute.rating, "number_of_ratings": changedRoute.number_of_ratings }} // Update
        )
        res.json(changedRoute);
    })
});


app.listen(port, () => console.log(`Listening on port ${port}!`));