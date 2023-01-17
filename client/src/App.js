import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tweets from './pages/Tweets'
import AI from './pages/AI'
import Download from './pages/Download'

const App = () => {
	return (
		<div>
			<BrowserRouter>
				<Route path="/login" exact component={Login} />
				<Route path="/register" exact component={Register} />
				{/* <Route path="/dashboard" exact component={Dashboard} /> */}
				<Route path="/tweets" exact component={Tweets} />
				<Route path="/ai" exact component={AI} />
				<Route path="/download" exact component={Download} />
			</BrowserRouter>
		</div>
	)
}

export default App
