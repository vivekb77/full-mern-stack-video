const mongoose = require('mongoose')

//schema validation for user data
const TweetData = new mongoose.Schema(
	{
		Email: { type: String, required: false },
		TweeterUserIDtopullTweets: { type: String, required: false },
		Tweets: { type: Array, required: false },
		AIAnalysis: { type: String, required: false },
		TwitteruserName: { type: String, required: false },
		TotalTokensUsed: { type: Number, required: false },
		PromptTokensUsed: { type: String, required: false },
		CompletionTokensUsed: { type: String, required: false },
		CreatedDate: { type: Date, required: true }
		
	},
	{ collection: 'TweetData' }
)

const model = mongoose.model('TweetData', TweetData)

module.exports = model



