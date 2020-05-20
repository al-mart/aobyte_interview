import React from 'react';
import './Ticket.css';

function Ticket(props) {
    return (
        <div className="ticket">
            <div>{props.taskNumber}</div>
            <div>{props.name}</div>
            {
                props.isAssigned ?
                    <div className=" button__all delete" onClick={props.delete}>Delete Ticket</div> :
                    <div className=" button__all assign" onClick={props.assign}>Assign To Me</div>
            }
        </div>
    );
}

export default Ticket;
