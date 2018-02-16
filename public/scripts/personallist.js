var refineButtons = document.querySelectorAll(".refineButton");
var watchedButton = document.querySelectorAll(".watched-button");
var watchedIcons = document.querySelectorAll(".watched-icon");
var movieDivs = document.querySelectorAll(".panel");

console.log(refineButtons);

refineButtons.forEach(function(button) {
	button.addEventListener("click", function(e) {
		refineButtons.forEach(function (button) {
			button.classList.remove("selected");
		});
		button.classList.add("selected");
		console.log(button.getAttribute("data-name"));
	});
});

// watchedButton.forEach(function(button) {
// 	button.addEventListener("click", function(e) {
// 		e.stopPropagation();
// 		var icon = button.children[0];
// 		if (icon.classList.contains("fa-eye")) {
// 			icon.classList.remove("fa-eye");
// 			icon.classList.add("fa-eye-slash");
// 		} else {
// 			icon.classList.add("fa-eye");
// 			icon.classList.remove("fa-eye-slash");
// 		}
// 	});
// });

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
						watchedIcon.classList.remove("fa-eye-slash");
						watchedIcon.classList.add("fa-eye");
					} else {
						watchedIcon.classList.remove("fa-eye");
						watchedIcon.classList.add("fa-eye-slash");
					}
					console.log(clickedMovieDiv.dataset.imdbid);
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
					console.log(deletedMovieDiv === clickedMovieDiv);
					deletedMovieDiv.parentNode.removeChild(deletedMovieDiv);
				}

			});
		}
	});
});