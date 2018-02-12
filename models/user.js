var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

mongoose.connect("mongodb://localhost/mustwatch");

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
			objectId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Movie"
			},
			imdbId: String,
			watched: {
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
			user.watchList.push({
				objectId: movie._id,
				imdbId: movie.imdbid
			});
			user.save(callback);
		}
	});

};

module.exports.hasMovie = function(user, movie) {
	var found = false;
	user.watchList.forEach(function(listMovie) {
		if (listMovie.imdbId === movie.imdbid) {
			found = true;
		}
	});
	if (found) {
		return true;
	}
	return false;
};