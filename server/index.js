
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const UserData = require('./models/user.model')
const TweetData = require('./models/tweet.model')


const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config();


const MONGO_URL = process.env.MONGO_URL
// || 'mongodb+srv://reactuser:E1FUIOqG7D6FMQGD@galaxzcluster.sofxyos.mongodb.net/TweetEraDB'
const PORT = process.env.PORT || 1337

app.use(cors())
app.use(express.json())

// prod
mongoose.connect(`${MONGO_URL}`)


// app.post('/api/register', async (req, res) => {


// 	try {

// 		const newPassword = await bcrypt.hash(req.body.password, 10)
// 		await UserData.create({
// 			name: req.body.name,
// 			email: req.body.email,
// 			password: newPassword,
// 			CreatedDate: new Date()
// 		})

// 		res.json({ status: 'ok' })
// 	} catch (err) {
// 		console.log("err" + err)
// 		res.json({ status: 'error', error: 'Duplicate email' })
// 		console.log("error is  ---" + err)
// 	}
// })

// app.post('/api/login', async (req, res) => {

// console.log(req.body.email)
// 	const user = await UserData.findOne({
// 		email: req.body.email,
// 	})

// 	if (!user) {
// 		console.log('no user')
// 		return { status: 'error', error: 'Invalid Email' }

// 	}

// 	const isPasswordValid = await bcrypt.compare(
// 		req.body.password,
// 		user.password
// 	)

// 	if (isPasswordValid) {
// 		const token = jwt.sign(
// 			{
// 				name: user.name,
// 				email: user.email,
// 			},
// 			'secret123'
// 		)

// 		return res.json({ status: 'ok', user: token })
// 	} else {
// 		return res.json({ status: 'error', user: false })
// 	}
// })

app.post('/api/admin', async (req, res) => {

	try {
		const Analyse = await TweetData.find({
			curationstatus: 'notcurated'
		})
		AdminArray = []
		for (let i = 0; i < Analyse.length; i++) {
			// console.log(Analyse[i].TwitteruserName)
			AdminArray.push(Analyse[i].TwitteruserName)
			
		}
		AdminArray = [...new Set(AdminArray)];  //remove duplicates
		// const AdminArray1 = AdminArray.sort((a, b) => 0.5 - Math.random()); //shuffle array

		return res.json({ status: 'ok', AdminArray: AdminArray })

	} catch (error) {
		res.json({ status: 'error', error: 'Admin error occured' })
	}
})



// DELETE TWEET START
app.post('/api/deleteTweet', async (req, res) => {

	let dbid = req.body.dbid.trim();
	
	TweetData.findByIdAndDelete(dbid)
		.then(deletedUser => {
			// console.log(`Successfully deleted user with id ${dbid}`);
			return res.json({ status: 'ok'})
		})
		.catch(err => {
			// console.log(`Error deleting user with id ${dbid}: ${err}`);
			return res.json({ status: 'error'})
		});

})
// DELETE TWEET END

// ADD TAG START
app.post('/api/addtag', async (req, res) => {

	let dbid = req.body.dbid.trim();
	let tag = req.body.tag.trim();
	
	try{
		TweetData.findByIdAndUpdate(dbid, {tag: tag, curationstatus: "notcurated"}, {new: false}, (err, doc) => {
			if (err) return handleError(err);
		});	
		return res.json({ status: 'ok'})
	}catch{
		return res.json({ status: 'error'})
	}
})
// ADD TAG END

// PULL TWEET to show user START
app.post('/api/ShowTweets', async (req, res) => {

	let tweeterUserHadleToPullTweets = req.body.tweeterUserHadleToPullTweets.trim();
	
	const AITweets = await TweetData.find({

		//case insensitive search on handle
		TwitteruserName: { '$regex':tweeterUserHadleToPullTweets , '$options' : 'i'} ,
		curationstatus:"notcurated"
	})
	
	if(AITweets.length > 0){
		//sort the array by likes to views ratio
		AITweets.sort((a, b) => (a.likesTOviewsRatio > b.likesTOviewsRatio) ? -1 : 1)
	return res.json({ status: 'ok', tweets: AITweets })
	}else{
		return res.json({ status: 'error', error: 'No Tweets found for user' })
	}

})
// PULL TWEET to show user END

