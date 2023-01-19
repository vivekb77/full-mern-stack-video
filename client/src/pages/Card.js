import React from "react";


export default function Card(props) {

    let ratio = ((props.tweet.like_count/props.tweet.impression_count)*100).toFixed(3);
    let ratio1 = ((props.tweet.reply_count/props.tweet.impression_count)*100).toFixed(3);
    let color = "#38761d";

    if(ratio>2){
        color = "#6aa84f";
    }
    if(ratio>1 && ratio<2){
        color = "#cc6600";
    }
    if(ratio<1){
        color = "#ff0000";
    }


    return (
        <div className="card">
            <div className="card-body">

              {props.tweet && <h5 className="card-title">{`Tweet - ${props.tweet.tweet}`}</h5>}
              {props.tweet &&   <p className="card-text"><span style={{color: `${color}`}}>{ `Likes/Views - ${ratio}% || Replies/Views - ${ratio1}% `}</span> { ` || Views - ${props.tweet.impression_count} || Likes - ${props.tweet.like_count} || Replies - ${props.tweet.reply_count} || Retweets - ${props.tweet.retweet_count} || Q Tweets - ${props.tweet.quote_count}`}</p>}
               {props.tweet &&  <h6 className="card-text">{`AI Analysis - ${props.tweet.tweetSentiment}`}</h6>}
               {props.tweet &&  <h6 className="card-text">{`New Tweet - ${props.tweet.newtweet}`}</h6>}
               {props.tweet &&<a href={`${props.tweet.tweetID}`} target="_blank" rel="noreferrer">View this Tweet on Twitter by {`${props.tweet.TwitteruserFullName}`}</a>} 

            </div>
        </div>
    );
}

