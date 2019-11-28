import React from 'react';
import { connect } from 'react-redux';
import Geosuggest from 'react-geosuggest';
import { startSetChannels } from '../../actions/channels';
import channelSelector from "../../selectors/channels";
import { addKeywordTarget, destroyKeywordTarget } from '../../requests/twitter/channels';
import Loader from '../../components/Loader';
import InfoModal from '../InfoModal';

class KeywordTargetSearchList extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        target: "",
        location: "",
        loading: false,
        suggestedTargets: [
            { keyword: "NEWS", location: "" },
            { keyword: "BUSINESS", location: "" },
            { keyword: "SOCIAL MEDIA MANAGEMENT", location: "" },
            { keyword: "TWITTER GROWTH", location: "" },
            { keyword: "TECHNOLOGY", location: "" },
            { keyword: "SPORTS", location: "" },
            { keyword: "TRAVEL", location: "" },
            { keyword: "POLITICS", location: "" },
            { keyword: "CONSERVATIVE VIEW", location: "" },
            { keyword: "LIBERAL VIEW", location: "" },
            { keyword: "SCIENCE", location: "" },
            { keyword: "CELEBRITY", location: "" },
            { keyword: "RECIPES", location: "" },
            { keyword: "DESIGN", location: "" },
            { keyword: "STYLE", location: "" },
            { keyword: "COMPUTER SCIENCE", location: "" },
            { keyword: "PHOTOGRAPHY", location: "" },
            { keyword: "HEALTHY EATING", location: "" },
            { keyword: "WOMEN'S NEWS", location: "" },
            { keyword: "BEAUTY", location: "" },
            { keyword: "MINDFULNESS", location: "" },
            { keyword: "WORLD ECONOMY", location: "" },
            { keyword: "SUSTAINABILITY", location: "" },
            { keyword: "STREET ART", location: "" },
            { keyword: "SKATEBOARDING", location: "" },
            { keyword: "MUSIC", location: "" },
            { keyword: "TV", location: "" },
            { keyword: "MOVIES", location: "" },
            { keyword: "COOL STUFF", location: "" },
            { keyword: "WORKOUTS", location: "" },
            { keyword: "HOME", location: "" },
            { keyword: "CLASSICAL MUSIC", location: "" },
            { keyword: "GAMING", location: "" },
            { keyword: "ELECTRIC VEHICLES", location: "" },
            { keyword: "LEADERSHIP", location: "" },
            { keyword: "FOOD & DINING", location: "" },
            { keyword: "NATIONAL PARKS", location: "" },
            { keyword: "STARTUPS", location: "" },
            { keyword: "MUSIC FESTIVALS", location: "" },
            { keyword: "HEALTH", location: "" },
            { keyword: "DIGITAL PHOTOGRAPHY", location: "" },
            { keyword: "BREAKTHROUGHS", location: "" },
            { keyword: "AUTOS", location: "" },
            { keyword: "ADVERTISING", location: "" },
            { keyword: "MARKETING", location: "" },
            { keyword: "ROAD TRIPS", location: "" },
            { keyword: "BOOKS", location: "" },
            { keyword: "RUNNING", location: "" },
            { keyword: "FOREIGN POLICY", location: "" },
            { keyword: "EDUCATION", location: "" },
            { keyword: "NEW YORK CITY", location: "" },
            { keyword: "ARCHITECTURE", location: "" },
            { keyword: "YOGA", location: "" },
            { keyword: "DOGS", location: "" },
            { keyword: "PARENTING", location: "" },
            { keyword: "BASKETBALL", location: "" },
            { keyword: "ENTREPRENEURSHIP", location: "" },
            { keyword: "TINY HOUSE MOVEMENT", location: "" },
            { keyword: "SELF-IMPROVEMENT", location: "" },
            { keyword: "CYCLING", location: "" },
            { keyword: "APPS", location: "" },
            { keyword: "STAR WARS", location: "" },
            { keyword: "PERSONAL FINANCE", location: "" },
            { keyword: "DIY", location: "" },
            { keyword: "SLEEP", location: "" },
            { keyword: "GREEN LIVING", location: "" },
            { keyword: "NFL", location: "" },
            { keyword: "SPACE", location: "" },
            { keyword: "COFFEE", location: "" },
            { keyword: "OUTDOORS", location: "" },
            { keyword: "GAME OF THRONES", location: "" },
            { keyword: "GARDENING", location: "" },
            { keyword: "HOW-TO'S", location: "" },
            { keyword: "WRITING", location: "" },
            { keyword: "CRAFTING", location: "" },
            { keyword: "MOTORSPORT", location: "" },
            { keyword: "WEDDINGS", location: "" },
            { keyword: "INTERIOR DESIGN", location: "" },
            { keyword: "MEMES", location: "" },
            { keyword: "CRYPTOCURRENCY", location: "" },
            { keyword: "WORK-LIFE BALANCE", location: "" },
            { keyword: "PSYCHOLOGY", location: "" },
            { keyword: "PRODUCTIVITY", location: "" },
            { keyword: "EQUALITY", location: "" },
            { keyword: "LITERATURE", location: "" },
            { keyword: "CUTE ANIMALS", location: "" },
            { keyword: "CLIMATE CHANGE", location: "" },
            { keyword: "CREATIVITY", location: "" },
            { keyword: "HIKING", location: "" },
            { keyword: "MENTAL HEALTH", location: "" },
            { keyword: "COUNTRY MUSIC", location: "" },
            { keyword: "COMICS", location: "" },
            { keyword: "LGBTQI", location: "" },
            { keyword: "RENEWABLE ENERGY", location: "" },
            { keyword: "PODCASTING", location: "" },
            { keyword: "WINE", location: "" },
            { keyword: "THE ARTS", location: "" },
            { keyword: "GENEALOGY", location: "" },
            { keyword: "MUSEUMS", location: "" },
            { keyword: "AUGMENTED REALITY", location: "" },
            { keyword: "TIME-LAPSE PHOTOGRAPHY", location: "" },
            { keyword: "ALTERNATIVE MEDICINE", location: "" },
            { keyword: "BASEBALL", location: "" },
            { keyword: "SOCIAL MEDIA", location: "" },
            { keyword: "NEUROSCIENCE", location: "" },
            { keyword: "TRAVEL GEAR", location: "" },
            { keyword: "ACTIVISM", location: "" },
            { keyword: "RELATIONSHIPS", location: "" },
            { keyword: "VINYL RECORDS", location: "" },
            { keyword: "LIST-WORTHY", location: "" },
            { keyword: "CITIES", location: "" },
            { keyword: "BIOTECHNOLOGY", location: "" },
            { keyword: "HOME IMPROVEMENT", location: "" },
            { keyword: "NORTH KOREA", location: "" },
            { keyword: "NET NEUTRALITY", location: "" },
            { keyword: "EXTREME SPORTS", location: "" },
            { keyword: "VENTURE CAPITAL", location: "" },
            { keyword: "SAILING", location: "" },
            { keyword: "ROBOTICS", location: "" },
            { keyword: "GENERATION Z", location: "" },
            { keyword: "INVESTING", location: "" },
            { keyword: "UX DESIGN", location: "" },
            { keyword: "RELIGION", location: "" },
            { keyword: "MOTORCYCLES", location: "" },
            { keyword: "WOODWORKING", location: "" },
            { keyword: "MANAGEMENT", location: "" },
            { keyword: "REAL ESTATE", location: "" },
            { keyword: "COMEDY", location: "" },
            { keyword: "MACHINE LEARNING", location: "" },
            { keyword: "KNITTING", location: "" },
            { keyword: "INNOVATION", location: "" },
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

        if (typeof suggestedLocation.location != "undefined") {
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
        if (e) e.preventDefault();

        const target = addedTarget ? addedTarget : this.state.target;
        const location = this.state.location;
        if (target.length) {
            addKeywordTarget(target, location)
                .then((response) => {
                    this.props.reloadTargets(response);
                    this.setLoading(false);
                }).catch((error) => {
                    this.setLoading(false);

                    if (error.response.status === 401) {

                        if (this.props.selectedChannel.active) {
                            this.props.startSetChannels();
                        }
                    }

                    return Promise.reject(error);
                });
        } else {
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
        this.setState(() => ({ infoModal: false }));
    };

    removeTarget = (target) => {
        this.setLoading(true);
        destroyKeywordTarget(target)
            .then((response) => {
                this.props.reloadTargets(response);
                this.setLoading(false);
            }).catch((error) => {
                this.setLoading(false);

                if (error.response.status === 401) {

                    if (this.props.selectedChannel.active) {
                        this.props.startSetChannels();
                    }
                }

                return Promise.reject(error);
            });
    }

    render() {
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

                            {!!this.props.targets.length ?
                                <div>
                                    <div>
                                        <div className={`section-header no-border mt20 mb20`}>
                                            <div className="section-header__first-row">
                                            </div>

                                            <div className="section-header__second-row">
                                                <h3>Added by you</h3>
                                            </div>
                                        </div>
                                        <div className="added-items">
                                            {this.props.targets.map((target, index) => (
                                                this.state.suggestedTargets.map(function (keyU, e) {
                                                    return keyU.keyword
                                                }).indexOf(target.keyword) < 0 ?
                                                    <KeywordItem key={target.id} target={target} removeTarget={this.removeTarget} />
                                                    :
                                                    ''
                                            ))}
                                        </div>
                                    </div>

                                    <div className="seperator mt20 mb20"></div>
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
                                                this.props.targets.map(function (keyw, e) {
                                                    return keyw.keyword
                                                }).indexOf(target.keyword) == -1 ?
                                                    <div key={index} onClick={(e) => this.onSubmit(false, target.keyword)} className="keyword-item">
                                                        #{target.keyword}
                                                    </div>
                                                    :
                                                    this.props.targets.map((actualKey, e) => {
                                                        if (actualKey.keyword == target.keyword) {
                                                            return (
                                                                <div key={e} onClick={(e) => this.removeTarget(actualKey.id)} className="keyword-item  added-keyword">
                                                                    #{actualKey.keyword}
                                                                </div>
                                                            )
                                                        }
                                                    })

                                            ))}
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="mt20 mb20 text-center no-hashtags">
                                    <img src="/images/hashtag-girl.svg" />
                                    <h3>Whoops!</h3>
                                    <p>You don't have any configured hashtags yet.</p>
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

const KeywordItem = ({ target, removeTarget }) => (
    <div className="keyword-item added-keyword">
        #{target.keyword} <i onClick={() => removeTarget(target.id)} className="fa fa-close"></i>
    </div>
);

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
})

export default connect(mapStateToProps, mapDispatchToProps)(KeywordTargetSearchList);