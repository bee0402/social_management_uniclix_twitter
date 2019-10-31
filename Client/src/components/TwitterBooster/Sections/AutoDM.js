import React from 'react';
import { connect } from 'react-redux';
import { startSetChannels } from "../../../actions/channels";
import UpgradeAlert from '../../UpgradeAlert';
import channelSelector from '../../../selectors/channels';
import Loader from '../../Loader';

class AutoDM extends React.Component {
    state = {
        loading: true,
        isTabActive: 'predefined'
    }

    componentDidMount() {

        if (!this.props.channelsLoading) {
            this.fetchData();
        }
        this.setState({
            loading: false
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if ((this.props.selectedChannel !== prevProps.selectedChannel) || (this.state.category !== prevState.category)) {
            this.fetchData();
        }
    }

    fetchData = (order = 'desc') => {

    };


    ChangeTab = (newIndex) => {
        this.setState(() => ({
            isTabActive: newIndex
        }));
    }

    render() {
        const { isTabActive } = this.state
        return (
            <div>
                <div>

                    <div className="section-header">
                        <div className="section-header__first-row">
                            <h2>Auto DM
                                <label class="switch round">
                                    <input type="checkbox" />
                                    <span class="slider round"></span>
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
                <div className="">
                    <form onSubmit={this.onSubmit}>
                        <div className="form-row">
                            <div className="relative-pos add-dm-message">
                                <input type="text" className="form-control p20 search-input" onChange={this.onChange} id="keyword" name="keyword" placeholder="Add Message" />
                                <div className="btn-container">
                                    {
                                        false ?
                                            <button className="default-button add-message">Save</button>
                                            :
                                            <button className="default-button add-message disabled" disabled>Save</button>
                                    }

                                </div>
                            </div>

                        </div>
                    </form>
                    <div className="tab-cnt">
                        <h3>Predefined Messages</h3>
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
                                    <button className="default-button add-message disabled" onClick={() => this.selectMessage('Welcome @username to my profile, thanks for follow me!')}>Select</button>
                                    </li>
                                    <li className="list-item">Add a new message, give warmth to your welcome and boost your account
                                    <button className="default-button add-message disabled" onClick={() => this.selectMessage('Welcome @username to my profile, thanks for follow me!')}>Select</button></li>
                                    <li className="list-item">Welcome @username to my profile, thanks for follow me!
                                    <button className="default-button add-message disabled" onClick={() => this.selectMessage('Welcome @username to my profile, thanks for follow me!')}>Select</button></li>
                                    <li className="list-item">Add a new message, give warmth to your welcome and boost your account
                                    <button className="default-button add-message disabled" onClick={() => this.selectMessage('Welcome @username to my profile, thanks for follow me!')}>Select</button></li>
                                    <li className="list-item">Welcome @username to my profile, thanks for follow me!
                                    <button className="default-button add-message disabled" onClick={() => this.selectMessage('Welcome @username to my profile, thanks for follow me!')}>Select</button></li>
                                </ul>
                            </div >
                            <div className={`cnt-item ${isTabActive == 'created-by-me' ? 'active' : ''}`}>
                                <ul className="list-items">
                                    <li className="list-item">Welcome @username to my profile, thanks for follow me!
                                    <button onClick={() => this.selectMessage('Welcome @username to my profile, thanks for follow me!')}>Select</button>
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