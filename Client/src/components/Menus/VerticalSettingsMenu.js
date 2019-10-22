import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from "react-router-dom";
import { startLogout } from "../../actions/auth";

const VerticalSettingsMenu = ({ menuItems, logout, channels, selectedChannel, selectChannel }) => {
    return (
        <div>
            <aside className="vertical-menu">
                <ProfileInfo selectedChannel={selectedChannel} channels={channels} selectChannel={selectChannel} />
                <MenuItems menuItems={menuItems} />
                <SupportSection logout={logout} />
            </aside>
        </div>
    );
};

class ProfileInfo extends React.Component {
    state = {
        channelMenu: false
    }

    toggleDropdown = () => {
        this.setState(() => ({
            channelMenu: !this.state.channelMenu
        }));
    }

    render() {
        const { selectedChannel, channels, selectChannel } = this.props;

        return (
            <div>
                <div className="profile-info" onClick={this.toggleDropdown}>
                    <span className="pull-left profile-img-container">
                        <img onError={(e) => e.target.src = '/images/dummy_profile.png'} src={selectedChannel.avatar} />
                        <i className={`fab fa-${selectedChannel.type} ${selectedChannel.type}_bg smallIcon`}></i>
                    </span>
                    <div>
                        <p className="profile-username">{!!selectedChannel.username && `@${selectedChannel.username}`}</p>
                    </div>
                </div>

                <ProfileSelectionDropDown
                    channels={channels}
                    selectChannel={selectChannel}
                    isOpen={this.state.channelMenu}
                />
            </div>

        );
    }
}

const ProfileSelectionDropDown = ({ channels, selectChannel, isOpen }) => (
    <div className={`channel-selection-menu select-channel ${isOpen ? 'is-open' : ''}`}>
        <div>
            {!!channels.length &&
                channels.map((channel) => (
                    <ProfileSelectionItem key={channel.id} channel={channel} selectChannel={selectChannel} />
                ))
            }
        </div>
    </div>
);

const ProfileSelectionItem = ({ channel, selectChannel }) => (
    <div className="channel-container">
        <a href="#" className="block-urls" onClick={(e) => { selectChannel(channel.id) }}>
            <div className="profile-info ">
                <span className="profile-img-container">
                    <img onError={(e) => e.target.src = '/images/dummy_profile.png'} src={channel.avatar} />
                    <i className={`fab fa-${channel.type} ${channel.type}_bg smallIcon`}></i>
                </span>
                <div>
                    <p className="profile-name" title={channel.name}>{channel.name}</p>
                    <p className="profile-username">{!!channel.username && `@${channel.username}`}</p>
                </div>
            </div>
        </a>
    </div>
);

const MenuItems = ({ menuItems }) => (
    <ul className="v-menu-links clear-both">
        {menuItems.map((item) => (
            <li key={item.id}><NavLink className="links" to={item.uri}>{item.displayName}</NavLink></li>
        ))}
    </ul>
);

const SupportSection = ({ logout }) => (
    <div className="support">
        <div>
            <a href="mailto:info@uniclixapp.com?Subject=The%20sky%20is%20falling!"><i className="fa fa-comment"></i> SUPPORT</a>
        </div>
        <div className="logout-btn">
            <a className="link-cursor" onClick={logout}>LOG OUT</a>
        </div>
    </div>
);

const mapDispatchToProps = (dispatch) => ({
    logout: () => dispatch(startLogout())
});

export default connect(undefined, mapDispatchToProps)(VerticalSettingsMenu);