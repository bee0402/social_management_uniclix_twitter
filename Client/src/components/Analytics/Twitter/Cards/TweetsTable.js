import React from 'react';
import Loader from 'react-loader-spinner';
import { pageInsightsByType } from "../../../../requests/twitter/channels";
import AnalyticsTooltip from '../../AnalyticsTooltip';
import ReadMore from '../../../ReadMore';
import {abbrNum} from '../../../../utils/numberFormatter';

class TweetsTable extends React.Component{
    state = {
        tweets: null,
        loading: false
    };

    componentDidMount(){
        this.fetchAnalytics();
    };

    componentDidUpdate(prevProps){
        if(prevProps.selectedAccount != this.props.selectedAccount || prevProps.calendarChange != this.props.calendarChange)
        {
            this.fetchAnalytics();
        }  
    }

    fetchAnalytics = () => {
        this.setState(() => ({
            loading: true
        }));
        try {
            pageInsightsByType(this.props.selectedAccount, this.props.startDate, this.props.endDate, this.props.type)            
            .then((response) => {
                this.setState(() => ({
                    tweets: response,
                    loading: false
                }));
            }).catch(error => {
                this.setState(() => ({
                    loading: false
                }));
                return Promise.reject(error);
            }); 
        } catch (error) {
            
        }
        
    };

    render(){
        const {name, selectedChannel} = this.props;
        return (
            <div>

            <div className="section-header mb15">
                <div className="section-header__first-row">
                </div>

                <div className="section-header__second-row">
                    <h3>Tweets table</h3>
                </div>
            </div>

                {this.state.tweets != null && !this.state.loading ?
                    this.state.tweets.map((tweet, index)=> (
                        <div key={index} className={`item-row clearfix no-hover`}>
                    
                            <div>
                                <div className="profile-info row">
                                    <div className="user-info col-md-3 col-sm-3 col-xs-12">
                                        <img src={selectedChannel.avatar} />
                                        <div>
                                            <p className="profile-name">{ selectedChannel.name }  <span className="profile-state"></span></p>
                                            <p className="profile-username">{ tweet.date }</p>
                                        </div>
                                    </div>

                                    <div className="main-info col-md-6 col-sm-6 col-xs-12">
                                        <ReadMore characters={400}>{tweet.text ? tweet.text : ''}</ReadMore>
                                    </div>
                                    
                                    <ul className="stats-info show-flex col-md-3 col-sm-3 col-xs-12">
                                        <li><p className="stat-count">{ abbrNum(tweet.retweet_count, 1) }</p> <p className="stat-name">Retweets</p></li>
                                        <li><p className="stat-count">{ 0 }</p><p className="stat-name">Replies</p></li>
                                        <li><p className="stat-count">{ abbrNum(tweet.favorite_count, 1) }</p><p className="stat-name">Likes</p></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                )) : <div className="table-loader-style">{this.state.loading && <Loader type="Bars" color="#46a5d1" height={70} width={70} />}</div>}
            </div>
        );
    }
}

export default TweetsTable;