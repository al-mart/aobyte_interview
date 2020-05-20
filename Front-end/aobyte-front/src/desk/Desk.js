import React, {Component} from 'react';
import Ticket from "../ticket/Ticket";


class Desk extends Component {

    state = {
        tickets: []
    };

    makeRequest = (method, relUri) => {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(method, "http://192.168.5.211:5000" + relUri);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    };

    assignToMe = (id) => {
        this.makeRequest("PUT", `/ticket/${id}`).then(() => {
            this.fetchFromServer();
        })
    };

    deleteTicket = (id) => {
        this.makeRequest("DELETE", `/ticket/${id}`).then(() => {
            this.fetchFromServer();
        });
    };


    componentDidMount() {
        let id = this.props.showMenu - 1;
        this.props.socket.on("datachange", response => {
            let data = response.data[id].docs;
            this.setState({
               tickets: data
            });
        });
        this.fetchFromServer();
    }

    fetchFromServer = () => {
        fetch(`http://192.168.5.211:5000/tickets/${this.props.showMenu}`)
            .then(response => response.json())
            .then(data => this.setState({tickets: data}));
    };

    render() {
        return this.state.tickets.map((ticket, index) => {
            return (
                <Ticket
                    assign={() => {
                        this.assignToMe(ticket._id)
                    }}
                    delete={() => {
                        this.deleteTicket(ticket._id)
                    }}
                    taskNumber={ticket._id}
                    name={ticket.ticket}
                    isAssigned={ticket.isAssigned}
                    key={ticket._id}
                />
            );
        });
    }
}

export default Desk;
