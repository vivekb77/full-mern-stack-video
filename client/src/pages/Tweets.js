import React, { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
// import { useHistory } from 'react-router-dom'

const Tweets = () => {
	// const history = useHistory()
	const [tweets, setTweets] = useState([])
	const [twitterUserID, settwitterUserID] = useState('')


	// async function populateQuote() {
	// 	const req = await fetch('http://localhost:1337/api/gettweets', {
	// 		headers: {
	// 			'x-access-token': localStorage.getItem('token'),
	// 		},
	// 	})

	// 	const data = await req.json()
	// 	if (data.status === 'ok') {
	// 		setQuote(data.quote)
	// 	} else {
	// 		alert(data.error)
	// 	}
	// }

	// useEffect(() => {
	// 	const token = localStorage.getItem('token')
	// 	if (token) {
	// 		const user = jwt.decode(token)
	// 		if (!user) {
	// 			localStorage.removeItem('token')
	// 			window.location.replace('/login')
	// 		} else {
	// 			populateQuote()
	// 		}
	// 	}
	// }, [])

	async function GetTweets(event) {
		event.preventDefault()

		const req = await fetch('http://localhost:1337/api/tweets', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token'),
			},
			body: JSON.stringify({
				tweeterUserIdToPullTweets: twitterUserID,
			}),
		})

		const data = await req.json()
		if (data.status === 'ok') {
			for (let i=0;i<data.tweets.length;i++){ 
                setTweets(tweets => [...tweets, data.tweets[i]]);
            
              }
              console.log("length is "+data.tweets.length);

        
            

		} else {
			alert(data.error)
		}
	}

	return (
		<div>
			
			<form onSubmit={GetTweets}>
				<input
					type="text"
					placeholder="User id eg. @naval"
                   // value={settwitterUserID}
					onChange={(e) => settwitterUserID(e.target.value)}
				/>
				<input type="submit" value="Get analysis" />

			</form>
            <h1>Tweets: </h1>

           {tweets.map((tweet,index) => {
                return <ol><li key={ index }>{tweet}</li></ol>
                
           })
            }
            

		</div>
	)
}

export default Tweets
