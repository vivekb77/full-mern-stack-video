import React, { useEffect, useState } from 'react'
// import jwt from 'jsonwebtoken'
import { useHistory } from 'react-router-dom'
import Card from './Card'
import NavBar from './Navbar'
require('dotenv').config();

const baseURL = process.env.REACT_APP_BASE_URL


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
		
		
		

		const req = await fetch(`${baseURL}/api/examples`, {
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

				setTweets(tweets => []); //clear them first
				setUserName(userName => "");
				setHandle(handle => "");

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
					TwitteruserFullName: data.tweets.AllAboutTweetsArray[i].TwitteruserFullName,
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

	

	return (
		
		<div className='tweetdiv'>
			{/* <NavBar sticky="top" /> */}
		<div className='header'>
			<br/>
			<h1 className='title'><a target="_blank" href="https://twitter.com/galaxz_AI">GALAXZ AI</a></h1>
			<h2 className='title'>Analyse user's last few Tweets, and write new Tweets in the same style</h2>
			 {/* <h5>We analyse what makes some Tweets viral? Based on the analysis, we suggest new tweets</h5> */}

			<form onSubmit={GetTweets}>
		
				
				<input type="submit" className='button' value={disable ? `      Analysing...      ` : ` Show me Examples ` } disabled={disable}/>
				
			</form>

			{handle && <h6>Click again to see another example</h6>}
			{/* {!handle && <h6>Please wait..</h6>} */}
			{/* <h4>Need a similar report (on 500 Tweets) for any Twitter account? <a href="mailto:learn@dictionaryv2.com">Email us at learn@dictionaryv2.com</a></h4> */}
			
			<h2 className='title1'><a target="_blank" href="/tweets">Analyse other Twitter accounts here</a></h2>
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

export default Examples