// CURATE TWEET  START
app.post('/api/curate', async (req, res) => {

	let tweeterUserHadleToPullTweets = req.body.tweeterUserHadleToPullTweets.trim();
	
	const AITweets = await TweetData.find({

		//case insensitive search on handle
		TwitteruserName: { '$regex':tweeterUserHadleToPullTweets , '$options' : 'i'} ,
		curationstatus:"notcurated"
	})
	
	if(AITweets.length > 0){
		//sort the array by likes to views ratio
		AITweets.sort((a, b) => (a.likesTOviewsRatio > b.likesTOviewsRatio) ? -1 : 1)
	return res.json({ status: 'ok', tweets: AITweets })
	}else{
		return res.json({ status: 'error', error: 'No Tweets found for user' })
	}

})
// CURATE TWEET END

// Generate AI TWEET START
app.post('/api/GenerateAITweet', async (req, res) => {

	let neednewAITweetforthisTweet = req.body.neednewAITweetforthisTweet.trim();
	let dbid = req.body.dbid.trim();
	
	const { Configuration, OpenAIApi } = require("openai");

	const configuration = new Configuration({
		apiKey: process.env.apiKey,
	});
	const openai = new OpenAIApi(configuration);
	let promptfornewtweet = `Write a new Tweet with no hashtags using the following Tweet as context. ${neednewAITweetforthisTweet}`;


	try{

	
		const newAItweet = await openai.createCompletion({
			"model": "text-curie-001",
			// "model": "text-davinci-003",
			"prompt": promptfornewtweet,
			"temperature": 0.9,
			"max_tokens": 100,
			// "top_p": 1,  this with temperature 0.9 gives bad results
			"frequency_penalty": 0.37,
			"presence_penalty": 0,
			// "stop": ["\n\n"]
		});

		console.log(newAItweet.data.usage.total_tokens)
		total_tokens_used_byAI = newAItweet.data.usage.total_tokens;
		

		if(newAItweet){

			//add tokens used to db
			TweetData.findByIdAndUpdate(dbid, {$inc: {total_tokens: total_tokens_used_byAI}}, {new: true}, (err, doc) => {
				if (err) return handleError(err);
			});
			// tokeuseremail = "genericuser@gmail.com"
			// UserData.findByIdAndUpdate(tokeuseremail, {$inc: {total_tokens: total_tokens_used_byAI}}, {new: true}, (err, doc) => {
			// 	if (err) return handleError(err);
			// });


			return res.json({ status: 'ok', newAItweet: newAItweet.data.choices[0].text })
			}else{
				return res.json({ status: 'error', error: 'Tweet Generation failed by AI' })
		}
	}
	catch(error){{
		console.log(error)
		return res.json({ status: 'error', error: 'Tweet Generation failed by AI' })
	}}
	

})
// generate AI TWEET END



let TwitteruserFullName = null;
let tweeterUserIdToPullTweets = null;
total_tokens_used_forrun = 0;

