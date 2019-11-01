import React from 'react';
import { connect } from 'react-redux';
import { ToastContainer } from "react-toastr";
import { startSetChannels } from "../../../actions/channels";
import { activateADM } from '../../../requests/twitter/channels';
import UpgradeAlert from '../../UpgradeAlert';
import channelSelector from '../../../selectors/channels';
import Loader from '../../Loader';

let toastContainer;

class AutoDM extends React.Component {
    state = {
        loading: true,
        isTabActive: 'predefined',
        keyword: "",
        isADMactive: this.props.selectedChannel.auto_dm
    }
    componentDidMount() {
        if (!this.props.channelsLoading) {
            this.fetchData();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if ((this.props.selectedChannel !== prevProps.selectedChannel) || (this.state.category !== prevState.category)) {
            this.fetchData();
            this.setState({
                isADMactive: this.props.selectedChannel.auto_dm
            })
        }
    }

    fetchData = (order = 'desc') => {

        this.setState({
            loading: false
        })
    };


    ChangeTab = (newIndex) => {
        this.setState(() => ({
            isTabActive: newIndex
        }));
    }

    onFieldChange = (e) => {
        const id = e.target.id;
        let state = Object.assign({}, this.state);
        state[id] = e.target.value;
        this.setState(() => (state));
    };
    selectMessage = (val) => {
        this.setState({ keyword: val });
    }

    activateDm = (e) => {
        const channelId = this.props.selectedChannel.id;
        const status = !this.state.isADMactive;
        this.setState({ isADMactive: status })
        return activateADM(channelId, status)
            .then((response) => {
                toastContainer.success("DM posted successfully.", "Success", { closeButton: true });
                return Promise.resolve(response)
            })
            .catch((error) => {

                if (typeof error.response.statusText == "undefined") {
                    console.log(error);
                    return;
                }
                console.log(error);
                Promise.reject(error);
            });
    }
    saveMessage = () => {

    }
    render() {
        const { isTabActive, isADMactive, keyword } = this.state
        return (
            <div>
                <div>
                    <ToastContainer
                        ref={ref => toastContainer = ref}
                        className="toast-top-right"
                    />

                    <div className="section-header">
                        <div className="section-header__first-row">
                            <h2>Auto DM
                                <label className="switch round">
                                    <input type="checkbox" defaultChecked={isADMactive != 0 ? 'checked' : ''} onChange={(e) => this.activateDm(e)} />
                                    <span className="slider round"></span>
                                </label>
                            </h2>
                        </div>

                        <div className="section-header__second-row">
                            <p>This is your Auto direct message, you can choose and edit a predefined one or start writing your own.</p>
                        </div>
                    </div>
                </div>
                {this.state.loading && <Loader />}
                <UpgradeAlert isOpen={this.state.forbidden && !this.state.loading} goBack={true} setForbidden={this.setForbidden} />
                <div className="aadm-cnt">
                    <form onSubmit={this.onSubmit}>
                        <div className="form-row">
                            <div className="relative-pos add-dm-message">
                                <input type="text" className="form-control p20 search-input" onChange={(e) => this.onFieldChange(e)} id="keyword" name="keyword" value={keyword} placeholder="Add Message" />
                                <div className="btn-container">
                                    {
                                        false ?
                                            <button onClick={() => this.saveMessage()} className="default-button add-message">Save</button>
                                            :
                                            <button className="default-button add-message disabled" disabled>Save</button>
                                    }

                                </div>
                            </div>

                        </div>
                    </form>
                    <div className="tab-cnt">
                        <h3 className="subsection-header">Predefined Messages</h3>
                        <div className="tab-head">
                            <div className={`tab-nav-item ${isTabActive == 'predefined' ? 'active' : ''}`}>
                                <button href="#personal-info" onClick={() => this.ChangeTab('predefined')}>Predefined</button>
                            </div>
                            <div className={`tab-nav-item ${isTabActive == 'created-by-me' ? 'active' : ''}`}>
                                <button href="#company-info" onClick={() => this.ChangeTab('created-by-me')}>Created by me</button>
                            </div>
                        </div>
                        <div className="tab-body">
                            <div className={`cnt-item ${isTabActive == 'predefined' ? 'active' : ''}`}>
                                <ul className="list-items">
                                    <li className="list-item">Welcome @username to my profile, thanks for follow me!
                                    <button className="blue-txt-btn add-message" onClick={() => this.selectMessage('Welcome @username to my profile, thanks for follow me!')}>Select</button>
                                    </li>
                                    <li className="list-item">Add a new message, give warmth to your welcome and boost your account
                                    <button className="blue-txt-btn add-message" onClick={() => this.selectMessage('Add a new message, give warmth to your welcome and boost your account')}>Select</button></li>
                                    <li className="list-item">Welcome @username to my profile, thanks for follow me!
                                    <button className="blue-txt-btn add-message " onClick={() => this.selectMessage('Welcome @username to my profile, thanks for follow me!')}>Select</button></li>
                                    <li className="list-item">Add a new message, give warmth to your welcome and boost your account
                                    <button className="blue-txt-btn add-message " onClick={() => this.selectMessage('Add a new message, give warmth to your welcome and boost your account')}>Select</button></li>
                                    <li className="list-item">Welcome @username to my profile, thanks for follow me!
                                    <button className="blue-txt-btn add-message" onClick={() => this.selectMessage('Welcome @username to my profile, thanks for follow me!')}>Select</button></li>
                                </ul>
                            </div >
                            <div className={`cnt-item ${isTabActive == 'created-by-me' ? 'active' : ''}`}>
                                <ul className="list-items">
                                    <li className="list-item">Welcome @username to my profile, thanks for follow me!
                                    <button className="blue-txt-btn add-message" onClick={() => this.selectMessage('Welcome @username to my profile, thanks for follow me!')}>Select</button>
                                    </li>
                                </ul>
                            </div>
                        </div >
                    </div >

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
        selectedChannel: selectedChannel.length ? selectedChannel[0] : {}
    };
};

const mapDispatchToProps = (dispatch) => ({
    startSetChannels: () => dispatch(startSetChannels())
});

export default connect(mapStateToProps, mapDispatchToProps)(AutoDM);