var express = require("express");
var router = express.Router();
var imdb = require("imdb-api");
var config = require("../config");
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
		apiKey: config.imdbKey,
		timeout: 30000
	}).then(movie => {
		currentSearch = movie;
		res.send(movie);
	}).catch(err => {
		console.log(err);
	});
});

router.get("/nextpage", function(req, res) {
	currentSearch.next().then(movie => {
		currentSearch = movie;
		res.send(movie);
	});
});

router.get("/movie", function(req, res) {
	imdb.getById(req.query.id, {apiKey: config.imdbKey, timeout: 30000}).then(movie => {
		console.log(req.user);
		if (req.user && User.hasMovie(req.user, movie)) {
			movie.onList = true;
		} else {
			movie.onList = false;
		}
		res.send(movie);
	}).catch(err => {
		console.log(err);
		res.send(err);
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
	}

});

router.post("/movies", ensureAuthenticatedPostRoute, function(req, res) {
	var imdbid = req.body.imdbid;

	Movie.count({imdbid: imdbid}, function(err, count) {
		if (count > 0) {
			Movie.incrementTimesWatched(req.body.imdbid, function(err, movie) {
				User.addMovie(req.user.username, movie, function(err, user) {
					if (err) {
						throw err;
					} else {
						console.log(user);
					}
				});
			});
		} else {
			var title = req.body.title;
			var imdbid = req.body.imdbid;
			var year = req.body.year;
			var rating = req.body.rating;
			var actors = req.body.actors;
			var director = req.body.director;
			var plot = req.body.plot;
			var imdburl = req.body.imdburl;

			var newMovie = new Movie({
				title: title,
				imdbid: imdbid,
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
						console.log(user);
						res.sendStatus(201);
					}
				});
			});
		}
	});		
	// res.locals.user.watchList.push(req.body);
	// res.locals.user.save();
	
});

router.get("/mylist/movies", ensureAuthenticatedGetRoute, function(req, res) {

});

function ensureAuthenticatedPostRoute(req, res, next) {
	if (req.isAuthenticated()) {
		console.log(req.user);
		return next();
	}
	console.log("didnt make it");
	req.flash("error_msg", "You must log in first");
	res.send({redirect: "/users/login"});
	
}

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