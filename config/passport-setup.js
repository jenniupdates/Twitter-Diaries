const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const keys = require("./keys");
const User = require("../models/user-model");

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id).then(user => {
		done(null, user);
	});
});

passport.use(
	new TwitterStrategy(
		{
			//options for twitter strat
			callbackURL: "http://localhost:3000/auth/twitter/redirect",
			consumerKey: keys.twitter.consumerKey,
			consumerSecret: keys.twitter.consumerSecret
		},
		(token, tokenSecret, profile, done) => {
			//check if user already exists in our db
			User.findOne({ twitterId: profile.id }).then(currentUser => {
				if (currentUser) {
					//already have the user
					// currentUser.updateOne({}, { tokenSecret: tokenSecret, token: token });
					// currentUser.msg = "hello cat";
					currentUser.username = profile.displayName;
					currentUser.twitterId = profile.id;
					currentUser.bannerUrl = profile._json.profile_banner_url;
					currentUser.profileImage = profile.photos[0].value;
					currentUser.token = token;
					currentUser.tokenSecret = tokenSecret;
					done(null, currentUser);
				} else {
					//if not, create user in our db
					//these variables will be updated everytime the timeline page is opened
					new User({
						username: profile.displayName,
						twitterId: profile.id,
						bannerUrl: profile._json.profile_banner_url,
						profileImage: profile.photos[0].value,
						token: token,
						tokenSecret: tokenSecret,
						theme: "",
						getTimeline: "false",
						overallSentiment: 0,
						topOneText: "",
						topOneRT: 0,
						topOneFav: 0,
						topTwoText: "",
						topTwoRT: 0,
						topTwoFav: 0,
						topThreeText: "",
						topThreeRT: 0,
						topThreeFav: 0,
						monthSentiment: ""
					})
						.save()
						.then(newUser => {
							done(null, newUser);
						});
				}
			});
		}
	)
);
