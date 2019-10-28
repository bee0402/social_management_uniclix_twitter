import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { startSetProfile } from "../actions/profile";
import { setMiddleware, setHashtags, setConnects } from '../actions/middleware';
import { addKeywordTarget, destroyKeywordTarget, onBoard } from '../requests/twitter/channels';
import { startSetChannels } from "../actions/channels";
import { getKeywordTargets } from '../requests/twitter/channels';
import channelSelector from '../selectors/channels';
import Loader from './Loader';

class MiddlewareHashtag extends React.Component {
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
            { keyword: "SOCIALMEDIAMANAGEMENT ", location: "" },
            { keyword: "TWITTERGROWTH", location: "" },
            { keyword: "TECHNOLOGY", location: "" },
            { keyword: "SPORTS", location: "" },
            { keyword: "TRAVEL", location: "" },
            { keyword: "POLITICS", location: "" },
            { keyword: "CONSERVATIVEVIEW", location: "" },
            { keyword: "LIBERALVIEW", location: "" },
            { keyword: "SCIENCE", location: "" },
            { keyword: "CELEBRITY", location: "" },
            { keyword: "RECIPES", location: "" },
            { keyword: "DESIGN", location: "" },
            { keyword: "STYLE", location: "" },
            { keyword: "COMPUTERSCIENCE", location: "" },
            { keyword: "PHOTOGRAPHY", location: "" },
            { keyword: "HEALTHYEATING", location: "" },
            { keyword: "WOMENSNEWS", location: "" },
            { keyword: "BEAUTY", location: "" },
            { keyword: "MINDFULNESS", location: "" },
            { keyword: "WORLDECONOMY", location: "" },
            { keyword: "SUSTAINABILITY", location: "" },
            { keyword: "STREETART", location: "" },
            { keyword: "SKATEBOARDING", location: "" },
            { keyword: "MUSIC", location: "" },
            { keyword: "TV", location: "" },
            { keyword: "MOVIES", location: "" },
            { keyword: "COOLSTUFF", location: "" },
            { keyword: "WORKOUTS", location: "" },
            { keyword: "HOME", location: "" },
            { keyword: "CLASSICALMUSIC", location: "" },
            { keyword: "GAMING", location: "" },
            { keyword: "ELECTRICVEHICLES", location: "" },
            { keyword: "LEADERSHIP", location: "" },
            { keyword: "FOOD&DINING", location: "" },
            { keyword: "NATIONALPARKS", location: "" },
            { keyword: "STARTUPS", location: "" },
            { keyword: "MUSICFESTIVALS", location: "" },
            { keyword: "HEALTH", location: "" },
            { keyword: "DIGITALPHOTOGRAPHY", location: "" },
            { keyword: "BREAKTHROUGHS", location: "" },
            { keyword: "AUTOS", location: "" },
            { keyword: "ADVERTISING", location: "" },
            { keyword: "MARKETING", location: "" },
            { keyword: "ROADTRIPS", location: "" },
            { keyword: "BOOKS", location: "" },
            { keyword: "RUNNING", location: "" },
            { keyword: "FOREIGNPOLICY", location: "" },
            { keyword: "EDUCATION", location: "" },
            { keyword: "NEWYORKCITY", location: "" },
            { keyword: "ARCHITECTURE", location: "" },
            { keyword: "YOGA", location: "" },
            { keyword: "DOGS", location: "" },
            { keyword: "PARENTING", location: "" },
            { keyword: "BASKETBALL", location: "" },
            { keyword: "ENTREPRENEURSHIP", location: "" },
            { keyword: "TINYHOUSEMOVEMENT", location: "" },
            { keyword: "SELFIMPROVEMENT", location: "" },
            { keyword: "CYCLING", location: "" },
            { keyword: "APPS", location: "" },
            { keyword: "STARWARS", location: "" },
            { keyword: "PERSONALFINANCE", location: "" },
            { keyword: "DIY", location: "" },
            { keyword: "SLEEP", location: "" },
            { keyword: "GREENLIVING", location: "" },
            { keyword: "NFL", location: "" },
            { keyword: "SPACE", location: "" },
            { keyword: "COFFEE", location: "" },
            { keyword: "OUTDOORS", location: "" },
            { keyword: "GAMEOFTHRONES", location: "" },
            { keyword: "GARDENING", location: "" },
            { keyword: "HOWTOS", location: "" },
            { keyword: "WRITING", location: "" },
            { keyword: "CRAFTING", location: "" },
            { keyword: "MOTORSPORT", location: "" },
            { keyword: "WEDDINGS", location: "" },
            { keyword: "INTERIORDESIGN", location: "" },
            { keyword: "MEMES", location: "" },
            { keyword: "CRYPTOCURRENCY", location: "" },
            { keyword: "WORKLIFEBALANCE", location: "" },
            { keyword: "PSYCHOLOGY", location: "" },
            { keyword: "PRODUCTIVITY", location: "" },
            { keyword: "EQUALITY", location: "" },
            { keyword: "LITERATURE", location: "" },
            { keyword: "CUTEANIMALS", location: "" },
            { keyword: "CLIMATECHANGE", location: "" },
            { keyword: "CREATIVITY", location: "" },
            { keyword: "HIKING", location: "" },
            { keyword: "MENTALHEALTH", location: "" },
            { keyword: "COUNTRYMUSIC", location: "" },
            { keyword: "COMICS", location: "" },
            { keyword: "RENEWABLEENERGY", location: "" },
            { keyword: "PODCASTING", location: "" },
            { keyword: "WINE", location: "" },
            { keyword: "THEARTS", location: "" },
            { keyword: "GENEALOGY", location: "" },
            { keyword: "MUSEUMS", location: "" },
            { keyword: "AUGMENTED REALITY", location: "" },
            { keyword: "TIMELAPSEPHOTOGRAPHY", location: "" },
            { keyword: "ALTERNATIVEMEDICINE", location: "" },
            { keyword: "BASEBALL", location: "" },
            { keyword: "SOCIALMEDIA", location: "" },
            { keyword: "NEUROSCIENCE", location: "" },
            { keyword: "TRAVELGEAR", location: "" },
            { keyword: "ACTIVISM", location: "" },
            { keyword: "RELATIONSHIPS", location: "" },
            { keyword: "VINYLRECORDS", location: "" },
            { keyword: "LISTWORTHY", location: "" },
            { keyword: "CITIES", location: "" },
            { keyword: "BIOTECHNOLOGY", location: "" },
            { keyword: "HOMEIMPROVEMENT", location: "" },
            { keyword: "NORTHKOREA", location: "" },
            { keyword: "NETNEUTRALITY", location: "" },
            { keyword: "EXTREMESPORTS", location: "" },
            { keyword: "VENTURECAPITAL", location: "" },
            { keyword: "SAILING", location: "" },
            { keyword: "ROBOTICS", location: "" },
            { keyword: "GENERATIONZ", location: "" },
            { keyword: "INVESTING", location: "" },
            { keyword: "UXDESIGN", location: "" },
            { keyword: "RELIGION", location: "" },
            { keyword: "MOTORCYCLES", location: "" },
            { keyword: "WOODWORKING", location: "" },
            { keyword: "MANAGEMENT", location: "" },
            { keyword: "REALESTATE", location: "" },
            { keyword: "COMEDY", location: "" },
            { keyword: "MACHINE LEARNING", location: "" },
            { keyword: "KNITTING", location: "" },
            { keyword: "INNOVATION", location: "" },
        ],
        targets: [],
        infoModal: localStorage.getItem('twitterBoosterInfoModal') !== 'seen'
    };

    onChange = (e) => {
        const target = e.target.value;
        this.setState(() => ({
            target
        }));
    };
    componentDidMount() {

        this.fetchTargets();
    }

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
                    this.fetchTargets();
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
                this.fetchTargets();
                this.setLoading(false);
            }).catch((error) => {
                this.setLoading(false);
                console.log(error)
                if (error.response.status === 401) {

                    if (this.props.selectedChannel.active) {
                        this.props.startSetChannels();
                    }
                }

                return Promise.reject(error);
            });
    }
    removeRole = () => {
        this.setState({ loading: true });
        onBoard(3).then((response) => {
            this.setState(() => ({ loading: false }));
            this.props.setMiddleware(false);

        }).catch(error => {
            this.setLoading(false);
            console.log(error)

            return Promise.reject(error);
        });
    }
    setRole = () => {
        this.setLoading(true);

        onBoard(2).then((response) => {
            this.setState(() => ({ loading: false }));
            this.props.setMiddleware('connections');

        }).catch(error => {
            this.setLoading(false);
            console.log(error)

            return Promise.reject(error);
        });
        this.props.startSetProfile().then(() => {
            this.setState(() => ({ loading: false }));
            this.props.setMiddleware('connections');
        });
    }
    fetchTargets = () => {
        this.setLoading(true);
        getKeywordTargets()
            .then((response) => {
                if (typeof (response.items) === "undefined") return;

                this.setState({
                    targets: response.targets,
                    loading: false
                });

            }).catch(error => {
                this.setLoading(false);
                console.log(error)

                return Promise.reject(error);
            });
    };
    render() {
        const { suggestedTargets, targets } = this.state;
        let tgId = null;
        return (
            <div className="login-container">
                <div className="logo">
                    <img src="/images/uniclix.png" />
                </div>
                <div className="col-md-7 col-xs-12">
                    <div className="steps-cnt">
                        <div className="scrollableY-cnt">
                            <div className="item-list">
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
                                            <div className="section-header__second-row">
                                                <h3>Added by you</h3>
                                            </div>
                                        </div>
                                        <div className="added-items">
                                            {targets.slice(0, 12).map((target, index) => (
                                                suggestedTargets.map(function (keyw) {
                                                    tgId = keyw.id
                                                    return keyw.keyword
                                                }).indexOf(target.keyword) < 0 ?
                                                    <div key={index} onClick={(e) => this.removeTarget(target.id)} className="keyword-item  added-keyword">
                                                        #{target.keyword}
                                                    </div>
                                                    :
                                                    ''
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`section-header no-border mt20 mb20`}>
                                            <div className="section-header__second-row">
                                                <h3>Trending Hashtags</h3>
                                            </div>
                                        </div>
                                        <div className="added-items">
                                            {suggestedTargets.slice(0, 12).map((target, index) => (
                                                targets.map(function (keyw) {
                                                    tgId = keyw.id
                                                    return keyw.keyword
                                                }).indexOf(target.keyword) > 0 ?
                                                    <div key={index} onClick={(e) => this.removeTarget(tgId)} className="keyword-item  added-keyword">
                                                        #{target.keyword}
                                                    </div>
                                                    :
                                                    <div key={index} onClick={(e) => this.onSubmit(false, target.keyword)} className="keyword-item">
                                                        #{target.keyword}
                                                    </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {this.state.targets.length < 3 ?
                            <button className="magento-btn w100 disabled-btn">Select {3 - this.state.targets.length} to continue</button>
                            :
                            <button className="magento-btn w100" onClick={this.setRole}>Continue</button>
                        }
                        <button className="second-link" onClick={this.removeRole}>I’ll configure it later</button>

                        {this.state.loading && <Loader />}
                    </div>
                </div>
                <div className="col-md-5 middleware-side girl"></div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const selectedTwitterChannel = { selected: 1, provider: "twitter" };
    const selectedChannel = channelSelector(state.channels.list, selectedTwitterChannel);

    return {
        channelsLoading: state.channels.loading,
        selectedChannel: selectedChannel.length ? selectedChannel[0] : {},
        middleware: state.middleware.step,
        middlewareHashtags: state.middleware.stepHashtags,
        middlewareSuggested: state.middleware.stepSuggested
    };
};

const mapDispatchToProps = (dispatch) => ({
    startSetChannels: () => dispatch(startSetChannels()),
    setMiddleware: (middleware) => dispatch(setMiddleware(middleware)),
    setHashtags: (middlewareHashtags) => dispatch(setHashtags(middlewareHashtags)),
    setConnects: (middlewareSuggested) => dispatch(setConnects(middlewareSuggested)),
    startSetProfile: () => dispatch(startSetProfile())
});


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MiddlewareHashtag));