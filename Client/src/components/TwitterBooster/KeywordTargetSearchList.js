import React from 'react';
import {connect} from 'react-redux';
import Geosuggest from 'react-geosuggest';
import {startSetChannels} from '../../actions/channels';
import channelSelector from "../../selectors/channels";
import {addKeywordTarget, destroyKeywordTarget} from '../../requests/twitter/channels';
import Loader from '../../components/Loader';
import InfoModal from '../InfoModal';

class KeywordTargetSearchList extends React.Component{
    constructor(props){
        super(props);
    }

    state = {
        target: "",
        location: "",
        loading: false,
        suggestedTargets: [
            {keyword: "news", location: ""},
            {keyword: "love", location: ""},
            {keyword: "music", location: ""},
            {keyword: "sports", location: ""},
            {keyword: "friends", location: ""},
            {keyword: "anime", location: ""},
            {keyword: "marvel", location: ""},
            {keyword: "snow", location: ""},
        ],
        infoModal: localStorage.getItem('twitterBoosterInfoModal') !== 'seen'
    };

    onChange = (e) => {
        const target = e.target.value;
        this.setState(() => ({
            target
        }));
    };

    onLocationSelect = (suggestedLocation) => {

        if(typeof suggestedLocation.location != "undefined"){
            this.setState(() => ({
                location: JSON.stringify({
                    ...suggestedLocation.location,
                    label: suggestedLocation.label
                })
            }));
        }
    };

    onSubmit = (e, addedTarget = false) => {
        this.setLoading(true);
        if(e) e.preventDefault();

        const target = addedTarget ? addedTarget : this.state.target;
        const location = this.state.location;
        if(target.length){
          addKeywordTarget(target, location)
          .then((response) => {
              this.props.reloadTargets(response);
              this.setLoading(false);
            }).catch((error) => {
                this.setLoading(false);

                if(error.response.status === 401){
                    
                    if(this.props.selectedChannel.active){
                       this.props.startSetChannels();
                    }
                }

                return Promise.reject(error);
            });  
        }else{
            this.setLoading(false); 
        }
    };

    setLoading = (loading = false) => {
        this.setState(() => ({
            loading
        }));
    }

    rememberInfoModal = () => {
        localStorage.setItem('twitterBoosterInfoModal', 'seen');
        this.setState(() => ({infoModal: false}));
    };

    removeTarget = (target) => {
        this.setLoading(true);
        destroyKeywordTarget(target)
        .then((response) => {
            this.props.reloadTargets(response);
            this.setLoading(false);
        }).catch((error) => {
            this.setLoading(false);

            if(error.response.status === 401){
                    
                if(this.props.selectedChannel.active){
                   this.props.startSetChannels();
                }
            }

            return Promise.reject(error);
        });
    }

    render(){
        return (
            <div className="row">

                <InfoModal
                    isOpen={this.state.infoModal}
                    title={"Welcome to Uniclix Twitter Booster"}
                    body={"Start by setting up your targeted audience"}
                    action={this.rememberInfoModal}
                />

                <div className="col-xs-12">
                    <div className="item-list shadow-box">
                        <div className="search-bar mt20">
                            <form onSubmit={this.onSubmit}>
                                <div className="form-row">
                                    <div className="relative-pos">
                                        <input type="text" className="form-control p20 search-input" onChange={this.onChange} id="keyword" name="keyword" placeholder="Add Hashtag" />
                                        <div className="btn-container">
                                            {
                                                this.state.target ?
                                                <button className="gradient-background-teal-blue white-button add-target">+</button>
                                                :
                                                <button className="gradient-background-teal-blue white-button add-target disabled" disabled>+</button>
                                            }
                                            
                                        </div>
                                    </div>

                                </div> 
                            </form>
                        </div>

                        <div className="added">
                            <div>
                                <div className={`section-header no-border mt20 mb20`}>
                                    <div className="section-header__first-row">
                                    </div>

                                    <div className="section-header__second-row">
                                        <h3>Trending Hashtags</h3>
                                    </div>
                                </div>
                                <div className="added-items">
                                    {this.state.suggestedTargets.map((target, index) => (
                                        <div key={index} onClick={(e) => this.onSubmit(false, target.keyword)} className="keyword-item">
                                            #{target.keyword}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {!!this.props.targets.length && 
                                <div>   
                                
                                <div className={`section-header no-border mt20 mb20`}>
                                    <div className="section-header__first-row">
                                    </div>
            
                                    <div className="section-header__second-row">
                                        <h3>Added by you</h3>
                                    </div>
                                </div>
                                    <div className="added-items">
                                        {this.props.targets.map((target) => <KeywordItem key={target.id} target={target} removeTarget={this.removeTarget} />)}
                                    </div>
                                </div>
                            }

                            {this.props.targets.length >= 3 && <button onClick={() => this.props.showSearchView(false)} className="btn-blue">Show me accounts to follow</button>}
                            {this.state.loading && <Loader />}
 
                        </div>
                    </div>
                </div>
            </div>
        );
    }
} 

const KeywordItem = ({target, removeTarget}) => (
    <div className="keyword-item added-keyword">
        #{target.keyword} <i onClick={() => removeTarget(target.id)} className="fa fa-close"></i>
    </div>
);

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
})

export default connect(mapStateToProps, mapDispatchToProps)(KeywordTargetSearchList);