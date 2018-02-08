var express = require("express");
var router = express.Router();
var imdb = require("imdb-api");
var config = require("../config");
var currentSearch;


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
		console.log(movie);
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
		res.send(movie);
	}).catch(err => {
		res.send(err);
	});

});

router.get("/mylist", ensureAuthenticated, function(req, res) {
	res.render("personallist");
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash("error_msg", "You must log in first");
		res.redirect("/users/login");
	}
}

module.exports = router;