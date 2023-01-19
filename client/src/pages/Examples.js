import React, { useEffect, useState } from 'react'
// import jwt from 'jsonwebtoken'
import { useHistory } from 'react-router-dom'
import Card from './Card'

const Examples = () => {
	// const history = useHistory()
	const [tweets, setTweets] = useState([])
	// const [twitterUserID, settwitterUserID] = useState('')
	const [disable, setDisable] = React.useState(false);
	const [handle, setHandle] = React.useState();
	const [userName, setUserName] = React.useState();


	// useEffect(() => {
	// 	// const token = localStorage.getItem('token')
		
	// 	GetTweets();
	// 	// if (token) {
	// 	// 	const user = jwt.decode(token)
	// 	// 	if (!user) {
	// 	// 		console.log('no user')
	// 	// 		localStorage.removeItem('token')
	// 	// 		history.replace('/login')
				
	// 	// 	} else {
	// 	// 		// populateQuote()do something
	// 	// 		// console.log('user is ', user)
	// 	// 	}
	// 	// }else{
	// 	// 	history.replace('/login')
	// 	// }

	// }), []

	async function GetTweets(event) {
		event.preventDefault()
		setDisable(true);
		setTweets(tweets => []);
		setHandle(handle => "");
		setUserName(userName => "");

		const req = await fetch('http://localhost:1337/api/examples', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token'),
			},
			body: JSON.stringify({
				// tweeterUserHadleToPullTweets: twitterUserID,
			}),
			
		})

		const data = await req.json()
		if (data.status === 'ok') {

			for (let i=0;i<data.tweets.AllAboutTweetsArray.length;i++){ 

				const obj = {
					tweetID: data.tweets.AllAboutTweetsArray[i].tweetID,
					tweet: data.tweets.AllAboutTweetsArray[i].tweet,
					tweetSentiment: data.tweets.AllAboutTweetsArray[i].tweetSentiment,
					impression_count: data.tweets.AllAboutTweetsArray[i].impression_count,
					like_count: data.tweets.AllAboutTweetsArray[i].like_count,
					reply_count: data.tweets.AllAboutTweetsArray[i].reply_count,
					quote_count: data.tweets.AllAboutTweetsArray[i].quote_count,
					retweet_count: data.tweets.AllAboutTweetsArray[i].retweet_count,
					newtweet: data.tweets.AllAboutTweetsArray[i].newtweet,
					// TwitteruserFullName: data.tweets.AllAboutTweetsArray[0].TwitteruserFullName,
					TwitteruserName: data.tweets.TwitteruserName,
					
				}

				setTweets(prevArray => [...prevArray, obj])
				
				setHandle(handle => data.tweets.TwitteruserName);
				setUserName(userName => data.tweets.AllAboutTweetsArray[0].TwitteruserFullName);
				setDisable(false);
				
				
              }
		} 
		else if(data.status === 'error'){
			setDisable(false);
			alert(data.error)
			
		}
	}

	const handleClick = event => {

		console.log('button disabled');
	  };

	return (
		<div className='tweetdiv'>
			<br/>
			 <h1>GalaxzAI - Get analysis of Tweets for any Twitter user </h1>
			 {/* <h1>Tweets Analytics by AI</h1> */}
			 <h5>Why some tweets go viral and some don't. We break down that and suggest new tweets based on the analysis</h5>

			<form onSubmit={GetTweets}>
			{/* <h5>Enter Twitter user handle without @, case sensitive</h5>
				<input
					type="text"
					className='userIdTextBox'
					maxLength={70}
					required
					placeholder="Twitter User handle without @, case sensitive"
					onChange={(e) => settwitterUserID(e.target.value)}
				/> */}

				<h2>Keep clicking to get analysis of different Twitter accounts</h2>
				<input type="submit" className='button' value={disable ? `InProgress...` : `Get Analysis` } disabled={disable}/>



			</form>
           
			<h4>Want a same report for any user of their last 3000 tweets , <a href="mailto:learn@dictionaryv2.com">Email us at learn@dictionaryv2.com</a></h4>
			
			<h2><a href="/tweets">Analyse your Twitter account</a></h2>
			{handle && <h4 className="card-title">{`Tweet Analysis for - @${handle} (${userName})`}</h4>}
			
			<h6>Sorted by Likes/Views%</h6>

			{tweets.map((tweet,index) => {
				return <Card 
				tweet={tweet}  key={index}
				onChange={setTweets}
				/>
			})}
			

		</div>
	)
}

export default Examples

