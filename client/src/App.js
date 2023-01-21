import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Tweets from './pages/Tweets'
import Examples from './pages/Examples'


const App = () => {
	return (
		<div className='maindiv'>
			<BrowserRouter>
				<Route path="/login" exact component={Login} />
				<Route path="/register" exact component={Register} />
				<Route path="/tweets" exact component={Tweets} />
				<Route path="/" exact component={Examples} />
			</BrowserRouter>
		</div>
	)
}

export default App
