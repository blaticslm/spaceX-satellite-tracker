import React, {Component} from 'react';
import logo from "../assets/images/starlink_logo.svg";

class Header extends Component {
    render() {
        return (
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p className="title">
                    StartLink Tracker
                </p>

            </header>
        );
    }
}

export default Header;