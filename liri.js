// configuration
require("dotenv").config();

// will need fs to read and write files
var fs = require("fs");

var request = require('request');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');

var keys = require("./keys.js");

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

// Take in the command line arguments
var nodeArgs = process.argv;

// sets up a variable for the user commands for simplicity (will always be third b/c node and liri are first two)
var userCommand = nodeArgs[2];
var userInputSpecific = nodeArgs[3];

// starts the program with a check for a command, otherwise greeting and prompt to enter a command if there is no third argument entered
if (userCommand) {

    // once we determine there is a command, then we run the if statement to see if it's one we have an answer for

    // =======================TWITTER========================== //
    if (userCommand === 'my-tweets') {
        // Building the twitter API call via the convenience code setup by the twitter node module
        // wrapped the API call in an if statement to let it only run with the right command
        client.get('statuses/user_timeline', {count: 20}, function(error, tweets, response) {
            if(error) throw error;
    
                //for loop here to loop through each tweet in array
                for (var i = 0; i < tweets.length; i++) {
                    console.log("\nTweet " + (i + 1)+ ": " + tweets[i].text);
                    console.log("Posted: " + tweets[i].created_at);    
                }
        });
    }
    // =======================END TWITTER========================== //

    // =======================SPOTIFY========================== //
    else if (userCommand === 'spotify-this-song') {
        // userInputSpecific in this case will be the string with the song title
        // limit of results set by default to 1 rather than the package's 20 default for simplicity since some searches will return multiple hits
        // hard-coded double quotes around the user string input for a stricter search beacuse otherwise each word is treated as an independent search term

        if (userInputSpecific) { // if input is truthy/not empty
            spotify.search({
                type: 'track',
                query: '"' + userInputSpecific + '"',
                limit: 1
                 }, 
                function(err, data) {
                if (err) {
                  return console.log('Error occurred: ' + err);
                }
                // if no error, return data
                console.log("Name of Track: " + data.tracks.items[0].name);
                console.log("Artist: " + data.tracks.items[0].album.artists[0].name); // artist name
                console.log("Album: " + data.tracks.items[0].album.name);// album name
                console.log("Link to Track: " + data.tracks.items[0].href);// link to track

                });
    
        } else {
            // if no song input, return default "The Sign" by Ace of Base
            spotify.request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE')
            .then(function(data) {
                console.log("Name of Track: " + data.name);
                console.log("Artist: " + data.artists[0].name); // artist name
                console.log("Album: " + data.album.name);// album name
                console.log("Link to Track: " + data.href);// link to track

            })
            .catch(function(err) {
              console.error('Error occurred: ' + err); 
            });
        }        
    }
    // =======================END SPOTIFY========================== //

    // =======================OMDB========================== //
    else if (userCommand === 'movie-this') {
        //format of request
        // http://www.omdbapi.com/?apikey=trilogy&s=Mr.+Nobody&type=movie&r=json
        var queryURL = "http://www.omdbapi.com/?apikey=trilogy&t=" + userInputSpecific + "&type=movie&r=json";

        if (userInputSpecific) {
            // Request to the OMDB API with the movie specified
            request(queryURL, function(error, response, body) {

                // If the request is successful (i.e. if the response status code is 200)
                if (!error && response.statusCode === 200) {
        
                // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
                console.log("Title: " + JSON.parse(body).Title);
                console.log("Year: "+ JSON.parse(body).Year); // Year the movie came out.
                console.log("IMDB Rating: "+ JSON.parse(body).imdbRating); // * IMDB Rating
                console.log(JSON.parse(body).Ratings[1].Source + " Rating: " + JSON.parse(body).Ratings[1].Value); // * Rotten Tomatoes Rating
                console.log("Produced in: " + JSON.parse(body).Country);// * Country where the movie was produced.
                console.log("Language(s): " + JSON.parse(body).Language);// * Language
                console.log("Plot: " + JSON.parse(body).Plot);// * Plot
                console.log("Actors: " + JSON.parse(body).Actors);// * Actors
                }
            });

        }
        else {
            userInputSpecific = "Mr. Nobody"; // if no input from user, set it to the default Mr. Nobody
            queryURL = "http://www.omdbapi.com/?apikey=trilogy&t=" + userInputSpecific + "&type=movie&r=json";
            // Request to the OMDB API with the movie specified
            request(queryURL, function(error, response, body) {

                // If the request is successful (i.e. if the response status code is 200)
                if (!error && response.statusCode === 200) {
        
                // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
                console.log("Title: " + JSON.parse(body).Title);
                console.log("Year: "+ JSON.parse(body).Year); // Year the movie came out.
                console.log("IMDB Rating: "+ JSON.parse(body).imdbRating); // * IMDB Rating
                console.log(JSON.parse(body).Ratings[1].Source + " Rating: " + JSON.parse(body).Ratings[1].Value); // * Rotten Tomatoes Rating
                console.log("Produced in: " + JSON.parse(body).Country);// * Country where the movie was produced.
                console.log("Language(s): " + JSON.parse(body).Language);// * Language
                console.log("Plot: " + JSON.parse(body).Plot);// * Plot
                console.log("Actors: " + JSON.parse(body).Actors);// * Actors
                }
            });
        }
    }
    // =======================END OMDB========================== //

    // =======================READ COMMAND FROM RANDOM.TXT========================== //
    else if (userCommand === 'do-what-it-says') {

    }
    // =======================END READ COMMAND FROM RANDOM.TXT======================= //
    
    else {
        console.log("Sorry, that's not an option. Please pick from the following: \nmy-tweets' \nspotify-this-song '<song name here>'  ");
    }

} 

else {
    console.log("Welcome to Liri, your very limited personal assistant! \nPlease ask me a question: \nTo see your recent tweets, enter 'node liri.js my-tweets' \nTo find a song on Spotify, enter node liri.js spotify-this-song '<song name here>'");
}








    
