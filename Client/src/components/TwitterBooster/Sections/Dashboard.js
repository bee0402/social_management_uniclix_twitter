import React from 'react';
import { connect } from "react-redux";
import UpgradeAlert from '../../UpgradeAlert';
import channelSelector from "../../../selectors/channels";
import { startSetChannels } from "../../../actions/channels";
import { getInactiveFollowing, getRecentFollowers } from '../../../requests/twitter/channels';
import 'react-dates/initialize';
import TwitterOverviewCard from '../../Analytics/Twitter/Cards/TwitterOverviewCard';
import TweetsTable from '../../Analytics/Twitter/Cards/TweetsTable';

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
    }

    state = {
        data: false,
        forbidden: false,
        calendarChange: false,
        recentFollowers: 0,
        inactiveFollowers: 0,
        loading: this.props.channelsLoading
    }
    componentDidMount() {
        if (!this.props.channelsLoading) {
            this.fetchData();
            this.fetchInactiveData();
        }
    }

    setLoading = (loading = false) => {
        this.setState(() => ({
            loading
        }));
    };

    setForbidden = (forbidden = false) => {
        if (forbidden != this.state.forbidden) {
            this.setState(() => ({
                forbidden
            }));
        }
    };

    fetchData = (order = 'desc') => {
        getRecentFollowers(order)
            .then((response) => {
                this.setState(() => ({
                    recentFollowers: response.items
                }));
            }).catch((error) => {
                this.setLoading(false);

                if (error.response.status === 401) {

                    if (this.props.selectedChannel.active) {
                        this.props.startSetChannels();
                    }
                }

                if (error.response.status === 403) {
                    this.setForbidden(true);
                }

                return Promise.reject(error);
            });
    };
    fetchInactiveData = (order = 'desc') => {
        getInactiveFollowing(order)
            .then((response) => {
                this.setState(() => ({
                    inactiveFollowers: response.items
                }));
            }).catch((error) => {
                this.setLoading(false);
                return Promise.reject(error);
            });
    };

    render() {
        const propData = {
            calendarChange: this.state.calendarChange,
            setForbidden: this.setForbidden,
            selectedAccount: this.props.selectedChannel.id,
            selectedChannel: this.props.selectedChannel
        }
        return (
            <div>
                <div className="section-header no-border">
                    <div className="section-header__first-row">
                        <h2>Dashboard</h2>
                    </div>

                    <div className="section-header__second-row">
                    </div>
                </div>

                <UpgradeAlert isOpen={this.state.forbidden && !this.state.loading} goBack={true} setForbidden={this.setForbidden} />
                {!this.state.forbidden &&
                    <div>
                        <div className="overview-cards-container mb20">
                            <div className="mr20">
                                <TwitterOverviewCard
                                    name='Tweets'
                                    type="tweetsCount"
                                    description='tweets'
                                    link="/twitter-booster/keyword-targets"
                                    description={<div className="analytics-description clearfix"><span>Recommended twitter accounts </span> to follow</div>}
                                    tooltipDesc='The number of tweets published from your Twitter account'
                                    iconPath={`/images/twitter-blue-icon.svg`}
                                    {...propData} />
                            </div>
                            <div className="mr20">
                                <TwitterOverviewCard
                                    name='Followers'
                                    type="followersCount"
                                    description={<div className="analytics-description clearfix"><span> {this.state.recentFollowers.length} new users</span> to follow</div>}
                                    link="/twitter-booster/followers?recent"
                                    tooltipDesc='The number of people who are following your Twitter account'
                                    iconPath={`/images/followers-blue-icon.svg`}
                                    {...propData} />
                            </div>
                            <div>
                                <TwitterOverviewCard
                                    name='Following'
                                    type="followingCount"
                                    description={<div className="analytics-description clearfix"><span> {this.state.inactiveFollowers.length} inactive users</span> to clean up</div>}
                                    link="/twitter-booster/clean-up-list?inactive"
                                    tooltipDesc='Toatal number of people you are following on your Twitter accounts'
                                    iconPath={`/images/user-check-blue-icon.svg`}
                                    {...propData} />
                            </div>
                        </div>

                        <div className="row mb20">
                            <div className="col-xs-12">
                                <TweetsTable
                                    name="Tweets Table"
                                    type='tweetsTableData'
                                    tooltipDesc='The list of tweets published by your Twitter account, with their engagement stats: retweets, replies and likes'
                                    iconPath={`/images/user-check-blue-icon.svg`}
                                    {...propData} />
                            </div>
                        </div>

                    </div>}

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const selectedTwitterChannel = { selected: 1, provider: "twitter" };
    const selectedChannel = channelSelector(state.channels.list, selectedTwitterChannel);

    return {
        channelsLoading: state.channels.loading,
        selectedChannel: selectedChannel.length ? selectedChannel[0] : {}
    };
};

const mapDispatchToProps = (dispatch) => ({
    startSetChannels: () => dispatch(startSetChannels())
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