app.post('/api/tweets', async (req, res) => {
	const token = req.headers['x-access-token']


	let tweeterUserHadleToPullTweets = req.body.tweeterUserHadleToPullTweets.trim();


	try {
		const response = await getTwitterUserId(tweeterUserHadleToPullTweets);

		tweeterUserIdToPullTweets = response.data[0].id;
		TwitteruserFullName = response.data[0].name;

		console.log("User found " + TwitteruserFullName)

		if (tweeterUserIdToPullTweets == null) {
			return res.json({ status: 'error', error: 'Twitter user not found' })
		}
		if (tweeterUserIdToPullTweets != null) {
			await getUserTweets(tweeterUserIdToPullTweets); // pulls the tweets from twitter
		}

	} catch (error) {
		return res.json({ status: 'error', error: 'Twitter user not found' })
	}


	try {

		//add this for login funtionality
		// const decoded = jwt.verify(token, 'secret123')
		// const email = decoded.email || "generic@email.com"
		// const email = "generic@email.com"

		if (AllAboutTweetsArray.length > 0) {
			for(let i = 0; i < AllAboutTweetsArray.length; i++){

				await TweetData.create({
					TweeterUserIDtopullTweets: tweeterUserIdToPullTweets,
					TwitteruserName: TwitteruserName,
					TwitteruserFullName: TwitteruserFullName,
					CreatedDate: new Date(),
					tweet:AllAboutTweetsArray[i].tweet,
					tweetID: AllAboutTweetsArray[i].tweetID,
					retweet_count: AllAboutTweetsArray[i].retweet_count,
					reply_count: AllAboutTweetsArray[i].reply_count,
					like_count: AllAboutTweetsArray[i].like_count,
					quote_count: AllAboutTweetsArray[i].quote_count,
					impression_count: AllAboutTweetsArray[i].impression_count,
					likesTOviewsRatio: AllAboutTweetsArray[i].like_count ==0 || AllAboutTweetsArray[i].impression_count ==0 ? 0 : AllAboutTweetsArray[i].like_count/AllAboutTweetsArray[i].impression_count,
					curationstatus:"notcurated",
					tag:"tagnotaddedyet",
					total_tokens: 0,

				})
			}	

			console.log("Added all Tweet data to DB and sent response to UI after analysis")
			// console.log("total_tokens_used_forrun " + total_tokens_used_forrun)
			// let ToBeCuratedArray = [];
			const ToBeCuratedArray = await TweetData.find({
				TwitteruserName: TwitteruserName,
				curationstatus:"notcurated"
			})

			//sort the array by likes to views ratio
			ToBeCuratedArray.sort((a, b) => (a.likesTOviewsRatio > b.likesTOviewsRatio) ? -1 : 1)
			return res.json({ status: 'ok', tweets: ToBeCuratedArray })
		}
		else {
			console.log("no tweets found")
			return res.json({ status: 'error', error: 'No high quality Tweets found for this user' })
		}

	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'No high quality Tweets found for this user' })
	}
})



const needle = require('needle');
const { response } = require('express')


const bearerToken = process.env.bearerToken


let TwitteruserName
let AllAboutTweetsArray = [];


