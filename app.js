const express = require("express");
const authRoutes = require("./routes/auth-routes");
const profileRoutes = require("./routes/profile-routes");
const passportSetup = require("./config/passport-setup");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const cookieSession = require("cookie-session");
const passport = require("passport");
const request = require("request");
const rp = require("request-promise");

const app = express();

const bodyParser = require("body-parser");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

// //session
// var session = require("express-session");
// app.use(session({ secret: "SECRET" }));

// set view engine
app.set("view engine", "ejs");

//access the static script file
app.use(express.static("public"));
app.use("/js", express.static(__dirname + "public/js"));

app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));

app.use(express.static("public"));
app.use("/assets", express.static(__dirname + "public/assets"));
// set the cookie
app.use(
	cookieSession({
		maxAge: 24 * 60 * 60 * 1000,
		keys: [keys.session.cookieKey]
	})
);

//initialise passport
app.use(passport.initialize());
app.use(passport.session());

//connect to mongodb
mongoose.connect(keys.mongodb.dbURI, () => {
	console.log("connected to mongo db");
});

// set up routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

// create website
app.get("/app", (req, res) => {
	res.render("website");
});

// create home route
app.get("/main", (req, res) => {
	passedVariable = "false";
	passedVariable = req.query.logout;
	if (req.user) {
		if (req.user.overallSentiment > 0) {
			// if happy recommend: action 1, adventure 2, comedy 4, fantasy 10, mecha 18, romance 22, shounen 27, sports 30, slice of life 36
			var genres = [1, 2, 4, 10, 18, 22, 27, 30, 39, 36];
			var animedic = {
				action: 1,
				adventure: 2,
				comedy: 4,
				fantasy: 10,
				mecha: 18,
				romance: 22,
				shounen: 27,
				sports: 30,
				"slice of life": 36
			};
		} else if (req.user.overallSentiment < 0) {
			// if sad recommend: action 1, adventure 2, comedy 4, drama 8, fantasy 10,romance 22, sports 30, slice of life 36
			var genres = [1, 2, 4, 8, 10, 22, 30, 36];
			var animedic = {
				action: 1,
				adventure: 2,
				comedy: 4,
				drama: 8,
				fantasy: 10,
				romance: 22,
				sports: 30,
				"slice of life": 36,
			};
		} else {
			var genres = [1];
			var animedic = { action: 1 };
		}
	} else {
		var genres = [1];
		var animedic = { action: 1 };
	}

	// random anime genre suggested if user is not logged in 
	index = Math.floor(Math.random() * genres.length);

	var options = {
		method: "GET",
		url: "https://jikan1.p.rapidapi.com/genre/anime/" + genres[index] + "/1",
		headers: {
			"x-rapidapi-host": "jikan1.p.rapidapi.com",
			"x-rapidapi-key": "15e0057f3fmsh3009160a6e0e15ap1f03d3jsn7fd2dbea9dab",
			useQueryString: true
		}
	};

	// create anime dictionary to be passed to the home page
	request(options, function(error, response, body) {
		if (error) throw new Error(error);
		const fakeanimelist = [];
		var jsonfile = JSON.parse(body);
		var animelist = jsonfile.anime;
		randomNum = Math.floor(Math.random() * animelist.length);
		secondNum = randomNum + 6;
		var animelist = animelist.slice(randomNum, secondNum);

		for (anime of animelist) {
			fakeanimelist.push({
				title: anime.title,
				url: anime.url,
				image: anime.image_url,
				score: anime.score
			});
		}

		res.render("home", {
			user: req.user,
			msg: passedVariable,
			animelist: fakeanimelist,
			animedic: animedic
		});
	});
});

app.post("/main", [urlencodedParser], (req, res) => {
	passedVariable = "false";
	passedVariable = req.query.logout;
	var index = req.body.genre;

	if (req.user) {
		if (req.user.overallSentiment > 0) {
			// if happy recommend: action 1, adventure 2, comedy 4, fantasy 10, mecha 18, romance 22, shounen 27, sports 30, slice of life 36
			var animedic = {
				action: 1,
				adventure: 2,
				comedy: 4,
				fantasy: 10,
				mecha: 18,
				romance: 22,
				shounen: 27,
				sports: 30,
				"slice of life": 36
			};
		} else if (req.user.overallSentiment < 0) {
			// if sad recommend: action 1, adventure 2, comedy 4, drama 8, fantasy 10,romance 22, sports 30, slice of life 36
			var animedic = {
				action: 1,
				adventure: 2,
				comedy: 4,
				drama: 8,
				fantasy: 10,
				romance: 22,
				sports: 30,
				"slice of life": 36,
			};
		}
	}

	// anime API passed in here
	async function getAnime() {
		const response = await rp(
			"https://jikan1.p.rapidapi.com/genre/anime/" + index + "/1",
			{
				headers: {
					"x-rapidapi-host": "jikan1.p.rapidapi.com",
					"x-rapidapi-key":
						"15e0057f3fmsh3009160a6e0e15ap1f03d3jsn7fd2dbea9dab",
					useQueryString: true
				}
			}
		);
		return JSON.parse(response);
	}
	(async () => {
		const results = await getAnime();
		var animelist = results.anime;
		var fiveResults = [];
		const randomNum = Math.floor(Math.random() * 10);
		const secondNum = randomNum + 6;
		const newList = animelist.slice(randomNum, secondNum);
		for (anime of newList) {
			fiveResults.push({
				title: anime.title,
				url: anime.url,
				image: anime.image_url,
				score: anime.score
			});
		}
		res.render("home", {
			user: req.user,
			msg: passedVariable,
			animelist: fiveResults,
			animedic: animedic
		});
	})();
});

app.listen(3000, () => {
	console.log("app now listening for requests on port 3000");
});
