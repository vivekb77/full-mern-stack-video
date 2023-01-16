
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const UserData = require('./models/user.model')
const TweetData = require('./models/tweet.model')
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
			Tweets: userTweetsArray,
			TwitteruserName:TwitteruserName,
			CreatedDate : new Date()
		}
		
		)
		console.log("added tweet data")
		return res.json({ status: 'ok', tweets: userTweetsArray  })

	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
})



const needle = require('needle');


const bearerToken = "AAAAAAAAAAAAAAAAAAAAAFzulAEAAAAAPdn2mYtxvCrm9%2BaE8tKnN2qy%2BVI%3D5vwJOXxAPCslAncjT7C2JTWJzW9yUtWIAPIs9FABTqIFpB97n2";

let TwitteruserName
let userTweetsArray = [];

const getUserTweets = async (tweeterUserIdToPullTweets) => {

// this is the ID for @TwitterDev
const userId = tweeterUserIdToPullTweets;
const url = `https://api.twitter.com/2/users/${userId}/tweets`;


    let userTweets = [];
	

    let params = {
        "max_results": 10,
        "tweet.fields": "created_at",
        "expansions": "author_id"
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
    console.log("Retrieving Tweets...");

    while (hasNextPage) {
        let resp = await getPage(params, options, nextToken,url);
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            userName = resp.includes.users[0].username;
            if (resp.data) {
                userTweets.push.apply(userTweets, resp.data);
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
	// console.log(userTweets[0].text);
	TwitteruserName = userName
	for (i=0;i<userTweets.length;i++){ 
		userTweetsArray.push(userTweets[i].text);

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
        throw new Error(`Request failed: ${err}`);
    }
}


// AI


let tweeterUserIdToAnalyse;
let userTweetsArrayforAI = [];
let AIanalysisArray;

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
		let prompt = userTweetsArrayforAI.toString().slice(600, 900) + "\n\nTl;dr";
		// console.log("prompt is "+prompt)

		const { Configuration, OpenAIApi } = require("openai");
		const configuration = new Configuration({
		apiKey: "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",
		});

		const openai = new OpenAIApi(configuration);
		const response = await openai.createCompletion({
		model: "text-davinci-003",
		prompt: prompt,
		temperature: 0.9,
		max_tokens: 1000,
		});
	 
		AIanalysisArray = response.data.choices[0].text.trim()
	
		//update DB with AI analysis
		await TweetData.updateOne(
			{ TwitteruserName: tweeterUserIdToAnalyse },
			{ $set: { AIAnalysis: AIanalysisArray } }
		)
		await TweetData.updateOne(
			{ TwitteruserName: tweeterUserIdToAnalyse },
			{ $set: { TotalTokensUsed: response.data.usage.total_tokens } }
		)
		await TweetData.updateOne(
			{ TwitteruserName: tweeterUserIdToAnalyse },
			{ $set: { PromptTokensUsed: response.data.usage.prompt_tokens } }
		)
		await TweetData.updateOne(
			{ TwitteruserName: tweeterUserIdToAnalyse },
			{ $set: { CompletionTokensUsed: response.data.usage.completion_tokens } }
		)


		return res.json({ status: 'ok', AItweets: AIanalysisArray  })

	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'Something went wrong' })
	}
})


