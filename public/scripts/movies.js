var searchButton = document.querySelector("button");
var searchField = document.querySelector("input");
var results = document.querySelector("#results");
var searchResults = [];
var totalResults;
var currentPage;
var maxPageVisited;
var maxPage;
var nextButton = document.querySelector("#next");
var previousButton = document.querySelector("#previous");

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
		});
	} else {
		console.log("BEEN HERE!");
		var firstIndex = (currentPage - 1) * 10;
		displayResults(searchResults.slice(firstIndex, firstIndex + 10));
	}
	displayProperButtons();
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
		var newDiv = document.createElement("div");
		var imgNode = document.createElement("img");
		var moreInfo = document.createElement("a");
		moreInfo.classList.add("btn", "btn-info", "thumb-button");
		moreInfo.href = "#";
		moreInfo.dataset.toggle = "modal";
		moreInfo.dataset.target = "#largeModal";
		moreInfo.textContent = "More Info";
		imgNode.classList.add("img-responsive");
		imgNode.src = movie.poster;
		imgNode.alt = "Image not Available";
		newDiv.classList.add("thumbnail", "col-md-2");
		if (index % 5 === 0) {
			newDiv.classList.add("col-md-offset-1");
		}
		var newContent = document.createElement("p");
		newContent.textContent = movie.title + ", " + movie.year;
		newContent.classList.add("caption");
		newDiv.appendChild(imgNode);
		newDiv.appendChild(newContent);
		newDiv.appendChild(moreInfo);
		
		results.appendChild(newDiv);
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