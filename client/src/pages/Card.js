import React from "react";


export default function Card(props) {


// if either likes or impressions are 0, then ratio is 0 otherwise ratio is likes/impressions
    let ratio = props.tweet.like_count>0 && props.tweet.impression_count>0 ? ((props.tweet.like_count/props.tweet.impression_count)*100).toFixed(2): 0 ;
    let ratio1 = props.tweet.reply_count>0 && props.tweet.impression_count>0 ? ((props.tweet.reply_count/props.tweet.impression_count)*100).toFixed(2): 0 ;
    let color = "#38761d";

    if(ratio>2){
        color = "#6aa84f";
    }
    if(ratio>=1 && ratio<2){
        color = "#cc6600";
    }
    if(ratio<1){
        color = "#ff0000";
    }


    return (
        <div className="card">
            <div className="card-body">

              {props.tweet && <h5 className="card-title"><span style={{color: `#808080`}}>Tweet - </span>{props.tweet.tweet}</h5>}
              {props.tweet && <hr/>}
              {props.tweet && <p className="card-text"><span style={{color: `${color}`}}>{ `Likes/Views - ${ratio}% | Replies/Views - ${ratio1}% `}</span> { ` | Views - ${props.tweet.impression_count} | Likes - ${props.tweet.like_count} | Replies - ${props.tweet.reply_count} | Retweets - ${props.tweet.retweet_count} | Q Tweets - ${props.tweet.quote_count}`}</p>}
               {props.tweet.tweetSentiment &&  <h6 className="card-text">{`New Tweet for you - ${props.tweet.tweetSentiment}`}</h6>}
               {/* {props.tweet.newtweet &&  <h6 className="card-text"><span style={{color: `#808080`}}>Tweet for you </span></h6>} */}
               {props.tweet.newtweet &&  <h6 className="card-text"><span style={{color: `#808080`}}>Tweet by AI - </span>{`  ${props.tweet.newtweet}`}</h6>}
               {props.tweet.newtweet && <button className="copybutton" onClick={() => {navigator.clipboard.writeText(props.tweet.newtweet);}}>Copy Tweet</button>}
               <br/>
               <br/>
               <br/>
               {props.tweet &&<a href={`${props.tweet.tweetID}`} target="_blank" rel="noreferrer">View this Tweet by {`${props.tweet.TwitteruserFullName} on Twitter`}</a>} 

            </div>
            {/* {ratio>1 &&  <h2 className='card-title'><a target="_blank" href="http://tweethunter.io/?via=vivek">BUILD & MONETIZE YOUR TWITTER AUDIENCE. FAST. Click here</a></h2>} */}
        </div>
    );
}

