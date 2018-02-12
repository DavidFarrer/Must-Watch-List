var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/mustwatch");

var MovieSchema =  mongoose.Schema({
	title: String,
	imdbid: {
		type: String,
		unique: true
	},
	year: Number,
	rating: String,
	actors: String,
	director: String,
	plot: String,
	imdburl: String,
	timesAdded: {
		type: Number,
		default: 1
	}

});

var Movie = module.exports = mongoose.model("Movie", MovieSchema);

module.exports.createMovie = function(newMovie, callback) {
	newMovie.save(callback); 
};

module.exports.incrementTimesWatched = function(imdbid, callback) {
	Movie.findOne({imdbid: imdbid}, function(err, movie) {
		movie.timesAdded++;
		movie.save(callback);
	});
};
