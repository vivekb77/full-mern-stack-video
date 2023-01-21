
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const UserData = require('./models/user.model')
const TweetData = require('./models/tweet.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://reactuser:M1Js50hX2JYxkqsQ@galaxzcluster.sofxyos.mongodb.net/test'
const PORT = process.env.PORT || 1337

app.use(cors())
app.use(express.json())

// prod
mongoose.connect(`${MONGO_URL}`)


app.post('/api/register', async (req, res) => {


	try {

		const newPassword = await bcrypt.hash(req.body.password, 10)
		await UserData.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
			CreatedDate: new Date()
		})

		res.json({ status: 'ok' })
	} catch (err) {
		console.log("err" + err)
		res.json({ status: 'error', error: 'Duplicate email' })
		console.log("error is  ---" + err)
	}
})

app.post('/api/login', async (req, res) => {

console.log(req.body.email)
	const user = await UserData.findOne({
		email: req.body.email,
	})

	if (!user) {
		console.log('no user')
		return { status: 'error', error: 'Invalid Email' }

	}

	const isPasswordValid = await bcrypt.compare(
		req.body.password,
		user.password
	)

	if (isPasswordValid) {
		const token = jwt.sign(
			{
				name: user.name,
				email: user.email,
			},
			'secret123'
		)

		return res.json({ status: 'ok', user: token })
	} else {
		return res.json({ status: 'error', user: false })
	}
})




// EXAMPLES START

app.post('/api/examples', async (req, res) => {


	pullexamplesforusers = [];


	try {
		const ExampleData = await TweetData.find({
			Email: 'v@v.v'
		})

		for (let i = 0; i < ExampleData.length; i++) {
			pullexamplesforusers.push(ExampleData[i].TwitteruserName)
		}

		//remove duplicates
		pullexamplesforusers = [...new Set(pullexamplesforusers)];

		const AllAboutTweetsArray = await TweetData.findOne({
			Email: 'v@v.v',
			TwitteruserName: pullexamplesforusers[Math.floor(Math.random() * pullexamplesforusers.length)]
		})
		return res.json({ status: 'ok', tweets: AllAboutTweetsArray })

	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'No high quality Tweets found for this user' })
	}
})


// EXAMPLES END




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


		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email

		if (AllAboutTweetsArray.length > 0) {
			await TweetData.create({
				Email: email,
				TweeterUserIDtopullTweets: tweeterUserIdToPullTweets,
				AllAboutTweetsArray: AllAboutTweetsArray,
				TwitteruserName: TwitteruserName,
				TwitteruserFullName:TwitteruserFullName,
				total_tokens_used_forrun:total_tokens_used_forrun,
				CreatedDate: new Date()
			}

			)
			console.log("Added all Tweet data to DB and sent response to UI after analysis")
			console.log("total_tokens_used_forrun "+total_tokens_used_forrun)
			return res.json({ status: 'ok', tweets: AllAboutTweetsArray })
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


		'max_results': 30, //hasNextPage = false;  so that only max 95 tweets are pulled on first page 
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
				hasNextPage = false; // so that only 200 tweets are pulled on first page 
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


			else if (userTweets[i].text.includes("https") || userTweets[i].text.includes("@") || userTweets[i].text.includes("t.co") || userTweets[i].text.length < 50 ) {

				tweetType = "notonpoint"  //tweets with @ and urls anywhere in them are not hight quality and are filtered out
			}


			else if (!userTweets[i].text.trim().match(/^[A-Za-z0-9!“”'@#\$%\^\&*\)\(+=.?_-\s,:;]+$/)) {
				tweetType = "notenglishtweet" //non english tweets are filtered out 
				//this also filter out ' and " ---fix it later
				// console.log("String is not in english -----" +userTweets[i].text);

			}
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
				
				if(AllAboutTweetsArray.length<5){
					console.log("AI run is " +i)
 
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


					let promptfornewtweet = `Write a new Tweet using the following Tweet in the same style. Don't add hashtags. ${userTweets[i].text.trim()}`;

					//generate a new tweet
					const newtweet = await openai.createCompletion({
						// "model": "text-curie-001",
						"model": "text-davinci-003",
						"prompt": promptfornewtweet,
						"temperature": 0.9,
						"max_tokens": 100,
						// "top_p": 1,  this with temperature 0.9 gives bad results
						"frequency_penalty": 0.37,
						"presence_penalty": 0,
						// "stop": ["\n\n"]
					});

					// add all data to array
					// console.dir("newtweet.data.choices[0].text.trim() is " +  JSON.stringify(newtweet.data.usage.total_tokens));

					let allTweetDataobj = {
						tweet: userTweets[i].text,
						tweetType: tweetType,
						tweetID: `https://twitter.com/${userName}/status/${userTweets[i].id}`,
						retweet_count: userTweets[i].public_metrics.retweet_count,
						reply_count: userTweets[i].public_metrics.reply_count,
						like_count: userTweets[i].public_metrics.like_count,
						quote_count: userTweets[i].public_metrics.quote_count,
						impression_count: userTweets[i].public_metrics.impression_count,
						// tweetSentiment: tweetSentiment,
						likesTOviewsRatio: likesTOviewsRatio,
						newtweet: newtweet.data.choices[0].text.trim(),
						TwitteruserFullName: TwitteruserFullName,
						total_tokens_used:newtweet.data.usage.total_tokens
					};

					AllAboutTweetsArray.push(allTweetDataobj);
					total_tokens_used_forrun = total_tokens_used_forrun + newtweet.data.usage.total_tokens;


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



app.listen(PORT, () => {
	console.log(`Server started on ${PORT}`)
})