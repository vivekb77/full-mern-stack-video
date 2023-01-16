import React, { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
// import { useHistory } from 'react-router-dom'

const AI = () => {
	// const history = useHistory()
	const [AItweets, setAITweets] = useState([])
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

	async function AI(event) {
		event.preventDefault()

		const req = await fetch('http://localhost:1337/api/ai', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token'),
			},
			body: JSON.stringify({
				tweeterUserIdToAnalyse: twitterUserID,
			}),
		})

		const data = await req.json()
		if (data.status === 'ok') {

			// for (let i=0;i<data.AItweets.length;i++){ 
            //     setAITweets(AItweets => [...AItweets, data.AItweets[i]]);

            
            //   }
			  setAITweets(AItweets => [...AItweets, data.AItweets]);  

        
            

		} else {
			alert(data.error)
		}
	}

	return (
		<div>
			
			<form onSubmit={AI}>
				<input
					type="text"
					placeholder="User id eg. @naval"
                   // value={settwitterUserID}
					onChange={(e) => settwitterUserID(e.target.value)}
				/>
				<input type="submit" value="Get analysis" />

			</form>
            <h1>Analysis: </h1>

           {AItweets.map((AItweet,index) => {
			
                return <ol><li key={ index }>{AItweet}</li></ol>

           })
            }
            

		</div>
	)
}

export default AI
