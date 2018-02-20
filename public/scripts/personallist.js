var refineButtons = document.querySelectorAll(".refineButton");
var watchedButton = document.querySelectorAll(".watched-button");
var watchedIcons = document.querySelectorAll(".watched-icon");
var movieDivs = document.querySelectorAll(".panel");
var refineLabel = document.querySelector("#refineLabel");
var personalResults = document.querySelector("#personalResults");
var currentRefineSelection = "notWatched";


window.addEventListener("load", displayRefinedMovies);

refineButtons.forEach(function(button) {
	button.addEventListener("click", function(e) {
		refineButtons.forEach(function (button) {
			button.classList.remove("selected");
		});
		button.classList.add("selected");
		currentRefineSelection = button.getAttribute("data-name");
		displayRefinedMovies();
	});
});

movieDivs.forEach(function(movieDiv) {
	movieDiv.addEventListener("click", function(e) {
		var clickedMovieDiv = e.currentTarget;
		if (e.target.classList.contains("watched-icon") && !e.target.classList.contains("disabled")) {
			e.target.classList.add("disabled");
			fetch("/mylist", {
				method: "POST",
				credentials: "include",
				body: JSON.stringify(
					{
						imdbid: clickedMovieDiv.dataset.imdbid,
						request: "toggleWatched"
					}
				),
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
				} else {
					var watchedIcon = e.target;
					if (watchedIcon.classList.contains("fa-eye-slash")) {
						clickedMovieDiv.classList.remove("panel-false");
						clickedMovieDiv.classList.add("panel-true");
						watchedIcon.classList.remove("fa-eye-slash");
						watchedIcon.classList.add("fa-eye");
					} else {
						clickedMovieDiv.classList.remove("panel-true");
						clickedMovieDiv.classList.add("panel-false");
						watchedIcon.classList.remove("fa-eye");
						watchedIcon.classList.add("fa-eye-slash");
					}
					displayRefinedMovies();
					e.target.classList.remove("disabled");
				}

			});
		} else if (e.target.classList.contains("delete-icon") && !e.target.classList.contains("disabled")) {
			e.target.classList.add("disabled");
			fetch("/mylist", {
				method: "POST",
				credentials: "include",
				body: JSON.stringify(
					{
						imdbid: clickedMovieDiv.dataset.imdbid,
						request: "deleteMovie"
					}
				),
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
				} else {
					var deletedMovieDiv = document.querySelectorAll("[data-imdbid='" + clickedMovieDiv.dataset.imdbid + "']")[0];
					deletedMovieDiv.parentNode.removeChild(deletedMovieDiv);
				}

			});
		}
	});
});

function displayRefinedMovies() {
	movieDivs.forEach(function(movieDiv) {
		if (currentRefineSelection === "showAll") {
			refineLabel.textContent = "All Movies:";
			movieDiv.classList.remove("hidden");
		} else if (currentRefineSelection === "notWatched") {
			refineLabel.textContent = "Unwatched Movies:";
			if (movieDiv.classList.contains("panel-false")) {
				movieDiv.classList.remove("hidden");
			} else {
				movieDiv.classList.add("hidden");
			}
		} else {
			refineLabel.textContent = "Watched Movies:";
			if (movieDiv.classList.contains("panel-true")) {
				movieDiv.classList.remove("hidden");
			} else {
				movieDiv.classList.add("hidden");
			}
		}
	});
	if (personalResults.querySelectorAll(".hidden").length === movieDivs.length) {
		if (currentRefineSelection === "showAll") {
			refineLabel.textContent = "Your list is empty.";
		} else if (currentRefineSelection === "notWatched") {
			refineLabel.textContent = "You have no unwatched movies.";
		} else {
			refineLabel.textContent = "You have no watched movies.";
		}
	}
}