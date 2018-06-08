// configuration
require("dotenv").config();


// Take in the command line arguments
var nodeArgs = process.argv;

// will need fs to read and write files
var fs = require("fs");


var request = require('request');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');

var keys = require("./keys.js");

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

// Building the twitter API call via the convenience code setup by the twitter node module
client.get('statuses/user_timeline', {count: 2}, function(error, tweets, response) {
    if(error) throw error;

    //Need a for loop here to loop through each tweet in array
    console.log("Tweet " + (0 + 1)+ ": " + tweets[0].text);
    console.log("Posted: " + tweets[0].created_at + "\n");

    // console.log(JSON.stringify(response));  // Raw response object. stringified
  });

