
"use strict";
/* global __dirname */

var express = require("express");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var path = require('path');


var port = (process.env.PORT || 10000);
var BASE_API_PATH = "/api/v1";

var mongoclient=require('mongodb').MongoClient;
var url = 'mongodb://test:test@ds113608.mlab.com:13608/sandbox';
var dba;

mongoclient.connect(url,{native_parser: true}, function (err,database){
    
    if(err){
        console.log("can not connect to db: "+ err);
        process.exit(1);
    }
    
    dba = database.collection("youthunemploymentstats");
    
    
    app.listen(port, () => {
        console.log("Magic is happening on port " + port);
    });
    
    
});

var app = express();

app.use("/api/v1",express.static(path.join('SOS1617-01')));
app.use(bodyParser.json()); //use default json enconding/decoding
app.use(helmet()); //improve security

app.get(BASE_API_PATH + "/youthunemploymentstats/loadInitialData", function (request, response) {
    console.log("INFO: New GET request to /youthunemploymentstats when BD is empty");
   
   dba.find({}).toArray(function (err, data) {
    console.log('INFO: Initialiting DB...');

    if (err) {
        console.error('WARNING: Error while getting initial data from DB');
        return 0;
    }


    if (data.length === 0) {
        console.log('INFO: Empty DB, loading initial data');

        var countries = [{
                "country":"germany",
                "male_unemployment_ratio":10.0,
                "female_unemployment_ratio":10.0
            },
            {
                  "country":"spain",
                "male_unemployment_ratio":44.0,
                "female_unemployment_ratio":44.0
            },
            {
                 "country":"italy",
                "male_unemployment_ratio":33.0,
                "female_unemployment_ratio":33.0
            }];
        dba.insert(countries);
        console.log("DB CREATE ");
    } else {
        console.log('INFO: DB has ' + dba.length + ' countries ');
    }
        response.redirect(301, BASE_API_PATH + "/youthunemploymentstats");

});
   
});



// Base GET
app.get("/", function (request, response) {
    console.log("INFO: Redirecting to /youthunemploymentstats");
    response.redirect(301, BASE_API_PATH + "/youthunemploymentstats");
});


// GET a collection
app.get(BASE_API_PATH + "/youthunemploymentstats", function (request, response) {
    console.log("INFO: New GET request to /youthunemploymentstats");
    dba.find({}).toArray(function (err, contacts) {
        if (err) {
            console.error('WARNING: Error getting data from DB');
            response.sendStatus(500); // internal server error
        } else {
            console.log("INFO: Sending contacts: " + JSON.stringify(contacts, 2, null));
            response.send(contacts);
        }
    });
});


// GET a single resource
app.get(BASE_API_PATH + "/youthunemploymentstats/:country", function (request, response) {
    var country = request.params.country;
    if (!country) {
        console.log("WARNING: New GET request to /youthunemploymentstats/:country without country, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New GET request to /youthunemploymentstats/" + country);
        dba.find({country:country}).toArray(function (err, paises) {
            if (err) {
                console.error('WARNING: Error getting data from DB');
                response.sendStatus(500); // internal server error
            } else {
            
                if (paises.length > 0) {
                    var pais = paises[0]; //since we expect to have exactly ONE contact with this name
                    console.log("INFO: Sending contact: " + JSON.stringify(pais, 2, null));
                    response.send(pais);
                } else {
                    console.log("WARNING: There are not any country with name " + country);
                    response.sendStatus(404); // not found
                }
            }
        });
    }
});


//POST over a collection
app.post(BASE_API_PATH + "/youthunemploymentstats", function (request, response) {
    var newData = request.body;
    if (!newData) {
        console.log("WARNING: New POST request to /youthunemploymentstats/ without country, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New POST request to /youthunemploymentstats with body: " + JSON.stringify(newData, 2, null));
        if (!newData.country || !newData.male_unemployment_ratio || !newData.female_unemployment_ratio) {
            console.log("WARNING: The contact " + JSON.stringify(newData, 2, null) + " is not well-formed, sending 422...");
            response.sendStatus(422); // unprocessable entity
        } else {
            dba.find({country:newData.country}).toArray(function (err, paises) {
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else {
                  
                    if (paises.length > 0) {
                        console.log("WARNING: The contact " + JSON.stringify(newData, 2, null) + " already extis, sending 409...");
                        response.sendStatus(409); // conflict
                    } else {
                        console.log("INFO: Adding contact " + JSON.stringify(newData, 2, null));
                        dba.insert(newData);
                        response.sendStatus(201); // created
                    }
                }
            });
        }
    }
});


