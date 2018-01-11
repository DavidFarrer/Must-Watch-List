var express = require("express");
var router = express.Router();
var imdb = require("imdb-api");
var currentSearch;

router.get("/", function(req, res) {
	res.render("landing");
});

router.get("/movies", function(req, res) {
	
	res.render("movies");
});

router.get("/searching", function(req, res) {
	imdb.search({
		title: req.query.search
	}, {
		apiKey: '40229cdb',
		timeout: 30000
	}).then(movie => {
		console.log(movie);
		currentSearch = movie;
		res.send(movie);
	}).catch(err => {
		res.send(err);
	});
});

router.get("/nextpage", function(req, res) {
	currentSearch.next().then(movie => {
		currentSearch = movie;
		res.send(movie);
	});
});



module.exports = router;