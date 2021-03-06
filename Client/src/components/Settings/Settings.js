import React from 'react';
import { connect } from "react-redux";
import VerticalSettingsMenu from "../Menus/VerticalSettingsMenu";
import MenuItems from "../TwitterBooster/Fixtures/MenuItems";
import VerticalMenu from "../Menus/VerticalMenu";
import channelSelector from "../../selectors/channels";
import SettingsRouter from '../../routes/SettingsRouter';
import { render } from 'react-dom';

// const menuItems = [
//     {
//         id: "profile",
//         displayName: "Personal Info",
//         uri: "/settings/profile"
//     },
//     {
//         id: "company-info",
//         displayName: "Company Info",
//         uri: "/settings/company-info"
//     },
//     {
//         id: "team",
//         displayName: "Team",
//         uri: "/settings/team"
//     },
//     {
//         id: "twitter-booster_recent_unfollowers",
//         displayName: "Manage Accounts",
//         uri: "/twitter-booster/manage-accounts",
//         icon: "list"
//     }
// ];

class Settings extends React.Component {
    state = {
        isBoxVisible: false
    }

    toggleBox = () => {
        console.log(this.state.isBoxVisible)
        this.setState({
            isBoxVisible: !this.state.isBoxVisible
        })
    }

    render() {
        const { channels, selectedChannel, selectChannel } = this.props

        const hasChannel = typeof (selectedChannel.username) !== "undefined";
        return (
            <div className="body-wrap">
                <div>
                    <VerticalMenu
                        menuItems={MenuItems}
                        channels={channels}
                        selectedChannel={selectedChannel}
                        selectChannel={selectChannel}
                        toggleBox={this.toggleBox}
                        isBoxVisible={this.state.isBoxVisible}
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