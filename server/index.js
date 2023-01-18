
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const UserData = require('./models/user.model')
const TweetData = require('./models/tweet.model')
const AllTweetData = require('./models/alltweet.model')
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












app.post('/api/tweets', async (req, res) => {
	const token = req.headers['x-access-token']

	let tweeterUserIdToPullTweets = req.body.tweeterUserIdToPullTweets;

	await getUserTweets(tweeterUserIdToPullTweets);

	try {
		
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email

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

	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
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


		'max_results': 30, //hasNextPage = false;  so that only max 95 tweets are pulled on first page 
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

	
	TwitteruserName = userName
	const { Configuration, OpenAIApi } = require("openai");
		
	const configuration = new Configuration({
	apiKey: "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",
	});
	const openai = new OpenAIApi(configuration);


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
				myanalysis = "Engagement is above average, here are some reasons and a similar tweet you can post for high engagement rate.  ";
				prompt = userTweets[i].text + "Engagement is above average, Brainstorm the reasons why this tweet was so popular? Generate a similar tweet to post for high engagement rate.";
			}
			else if(likesTOviewsRatio >= 1){
				myanalysis = "Engagement is average, here are some reasons and a better tweet you can post for high engagement rate.";
				prompt = userTweets[i].text +"Engagement is average, Brainstorm the reasons why this tweet was not so popular? Generate a better tweet to post for high engagement rate.";
			}
			else if(likesTOviewsRatio < 1){
				myanalysis = "Engagement is below average, here are some reasons and a better tweet you can post for high engagement rate.  ";
				prompt = userTweets[i].text + "Engagement is below average, Brainstorm the reasons why this tweet performed poor? Generate a different tweet to post for high engagement rate.";
			}
			else{
				myanalysis =  "Engagement is below average, here are some reasons and a better tweet you can post for high engagement rate.  ";
				prompt = userTweets[i].text + "Engagement is below average, Brainstorm the reasons why this tweet performed poor? Generate a different tweet to post for high engagement rate.";
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
		
				//call AI
		if (tweetType == "tweet"){

				console.log("run is "+ i);

				const response = await openai.createCompletion({
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

				let tweetSentiment = (myanalysis + ". "+response.data.choices[0].text.trim())


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
					likesTOviewsRatio:likesTOviewsRatio
				};

				AllAboutTweetsArray.push(allTweetDataobj);
				
		}
	}

	AllAboutTweetsArray.sort((a, b) => (a.likesTOviewsRatio > b.likesTOviewsRatio) ? -1 : 1)

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
































// AI


let tweeterUserIdToAnalyse;
let userTweetsArrayforAI = [];
let AIanalysisArray= [];
let TotalTokensUsed =0 ;
let PromptTokensUsed = 0;
let CompletionTokensUsed = 0;

app.post('/api/ai', async (req, res) => {
	const token = req.headers['x-access-token']

	tweeterUserIdToAnalyse = req.body.tweeterUserIdToAnalyse;

	try {

		//get tweets from DB for the user
		const TwiterUser =  await TweetData.findOne({
			TwitteruserName: tweeterUserIdToAnalyse,
		})

		for (i=0;i<TwiterUser.Tweets.length;i++){ 
			userTweetsArrayforAI.push(TwiterUser.Tweets[i]);

		}

		//open ai call
		console.log("totals runs will be  -- "+userTweetsArrayforAI.toString().length/5000)

	let slicedata = 0;

	// for (let i = 0; i < userTweetsArrayforAI.toString().length/5000; i++)
	for (let i = 0; i < 4; i++)
	{
		console.log("run is "+i)
		// console.log("slicedata is "+slicedata)

		let prompttext = userTweetsArrayforAI.toString().slice(slicedata, slicedata+4900);
		// let prompt: `What are the key points from this text:\n\n\"\"\"\n${prompttext}\n\"\"\"\n\nThe key points are:`,
		// console.log("prompt is "+prompt)

		finalprompt = `Read these tweets then answer the following questions:\n\n\"\"\"\n${prompttext}\n\"\"\"\n\nQuestions:\n1. What topic do the tweets talk about?\n2. Who are mentioned in these tweets?\n3. Pull all hashtags in these tweets.\n4. Sentiment of tweets.\n\nAnswers:\n1.`;

		const { Configuration, OpenAIApi } = require("openai");
		
		const configuration = new Configuration({
		apiKey: "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",
		});

	
		const openai = new OpenAIApi(configuration);

		const response = await openai.createCompletion({
			"model": "text-curie-001",
			"prompt": finalprompt,
			"temperature": 0.9,
			"max_tokens": 200,
			"top_p": 1,
			"frequency_penalty": 0.37,
			"presence_penalty": 0,
			"stop": ["\n\n"]
		});

		AIanalysisArray.push(response.data.choices[0].text.trim())

		TotalTokensUsed = TotalTokensUsed + response.data.usage.total_tokens;
		PromptTokensUsed = PromptTokensUsed + response.data.usage.prompt_tokens;
		CompletionTokensUsed = CompletionTokensUsed + response.data.usage.completion_tokens;
		// console.log("comp tokens "+CompletionTokensUsed)
		slicedata = slicedata+4900;
		


	}
	
		//update DB with AI analysis
		await TweetData.updateOne(
			{ TwitteruserName: tweeterUserIdToAnalyse },
			{ $set: { AIAnalysis: AIanalysisArray } }
		)
		await TweetData.updateOne(
			{ TwitteruserName: tweeterUserIdToAnalyse },
			{ $set: { TotalTokensUsed: TotalTokensUsed.toString()} }
		)
		await TweetData.updateOne(
			{ TwitteruserName: tweeterUserIdToAnalyse },
			{ $set: { PromptTokensUsed: PromptTokensUsed.toString() } }
		)
		await TweetData.updateOne(
			{ TwitteruserName: tweeterUserIdToAnalyse },
			{ $set: { CompletionTokensUsed: CompletionTokensUsed.toString() } }
		)


		return res.json({ status: 'ok', AItweets: AIanalysisArray })

	} catch (error) {
		console.log(JSON.stringify(error))
		res.json({ status: 'error', error: 'Something went wrong' })
	}
})



app.post('/api/download', async (req, res) => {
	const token = req.headers['x-access-token']

	dataToDownload = [];
	
	tweeterUserIdToDownlaod = req.body.tweeterUserIdToAnalyse;

	try {

		//get tweets from DB for the user
		const TwiterUserData =  await TweetData.findOne({
			TwitteruserName: tweeterUserIdToDownlaod,
		})

		for (i=0;i<TwiterUserData.AIAnalysis.length;i++){ 
			dataToDownload.push(TwiterUserData.AIAnalysis[i]);

		}

		return res.json({ status: 'ok', AItweets: dataToDownload })

	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'Something went wrong' })
	}
})


app.post('/api/downloadtweets1111', async (req, res) => {
	const token = req.headers['x-access-token']

	dataToDownload = [];
	
	tweeterUserIdToDownlaod = req.body.tweeterUserIdToAnalyse;

	try {

		//get tweets from DB for the user
		const TwiterUserData =  await TweetData.findOne({
			TwitteruserName: tweeterUserIdToDownlaod,
		})

		for (i=0;i<TwiterUserData.Tweets.length;i++){ 
			dataToDownload.push(TwiterUserData.Tweets[i]);

		}


		return res.json({ status: 'ok', Usertweets: dataToDownload })

	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'Something went wrong' })
	}
})






