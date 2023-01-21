import React, { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
import { useHistory } from 'react-router-dom'
import Card from './Card'

const Tweets = () => {
	const history = useHistory()
	const [tweets, setTweets] = useState([])
	const [twitterUserID, settwitterUserID] = useState('')
	const [disable, setDisable] = React.useState(false);
	const [handle, setHandle] = React.useState();
	const [userName, setUserName] = React.useState();
	const [errormessage, setErrormessage] = React.useState();

	


	useEffect(() => {
		const token = localStorage.getItem('token')
		
		// https://mudit.hashnode.dev/5-things-you-should-know-about-useeffect
		if (token) {
			const user = jwt.decode(token)
			if (!user) {
				console.log('no user')
				localStorage.removeItem('token')
				history.replace('/login')
				
			} else {
				// populateQuote()do something //cleanup function
				// console.log('user is ', user)
			}
		}else{
			history.replace('/login')
		}

	},[])

	async function GetTweets(event) {
		event.preventDefault()
		setDisable(true);
		setTweets(tweets => []);
		setUserName(userName => "");
		setHandle(handle => "");
		setErrormessage(errormessage => "");

		const req = await fetch('http://localhost:1337/api/tweets', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token'),
			},
			body: JSON.stringify({
				tweeterUserHadleToPullTweets: twitterUserID,
			}),
			
		})

		const data = await req.json()
		if (data.status === 'ok') {
			// console.log('data is ', data.error)
			for (let i=0;i<data.tweets.length;i++){ 

				const obj = {
					tweetID: data.tweets[i].tweetID,
					tweet: data.tweets[i].tweet,
					tweetSentiment: data.tweets[i].tweetSentiment,
					impression_count: data.tweets[i].impression_count,
					like_count: data.tweets[i].like_count,
					reply_count: data.tweets[i].reply_count,
					quote_count: data.tweets[i].quote_count,
					retweet_count: data.tweets[i].retweet_count,
					newtweet: data.tweets[i].newtweet,
					TwitteruserFullName: data.tweets[i].TwitteruserFullName,
					
				}

				setTweets(prevArray => [...prevArray, obj])
				
				setHandle(handle => data.tweets[0].TwitteruserFullName);
				setUserName(userName => data.tweets[0].TwitteruserFullName);
				setDisable(false);
				
				
              }
		} 
		else if(data.status === 'error'){
			setDisable(false);
			setErrormessage(userName => data.error);
			// alert(data.error)
			
		}
	}

	const handleClick = event => {

		console.log('button disabled');
	  };

	return (
		<div className='tweetdiv'>
		<div className='header'>
			<h1 className='title'><a target="_blank" href="https://twitter.com/galaxz_AI">GALAXZ AI</a></h1>
			<h2 className='title'>Analyse user's Tweets, and write new Tweets in the same style</h2>
			 {/* <h5>We analyse what makes some Tweets viral? Based on the analysis, we suggest new tweets</h5> */}
			 {errormessage && <h4 className="errormessage">{`${errormessage}`}</h4>}

			 <h2><a target="_blank" href="/">See Examples here</a></h2>
			<form onSubmit={GetTweets}>
			{/* <h5>Enter a Twitter handle without @</h5> */}
				<input
					type="text"
					className='userIdTextBox'
					maxLength={70}
					required
					placeholder="Twitter User handle without @"
					onChange={(e) => settwitterUserID(e.target.value)}
				/>
				
				<input type="submit" className='button' value={disable ? `Analysing...` : `Get Analysis` } disabled={disable}/>
				
			</form>
			{disable && <h6>Analysis and new Tweet genaration may take few seconds..Please wait..</h6>}
			<br/>
			{disable && <h6><a href="mailto:learn@dictionaryv2.com">Send us feedback at learn@dictionaryv2.com</a></h6>}
			<br/>
				{/* <h4>Need a similar report (on 500 Tweets) for any Twitter account? <a href="mailto:learn@dictionaryv2.com">Email us at learn@dictionaryv2.com</a></h4> */}
			{/* {handle && <h6><a href="mailto:learn@dictionaryv2.com">Send us feedback at learn@dictionaryv2.com</a></h6>} */}
			{handle && <h4 className="card-title">{`@${handle} (${userName})`}</h4>}
			</div>
			{/* {handle && <h6>Sorted by Likes/Views%</h6>} */}

			{tweets.map((tweet,index) => {
				return <Card 
				tweet={tweet}  key={index}
				onChange={setTweets}
				/>
			})}
			

		</div>
	)
}

export default Tweets

