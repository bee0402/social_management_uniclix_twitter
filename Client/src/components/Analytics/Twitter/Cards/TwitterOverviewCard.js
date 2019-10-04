import React from 'react';
import Loader from 'react-loader-spinner';
import AnalyticsTooltip from '../../AnalyticsTooltip';
import { pageInsightsByType } from "../../../../requests/twitter/channels";

class TwitterOverviewCard extends React.Component{
    state = {
        count: null,
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
                    count: response,
                    loading: false
                }));
            }).catch(error => {
                this.setState(() => ({
                    loading: false
                }));

                if(error.response.status === 403){
                    this.props.setForbidden(true);
                }
                
                return Promise.reject(error);
            }); 
        } catch (error) {
            
        }        
    };

    render(){
        const {name, description, iconPath} = this.props;
        return (
            <div className="overview-card analytics-card">
                <div className="analytic-card-body">
                    <div className="analytic-column col-md-6">
                        <div className="analytic-stats">
                            {
                                iconPath ? <img src={iconPath} /> :
                                <img className="card-img" src="/images/twitter.png" />
                            }
                            <div className="analytic-stat-count">
                                {this.state.loading ?  <Loader type="Bars" color="#46a5d1" height={30} width={30} /> : this.state.count !=null && this.state.count}
                            </div> 
                        </div>  
                        <p>{name}</p>
                    </div>

                 
                    <div className="analytic-column col-md-6">
                        <div>
                            <img src={`/images/stat-line.svg`} />
                        </div>

                        <p><span>+13</span> this week</p>
                    </div>

                    <div className="analytics-description clearfix"><span>48 new users</span> to follow</div>
                </div>
            </div>
            );
    }
}

export default TwitterOverviewCard;