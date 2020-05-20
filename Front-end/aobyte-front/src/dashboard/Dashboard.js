import React from 'react';
import './Dashboard.css';


const Dashboard = (props) => {
    return (
        <div className="dashboard__section">
            <div className="dashboard__section-item" onClick={() =>{props.clicked(1)}}>
                My Tickets
            </div>
            <div className="dashboard__section-item" onClick={() =>{props.clicked(2)}} >
                Open Tickets
            </div>
        </div>
    );
};

export default Dashboard;
