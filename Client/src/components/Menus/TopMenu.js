import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from "react-router-dom";
import {backendUrl} from "../../config/api";
import {setComposerModal} from "../../actions/composer";

const TopMenu = ({setComposerModal}) => (
    <div className="navbar-uniclix">
        <a href={backendUrl} className="brand"><img src="/images/uniclix.png"/></a>

        <ul className="top-menu">
            <li><NavLink to="/twitter-booster" activeClassName="active" className="first-nav-item">Twitter Booster</NavLink></li> 
            <li><a href="#">Social media manager</a></li> 
        </ul>


        <div className="current-profile">
            <div className="current-profile-info">
                <p className="current-profile-name">Albert Feka</p>
                <p className="current-profile-email">email@email.com</p>
            </div>
            <div className="current-profile-avatar">
                <img src="/images/dummy_profile.png" />
            </div>
        </div>
    </div>
);

const mapDispatchToProps = (dispatch) => ({
    setComposerModal: (isOpen) => dispatch(setComposerModal(isOpen))
});

export default connect(undefined, mapDispatchToProps)(TopMenu);