import React from 'react';
import { connect } from "react-redux";
import VerticalMenu from "../Menus/VerticalMenu";
import MenuItems from "./Fixtures/MenuItems";
import ManageRouter from "../../routes/ManageRouter";
import channelSelector from "../../selectors/channels";
import { setTwitterChannel } from '../../actions/channels';
import SocialAccountsPrompt from '../SocialAccountsPrompt';

class Manage extends React.Component {
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
        const { channels, selectedChannel, selectChannel, profile } = this.props
        const hasChannel = typeof (selectedChannel.username) !== "undefined";
        return (
            <div className="body-wrap">
                {!!hasChannel ? <div>
                    <VerticalMenu
                        menuItems={MenuItems}
                        toggleBox={this.toggleBox}
                        channels={channels}
                        trialEnded={profile.user.trial_ends_at}
                        selectedChannel={selectedChannel}
                        selectChannel={selectChannel}
                        isBoxVisible={this.state.isBoxVisible}
                    />
                    <div className="body-container">
                        <div className="main-section">
                            <ManageRouter />
                        </div>
                    </div>
                </div> :
                    <div className="mt100">
                        <SocialAccountsPrompt
                            image="/images/connect_twitter_accounts.svg"
                            title="Prove the impact of your social media initiatives"
                            description="Track your social growth, and get meaningful stats"
                            buttonTitle="Connect your Twitter Account"
                            buttonLink="/twitter-booster/manage-accounts"
                        />
                    </div>
                }

            </div>
        );
    };
}

const mapStateToProps = (state) => {

    const unselectedTwitterChannels = { selected: 0, provider: "twitter" };
    const selectedTwitterChannel = { selected: 1, provider: "twitter" };

    const channels = channelSelector(state.channels.list, unselectedTwitterChannels);
    const selectedChannel = channelSelector(state.channels.list, selectedTwitterChannel);
    const profile = state.profile

    return {
        channels,
        profile,
        selectedChannel: selectedChannel.length ? selectedChannel[0] : {}
    };
};

const mapDispatchToProps = (dispatch) => ({
    selectChannel: (id) => dispatch(setTwitterChannel(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Manage);