const getUserTweets = async (tweeterUserIdToPullTweets) => {

	// this is the ID for @TwitterDev
	const userId = tweeterUserIdToPullTweets;
	const url = `https://api.twitter.com/2/users/${userId}/tweets`;


	let userTweets = [];


	let params = {


		'max_results': 100, //hasNextPage = false;  so that only max 95 tweets are pulled on first page 
		"expansions": "author_id",
		'tweet.fields': ('author_id', 'created_at', 'id', 'lang', 'public_metrics'),

	}

	const options = {
		headers: {
			"User-Agent": "v2UserTweetsJS",
			"authorization": `Bearer ${bearerToken}`
		}
	}

	let hasNextPage = true;
	let nextToken = null;
	let userName;
	// console.log("Retrieving Tweets...");

	while (hasNextPage) {
		console.log("Retrieving Tweets...");
		let resp = await getPage(params, options, nextToken, url);
		if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
			userName = resp.includes.users[0].username;
			if (resp.data) {
				userTweets.push.apply(userTweets, resp.data);
				hasNextPage = false; // false so that only 200 tweets are pulled on first page 
			}
			if (resp.meta.next_token) {
				nextToken = resp.meta.next_token;
			} else {
				hasNextPage = false;
			}
		} else {
			hasNextPage = false;
		}
	}


	console.log(`Got ${userTweets.length} Tweets from ${userName} (user ID ${userId})!`);

	//////////AI thingy///////////////

	TwitteruserName = userName
	const { Configuration, OpenAIApi } = require("openai");

	const configuration = new Configuration({


		apiKey: process.env.apiKey,


	});
	const openai = new OpenAIApi(configuration);

	try {

		console.log("started analysis of Tweets by AI")
		//clear the array first 
		AllAboutTweetsArray = []
		total_tokens_used_forrun = 0;

		for (i = 0; i < userTweets.length; i++) {

			let likesTOviewsRatio = ((userTweets[i].public_metrics.like_count / userTweets[i].public_metrics.impression_count) * 100).toFixed(3);

			//filter out quote , retweets and replies
			let tweetType
			if (userTweets[i].text.startsWith("RT @")) {
				tweetType = "retweet"
			}
			else if (userTweets[i].text.startsWith("@")) {
				tweetType = "reply"
			}


			else if (userTweets[i].text.includes("https") || userTweets[i].text.includes("@") || userTweets[i].text.includes("t.co") || userTweets[i].text.length < 50) {

				tweetType = "notonpoint"  //tweets with @ and urls anywhere in them are not hight quality and are filtered out
			}


			// else if (!userTweets[i].text.trim().match(/^[A-Za-z0-9!“”'@#\$%\^\&*\)\(+=.?_-\s,:;]+$/)) {
			// 	tweetType = "notenglishtweet" //non english tweets are filtered out 
			// 	//this also filter out ' and " ---fix it later
			// 	// console.log("String is not in english -----" +userTweets[i].text);

			// }
			else {
				tweetType = "tweet" //tweets and quote tweets filtered out
			}

			//to filter out non english tweets
			// let regex = /^[A-Za-z0-9!@#\$%\^\&*\)\(+=._-\s]+$/;
			// 		if (userTweets[i].text.trim().match(regex)) {
			// 			// console.log("String is valid1");
			// 		} else {
			// 			// console.log("String is not valid1");
			// 		}


			// let prompt;
			if (tweetType == "tweet") {

				// if(likesTOviewsRatio >= 2){
				// 	myanalysis = "Engagement is above average..";
				// 	prompt = `Read this tweet then answer the following questions:\n\n\"\"\"\n${userTweets[i].text}\n\"\"\"\n\nQuestions:\n1. Extract keywords that makes a Tweet viral.\n2. Who are mentioned in these tweets?\n3. Sentiment of tweets.\n4.Create an analogy.\n\n`;
				// }
				// else if(likesTOviewsRatio >= 1){
				// 	myanalysis = "Engagement is average.";
				// 	prompt = `Read this tweet then answer the following questions:\n\n\"\"\"\n${userTweets[i].text}\n\"\"\"\n\nQuestions:\n1. Extract keywords that makes a Tweet viral.\n2. Who are mentioned in these tweets?\n3. Sentiment of tweets.\n4.Create an analogy.\n\n`;
				// }
				// else if(likesTOviewsRatio < 1){
				// 	myanalysis = "Engagement is below average.";
				// 	prompt = `Read this tweet then answer the following questions:\n\n\"\"\"\n${userTweets[i].text}\n\"\"\"\n\nQuestions:\n1. Extract keywords that makes a Tweet viral.\n2. Who are mentioned in these tweets?\n3. Sentiment of tweets.\n4.Create an analogy.\n\n`;
				// }
				// else{
				// 	myanalysis = "Engagement is below average.";
				// 	prompt = `Read this tweet then answer the following questions:\n\n\"\"\"\n${userTweets[i].text}\n\"\"\"\n\nQuestions:\n1. Extract keywords that makes a Tweet viral.\n2. Who are mentioned in these tweets?\n3. Sentiment of tweets.\n4.Create an analogy.\n\n`;
				// }

			}



			if (tweetType == "tweet") {
				//only get analysis for 5 tweets to save cost and get results faster

				if (AllAboutTweetsArray.length < 100) {
					// console.log("AI run is " + i)

					//analyse the tweet
					// const analysetweet = await openai.createCompletion({
					// 	"model": "text-curie-001",
					// 	// "model": "text-davinci-003",
					// 	"prompt": prompt,
					// 	"temperature": 0.7,
					// 	"max_tokens": 200,
					// 	// "top_p": 1,
					// 	"frequency_penalty": 0.37,
					// 	"presence_penalty": 0,
					// 	// "stop": ["\n\n"]
					// });

					// from YT video
					// data.slice(-1)==="." ? "" : "." //add a dot at the end of bio if it doesn't have one
					//sample prompt = `Generate 2 funny twitter bios with no hashtags and clearly labeled "1." and "2.". Make sure there
					// is a joke in there and it's a little ridiculous. Make sure each generated bio is at max 20 words and base it on this context: ${bioContext}${bioContext.slice(-1)==="." ? "" : "."}`

					// let promptfornewtweet = `Write a new Tweet using the following Tweet in the same style with no hashtags. ${userTweets[i].text.trim()}`;

					//generate a new tweet
					// const newtweet = await openai.createCompletion({
					// 	// "model": "text-curie-001",
					// 	"model": "text-davinci-003",
					// 	"prompt": promptfornewtweet,
					// 	"temperature": 0.9,
					// 	"max_tokens": 100,
					// 	// "top_p": 1,  this with temperature 0.9 gives bad results
					// 	"frequency_penalty": 0.37,
					// 	"presence_penalty": 0,
					// 	// "stop": ["\n\n"]
					// });

					// add all data to array
					// console.dir("newtweet.data.choices[0].text.trim() is " +  JSON.stringify(newtweet.data.usage.total_tokens));

					let allTweetDataobj = {
						tweet: userTweets[i].text,
						// tweetType: tweetType,
						tweetID: `https://twitter.com/${userName}/status/${userTweets[i].id}`,
						retweet_count: userTweets[i].public_metrics.retweet_count,
						reply_count: userTweets[i].public_metrics.reply_count,
						like_count: userTweets[i].public_metrics.like_count,
						quote_count: userTweets[i].public_metrics.quote_count,
						impression_count: userTweets[i].public_metrics.impression_count,
						// tweetSentiment: tweetSentiment,
						// likesTOviewsRatio: likesTOviewsRatio,
						// newtweet: newtweet.data.choices[0].text.trim(),
						TwitteruserFullName: TwitteruserFullName,
						// total_tokens_used: newtweet.data.usage.total_tokens
					};

					AllAboutTweetsArray.push(allTweetDataobj);
					// total_tokens_used_forrun = total_tokens_used_forrun + newtweet.data.usage.total_tokens;


				}


			}

		}
		//sort the array by likes to views ratio
		AllAboutTweetsArray.sort((a, b) => (a.likesTOviewsRatio > b.likesTOviewsRatio) ? -1 : 1)

	}

	catch (error) {
		console.log(error)
	}



}


