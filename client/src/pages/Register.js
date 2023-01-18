import { useState } from 'react'
import { useHistory } from 'react-router-dom'

function App() {
	const history = useHistory()

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	//this funtion is communicating with backend
	async function registerUser(event) {
		event.preventDefault() // to prevent page refresh on submit as form is inside div

		//this funtion is communicating with backend
		//server folder , index.js file has this route /api/register
		const response = await fetch('http://localhost:1337/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name,
				email,
				password,
			}),
		})

		const data = await response.json() //response from server will be ok or error

		if (data.status === 'ok') {
			history.push('/login') // if response is ok then redirect to login page
		}
	}

	return (
		<div className='registerdiv'>
			<h1>TweetEra Register</h1>
			<form className='registerform' onSubmit={registerUser}>
				<input className='registerinput'
					value={name}
					onChange={(e) => setName(e.target.value)}
					type="text"
					placeholder="Name"
				/>
				<br />
				<input className='registerinput'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type="email"
					placeholder="Email"
				/>
				<br />
				<input className='registerinput'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					placeholder="Password"
				/>
				<br />
				<input className='registerbutton' type="submit" value="Register" />
				<a rel="noopener noreferrer" href="login">Already a User! Login</a>
			</form>
		</div>
	)
}

export default App
