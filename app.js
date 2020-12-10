// GLOBAL VARIABLES
var linksCount  = 0;    // counter for filled links (The Spaceships)
var MAXLINKS    = 10;   // maximum links to fill in the menu
var linkObjects = [];   // Array of link elements (which are children of ul #starships)

// ELEMENTS
var starshipName = document.getElementById("name");
var model = document.getElementById("model");
var manufacturer = document.getElementById("manufacturer");
var crew = document.getElementById("crew");
var passengers = document.getElementById("passengers");
var films = document.getElementById("films")


// Initialize when page loaded
window.onload = init;

// This function gets MAXLINKS links from swapi.dev/starships
function init() {
    fetchUntil(1);
}

// This function gets an index and adds it to links (chilren of #starships list)
// It's a recursive function which goes on until linksCount reaches to MAXLINKS
// It's basically a while loop, but because the while in js is sync, I used this
function fetchUntil(index) {
    // construct request url
    url = "https://swapi.dev/api/starships/" + index + "/";
    fetch(url).then(
        function(response) {
            // Check the end recursion condition
            if(linksCount < MAXLINKS) {
                // Throw an error if response is not ok, aka the page does not exist
                if(!response.ok) {
                    throw Error(response.status);
                }
                // If response is ok, call addLink which adds an item to #starships list
                addLink(response.json(), url);
                // Addup successfull links
                linksCount += 1;
                // Continue to get more links
                fetchUntil(index + 1);
            }
        }
    ).catch(err => { 
        console.log(err);
        // Continue to get more links
        fetchUntil(index + 1);
    });
}

// This function builds a li to add as child of #starships
// It gets a response promise and puts the name of that json into a list item
// It also adds an event listener to that list item, which sends an API request to the given link
// The given link is the second argument(url) 
function addLink(response, url) {
    var father = document.getElementById("starships");
    var node = document.createElement("li");
    var starship = document.createElement("p");
    
    // Adds name of the retrieved response to item's content
    response.then(
        (data) => starship.innerHTML = JSON.stringify(data["name"]).replace(/['"]+/g, '')
    )

    // Adds this paragraph to linksObject for probable uses
    linkObjects.push(starship)

    // Adds children to put into index.html
    node.appendChild(starship);
    father.appendChild(node);

    // Adds Eventlistener for this paragraph, for clickable functionality (showing the info)
    linkObjects[linkObjects.length - 1].addEventListener('click', function() {
        updateInfo(url);
    })
}

// This function updates the right column according to clicked starship
function updateInfo(url) {
    // Cleans films inner HTML to prevent probable errors
    films.innerHTML = '';

    // Fetches the url (which is checked before, and therefore valid)
    // reads the content of json response and puts it in proper HTML element
    fetch(url).then(resp => resp.json()).then(
        (data) => {
            // replace removes all the " and '
            starshipName.innerHTML = JSON.stringify(data["name"]).replace(/['"]+/g, '')
            
            model.innerHTML = JSON.stringify(data["model"]).replace(/['"]+/g, '')
            manufacturer.innerHTML = JSON.stringify(data["manufacturer"]).replace(/['"]+/g, '')
            crew.innerHTML = JSON.stringify(data["crew"]).replace(/['"]+/g, '')
            passengers.innerHTML = JSON.stringify(data["passengers"]).replace(/['"]+/g, '')
            
            // For the films, first count number of films and loop over each film
            numFilms = JSON.stringify(data["films"].length)
            for(let i = 0; i < numFilms; i++) {
                // First build a paragraph
                let film = document.createElement("p");
                // Get a promise containing the title of that film
                p = swapiGetField(JSON.stringify(data["films"][i]).replace(/['"]+/g, ''), "title");
                // Put the title of the film into the paragraph built before
                // replace removes all the " ' and \
                p.then((data) => film.innerHTML = JSON.stringify(data).replace(/['"\\]+/g, ''));
                // Add this paragraph to films (#films)
                films.appendChild(film);
            }
        }
    )
}

// This functions gets a specific field from a url (API call)
function swapiGetField(url, field) {
    let r = fetch(url).then((resp) => resp.json())
    .then((data) => JSON.stringify(data[field]));
    return r;
}


