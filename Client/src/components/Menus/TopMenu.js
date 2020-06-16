import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from "react-router-dom";
import { backendUrl } from "../../config/api";
import { setComposerModal } from "../../actions/composer";
import { startLogout } from "../../actions/auth";
import { withRouter } from "react-router";

const calcTrialDays = (user) => {
    let msDiff = new Date(user.trial_ends_at).getTime() - new Date().getTime();    //Future date - current date
    var daysToTheEnd = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    return daysToTheEnd >= 0 ? daysToTheEnd + 1 : 0
}

const TopMenu = ({ logout, profile, props }) => (
    <div className="navbar-wrap">
        <div className="navbar-uniclix">
            <a href={backendUrl} className="brand"><img src="/images/uniclix.png" /></a>
            <ul className="top-menu">
                <li>
                    <NavLink to="/twitter-booster" activeClassName="active" className="first-nav-item">Twitter Booster</NavLink>
                </li>
                <li><a href="https://web.uniclixapp.com/" target="_blank">Social media manager</a></li>
            </ul>

            <div className="right-top-nav">
                <div className="current-profile">
                    {typeof profile !== 'undefined' && typeof profile.user !== 'undefined' && <div className="current-profile-info">
                        <p className="current-profile-name">{profile.user.name}</p>
                        <p className="current-profile-email">{profile.user.email}</p>
                    </div>}
                    <div className="current-profile-avatar">
                        <img src="/images/dummy_profile.png" />
                    </div>
                </div>
                <ul className="current-profile-links">
                    <li>
                        <NavLink to="/settings" activeClassName="active" className="first-nav-item">
                            <i className={`fa fa-cog `}></i> Settings</NavLink>
                    </li>
                    <li>
                        <a className="link-cursor first-nav-item" onClick={logout}>
                            <i className={`fa fa-sign-out-alt`}></i> Logout</a>
                    </li>
                </ul>
            </div>
        </div>
        {!!profile.subscription ?
            (!profile.subscription.activeSubscription &&
                <div className="top-alert"><span>You have {calcTrialDays(profile.user)} days remaining on your Twitter Booster trial.</span>
                    Add your billing information now to start your subscription.
         <button className="btn-text-pink" onClick={() => props.history.push('/twitter-booster/manage-accounts')}>
                        {calcTrialDays(profile.user) > 0 ? 'Start subscription' : "Upgrade Account"}
             </button>
                </div>
            ) : ""
        }
    </div>
);
const mapStateToProps = (state, props) => {
    const profile = state.profile
    return {
        profile,
        props
    };
};

const mapDispatchToProps = (dispatch) => ({
    setComposerModal: (isOpen) => dispatch(setComposerModal(isOpen)),
    logout: () => dispatch(startLogout())
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopMenu));