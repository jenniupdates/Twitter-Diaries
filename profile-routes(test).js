const router = require("express").Router();
const Twit = require("twit");
const keys = require("../config/keys");
const rp = require("request-promise");
const bodyParser = require("body-parser");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const authCheck = (req, res, next) => {
	if (!req.user) {
		//if user is not logged in
		res.redirect("/auth/twitter");
	} else {
		//if user is logged in
		next();
	}
};

router.get("/", authCheck, (req, res) => {
	res.render("profile", { user: req.user });
});

// form validation and updating database
router.post("/", [authCheck, urlencodedParser], (req, res) => {
	// console.log(req.body);
	//update the database
	req.user.theme = req.body.theme;
	req.user.save();
	res.redirect("profile");
});

router.get("/timeline", authCheck, (req, res) => {
	// console.log(res);
	var T = new Twit({
		consumer_key: keys.twitter.consumerKey,
		consumer_secret: keys.twitter.consumerSecret,
		access_token: req.user.token,
		access_token_secret: req.user.tokenSecret
	});

	T.get(
		"statuses/user_timeline",
		{ count: 10, include_rts: false, exclude_replies: true },
		(err, data, response) => {
			var emotionalLevel = 0;
			const timeline = [];


			for (tweet of data) {
				console.log(tweet);
				console.log("---------------end of one tweet-----------------");
				// if there is a image it will be added into the timeline object as an additional "image" key
				if (tweet.lang == "en" && "media" in tweet.entities) {
					var tweetTextList = tweet.text.split(" https:");
					timeline.push({
						text: tweetTextList[0],
						date: tweet.created_at,
						image: tweet.entities.media[0].media_url_https,
						fav: tweet.favorite_count,
						rt: tweet.retweet_count
					});
				}
				// if not it will just be a normal object without the "image" key
				else if (tweet.lang == "en") {
					timeline.push({
						text: tweet.text,
						date: tweet.created_at,
						fav: tweet.favorite_count,
						rt: tweet.retweet_count
					});
				}
			}
			console.log(timeline);
			console.log("---------timeline---------");

			//update the database
			// req.user.msg = "hola guys";
			// req.user.save();

			// render the webpage
			// res.render("timeline", { user: req.user, timeline: timeline });

			// get analysis
			async function fetchTweetInfos(timeline) {
				const promises = timeline.map(async tweet => {
					const response = await rp(
						"https://aylien-text.p.rapidapi.com/sentiment?text=" +
							tweet.text +
							"&mode=tweet",
						{
							headers: {
								"x-rapidapi-host": "aylien-text.p.rapidapi.com",
								"x-rapidapi-key":
									"15e0057f3fmsh3009160a6e0e15ap1f03d3jsn7fd2dbea9dab"
							}
						}
					);
					return [
						{
							text: tweet.text,
							analysis: JSON.parse(response)
						}
					];
				});
				// this will be what is parsed to the timeline.ejs so to amend this data object, you have to edit this value
				const results = await Promise.all(promises);
				for (i = 0; i < timeline.length; i++) {
					results[i][0]["date"] = timeline[i]["date"];
					results[i][0]["fav"] = timeline[i]["fav"];
					results[i][0]["rt"] = timeline[i]["rt"];
					// if there is an image this if function will add the image to the result object
					if ("image" in timeline[i]) {
						results[i][0]["image"] = timeline[i]["image"];
					}
				}

				console.log(results);
				console.log("---------results---------");

				return results;
			}
			(async () => {
				const results = await fetchTweetInfos(timeline);

				// getting the overall sentiment for the timeline
				var overallSentiment = 0;
				var monthSentiment = {}
				for (tweet of results) {
					// if negative it will be added as a negative integer into the overallSentiment
					if (tweet[0].analysis.polarity == "negative") {
						emotionalLevel -= 1;
						overallSentiment += -1 * tweet[0].analysis.polarity_confidence;
						month = tweet[0].date.split(" ")[1] 
						console.log(tweet[0].date)
						if (!(month in monthSentiment)){
							monthSentiment[month] = overallSentiment
						} else {
							monthSentiment[month] += overallSentiment
						}

					} else if (tweet[0].analysis.polarity == "neutral") {
						emotionalLevel += 0;
						// if positive it will be added as a positive integer into the overallSentiment
					} else {
						emotionalLevel += 1;
						overallSentiment += tweet[0].analysis.polarity_confidence;
						console.log(tweet[0].analysis.polarity_confidence);
						month = tweet[0].date.split(" ")[1] 
						console.log(tweet[0].date)
						console.log(month)
						if (!(month in monthSentiment)){
							monthSentiment[month] = overallSentiment
						} else {
							monthSentiment[month] += overallSentiment
						}
					}
				}
				console.log('-------------------')
				console.log(monthSentiment)
				console.log('--------------')

				// overall sentiment coverted into percentage and pushed into mango database
				overallSentiment = overallSentiment / results.length;

				overallSentiment = overallSentiment * 100;
				console.log(overallSentiment);

				req.user.overallSentiment = overallSentiment;

				//get top 3 index position of the tweets
				var indexScoreObject = {};
				var top3indexlist = [];

				for (i = 0; i < results.length; i++) {
					var score = results[i][0]["fav"] + results[i][0]["rt"] * 2;
					indexScoreObject[i] = score;
				}
				// if (results.length <3){
				// 	for (i = 0; i < results.length; i++) {
				// }
				for (i = 0; i < 3; i++) {
					var maximum = 0;
					var indexofmax = 0;

					for (j = 0; j < results.length; j++) {
						if (indexScoreObject[j] > maximum) {
							maximum = indexScoreObject[j];
							indexofmax = j;
						}
					}
					if (indexScoreObject[indexofmax] == 0) {
						continue;
					}
					indexScoreObject[indexofmax] = 0;
					top3indexlist.push(indexofmax);
				}


				// make an array to parse the top3 tweet's text RT and Fav count into an object an into an array
				var top3objects = [];
				for (position of top3indexlist) {
					var obj = {
						text: results[position][0]["text"],
						rt: results[position][0]["rt"],
						fav: results[position][0]["fav"]
					};
					top3objects.push(obj);
				}
				console.log(top3objects)
				console.log('-----------------sefewsf-')

				// push all the items into the database manually
				try {
					var top1 = top3objects[0]["text"];
					var top1RT = top3objects[0]["rt"];
					var top1Fav = top3objects[0]["fav"];
					req.user.topOneText = top1;
					req.user.topOneRT = top1RT;
					req.user.topOneFav = top1Fav;
				} catch (err) {
					console.log("lesser than 1 tweets");
				}

				try {
					var top2 = top3objects[1]["text"];
					var top2RT = top3objects[1]["rt"];
					var top2Fav = top3objects[1]["fav"];
					req.user.topTwoText = top2;
					req.user.topTwoRT = top2RT;
					req.user.topTwoFav = top2Fav;
				} catch (err) {
					console.log("lesser than 2 tweets");
				}

				try {
					var top3 = top3objects[2]["text"];
					var top3RT = top3objects[2]["rt"];
					var top3Fav = top3objects[2]["fav"];
					req.user.topThreeText = top3;
					req.user.topThreeRT = top3RT;
					req.user.topThreeFav = top3Fav;
				} catch (err) {
					console.log("lesser than 3 tweets");
				}

				req.user.getTimeline = "true";

				const rarebird = {"kuku":"bird"}
				const string = JSON.stringify(rarebird);
				req.user.gettingthebird = string
				console.log(string)
				
				req.user.save();

				res.render("timeline", {
					user: req.user,
					timeline: results,
					level: emotionalLevel
				});
			})();
		}
	);
});

module.exports = router;
