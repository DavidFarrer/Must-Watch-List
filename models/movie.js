var mongoose = require("mongoose");

mongoose.connect(process.env.MONGOLAB_URI);

var MovieSchema =  mongoose.Schema({
	title: String,
	imdbid: {
		type: String,
		unique: true
	},
	poster: String,
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

module.exports.getTimesAdded = function(imdbid, callback) {
	Movie.findOne({imdbid: imdbid}, function(err, movie) {
		if (movie === null) {
			callback(0);
		} else {
			callback(movie.timesAdded);
		}

	});
};

module.exports.getTopMovies = function(number, callback) {
	Movie.find()
		.sort("-timesAdded")
		.limit(number)
		.exec(callback);
};
