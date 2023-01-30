import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
// import Login from './pages/Login'
// import Register from './pages/Register'
import Tweets from './pages/Tweets'
import AITweets from './pages/AITweets'
import Curate from './pages/Curate'
import Examples from './pages/Examples'
import Admin from './pages/Admin'

import ReactGA from 'react-ga';
const MEASUREMENT_ID = "G-N2T7DHCCBJ"; // YOUR_OWN_TRACKING_ID
const TRACKIING_ID = "UA-250139782-1";
ReactGA.initialize(TRACKIING_ID);



const App = () => {
	return (
		<div className='maindiv'>
			<BrowserRouter>
				{/* <Route path="/login" exact component={Login} /> */}
				{/* <Route path="/register" exact component={Register} /> */}
				<Route path="/tweets" exact component={Tweets} />
				<Route path="/" exact component={AITweets} />
				<Route path="/curate" exact component={Curate} />

				{/* <Route path="/admin" exact component={Admin} /> */}
				{/* <Route path="/examples" exact component={Examples} /> */}
			</BrowserRouter>
		</div>
	)
}

export default App