var searchButton = document.querySelector("#searchButton");
var searchField = document.querySelector("input");
var results = document.querySelector("#results");
var searchResults = [];
var totalResults;
var currentPage;
var maxPageVisited;
var maxPage;
var nextButton = document.querySelector("#next");
var previousButton = document.querySelector("#previous");
var currentMovie;
var matches = document.body.matchesSelector || document.body.webkitMatchesSelector || document.body.mozMatchesSelector || document.body.msMatchesSelector || document.body.webkitMatchesSelector || document.body.matchesSelector;
var yearField = document.querySelector(".year");
var imdbRatingField = document.querySelector(".rating");
var starringField = document.querySelector(".starring");
var errorField = document.querySelector(".error");
var movieInfoSection = document.querySelector("#movieInfo");
var directorField = document.querySelector(".director");
var plotField = document.querySelector(".plot");
var imdbLinkField = document.querySelector(".imdbLink");
var currentSelected;

searchButton.addEventListener("click", function(e) {
	e.preventDefault();
	searchResults = [];
	results.innerHTML = "";
	currentPage = 1;
	maxPageVisited = 1;
	maxPage = 1;
	totalResults = 0;
	previousButton.classList.add("hidden");
	nextButton.classList.add("hidden");

	fetch("/searching?search=" + searchField.value).then(function(res) {
		return res.json();
	}).then(function(resp) {
		console.log(resp);
		if (!resp.hasOwnProperty("results")) {
			results.textContent = "The search \"" + searchField.value + "\" returned no results!";
		} else {
			totalResults = resp.totalresults;
			maxPage = Math.floor((totalResults - 1) / 10 + 1);
			pushMovies(resp.results);
			displayResults(resp.results);
			displayProperButtons();
		}
	});
});

nextButton.addEventListener("click", function(e) {
	results.innerHTML = "";
	currentPage++;
	hideButtons();
	if (currentPage > maxPageVisited) {
		console.log("New PAGE!");
		maxPageVisited = currentPage;
		fetch("/nextpage").then(function(res) {
			return res.json();
		}).then(function(resp) {
			pushMovies(resp.results);	
			displayResults(resp.results);
			displayProperButtons();
		});
	} else {
		console.log("BEEN HERE!");
		var firstIndex = (currentPage - 1) * 10;
		displayResults(searchResults.slice(firstIndex, firstIndex + 10));
		displayProperButtons();
	}
	
});

previousButton.addEventListener("click", function(e) {
	console.log("BEEN HERE!");
	results.innerHTML = "";
	currentPage--;
	hideButtons();
	var firstIndex = (currentPage - 1) * 10;
	displayResults(searchResults.slice(firstIndex, firstIndex + 10));
	displayProperButtons();
});

function displayResults(resultsObj) {
	console.log(resultsObj);
	resultsObj.forEach(function(movie, index) {
		var boxDiv = document.createElement("div");
		var innerDiv = document.createElement("div");
		var imgNode = document.createElement("img");
		var moreInfo = document.createElement("a");
		moreInfo.dataset.index = index;
		moreInfo.classList.add("btn", "btn-info", "thumb-button");
		moreInfo.href = "#";
		moreInfo.dataset.toggle = "modal";
		moreInfo.dataset.target = "#largeModal";
		moreInfo.textContent = "More Info";
		imgNode.classList.add("img-responsive");
		if (movie.poster != "N/A") {
			imgNode.src = movie.poster;
		}
		imgNode.alt = "Image not Available";
		boxDiv.classList.add("col-md-2", "col-xs-5", "box");
		if (index % 5 === 0) {
			boxDiv.classList.add("col-md-offset-1");
		}
		if (index % 2 === 0) {
			boxDiv.classList.add("col-xs-offset-1");
			if (index !== 0) {
				boxDiv.classList.add("col-md-offset-0");
			}
		}
		innerDiv.classList.add("thumbnail");
		var newContent = document.createElement("p");
		newContent.textContent = movie.title + ", " + movie.year;
		newContent.classList.add("caption");
		innerDiv.appendChild(imgNode);
		innerDiv.appendChild(newContent);
		innerDiv.appendChild(moreInfo);
		boxDiv.appendChild(innerDiv);
		
		results.appendChild(boxDiv);
	});
}

function displayProperButtons() {
	if (currentPage === 1) {
		previousButton.classList.add("hidden");
		nextButton.classList.remove("hidden");
	} else if (currentPage > 1 && currentPage < maxPage) {
		previousButton.classList.remove("hidden");
		nextButton.classList.remove("hidden");
	} else if (currentPage === maxPage) {
		nextButton.classList.add("hidden");
		previousButton.classList.remove("hidden");
	}
}

function showPages() {
	console.log("Current: " + currentPage);
	console.log("Max: " + maxPage);
}

function pushMovies(resultsObj) {
	resultsObj.forEach(function(movie) {
		searchResults.push(movie);
	});
}

function hideButtons() {
	previousButton.classList.add("hidden");
	nextButton.classList.add("hidden");
}

results.addEventListener("click", function(e) {
	if (e.target.classList.contains("thumb-button")) {
		var indexOfMovie = ((currentPage - 1) * 10) + +e.target.dataset.index;
		var selectedMedia = searchResults[indexOfMovie];
		var modalImage = document.querySelector(".modal-image");
		if (selectedMedia.poster != "N/A") {
			modalImage.src = selectedMedia.poster;
		} else {
			modalImage.src = "";
		}
		modalImage.alt = "Image not available";
		document.querySelector("#modalLabel").textContent = selectedMedia.title;
		fetch("/movie?id=" + searchResults[indexOfMovie].imdbid).then(function(res) {
			console.log(res);
			return res.json();
		}).then(function(resp) {
			var modalDescription = document.querySelector(".description");
			var addButton = document.querySelector("#add-button");
			if (resp.message) {
				errorField.classList.remove("hidden");
				movieInfoSection.classList.add("hidden");
				addButton.classList.add("hidden");
			} else {
				currentSelected = resp;
				errorField.classList.add("hidden");
				movieInfoSection.classList.remove("hidden");
				yearField.textContent = resp.year;
				imdbRatingField.textContent = resp.rating + " / 10";
				starringField.textContent = resp.actors;
				directorField.textContent = resp.director;
				plotField.textContent = resp.plot;
				imdbLinkField.setAttribute("href", resp.imdburl);				
				console.log(resp);
				addButton.classList.remove("hidden");			
			}
		});
	}
});

document.querySelector("#add-button").addEventListener("click", function() {
	fetch("/mylist", {
		method: "POST",
		credentials: "include",
		body: JSON.stringify(currentSelected),
		headers: {
			"Content-Type": "application/json"
		}
	})
	.then(function(response) {
		if (response.status >= 200 && response.status < 300) {
			if (response.status === 201) {
				return response;
			} else {
				return response.json();
			}
		} else {
			var error = new Error(response.statusText);
			error.response = response;
			throw error;
		}
	})
	.then(function(res) {
		if (typeof res.redirect === "string") {
			window.location = res.redirect;
		}
		console.log(res);
	});
});