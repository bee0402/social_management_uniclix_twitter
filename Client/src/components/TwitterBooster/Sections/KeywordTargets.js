import React from 'react';
import { connect } from 'react-redux';
import BottomScrollListener from 'react-bottom-scroll-listener';
import UserList from "../../UserList";
import UpgradeAlert from '../../UpgradeAlert';
import { getKeywordTargets, follow } from '../../../requests/twitter/channels';
import { startSetChannels } from "../../../actions/channels";
import channelSelector from '../../../selectors/channels';
import Loader from '../../Loader';
import UpgradeIntro from '../../UpgradeIntro';

class KeywordTargets extends React.Component {
    state = {
        userItems: [],
        actions: 0,
        targets: [],
        loading: this.props.channelsLoading,
        searchView: false,
        forbidden: false,
        showTargetLink: false,
        page: 1
    }

    componentDidMount() {
        if (!this.props.channelsLoading) {
            this.fetchTargets();
        }
    }

    componentDidUpdate(prevProps) {
        if ((this.props.selectedChannel !== prevProps.selectedChannel)) {
            this.fetchTargets();
        }

        if ((this.props.channelsLoading !== prevProps.channelsLoading)) {
            this.setLoading(this.props.channelsLoading);
        }
    }

    showSearchView = (searchView = false) => {
        this.setState(() => ({
            searchView,
            showTargetLink: true
        }));

        if (!searchView) {
            this.fetchTargets();
        }
    };

    setLoading = (loading = false) => {
        this.setState(() => ({
            loading
        }));
    };

    setForbidden = (forbidden = false) => {
        this.setState(() => ({
            forbidden
        }));
    };

    perform = (userId) => {
        this.setState((prevState) => ({
            actions: prevState.actions + 1
        }));

        return follow(userId)
            .then((response) => response)
            .catch((error) => {
                this.setState((prevState) => ({
                    actions: prevState.actions - 1
                }));

                if (error.response.status === 401) {

                    if (this.props.selectedChannel.active) {
                        this.props.startSetChannels();
                    }
                }

                return Promise.reject(error);
            });
    };

    fetchTargets = () => {
        this.setLoading(true);
        getKeywordTargets()
            .then((response) => {
                if (typeof (response.items) === "undefined") return;
                if (response.targets.length < 1) {
                    this.setState(() => ({
                        searchView: true,
                        loading: false,
                        showTargetLink: true
                    }));

                    return;
                }

                this.setState(() => ({
                    userItems: response.items,
                    showTargetLink: response.items.length >= 1,
                    actions: response.actions,
                    targets: response.targets,
                    loading: false,
                    searchView: false,
                    forbidden: false,
                    page: 1
                }));
                return;
            }).catch(error => {
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

    loadMore = () => {
        this.setLoading(true);
        let page = this.state.page + 1;
        getKeywordTargets(page)
            .then((response) => {
                if (typeof (response.items) === "undefined") return;
                this.setState((prevState) => ({
                    userItems: prevState.userItems.concat(response.items),
                    actions: response.actions,
                    page,
                    loading: false
                }));
            }).catch((error) => {
                this.setLoading(false);

                if (error.response.status === 401) {

                    if (this.props.selectedChannel.active) {
                        this.props.startSetChannels();
                    }
                }

                return Promise.reject(error);
            });
    };

    reloadTargets = (targets) => {
        this.setState(() => ({
            targets
        }));
    };

    render() {
        const { forbidden, searchView, targets, loading, userItems, showTargetLink } = this.state;
        return (
            !loading ?
                <div>
                    {forbidden ? <UpgradeIntro
                        title="A simpler way to boost your twitter influence"
                        description="Track your social growth, and engage with your targeted audience."
                        infoData={[
                            {
                                title: "Grow your audience",
                                description: "Grow your Twitter audience and expand your Influence with UniClix Twitter Booster."
                            },
                            {
                                title: "Target and engage",
                                description: "Grow your community on Twitter by targeting the right audience. Think of our Booster tool as a matchmaker that connects you with people most interested in what you have to offer."
                            },
                            {
                                title: "Stay on top of things",
                                description: "Get started now, Follow relevant users only, Unfollow Inactive users, schedule posts, retweet, and monitor your Twitter mentions and streams with Uniclix Twitter Booster."
                            }
                        ]}
                        image="/images/analytic_intro.svg"
                        buttonLink="/twitter-booster/manage-accounts"
                    /> :
                        <div>

                            <div className={`section-header ${searchView || targets.length < 1 ? 'no-border' : ''}`}>
                                <div className="section-header__first-row">
                                    <h2>{searchView || targets.length < 1 ? 'Configure Targets' : 'Target Audience'}</h2>
                                </div>

                                <div className="section-header__second-row">
                                    {searchView || targets.length < 1 ? <p>Selecting at least 3 hasthtags and interests will help Uniclix to suggest relevant accounts to follow.</p>
                                        : <p>These are relevant accounts that you may want to follow based on your interests.</p>}
                                </div>
                            </div>

                            {!searchView && <button className="btn-text-blue pull-right mt20" onClick={() => this.showSearchView(true)}>Configure hashtags</button>}
                            <UpgradeAlert isOpen={this.state.forbidden && !this.state.loading} goBack={true} setForbidden={this.setForbidden} />
                            <UserList
                                userItems={userItems}
                                actionType="follow"
                                showTargetLink={showTargetLink}
                                searchView={searchView}
                                showSearchView={this.showSearchView}
                                reloadTargets={this.reloadTargets}
                                targetType="keyword"
                                targets={targets}
                                actions={this.state.actions}
                                loading={loading}
                                perform={this.perform}
                                page="keyword-targets"
                                noData={{ title: "No Users", description: "Change hashtags" }}
                            />
                            <BottomScrollListener onBottom={this.loadMore} />
                        </div>}
                </div> :
                <Loader />
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

export default connect(mapStateToProps, mapDispatchToProps)(KeywordTargets);