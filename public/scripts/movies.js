(function IIFE() {
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
	var modalErrorField = document.querySelector(".error");
	var movieInfoSection = document.querySelector("#movieInfo");
	var directorField = document.querySelector(".director");
	var addsField = document.querySelector(".adds");
	var plotField = document.querySelector(".plot");
	var imdbLinkField = document.querySelector(".imdbLink");
	var addButton = document.querySelector("#add-button");
	var addedButton = document.querySelector("#already-added");
	var loadingAnimation = document.querySelector(".sk-folding-cube");
	var errorField = document.querySelector("#errorField");
	var currentSelected;


	// Simulate search button being pressed when Enter is pressed while in search input.
	searchField.addEventListener("keyup", function(e) {
		if (e.keyCode === 13) {
			searchMovies(e);
		}
	});
	searchButton.addEventListener("click", searchMovies);

	function searchMovies(e) {
		if (searchField.value !== "") {
			e.preventDefault();
			errorField.classList.add("hidden");
			loadingAnimation.classList.remove("hidden");
			searchResults = [];
			results.innerHTML = ""; // clear results area
			currentPage = 1;
			maxPageVisited = 1;
			maxPage = 1;
			totalResults = 0;
			previousButton.classList.add("hidden");
			nextButton.classList.add("hidden");

			fetch("/searching?search=" + searchField.value)
			.then(function(res) {
				if (res.status === 500) {
					throw err;
				} else {
					return res.json();
				}
			}).then(function(resp) {
				if (!resp.hasOwnProperty("results")) {
					if (resp.message.indexOf("Error") !== -1) {
						errorField.textContent = "Server timed out. Please try again.";
					} else {
						errorField.textContent = "The search \"" + searchField.value + "\" returned no results!";
					}
					loadingAnimation.classList.add("hidden");
					errorField.classList.remove("hidden");
				} else {
					totalResults = resp.totalresults;
					maxPage = Math.floor((totalResults - 1) / 10 + 1);
					pushMovies(resp.results);
					loadingAnimation.classList.add("hidden");
					displayResults(resp.results);
					displayProperButtons();
				}
			}).catch(function(err) {
				loadingAnimation.classList.add("hidden");
				errorField.textContent = "Server timed out. Please try again.";
				errorField.classList.remove("hidden");
			});
		}
	}

	nextButton.addEventListener("click", function(e) {
		results.innerHTML = "";
		loadingAnimation.classList.remove("hidden");
		currentPage++;
		hideButtons();
		if (currentPage > maxPageVisited) { //if the page hasn't been visited before:
			maxPageVisited = currentPage;
			fetch("/nextpage").then(function(res) {
				if (res.status === "500") {
					throw err;
				}
				return res.json();
			}).then(function(resp) {
				pushMovies(resp.results);
				loadingAnimation.classList.add("hidden");	
				displayResults(resp.results);
				displayProperButtons();
			}).catch(function(err) {
				loadingAnimation.classList.add("hidden");
				errorField.classList.remove("hidden");
				errorField.textContent = "An error occurred. Please reload and try again.";
			});
		} else { // if the page has been visited, just reload results
			var firstIndex = (currentPage - 1) * 10;
			loadingAnimation.classList.add("hidden");
			displayResults(searchResults.slice(firstIndex, firstIndex + 10));
			displayProperButtons();
		}
		
	});

	previousButton.addEventListener("click", function(e) {
		results.innerHTML = "";
		currentPage--;
		hideButtons();
		var firstIndex = (currentPage - 1) * 10;
		displayResults(searchResults.slice(firstIndex, firstIndex + 10));
		displayProperButtons();
	});

	function displayResults(resultsObj) {
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
		if (currentPage === 1 && currentPage < maxPage) {
			previousButton.classList.add("hidden");
			nextButton.classList.remove("hidden");
		} else if (currentPage === 1 && currentPage === maxPage) {
			previousButton.classList.add("hidden");
			nextButton.classList.add("hidden");
		} else if (currentPage > 1 && currentPage < maxPage) {
			previousButton.classList.remove("hidden");
			nextButton.classList.remove("hidden");
		} else if (currentPage === maxPage) {
			nextButton.classList.add("hidden");
			previousButton.classList.remove("hidden");
		}
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
			fetch("/movie?id=" + searchResults[indexOfMovie].imdbid, {
				credentials: "include"
			}).then(function(res) {
				if (res.status === 500) {
					throw err;
				}
				return res.json();
			}).then(function(resp) {
				var modalDescription = document.querySelector(".description");
				if (resp.message) { // if it has a message, api returned with an error
					modalErrorField.classList.remove("hidden");
					modalErrorField.textContent = "Video games are not \"must watch\". Please select TV Shows or Movies.";
					movieInfoSection.classList.add("hidden");
					addButton.classList.add("hidden");
				} else {
					currentSelected = resp;
					modalErrorField.classList.add("hidden");
					movieInfoSection.classList.remove("hidden");
					yearField.textContent = currentSelected.year;
					addsField.textContent = currentSelected.timesAdded;
					imdbRatingField.textContent = currentSelected.rating + " / 10";
					starringField.textContent = currentSelected.actors;
					directorField.textContent = currentSelected.director;
					plotField.textContent = currentSelected.plot;
					imdbLinkField.setAttribute("href", currentSelected.imdburl);
					if (currentSelected.onList) {
						addButton.classList.add("hidden");
						addedButton.classList.remove("hidden");
					} else {
						addButton.classList.remove("hidden");			
						addedButton.classList.add("hidden");
					}				
				}
			}).catch(function(err) {

				modalErrorField.classList.remove("hidden");
				modalErrorField.textContent = "An error occurred. Please refresh your page and try again.";
				movieInfoSection.classList.add("hidden");
				addButton.classList.add("hidden");
			});
		}
	});

	addButton.addEventListener("click", function() {	
		addButton.disabled = true;
		fetch("/movies", {
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
			if (typeof res.redirect === "string") { // server is redirecting you to login page.
				window.location = res.redirect;
			} else {
				addButton.classList.add("hidden");
			addedButton.classList.remove("hidden");
				addButton.disabled = false;
			}

		});
	});
})();