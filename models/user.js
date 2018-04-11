var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

mongoose.connect(process.env.MONGOLAB_URI);

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	email: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	watchList: [
		{
			movie: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Movie"
			},
			imdbid: String,
			watched: {
				type: Boolean,
				default: false
			},
			deleted: {
				type: Boolean,
				default: false
			}		
		}
	]
});

var User = module.exports = mongoose.model("User", UserSchema);

module.exports.createUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(newUser.password, salt, function(err, hash) {
        	newUser.password = hash;
        	newUser.save(callback); 
    	});
	});
};

module.exports.getUserByUsername = function(username, callback) {
	var query = {username: username};
	User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback) {
	User.findById(id, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		if (err) {
			throw err;
		}
		callback(null, isMatch);
	});
};

module.exports.addMovie = function(username, movie, callback) {
	var query = {username: username};
	User.findOne(query, function(err, user) {
		if (err) {
			throw err;
		} else {
			if (User.hasMovie(user, movie)) {
				var movieToReadd = user.watchList.find(function(currentMovie) {
					return currentMovie.imdbid === movie.imdbid;
				});
				movieToReadd.deleted = false;
			} else {
				user.watchList.push({
					movie: movie._id,
					imdbid: movie.imdbid
				});			
			}
			user.save(callback);
		}
	});

};

module.exports.hasMovie = function(user, movie) {
	var found = false;
	user.watchList.forEach(function(listMovie) {
		if (listMovie.imdbid === movie.imdbid) {
			found = true;
		}
	});
	return found;
};

module.exports.populateUserMovies = function(user, callback) {
	User.findOne({username: user.username})
	.populate("watchList.movie")
	.exec(callback);

};

module.exports.toggleWatched = function(username, imdbid, callback) {
	User.findOne({username: username}, function(err, user) {
		if (err) {
			throw err;
		}
		var movieToToggle = user.watchList.find(function(movie) {
			return movie.imdbid === imdbid;
		});
		movieToToggle.watched = movieToToggle.watched ? false : true;
		user.save(callback);
	});
};

module.exports.removeMovie = function(username, imdbid, callback) {
	User.findOne({username: username}, function(err, user) {
		if (err) {
			throw err;
		}
		changeToDeleted(user.watchList, "imdbid", imdbid);
		user.save(callback);
	});

	function changeToDeleted(arr, attr, value) {
		var i = arr.length;
		while (i--) {
			if (arr[i] && arguments.length > 2 && arr[i][attr] === value) {
				arr[i].deleted = true;
			}
		}
		return arr;
	}
};

module.exports.isDeleted = function(user, imdbid) {
	var arr = user.watchList;
	var i = arr.length;
	while (i--) {
		if (arr[i] && arr[i].imdbid === imdbid) {
			return arr[i].deleted;
		}
	}
};