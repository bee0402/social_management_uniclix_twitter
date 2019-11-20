import React from 'react';
import { NavLink, Link } from "react-router-dom";

const VerticalMenu = ({ menuItems, channels, selectedChannel, selectChannel }) => {
    return (
        <aside className="vertical-menu scrollbar">

            <ProfileInfo selectedChannel={selectedChannel} channels={channels} selectChannel={selectChannel} />

            <MenuItems menuItems={menuItems} />
            <SupportSection />
        </aside>
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

    activeChannels = () => {
        return (this.props.channels).filter(channel => channel.details.paid == 1)
    }

    render() {
        const { selectedChannel, selectChannel } = this.props;

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
                    channels={this.activeChannels}
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

class MenuItems extends React.Component {

    render() {
        const { menuItems } = this.props;

        return (
            <ul className="v-menu-links clear-both">
                {menuItems.map((item) => (
                    <li key={item.id} ><NavLink className="links" to={item.uri}><i className={`fa fa-${item.icon}`}></i> <span>{item.displayName}</span></NavLink></li>
                ))}
            </ul>
        );
    }
}

const SupportSection = () => (
    <div className="support">
        <div>
            <a href="mailto:info@uniclixapp.com?Subject=The%20sky%20is%20falling!"><i className="fa fa-comment"></i> Support</a>
        </div>
    </div>
);

export default VerticalMenu;