import React from 'react';
import { connect } from 'react-redux';
import BottomScrollListener from 'react-bottom-scroll-listener';
import UpgradeAlert from '../../UpgradeAlert';
import UserList from "../../UserList";
import {startSetChannels} from "../../../actions/channels";
import { getFans, follow, getRecentFollowers } from '../../../requests/twitter/channels';
import channelSelector from '../../../selectors/channels';
import Loader from '../../Loader';
import UpgradeIntro from '../../UpgradeIntro';

class Fans extends React.Component{
    state = {
        userItems: [],
        actions: 0,
        page: 1,
        order: "desc",
        forbidden: false,
        category: "getFans",
        loading: this.props.channelsLoading
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

    setCategory = (e) => {
        const category = e.target.value;
        this.setState(() => ({
            category
        }));
    }

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

                if(error.response.status === 401){
                    
                    if(this.props.selectedChannel.active){
                       this.props.startSetChannels();
                    }
                }

                return Promise.reject(error);
            });
    };

    fetchData = (order = 'desc') => {
        this.setLoading(true);
        const categoryFunc = this.state.category === "getFans" ? getFans : getRecentFollowers;
        categoryFunc(order)
            .then((response) => {
                this.setState(() => ({
                    userItems: response.items,
                    actions: response.actions,
                    forbidden: false,
                    page: 1,
                    order,
                    loading: false
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
        const categoryFunc = this.state.category === "getFans" ? getFans : getRecentFollowers;
        categoryFunc(order, page)
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
                {
                    this.state.forbidden ? <UpgradeIntro 
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
                        buttonLink = "/settings/billing"
                    />
                    :
                    <div>
                    
                    <div className="section-header">
                        <div className="section-header__first-row">
                           <h2>Followers</h2> 
                           <button className="btn-text-blue">Set up auto DM</button>
                        </div>

                        <div className="section-header__second-row">
                            <p>This is a list of your active and recent followers</p> 
                            <div className="section-header__select-menu">
                                <label htmlFor="sortBy">Category</label>
                                <select id="sortBy" onChange={(e) => this.setCategory(e)} value={this.state.category}>
                                    <option value="getRecentFollowers">Recent</option>
                                    <option value="getFans">Fans</option>
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
                            actionType="follow"
                            actions={this.state.actions}
                            loading={this.state.loading}
                            showSortOption={true}
                            fetchData={this.fetchData}
                            perform={this.perform}
                            page="fans"
                            noData={{
                                title: "We are mining your data, please return back later",
                                description: "We suggest you  increase your engagement with UniClix by following relevant accounts using Keyword Target feature.",
                                text: false
                            }}
                        />
                        <BottomScrollListener onBottom={this.loadMore} />
                    </div>
                }
                {this.state.loading && <Loader />}
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

export default connect(mapStateToProps, mapDispatchToProps)(Fans);