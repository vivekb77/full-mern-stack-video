
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const UserData = require('./models/user.model')
const TweetData = require('./models/tweet.model')
// const AllTweetData = require('./models/alltweet.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')



app.use(cors())
app.use(express.json())

// mongoose.connect('mongodb+srv://reactuser:M1Js50hX2JYxkqsQ@galaxzcluster.sofxyos.mongodb.net/?retryWrites=true&w=majority')

mongoose.connect('mongodb+srv://reactuser:M1Js50hX2JYxkqsQ@galaxzcluster.sofxyos.mongodb.net/test')


//frontend react server is sending request to backend node server
app.post('/api/register', async (req, res) => {
	console.log(req.body)
	
	try {

		const newPassword = await bcrypt.hash(req.body.password, 10)
		await UserData.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
			CreatedDate : new Date()
		})

		res.json({ status: 'ok' })
	} catch (err) {
		res.json({ status: 'error', error: 'Duplicate email' })
		console.log("error is  ---" +err)
	}
})




app.post('/api/login', async (req, res) => {
	const user = await UserData.findOne({
		email: req.body.email,
	})

	if (!user) {
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



app.listen(1337, () => {
	console.log('Server started on 1337')
})











let TwitteruserFullName = null;
let tweeterUserIdToPullTweets = null;

app.post('/api/tweets', async (req, res) => {
	const token = req.headers['x-access-token']

	let tweeterUserHadleToPullTweets = req.body.tweeterUserHadleToPullTweets;
	

	try{
		const response = await getTwitterUserId(tweeterUserHadleToPullTweets);

		tweeterUserIdToPullTweets = response.data[0].id;
		TwitteruserFullName = response.data[0].name;

		if(tweeterUserIdToPullTweets == null){
			return res.json({ status: 'error', error: 'Twitter user not found' })
		}
		if(tweeterUserIdToPullTweets != null){
			await getUserTweets(tweeterUserIdToPullTweets);
		}
		
	} catch (error) {
		return res.json({ status: 'error', error: 'Twitter user not found' })
	}
	

	try {
		

		console.log("started analysis of tweets by AI")

		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email

		if(AllAboutTweetsArray.length>0){
			await TweetData.create({
				Email: email ,
				TweeterUserIDtopullTweets: tweeterUserIdToPullTweets,
				AllAboutTweetsArray: AllAboutTweetsArray,
				TwitteruserName:TwitteruserName,
				CreatedDate : new Date()
			}
			
			)
			console.log("added all tweet data after analysis")
			
			return res.json({ status: 'ok', tweets: AllAboutTweetsArray  })
		}
		else{
			console.log("no tweets found")
			return res.json({ status: 'error', error: 'Something went wrong while retrieving tweets' })
		}

	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'Something went wrong while retrieving tweets' })
	}
})



const needle = require('needle');
const { response } = require('express')


const bearerToken = "AAAAAAAAAAAAAAAAAAAAAFzulAEAAAAAPdn2mYtxvCrm9%2BaE8tKnN2qy%2BVI%3D5vwJOXxAPCslAncjT7C2JTWJzW9yUtWIAPIs9FABTqIFpB97n2";

let TwitteruserName
let AllAboutTweetsArray = [];


const getUserTweets = async (tweeterUserIdToPullTweets) => {

// this is the ID for @TwitterDev
const userId = tweeterUserIdToPullTweets;
const url = `https://api.twitter.com/2/users/${userId}/tweets`;


    let userTweets = [];
	

    let params = {


		'max_results': 10, //hasNextPage = false;  so that only max 95 tweets are pulled on first page 
        "expansions": "author_id",
		'tweet.fields':('author_id','created_at','id', 'lang', 'public_metrics' ),

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
        let resp = await getPage(params, options, nextToken,url);
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
	apiKey: "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",
	});
	const openai = new OpenAIApi(configuration);

		try {
			//clear the array first 
			AllAboutTweetsArray = []
			// console.log("length of tweets analysed is  "+AllAboutTweetsArray.length)

			for (i=0;i<userTweets.length;i++){ 

				let likesTOviewsRatio = ((userTweets[i].public_metrics.like_count/userTweets[i].public_metrics.impression_count)*100).toFixed(3);

				//filter out quote , retweets and replies
				let tweetType 
				if (userTweets[i].text.startsWith("RT @")){
					tweetType = "retweet"
				}
				else if (userTweets[i].text.startsWith("@")){
					tweetType = "reply"
				}
				// else if (userTweets[i].text.startsWith("“")){
				// 	tweetType = "quote" //does not work as quote tweets are not in the same format
				// }
				else {

					tweetType = "tweet"
				}
				
				let prompt;
				if (tweetType == "tweet"){

					

					if(likesTOviewsRatio >= 2){
						myanalysis = "Engagement is above average..";
						prompt = `Read this tweet then answer the following questions:\n\n\"\"\"\n${userTweets[i].text}\n\"\"\"\n\nQuestions:\n1. What topic do the tweets talk about?\n2. Who are mentioned in these tweets?\n3. Sentiment of tweets.\n\n`;
					}
					else if(likesTOviewsRatio >= 1){
						myanalysis = "Engagement is average.";
						prompt = `Read this tweet then answer the following questions:\n\n\"\"\"\n${userTweets[i].text}\n\"\"\"\n\nQuestions:\n1. What topic do the tweets talk about?\n2. Who are mentioned in these tweets?\n3. Sentiment of tweets.\n\n`;
					}
					else if(likesTOviewsRatio < 1){
						myanalysis = "Engagement is below average.";
						prompt = `Read this tweet then answer the following questions:\n\n\"\"\"\n${userTweets[i].text}\n\"\"\"\n\nQuestions:\n1. What topic do the tweets talk about?\n2. Who are mentioned in these tweets?\n3. Sentiment of tweets.\n\n`;
					}
					else{
						myanalysis = "Engagement is below average.";
						prompt = `Read this tweet then answer the following questions:\n\n\"\"\"\n${userTweets[i].text}\n\"\"\"\n\nQuestions:\n1. What topic do the tweets talk about?\n2. Who are mentioned in these tweets?\n3. Sentiment of tweets.\n\n`;
					}
					
				}
				// if (tweetType == "retweet"){
				// 	 prompt = userTweets[i].text + " What is sentiment of this tweet?";
				// 	 myanalysis = "it is retweet";
				// }
				// if (tweetType == "reply"){
				// 	 prompt = userTweets[i].text + " What is sentiment of this tweet?";
				// 	 myanalysis = " it is a reply";
				// }
				
					
				if (tweetType == "tweet"){

						console.log("run is "+ i);

						//analyse the tweet
						const analysetweet = await openai.createCompletion({
							"model": "text-curie-001",
							// "model": "text-davinci-003",
							"prompt": prompt,
							"temperature": 0.9,
							"max_tokens": 200,
							// "top_p": 1,
							"frequency_penalty": 0.37,
							"presence_penalty": 0,
							// "stop": ["\n\n"]
						});

						let tweetSentiment = (myanalysis + ". "+analysetweet.data.choices[0].text.trim())
						let promptfornewtweet = "This is a tweet " + userTweets[i].text + ". " + "And this is analysis on the tweet. " +analysetweet.data.choices[0].text.trim() + " Now write a new tweet based on the analysis. \n\n"

				//new tweet
						const newtweet = await openai.createCompletion({
							"model": "text-curie-001",
							// "model": "text-davinci-003",
							"prompt": promptfornewtweet,
							"temperature": 0.9,
							"max_tokens": 400,
							// "top_p": 1,
							"frequency_penalty": 0.37,
							"presence_penalty": 0,
							// "stop": ["\n\n"]
						});

						// add all data to array

						let allTweetDataobj = {
							tweet: userTweets[i].text,
							tweetType: tweetType,
							tweetID: `https://twitter.com/${userName}/status/${userTweets[i].id}`,
							retweet_count:userTweets[i].public_metrics.retweet_count,
							reply_count:userTweets[i].public_metrics.reply_count,
							like_count: userTweets[i].public_metrics.like_count,
							quote_count: userTweets[i].public_metrics.quote_count,
							impression_count : userTweets[i].public_metrics.impression_count,
							tweetSentiment:tweetSentiment,
							likesTOviewsRatio:likesTOviewsRatio,
							newtweet:newtweet.data.choices[0].text.trim(),
							TwitteruserFullName:TwitteruserFullName
						};

						AllAboutTweetsArray.push(allTweetDataobj);
						
				}
			}

			AllAboutTweetsArray.sort((a, b) => (a.likesTOviewsRatio > b.likesTOviewsRatio) ? -1 : 1)
			

		} catch (error) {
			console.log(error)
		}



}


const getPage = async (params, options, nextToken,url) => {
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
		console.log("error is -----------" +JSON.stringify(err))
        throw new Error(`Request failed: ${err}`);
		
    }
}










async function getTwitterUserId(tweeterUserHadleToPullTweets) {

	console.log(" gettin user id ")
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
		throw new Error('Unsuccessful request')
	}
}

	