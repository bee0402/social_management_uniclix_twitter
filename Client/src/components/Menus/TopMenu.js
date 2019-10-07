import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from "react-router-dom";
import {backendUrl} from "../../config/api";
import {setComposerModal} from "../../actions/composer";

const TopMenu = ({setComposerModal, profile}) => (
    <div>
        <div className="navbar-uniclix">
            <a href={backendUrl} className="brand"><img src="/images/uniclix.png"/></a>

            <ul className="top-menu">
                <li><NavLink to="/twitter-booster" activeClassName="active" className="first-nav-item">Twitter Booster</NavLink></li> 
                <li><a href="#">Social media manager</a></li> 
            </ul>


            <div className="current-profile">
                <div className="current-profile-info">
                    <p className="current-profile-name">{profile.user.name}</p>
                    <p className="current-profile-email">{profile.user.email}</p>
                </div>
                <div className="current-profile-avatar">
                    <img src="/images/dummy_profile.png" />
                </div>
            </div>
        </div>

        <div className="top-alert"><span>You have 3 days remaining on your Twitter Booster trial.</span> Add your billing information now to start your subscription. <button className="btn-text-pink">Start subscription</button></div>
    </div>

);

const mapStateToProps = (state) => {
    const profile = state.profile
    return {
        profile
    };
};

const mapDispatchToProps = (dispatch) => ({
    setComposerModal: (isOpen) => dispatch(setComposerModal(isOpen))
});

export default connect(mapStateToProps, mapDispatchToProps)(TopMenu);