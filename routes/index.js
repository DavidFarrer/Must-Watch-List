var express = require("express");
var router = express.Router();
var imdb = require("imdb-api");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var currentSearch;

var User = require("../models/user");
var Movie = require("../models/movie");


router.get("/", function(req, res) {
	res.render("landing");
});

router.get("/movies", function(req, res) {
	console.log(res.locals.user);
	res.render("movies");
});

router.get("/searching", function(req, res) {
	imdb.search({
		title: req.query.search
	}, {
		apiKey: process.env.IMDB_API_KEY,
		timeout: 30000
	}).then(movie => {
		currentSearch = movie;
		res.send(movie);
	}).catch(err => {
		console.log(err);
		res.send(err);
	});
});

router.get("/nextpage", function(req, res) {
	currentSearch.next().then(movie => {
		currentSearch = movie;
		res.send(movie);
	}).catch(err => {
		console.log(err);
		res.status(500).send("Something broke!");
	});
});

router.get("/movie", function(req, res) {
	console.log("id: " + req.query.id);
	imdb.getById(req.query.id, {apiKey: process.env.IMDB_API_KEY, timeout: 30000}).then(movie => {
		console.log(req.user);
		if (req.user && User.hasMovie(req.user, movie) && !User.isDeleted(req.user, movie.imdbid)) {
			movie.onList = true;
		} else {
			movie.onList = false;
		}
		Movie.getTimesAdded(movie.imdbid, function(timesAdded) {
			movie.timesAdded = timesAdded;
			res.send(movie);
		});
	}).catch(err => {
		console.log(err);
		res.status(500).send(err);
	});

});

router.get("/mylist", ensureAuthenticatedGetRoute, function(req, res) {
	User.populateUserMovies(req.user, function(err, populatedUser) {
		if (err) {
			throw err;
		} else {
			sortMovies(populatedUser.watchList);
			res.render("personallist", {movies: populatedUser.watchList});
		}
	});
});

router.post("/mylist", ensureAuthenticatedPostRoute, function(req, res) {
	// Toggle watched
	if (req.body.request === "toggleWatched") {
		var imdbid = req.body.imdbid;
		User.toggleWatched(req.user.username, imdbid, function(err, user) {
			if (err) {
				throw err;
			}
			res.sendStatus(201);	
		});
	} else if (req.body.request === "deleteMovie") {
		var imdbid = req.body.imdbid;
		User.removeMovie(req.user.username, imdbid, function(err, user) {
			if (err) {
				throw err;
			}
			res.sendStatus(201);
		});
	}

});

router.post("/movies", ensureAuthenticatedPostRoute, function(req, res) {
	var imdbid = req.body.imdbid;
	var movieObj = {imdbid: imdbid};

	Movie.count(movieObj, function(err, count) {
		if (count > 0) {
			if (User.hasMovie(req.user, movieObj)) {
				User.addMovie(req.user.username, movieObj, function(err, user) {
					if (err) {
						throw err;
					}
					res.sendStatus(201);
				});
			} else {
				Movie.incrementTimesWatched(req.body.imdbid, function(err, movie) {
					User.addMovie(req.user.username, movie, function(err, user) {
						if (err) {
							throw err;
						} else {
							res.sendStatus(201);
						}
					});
				});
			}
		} else {
			var title = req.body.title;
			var imdbid = req.body.imdbid;
			var poster = req.body.poster;
			var year = req.body.year;
			var rating = req.body.rating;
			var actors = req.body.actors;
			var director = req.body.director;
			var plot = req.body.plot;
			var imdburl = req.body.imdburl;

			var newMovie = new Movie({
				title: title,
				imdbid: imdbid,
				poster: poster,
				year: year,
				rating: rating,
				actors: actors,
				director: director,
				plot: plot,
				imdburl: imdburl
			});

			Movie.createMovie(newMovie, function(err, movie) {
				if (err) {
					throw err;
				}
				User.addMovie(req.user.username, movie, function(err, user) {
					if (err) {
						throw err;
					} else {
						res.sendStatus(201);
					}
				});
			});
		}
	});
	
});

router.get("/movies/top", function(req, res) {
	Movie.getTopMovies(20, function(err, movies) {
		res.render("topmovies", {movies: movies});
	});
});


// Post Route Middleware
function ensureAuthenticatedPostRoute(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error_msg", "You must log in first");
	res.send({redirect: "/users/login"});
}

// Get Route Middleware
function ensureAuthenticatedGetRoute(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error_msg", "You must log in first");
	res.redirect("/users/login");

}

module.exports = router;

function sortMovies(movies) {

	movies.sort(compare);

	function compare(a, b) {
		if (a.movie.title < b.movie.title) {
			return -1;
		}
		if (a.movie.title > b.movie.title) {
			return 1;
		}
		return 0;
	}
}