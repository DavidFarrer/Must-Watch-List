var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var sanitize = require("mongo-sanitize");
var json = require("body-parser").json;

var User = require("../models/user");

// Register
router.get("/register", function(req, res) {
	res.render("register");
});

// Login
router.get("/login", function(req, res) {
	res.render("login");
});

// Register User
router.post("/register", json(), cleanBody, function(req, res) {
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password1;
	var password2 = req.body.password2;

	// Validation
	req.checkBody("password1", "Password is required").notEmpty();
	req.checkBody("username", "Username is required").notEmpty();
	req.checkBody("email", "Email is required").notEmpty();
	req.checkBody("email", "Email is not valid").isEmail();
	req.checkBody("password2", "Passwords do not match").equals(req.body.password1);

	var errors = req.validationErrors();

	if(errors) {
		res.render("register", {
			errors: errors
		});
	} else {
		var newUser = new User({
			username: username,
			email: email,
			password: password
		});

		User.createUser(newUser, function(err, user) {
			if (err) {
				throw err;
			}
		});

		req.flash("success_msg", "You are registered and can now login");

		res.redirect("/users/login");
	}
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.getUserByUsername(username, function(err, user) {
			if (err) {
				throw err;
			}
			if (!user) {
				return done(null, false, {message: "Username not found."});
			}
			User.comparePassword(password, user.password, function(err, isMatch) {
				if (err) {
					throw err;
				}
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {message: "Invalid password."});
				}
			});
		});
	}));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

router.post("/login", json(), cleanBody,
	passport.authenticate("local", {successRedirect:"/movies", failureRedirect:"/users/login", failureFlash: true}),
	function(req, res) {
		res.redirect("/");
});

router.get("/logout", function(req, res) {
	req.logout();
	req.flash("success_msg", "You have successfully signed out.");
	res.redirect("/movies");
});


module.exports = router;

function cleanBody(req, res, next) {
  req.body = sanitize(req.body);
  next();
}