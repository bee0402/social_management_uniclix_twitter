import React from 'react';
import { connect } from 'react-redux';
import BottomScrollListener from 'react-bottom-scroll-listener';
import UserList from "../../UserList";
import UpgradeAlert from '../../UpgradeAlert';
import {startSetChannels} from "../../../actions/channels";
import { getNonFollowers, getFollowing, getInactiveFollowing, getRecentUnfollowers, unfollow } from '../../../requests/twitter/channels';
import channelSelector from '../../../selectors/channels';
import Loader from '../../Loader';
import UpgradeIntro from '../../UpgradeIntro';

class CleanupList extends React.Component{
    state = {
        userItems: [],
        actions: 0,
        loading: this.props.channelsLoading,
        forbidden: false,
        category: "getFollowing",
        page: 1,
        order: "desc"
    }

    componentDidMount() {
        
        if(!this.props.channelsLoading){
            this.fetchData();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if((this.props.selectedChannel !== prevProps.selectedChannel) || (this.state.category !== prevState.category)){
            this.fetchData();
        }
    }

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

        return unfollow(userId)
            .then((response) => response)
            .catch((error) => {
                this.setState((prevState) => ({
                    actions: prevState.actions - 1
                }));

                if(error.response.status === 401){
                    
                    if(this.props.selectedChannel.active){
                       this.props.startSetChannels();
                    }
                }

                return Promise.reject(error);
            });
    };

    setCategory = (e) => {
        const category = e.target.value;
        this.setState(() => ({
            category
        }));
    }

    getCategoryFunction = () => {
        switch(this.state.category){
            case "getFollowing":
                return getFollowing;
            case "getNonFollowers":
                return getNonFollowers;
            case "getInactiveFollowing":
                return getInactiveFollowing;
            case "getRecentUnfollowers":
                return getRecentUnfollowers;
        }
    };

    fetchData = (order = 'desc') => {
        this.setLoading(true);
        const categoryFunc = this.getCategoryFunction();
        categoryFunc(order)
            .then((response) => {
                this.setState(() => ({
                    userItems: response.items,
                    actions: response.actions,
                    loading: false,
                    forbidden: false,
                    page: 1,
                    order
                }));
            }).catch((error) => {
                this.setLoading(false);

                if(error.response.status === 401){
                    
                    if(this.props.selectedChannel.active){
                       this.props.startSetChannels();
                    }
                }

                if(error.response.status === 403){
                    this.setForbidden(true);
                }

                return Promise.reject(error);
            });
    };

    loadMore = () => {
        this.setLoading(true);
        let page = this.state.page + 1;
        const order = this.state.order;
        const categoryFunc = this.getCategoryFunction();
        categoryFunc(order)
            .then((response) => {
                this.setState((prevState) => ({
                    userItems: prevState.userItems.concat(response.items),
                    actions: response.actions,
                    page,
                    loading: false
                }));
            }).catch((error) => {

                if(error.response.status === 401){
                    
                    if(this.props.selectedChannel.active){
                       this.props.startSetChannels();
                    }
                }

                this.setLoading(false);
            });
    };

    render(){
        return (
            <div>
                {this.state.forbidden ? <UpgradeIntro 
                    title="A simpler way to boost your twitter influence"
                    description = "Track your social growth, and engage with your targeted audience."
                    infoData = {[
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
                    image = "/images/analytic_intro.svg"
                    buttonLink = "/twitter-booster/manage-accounts"
                />:
                <div>
                    <div className="section-header">
                        <div className="section-header__first-row">
                        <h2>Clean up list</h2>
                        </div>

                        <div className="section-header__second-row">                                
                            <div></div>
                            <div className="section-header__select-menu">
                                <label htmlFor="sortBy">Category</label>
                                <select id="sortBy" onChange={(e) => this.setCategory(e)} value={this.state.category}>
                                    <option value="getFollowing">All</option>
                                    <option value="getInactiveFollowing">Inactive</option>
                                    <option value="getNonFollowers">Non followers</option>
                                    <option value="getRecentUnfollowers">Recent unfollowers</option>
                                </select>
                                {   this.state.order === "asc" ?
                                    <i className="fas fa-arrow-up" onClick={() => this.fetchData("desc")}></i> :
                                    <i className="fas fa-arrow-up disabled-btn" disabled></i>
                                }

                                {   this.state.order === "desc" ?
                                    <i className="fas fa-arrow-down" onClick={() => this.fetchData("asc")}></i> :
                                    <i className="fas fa-arrow-down disabled-btn" disabled></i>
                                }
                            </div>
                        </div>
                    </div>

                    <UpgradeAlert isOpen={this.state.forbidden && !this.state.loading} goBack={true} setForbidden={this.setForbidden}/>
                    <UserList 
                        userItems={ this.state.userItems }
                        actionType="unfollow"
                        actions={this.state.actions}
                        loading={this.state.loading}
                        showSortOption={true}
                        fetchData={this.fetchData}
                        perform={this.perform}
                        page="non-followers"
                        noData={{
                            title: "Woops!",
                            description: "Seems like you don't have any matching data!"
                        }}
                    />
                    <BottomScrollListener onBottom={this.loadMore} />
                    {this.state.loading && <Loader />}
                </div>}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const selectedTwitterChannel = {selected: 1, provider: "twitter"};
    const selectedChannel = channelSelector(state.channels.list, selectedTwitterChannel);

    return {
        channelsLoading: state.channels.loading,
        selectedChannel: selectedChannel.length ? selectedChannel[0] : {}
    };
};

const mapDispatchToProps = (dispatch) => ({
    startSetChannels: () => dispatch(startSetChannels())
});

export default connect(mapStateToProps, mapDispatchToProps)(CleanupList);