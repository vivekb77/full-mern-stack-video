import React from "react";


export default function AdminCard(props) {



    return (
        <div className="admincard">
            <div className="admincard-body">

              {props.admin && <h5 className="card-text"><span style={{color: `#808080`}}>  </span>{props.admin}</h5>}
              

            </div>
        </div>
    );
}

