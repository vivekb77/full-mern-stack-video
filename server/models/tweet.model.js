const mongoose = require('mongoose')

//schema validation for user data
const TweetData = new mongoose.Schema(
	{
		Email: { type: String, required: false },
		TweeterUserIDtopullTweets: { type: String, required: false },
		Tweets: { type: Array, required: false },
		AIAnalysis: { type: Array, required: false },
		TwitteruserName: { type: String, required: false },
		TotalTokensUsed: { type: String, required: false },
		PromptTokensUsed: { type: String, required: false },
		CompletionTokensUsed: { type: String, required: false },
		CreatedDate: { type: Date, required: true }
		
	},
	{ collection: 'TweetData' }
)

const model = mongoose.model('TweetData', TweetData)

module.exports = model



