import React, { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
import { useHistory } from 'react-router-dom'
import Card from './Card'
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';
import AdminCard from './AdminCard'
require('dotenv').config();


const baseURL = process.env.REACT_APP_BASE_URL

const Curate = () => {
	const history = useHistory()
	const [tweets, setTweets] = useState([])
	const [twitterUserID, settwitterUserID] = useState('')
	const [disable, setDisable] = React.useState(false);
	const [handle, setHandle] = React.useState();
	const [userName, setUserName] = React.useState();
	const [errormessage, setErrormessage] = React.useState();
	const [admin, setAdmin] = useState([])
	const [disable1, setDisable1] = React.useState(false);

	// },[])
	useEffect(() => {
		Admin();
		const params = new URLSearchParams()
		if (handle) {
		  params.append("h", handle)
		} else {
		  params.delete("h")
		}
		history.push({search: params.toString()})
	  }, [handle, history])

	async function Admin(event) {
		
		// setAdmin(admin => []);
		// setDisable1(false);

		const req = await fetch(`${baseURL}/api/admin`, {

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

			setAdmin(admin => []); //clear them first

		for (let i=0;i<data.AdminArray.length;i++){ 
		
			setAdmin(prevArray => [...prevArray, data.AdminArray[i]])

		}
		setDisable1(true);
	} }   

	async function GetTweets(event) {
		event.preventDefault()
		setDisable(true);
		setTweets(tweets => []);
		setUserName(userName => "");
		setHandle(handle => "");
		setErrormessage(errormessage => "");

		const req = await fetch(`${baseURL}/api/curate`, {

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
			// console.log('data is ', data)
			for (let i=0;i<data.tweets.length;i++){ 

				const obj = {
					dbid:data.tweets[i]._id,
					tweetID: data.tweets[i].tweetID,
					tweet: data.tweets[i].tweet,
					TwitteruserFullName: data.tweets[i].TwitteruserFullName,
					TwitteruserName: data.tweets[i].TwitteruserName,
					impression_count: data.tweets[i].impression_count,
					like_count: data.tweets[i].like_count,
					reply_count: data.tweets[i].reply_count,
					quote_count: data.tweets[i].quote_count,
					retweet_count: data.tweets[i].retweet_count,
					tag: data.tweets[i].tag,
					CreatedDate: data.tweets[i].CreatedDate,

					
					
				}

				setTweets(prevArray => [...prevArray, obj])
				
				setHandle(handle => data.tweets[0].TwitteruserName);
				setUserName(userName => data.tweets[0].TwitteruserFullName);
				setDisable(false);	
				
              }
			  ReactGA.event({
				category: 'Curate',
				action: 'Curate page used'
			  });
		} 
		else if(data.status === 'error'){
			setDisable(false);
			setErrormessage(userName => data.error);
			ReactGA.exception({
				description: 'An error ocurred on Tweets page',
				fatal: true
			  });
		}
	}
	const chooseHandle = (twitterUserID) => {
		settwitterUserID(twitterUserID); // id passed back from chile component
	  };

	return (
		<div className='tweetdiv'>
		<div className='header'>
			<h1 className='maintitle'>GALAXZ AI - ADMIN CURATE</h1>
			{/* <h2 className='mainsubtitle'>Analyse user's last few Tweets, and write new Tweets in the same style</h2> */}
			 {errormessage && <h4 className="errormessage">{`${errormessage}`}</h4>}

			 <h2 className='mainsubtitle'><a href="/tweets">Pull Tweets here</a></h2>
			 
			 {!disable1 && <h6>Pulling Twitter users...Please wait..</h6>}

			 <div className='admincardmain'>
			 {admin.map((admin,index,) => {
				return <AdminCard 
				admin={admin}  key={index} chooseHandle={chooseHandle}
				// onChange={setAdmin}
				/>
			})}
			</div>
			
			<form onSubmit={GetTweets}>
				<input
					type="text"
					className='userIdTextBox'
					maxLength={70}
					// required
					placeholder="Twitter User handle without @"
					onChange={(e) => settwitterUserID(e.target.value)}
				/>
				
				<input type="submit" className='button' value={disable ? `Analysing...` : `Get Analysis` } disabled={disable}/>
				
			</form>
			{disable && <h6>Analysis and new Tweet genaration may take few seconds..Please wait..</h6>}
			<br/>
			{disable && <h5><a href="mailto:learn@dictionaryv2.com">Send us feedback at learn@dictionaryv2.com</a></h5>}
			<br/>
				{/* <h4>Need a similar report (on 500 Tweets) for any Twitter account? <a href="mailto:learn@dictionaryv2.com">Email us at learn@dictionaryv2.com</a></h4> */}
			{/* {handle && <h6><a href="mailto:learn@dictionaryv2.com">Send us feedback at learn@dictionaryv2.com</a></h6>} */}
			{handle && <h4 className="mainsubtitle">{`@${handle} (${userName})`}</h4>}
			</div>
			{/* {handle && <h6>Sorted by Likes/Views%</h6>} */}

			{tweets.map((tweet,index) => {
				return <Card 
				tweet={tweet}  key={index}
				onChange={setTweets}
				/>
			})}
			{handle &&  <h4 className='mainsubtitleads'><a target="_blank" href="mailto:learn@dictionaryv2.com">We CREATE a custom AI model on your/any account's Tweets, to generate high quality Tweets like you/them. Click to send us email</a></h4>}
			{handle &&  <h2 className='mainsubtitleads'><a target="_blank" href="http://tweethunter.io/?via=vivek">To BUILD & MONETIZE YOUR TWITTER AUDIENCE... FAST. Click here.</a></h2>}
			{handle &&  <h2 className='mainsubtitleads'><a target="_blank" href="https://twitter.com/galaxz_AI">Follow us on Twitter</a></h2>}
		
		<Helmet>
          {handle && <title>{`GALAXZAI @${handle}`}</title>}
		  <meta charSet="utf-8" />
		</Helmet>

		</div>
	)
}

export default Curate
