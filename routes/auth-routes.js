const router = require("express").Router();
const passport = require("passport");


//auth logout
router.get("/logout", (req, res) => {
	// handl with passport
	req.logout();
	var string = encodeURIComponent("true");
	res.redirect("/main/?logout=" + string);
	// res.redirect("/app");
});

//auth with twitter
router.get(
	"/twitter",
	passport.authenticate("twitter", {
		scope: ["profile"]
	})
);

//callback route for twitter to redirect to
router.get(
	"/twitter/redirect",
	passport.authenticate("twitter", { failureRedirect: "/" }),
	(req, res) => {
		//res.send(req.user);
		res.redirect("/main");
	}
);

module.exports = router;
