// GLOBAL VARIABLES
var linkObjects = [];   // Array of link elements (which are children of ul #starships)
var buttons     = [];   // Array of buttons for pagination
var currentPage = 0;    // Indicates the active page(index in buttons), used for handling clicking it again
var currentShip = -1;   // Indicates latest chosen spaceship(index in linkObjects)
var pageSize    = 10;   // Size of content in a api page, this does not have control on real size of the page

// ELEMENTS
var starshipName = document.getElementById("name");

var model = document.getElementById("model");
var manufacturer = document.getElementById("manufacturer");
var crew = document.getElementById("crew");
var passengers = document.getElementById("passengers");
var films = document.getElementById("films");


// Initialize when page loaded
window.onload = init;

// This function initializes the page with counting the spaceships (for pages) and constructs first page
function init() {
    // Counts api response to build paginations
    getShipsCount();
    // Fetches page one of the starships
    fetchLinks(1);
}

// This function gets count of starships available in swapi.dev and builds paginations accordingly
function getShipsCount() {
    url = "https://swapi.dev/api/starships/?page=1";
    fetch(url).then(
        resp => resp.json()
    ).then(
        data => 
            // Builds pages according to count
            addPagination(Math.ceil(JSON.stringify(data["count"]) / pageSize))
    )
    .catch(err => { 
        console.log(err);
    });
}


// This function builds <number> pages in pagination and assigns event listeners to that button
function addPagination(number) {
    // Gets button container
    var father = document.getElementsByClassName("button-container")[0];

    // Adds <number> buttons and assigns event listeners
    for(let i = 0; i < number; i++) {
        // Build and fill button
        let button = document.createElement("div");
        button.className = "button";
        button.innerHTML = i + 1;

        // Put it in button-container
        father.appendChild(button);

        // Builds listener for this button
        buttons.push(button);
        buttons[buttons.length - 1].addEventListener('click', function() {
            // Handles reclick pages for better performance
            if (currentPage != buttons.indexOf(this)) {
                currentPage = buttons.indexOf(this);

                // Fetches and shows information of this page
                fetchLinks(buttons.indexOf(this) + 1);
            }
        })
    }
}

// This function gets an page and adds it to links (chilren of #starships list)
function fetchLinks(page) {
    // construct request url
    url = "https://swapi.dev/api/starships/?page=" + page;
    fetch(url).then(
        function(response) {
            // Throw an error if response is not ok, aka the page does not exist
            if(!response.ok) {
                throw Error(response.status);
            }
            // If response is ok, call addLink which adds items to #starships list
            addLink(response.json());
        }
    ).catch(err => { 
        console.log(err);
    });
}

// This function builds a bunch of li (in the given page) to add as child of #starships
// It gets a response promise and puts the name of each json result into a list item (our menu)
// It also adds an event listener to each list item, which sends an API request to the given link (for details)
function addLink(response) {
    // Gets #starships
    var father = document.getElementById("starships");
    // Cleans the old list items, to start with a fresh unordered list
    father.innerHTML = '';

    // Add all the items in this page
    for(let i = 0; i < pageSize; i++) {
        // Builds li and p to fill it
        /* The schema is 
            <ul id = "starships">
                <li>
                    <p>Death Star</p>
                </li>
            </ul>
        */
        let node = document.createElement("li");
        let starship = document.createElement("p");
        let url = "";

        // Adds name of the retrieved response to item's content
        response.then(
            (data) => {
                // Fill the inner HTML with the name of this result
                starship.innerHTML = JSON.stringify(data["results"][i]["name"]).replace(/['"]+/g, '')
                // Store the url to use it in event listener (call api for more details)
                url = JSON.stringify(data["results"][i]["url"]).replace(/['"]+/g, '');
            }
        ).catch(() => console.log("That object does not exist : probably end of results"))
    
        // Adds this paragraph to linksObject for probable uses
        linkObjects.push(starship)
    
        // Adds children to put into index.html
        node.appendChild(starship);
        father.appendChild(node);
    
        // Adds Eventlistener for this paragraph, for clickable functionality (showing the info)
        linkObjects[linkObjects.length - 1].addEventListener('click', function() {
            // Handles reclicking the same ship
            if(currentShip != linkObjects.indexOf(this)) {
                updateInfo(url);
                currentShip = linkObjects.indexOf(this);
            }
        })
    }
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


