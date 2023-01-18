const mongoose = require('mongoose')

try{


//schema validation for user data
const AllTweetData = new mongoose.Schema(
	{
		
		TweetText: { type: String, required: false },
		TweetId: { type: String, required: false },
		retweet_count: { type: Number, required: false },
		reply_count: { type: Number, required: false },
		like_count: { type: Number, required: false },
		quote_count: { type: Number, required: false },
		impression_count: { type: Number, required: false },
		CreatedDate: { type: Date, required: false }
		
	},
	{ collection: 'AllTweetData' }
)


const model = mongoose.model('AllTweetData', AllTweetData)
module.exports = model

}
catch(err){
	console.log(err)
}




