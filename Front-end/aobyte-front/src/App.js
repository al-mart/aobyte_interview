import React, {Component} from 'react';
import './App.css';
import Dashboard from "./dashboard/Dashboard";
import SocketIOClient from  "socket.io-client"
import Desk from "./desk/Desk";

const ENDPOINT = "http://192.168.5.211:5000"

class App extends Component {

    socket = SocketIOClient(ENDPOINT);

    state = {
        showMenu: 1,
    };

    toggleMenu = (menuId) => {
        this.setState({
            showMenu: menuId,
        })
    };

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    AoByte Ticket Application
                </header>
                <Dashboard clicked={this.toggleMenu}/>
                {
                    this.state.showMenu === 1 ?
                    <Desk showMenu={1}
                            socket={this.socket}/> : null
                }
                {
                    this.state.showMenu === 2 ?
                        <Desk showMenu={2}
                              socket={this.socket}/> : null
                }
            </div>
        );
    }
}

export default App;
