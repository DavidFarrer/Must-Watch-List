var movieLinks = document.querySelectorAll(".panelLink");
var modalTitle = document.querySelector("#modalLabel");
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
var modalImage = document.querySelector(".modal-image");
var addedButton = document.querySelector("#already-added");
var modalErrorField = document.querySelector(".error");


// Populate modal for the top movies when clicked.
movieLinks.forEach(function(movieLink) {
	movieLink.addEventListener("click", function(e) {
		var imdbid = movieLink.dataset.imdbid;
		fetch("/movie?id=" + imdbid, {
			credentials: "include"
		}).then(function(res) {
			if (res.status === 500) {
				throw err;
			}
			return res.json();
		}).then(function(resp) {
			var modalDescription = document.querySelector(".description");
			if (resp.message) { //if there's an error
				modalErrorField.classList.remove("hidden");
				modalErrorField.textContent = "Video games are not \"must watch\". Please select TV Shows or Movies.";
				movieInfoSection.classList.add("hidden");
				addButton.classList.add("hidden");
			} else { //no error
				currentSelected = resp;
				modalErrorField.classList.add("hidden");
				movieInfoSection.classList.remove("hidden");
				modalTitle.textContent = currentSelected.title;
				if (currentSelected.poster != "N/A") {
					modalImage.src = currentSelected.poster;
				} else {
					modalImage.src = "";
				}
				modalImage.alt = "Image not available";
				yearField.textContent = currentSelected.year;
				addsField.textContent = currentSelected.timesAdded;
				imdbRatingField.textContent = currentSelected.rating + " / 10";
				starringField.textContent = currentSelected.actors;
				directorField.textContent = currentSelected.director;
				plotField.textContent = currentSelected.plot;
				imdbLinkField.setAttribute("href", currentSelected.imdburl);
				if (currentSelected.onList) { // if the movie is on the user's list remove add button and put See on my list button
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
	});
});