const getPage = async (params, options, nextToken, url) => {
	if (nextToken) {
		params.pagination_token = nextToken;
	}

	try {
		const resp = await needle('get', url, params, options);

		if (resp.statusCode != 200) {
			console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
			return;
		}
		return resp.body;
	} catch (err) {
		console.log("error is -----------" + JSON.stringify(err))
		throw new Error(`Request failed: ${err}`);

	}
}




async function getTwitterUserId(tweeterUserHadleToPullTweets) {
	const endpointURL1 = "https://api.twitter.com/2/users/by?usernames="
	// These are the parameters for the API request
	// specify User names to fetch, and any additional fields that are required
	// by default, only the User ID, name and user name are returned
	const params = {
		usernames: tweeterUserHadleToPullTweets, // Edit usernames to look up
		"user.fields": "created_at,entities", // Edit optional query parameters here
		// "expansions": "pinned_tweet_id"
	}
	// this is the HTTP header that adds bearer token authentication
	const res = await needle('get', endpointURL1, params, {
		headers: {
			"User-Agent": "v2UserLookupJS",
			"authorization": `Bearer ${bearerToken}`
		}
	})
	if (res.body) {
		return res.body;
	} else {
		console.log(res)
		throw new Error('Unsuccessful request')
	}
}

// EXAMPLES START

app.post('/api/examples', async (req, res) => {


	try {
		pullexamplesforusers = [];
		const ExampleData = await TweetData.find({
			Email: 'generic@email.com'
		})

		// console.log(ExampleData[0].TwitteruserName)

		for (let i = 0; i < ExampleData.length; i++) {
			// for (let i = 0; i < 30; i++) {
			pullexamplesforusers.push(ExampleData[i].TwitteruserName)
			// console.log(ExampleData[i].TwitteruserName )  //see users analysed by the app
		}

		console.log("Total users analysed ----->" + pullexamplesforusers.length)

		//remove duplicates
		pullexamplesforusers = [...new Set(pullexamplesforusers)];

		const AllAboutTweetsArray = await TweetData.findOne({
			Email: 'generic@email.com',
			TwitteruserName: pullexamplesforusers[Math.floor(Math.random() * pullexamplesforusers.length)]
		})
		return res.json({ status: 'ok', tweets: AllAboutTweetsArray })

	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'Please Try Again' })
	}
})


// EXAMPLES END


app.listen(PORT, () => {
	console.log(`Server started on ${PORT}`)
})