// this is 

// a 

// new 

// use case
//https://developer.twitter.com/en/docs/twitter-api/tweets/search/integrate/build-a-query#boolean
// https://developer.twitter.com/en/docs/twitter-api/enterprise/rules-and-filtering/operators-by-product


app.post('/api/downloadtweets', async (req, res) => {
	
	let tweeterUserIdToAnalyse = req.body.tweeterUserIdToAnalyse;
	console.log(tweeterUserIdToAnalyse);
	
	const token = 'AAAAAAAAAAAAAAAAAAAAAFzulAEAAAAAPdn2mYtxvCrm9%2BaE8tKnN2qy%2BVI%3D5vwJOXxAPCslAncjT7C2JTWJzW9yUtWIAPIs9FABTqIFpB97n2';

	const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";
	
	try {
		
	async function getRequest() {
	
		//“Twitter API”, in "" will do exact search 
		// -wordhere will not include word in the search
		// has:media has:images has:links has:videos
		// place:"new york city" OR place:seattle
		// place_country:US OR place_country:MX OR place_country:CA
		// from:twitteruser -has:hashtags
		//followers_count:500 tweets_count:1000  following_count:500
	
		
		const params = {
			// 'query': ' "openai" -is:retweet -is:quote is:reply lang:en ',
			'query': 'from:TestEraAI -is:retweet -is:quote is:reply lang:en ',
			'max_results': 0,
			// 'start_time': '2023-01-11T00:00:00Z',
			// 'end_time': '2023-01-15T00:00:00Z',
			'tweet.fields':('author_id','created_at','id', 'lang', 'public_metrics' )
			
		}
	
		const res = await needle('get', endpointUrl, params, {
			headers: {
				"User-Agent": "v2RecentSearchJS",
				"authorization": `Bearer ${token}`
			}
		})
	
		if (res.body) {
			return res.body;
			
		} else {
			throw new Error('Unsuccessful request');
		}
	}
	


	(async () => {
	
		try {
			// Make request
			const response111 = await getRequest();
			console.log("dfsdsfds-----"+JSON.stringify(response111));

				for (i=0;i<response111.data.length;i++){ 
					// if(response111.data[i].public_metrics.impression_count>1000)
					// {
				
						await AllTweetData.create({
								TweetText: response111.data[i].text,
								TweetId: response111.data[i].id,
								retweet_count: response111.data[i].public_metrics.retweet_count,
								reply_count:response111.data[i].public_metrics.reply_count,
								like_count:response111.data[i].public_metrics.like_count,
								quote_count:response111.data[i].public_metrics.quote_count,
								impression_count:response111.data[i].public_metrics.impression_count,
							
						})
					// }
				}
				console.log("tweets with likes and all added to DB")

		} catch (e) {
			console.log("error is "+e);
			process.exit(-1);
		}
		
		process.exit();
		
	})();
	
	}
	
	catch (err) {
			res.json({ status: 'error', error: 'error occured line 398' })
			console.log("error is  ---" +err)
		}
	
})






