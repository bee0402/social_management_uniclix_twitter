import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { startSetProfile } from "../actions/profile";
import { setMiddleware, setHashtags, setConnects } from '../actions/middleware';
import { abbrNum } from "../utils/numberFormatter";
import { startSetChannels } from "../actions/channels";
import { getKeywordTargets, follow, onBoard } from '../requests/twitter/channels';
import channelSelector from '../selectors/channels';
import Loader from './Loader';

class MiddlewareHashtag extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        userItems: [],
        actions: 0,
        targets: [],
        loading: this.props.channelsLoading,
        searchView: false,
        forbidden: false,
        page: 1
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
    fetchTargets = () => {
        this.setLoading(true);
        getKeywordTargets()
            .then((response) => {
                if (typeof (response.items) === "undefined") return;
                console.log(response)
                this.setState({
                    userItems: response.items,
                    actions: response.actions,
                    loading: false,
                    forbidden: false,
                    page: 1
                });
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

    setRole = () => {
        this.setLoading(true);
        onBoard(3).then((response) => {
            this.props.startSetProfile().then(() => {
                this.setState(() => ({ loading: false }));
                this.props.setMiddleware(false);
            });
        }).catch(error => {
            this.setLoading(false);
            console.log(error)

            return Promise.reject(error);
        });
    }

    setLoading = (loading = false) => {
        this.setState(() => ({
            loading
        }));
    }

    rememberInfoModal = () => {
        localStorage.setItem('twitterBoosterInfoModal', 'seen');
        this.setState(() => ({ infoModal: false }));
    };
    render() {
        const { userItems, page } = this.state;
        return (
            <div className="login-container">
                <div className="logo">
                    <img src="/images/uniclix.png" />
                </div>

                <div className="col-md-7 col-xs-12 text-center">
                    <div className="steps-cnt steps-cnt-middle">
                        <div className="scrollableY-cnt">
                            <div className="item-list">
                                {userItems.slice(0, 40).map((userItem, index) => (
                                    <UserItem
                                        key={index}
                                        index={index}
                                        userItem={userItem}
                                    />
                                ))}

                            </div>
                        </div>
                        <button className="magento-btn w100" onClick={this.setRole}>Continue</button>
                        {this.state.loading && <Loader />}
                    </div>
                </div>
                <div className="col-md-5 middleware-side girl"></div>
            </div>
        );
    }
}

class UserItem extends React.Component {

    state = {
        buttonState: {
            actionSymbol: this.defaultActionSymbol,
            action: 'add',
            disabled: false
        }
    };

    perform = () => {

        const { userItem, index } = this.props
        const userId = userItem.screen_name;
        if (!this.state.buttonState.disabled) {

            let buttonState = Object.assign({}, this.state.buttonState);
            buttonState.disabled = true;
            buttonState.actionSymbol = this.loadingActionSymbol;

            this.setState(() => ({
                ...this.state,
                buttonState
            }));


            follow(userId)
                .then((response) => {
                    buttonState.disabled = true;
                    buttonState.actionSymbol = this.successActionSymbol;

                    this.setState(() => ({
                        buttonState,
                    }));
                    return Promise.resolve(response);
                })
                .catch((error) => {
                    buttonState.disabled = false;
                    buttonState.actionSymbol = this.defaultActionSymbol;

                    this.setState(() => ({
                        buttonState,
                    }));
                    return Promise.reject(error);
                });

        }
    };
    render() {
        const { userItem, index } = this.props
        const { buttonState } = this.state;
        return (
            <div className={`item-row clearfix`} key={index}>
                <div className="profile-info">
                    <div className="user-info">
                        <img src={userItem.profile_image_url} />
                        <div>
                            <p className="profile-name">{userItem.name}  <span className="profile-state"></span></p>
                            <p className="profile-username">@{userItem.screen_name}</p>
                            <p className="profile-title" title={userItem.description}>{userItem.description}</p>
                        </div>
                    </div>

                    <ul className="stats-info">
                        <li><p className="stat-count">{abbrNum(userItem.statuses_count, 1)}</p> <p className="stat-name">tweets</p></li>
                        <li><p className="stat-count">{abbrNum(userItem.followers_count, 1)}</p><p className="stat-name">followers</p></li>
                        <li><p className="stat-count">{abbrNum(userItem.friends_count, 1)}</p><p className="stat-name">following</p></li>
                    </ul>

                    <div className="item-actions pull-right">
                        {!!buttonState &&
                            buttonState.action == "add" ?
                            <img onClick={() => { this.perform(); close(); }} src={`/images/user-plus-regular.svg`} className={`user-action ${buttonState.disabled ? 'disabled-btn' : ''}`} />
                            :
                            <img onClick={() => { this.perform(); close(); }} src={`/images/user-minus-regular.svg`} className={`user-action ${buttonState.disabled ? 'disabled-btn' : ''}`} />
                        }
                    </div>
                </div>
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