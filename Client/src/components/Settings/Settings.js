import React from 'react';
import { connect } from "react-redux";
import VerticalSettingsMenu from "../Menus/VerticalSettingsMenu";
import channelSelector from "../../selectors/channels";
import SettingsRouter from '../../routes/SettingsRouter';

const menuItems = [
    {
        id: "profile",
        displayName: "Personal Info",
        uri: "/settings/profile"
    },
    {
        id: "company-info",
        displayName: "Company Info",
        uri: "/settings/company-info"
    },
    {
        id: "team",
        displayName: "Team",
        uri: "/settings/team"
    },
    {
        id: "billing",
        displayName: "Manage Accout",
        uri: "/settings/billing"
    }
];

const Settings = ({ channels, selectedChannel, selectChannel }) => {
    const hasChannel = typeof (selectedChannel.username) !== "undefined";
    return (
        <div className="body-wrap">
            <div>
                <VerticalSettingsMenu
                    menuItems={menuItems}
                    channels={channels}
                    selectedChannel={selectedChannel}
                    selectChannel={selectChannel}
                />
                <div className="body-container">
                    <div className="main-section">
                        <SettingsRouter />
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {

    const unselectedTwitterChannels = { selected: 0, provider: "twitter" };
    const selectedTwitterChannel = { selected: 1, provider: "twitter" };

    const channels = channelSelector(state.channels.list, unselectedTwitterChannels);
    const selectedChannel = channelSelector(state.channels.list, selectedTwitterChannel);

    return {
        channels,
        selectedChannel: selectedChannel.length ? selectedChannel[0] : {}
    };
};

const mapDispatchToProps = (dispatch) => ({
    selectChannel: (id) => dispatch(setTwitterChannel(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);