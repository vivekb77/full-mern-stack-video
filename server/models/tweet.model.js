const mongoose = require('mongoose')

//schema validation for user data
const TweetData = new mongoose.Schema(
	{
		Email: { type: String, required: false },
		TweeterUserIDtopullTweets: { type: String, required: false },
		AllAboutTweetsArray: { type: Array, required: false }, 
		TwitteruserName: { type: String, required: false },
		TwitteruserFullName: { type: String, required: false },
		total_tokens_used_forrun: { type: Number, required: false },
		CreatedDate: { type: Date, required: true }
		
	},
	{ collection: 'TweetData' }
)

const model = mongoose.model('TweetData', TweetData)

module.exports = model



