const Twit = require("twit");
const keys = require("./config/keys");
var mongoose = require("mongoose");

var T = new Twit({
	consumer_key: keys.twitter.consumerKey,
	consumer_secret: keys.twitter.consumerSecret,
	access_token: token,
	access_token_secret: tokenSecret
});

T.get("statuses/user_timeline", { count: 5 }, (err, data, response) => {});

//call the user timeline with the mongodb id
function getTimeline(id) {
	User.findOne({ twitterId: id }).then(currentUser => {
		//already have the user
		// currentUser.updateOne({}, { tokenSecret: tokenSecret, token: token });
		// console.log(currentUser);
	});
}

const swup = new Swup();
