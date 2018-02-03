var express = require("express");
var router = express.Router();

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
router.post("/register", function(req, res) {
	var email = req.body.email;
	var password = req.body.password1;
	var password2 = req.body.password2;

	// Validation
	req.checkBody("password1", "Password is required").notEmpty();
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
			email: email,
			password: password
		});

		User.createUser(newUser, function(err, user) {
			if (err) {
				throw err;
			}
			console.log(user);
		});

		req.flash("success_msg", "You are registered and can now login");

		res.redirect("/users/login");
	}
});

module.exports = router;