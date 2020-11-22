const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: String,
	twitterId: String,
	bannerUrl: String,
	profileImage: String,
	token: String,
	tokenSecret: String,
	theme: String,
	getTimeline: String,
	overallSentiment: Number,
	topOneText: String,
	topOneRT: Number,
	topOneFav: Number,
	topTwoText: String,
	topTwoRT: Number,
	topTwoFav: Number,
	topThreeText: String,
	topThreeRT: Number,
	topThreeFav: Number,
	monthSentiment: String
});

const User = mongoose.model("user", userSchema);

module.exports = User;
