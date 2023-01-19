import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
// import Dashboard from './pages/Dashboard'
import Tweets from './pages/Tweets'
import Examples from './pages/Examples'
// import AI from './pages/AI'
// import Download from './pages/Download'
// import DownloadTweets from './pages/DownloadTweets'

const App = () => {
	return (
		<div className='maindiv'>
			<BrowserRouter>
				<Route path="/login" exact component={Login} />
				<Route path="/register" exact component={Register} />
				{/* <Route path="/dashboard" exact component={Dashboard} /> */}
				<Route path="/tweets" exact component={Tweets} />
				<Route path="/" exact component={Examples} />
				{/* <Route path="/ai" exact component={AI} />
				<Route path="/download" exact component={Download} />
				<Route path="/downloadtweets" exact component={DownloadTweets} /> */}
			</BrowserRouter>
		</div>
	)
}

export default App