//POST over a single resource
app.post(BASE_API_PATH + "/youthunemploymentstats/:country", function (request, response) {
    var country = request.params.country;
    console.log("WARNING: New POST request to /contacts/" + country + ", sending 405...");
    response.sendStatus(405); // method not allowed
});


//PUT over a collection
app.put(BASE_API_PATH + "/youthunemploymentstats", function (request, response) {
    console.log("WARNING: New PUT request to /youthunemploymentstats, sending 405...");
    response.sendStatus(405); // method not allowed
});


//PUT over a single resource
app.put(BASE_API_PATH + "/youthunemploymentstats/:country", function (request, response) {
    var updatedCountry = request.body;
    var country = request.params.country;
    if (!updatedCountry) {
        console.log("WARNING: New PUT request to /youthunemploymentstats/ without country, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New PUT request to /youthunemploymentstats/" + country + " with data " + JSON.stringify(updatedCountry, 2, null));
        if (!updatedCountry.country || !updatedCountry.male_unemployment_ratio || !updatedCountry.female_unemployment_ratio) {
            console.log("WARNING: The country " + JSON.stringify(updatedCountry, 2, null) + " is not well-formed, sending 422...");
            response.sendStatus(422); // unprocessable entity
        } else {
            
            dba.find({country:updatedCountry.country}).toArray(function (err, paises) {
                if (err) {
                    console.error('WARNING: Error getting data from DB');
                    response.sendStatus(500); // internal server error
                } else {
                
                    if (paises.length > 0) {
                        dba.update({country: updatedCountry.country}, updatedCountry);
                        console.log("INFO: Modifying country with name " + country + " with data " + JSON.stringify(updatedCountry, 2, null));
                        response.send(updatedCountry); // return the updated contact
                    } else {
                        console.log("WARNING: There are not any country with name " + country);
                        response.sendStatus(404); // not found
                    }
                }
            });
        }
    }
});


//DELETE over a collection
app.delete(BASE_API_PATH + "/youthunemploymentstats", function (request, response) {
    console.log("INFO: New DELETE request to /youthunemploymentstats");
    dba.remove({}, function (err, numRemoved) {
        if (err) {
            console.error('WARNING: Error removing data from DB');
            response.sendStatus(500); // internal server error
        } else {
            if (numRemoved) {
                console.log("INFO: All the countries (" + numRemoved + ") have been succesfully deleted, sending 204...");
                response.sendStatus(204); // no content
            } else {
                console.log("WARNING: There are no countries to delete");
                response.sendStatus(404); // not found
            }
        }
    });
});


//DELETE over a single resource
app.delete(BASE_API_PATH + "/youthunemploymentstats/:country", function (request, response) {
    var country = request.params.country;
    if (!country) {
        console.log("WARNING: New DELETE request to /youthunemploymentstats/:country without country, sending 400...");
        response.sendStatus(400); // bad request
    } else {
        console.log("INFO: New DELETE request to /youthunemploymentstats/" + country);
        dba.remove({country: country}, function (err, numRemoved) {
            if (err) {
                console.error('WARNING: Error removing data from DB');
                response.sendStatus(500); // internal server error
            } else {
                console.log("INFO: country removed: " + numRemoved);
                if (numRemoved) {
                    console.log("INFO: The country with name " + country + " has been succesfully deleted, sending 204...");
                    response.sendStatus(204); // no content
                } else {
                    console.log("WARNING: There are no countries to delete");
                    response.sendStatus(404); // not found
                }
            }
        });
    }
});

