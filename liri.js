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


// ===========================FUNCTIONS===========================
    //OMDB print function called within main OMDB function
    function omdbPrint(movieInfo) {
        console.log("Title: " + movieInfo.Title);
        console.log("Year: "+ movieInfo.Year); // Year the movie came out.
        console.log("IMDB Rating: "+ movieInfo.imdbRating); // * IMDB Rating
        console.log(movieInfo.Ratings[1].Source + " Rating: " + movieInfo.Ratings[1].Value); // * Rotten Tomatoes Rating
        console.log("Produced in: " + movieInfo.Country);// * Country where the movie was produced.
        console.log("Language(s): " + movieInfo.Language);// * Language
        console.log("Plot: " + movieInfo.Plot);// * Plot
        console.log("Actors: " + movieInfo.Actors);// * Actors    
    };

    //TWITTER Function
    function tweetCall() {
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
    };

    //SPOTIFY Function
    function spotifyCall(spotInputSpecific) {
         // spotInputSpecific in this case will be the string with the song title
        // limit of results set by default to 1 rather than the package's 20 default for simplicity since some searches will return multiple hits
        // hard-coded double quotes around the user string input for a stricter search beacuse otherwise each word is treated as an independent search term

        if (spotInputSpecific) { // if input is truthy/not empty
            spotify.search({
                type: 'track',
                query: '"' + spotInputSpecific + '"',
                limit: 1
                 }, 
                function(err, data) {
                if (err) {
                  return console.log('Error occurred: ' + err);
                }
                // if no error, return data
                console.log("Name of Track: " + data.tracks.items[0].name);
                console.log("Artist: " + data.tracks.items[0].album.artists[0].name); //artist name
                console.log("Album: " + data.tracks.items[0].album.name); //album name
                    if (data.tracks.items[0].preview_url) {
                        console.log("Link to Track Preview: " + data.tracks.items[0].preview_url); // link to preview of track if available
                    } else {
                        console.log("Link to Track with Login (Preview unavailable): " + data.tracks.items[0].external_urls.spotify); // link to track if no preview available since some tracks return null                  
                    };
                });
    
        } else {
            // if no song input, return default "The Sign" by Ace of Base
            // uses the specific track request rather than search function
            spotify.request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE')
            .then(function(data) {
                console.log("Name of Track: " + data.name);
                console.log("Artist: " + data.artists[0].name); //artist name
                console.log("Album: " + data.album.name); //album name
                console.log("Link to Track Preview: " + data.preview_url);// link to track preview, which is available for this default

            })
            .catch(function(err) {
              console.error('Error occurred: ' + err); 
            });
        }       
    };

    //OMDB Function
    function movieCall(movieInputSpecific) {
       // initialize variable
       var prettyOmdb = "";
       //format of request
       // http://www.omdbapi.com/?apikey=trilogy&s=Mr.+Nobody&type=movie&r=json
       var queryURL = "http://www.omdbapi.com/?apikey=trilogy&t=" + movieInputSpecific + "&type=movie&r=json";

       if (movieInputSpecific) {
           // Request to the OMDB API with the movie specified
           request(queryURL, function(error, response, body) {

               // If the request is successful (i.e. if the response status code is 200)
               if (!error && response.statusCode === 200) {
       
                   // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
                   prettyOmdb = JSON.parse(body); //sets the variable to the pretty-print JSON object so before passing it
                   omdbPrint(prettyOmdb); // calls the printing function using the pretty-print JSON object
               }
           });

       }
       else {
           movieInputSpecific = "Mr. Nobody"; // if no input from user, set it to the default Mr. Nobody
           queryURL = "http://www.omdbapi.com/?apikey=trilogy&t=" + movieInputSpecific + "&type=movie&r=json";
           // Request to the OMDB API with the movie specified
           request(queryURL, function(error, response, body) {

               // If the request is successful (i.e. if the response status code is 200)
               if (!error && response.statusCode === 200) {

                   prettyOmdb = JSON.parse(body); //sets the variable to the pretty-print JSON object so before passing it
                   omdbPrint(prettyOmdb); // calls the printing function using the pretty-print JSON object
               }
           });
       } 
    };

    //READ-THIS Function
    function readThisCall() {
        fs.readFile("random.txt", "utf8", function(error, data) {

            // If the code experiences any errors it will log the error to the console.
            if (error) {
              return console.log("Error occurred: " + error);
            }
            
            var dataArr = data.split(","); //split it by commas

            // set new arguments
            readUserCommand = dataArr[0];
            readUserInputSpecific = dataArr[1];

            // check for infinite loop if UserCommand read from file is 'do-what-it-says' and if so throws error message and exits
            if (readUserCommand === 'do-what-it-says') {
                return console.log("Oops, the command in that file will cause an error by running itself on an infinite loop. Please correct random.txt before entering 'do-what-it-says' again, or try a new command.");
            }

            // call function that re-runs the command processing part of the script with new values
            else {
                pickCommand(readUserCommand, readUserInputSpecific);
            }
          
        });
    };

    //COMMAND PICK FUNCTION
    function pickCommand(command, inputSpecific) {
        // =======================TWITTER========================== //
        if (command === 'my-tweets') {
            tweetCall();
        }
        // =======================END TWITTER========================== //

        // =======================SPOTIFY========================== //
        else if (command === 'spotify-this-song') {
            spotifyCall(inputSpecific);
        }
        // =======================END SPOTIFY========================== //

        // =======================OMDB========================== //
        else if (command === 'movie-this') {
            movieCall(inputSpecific);
        }
        // =======================END OMDB========================== //

        // =======================READ COMMAND FROM RANDOM.TXT========================== //
        else if (command === 'do-what-it-says') {
            readThisCall();
        }
        // =======================END READ COMMAND FROM RANDOM.TXT======================= //
        
        else {
            console.log("Sorry, that's not an option. Please pick from the following: \nmy-tweets' \nspotify-this-song '<song name here>' \nmovie-this '<movie name here>' \ndo-what-it-says ");
        }
    };

// ===========================END FUNCTIONS====================================================

// ===========================CODE BODY========================================================

// starts the program with a check for a command, otherwise greeting and prompt to enter a command if there is no third argument entered
if (userCommand) {

    //determine there is a command, then run pickCommand function to see if it's one we have an answer for
    pickCommand(userCommand, userInputSpecific); //these values being called are pulled from the global variables
}
else {
    console.log("Welcome to Liri, your very limited personal assistant! \nPlease ask me a question! \nTo see your recent tweets, enter: node liri.js my-tweets \nTo find a song on Spotify, enter: node liri.js spotify-this-song '<song name here>' \nTo look up a movie, enter: movie-this '<movie name here>' \nTo run a command from the random.txt file, enter: do-what-it-says ");
}

// ===========================END CODE BODY=======================================================








    
