import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Dashboard from '../components/TwitterBooster/Sections/Dashboard';
import AccountTargets from '../components/TwitterBooster/Sections/AccountTargets';
import KeywordTargets from '../components/TwitterBooster/Sections/KeywordTargets';
import Followers from '../components/TwitterBooster/Sections/Followers';
import CleanupList from '../components/TwitterBooster/Sections/CleanupList';
import RecentUnfollowers from '../components/TwitterBooster/Sections/RecentUnfollowers';
import RecentFollowers from '../components/TwitterBooster/Sections/RecentFollowers';
import InactiveFollowing from '../components/TwitterBooster/Sections/InactiveFollowing';
import Following from '../components/TwitterBooster/Sections/Following';
import WhiteList from '../components/TwitterBooster/Sections/WhiteList';
import BlackList from '../components/TwitterBooster/Sections/BlackList';
import AutoDM from '../components/TwitterBooster/Sections/AutoDM';
import Accounts from '../components/Accounts/Twitter';
import Checkout from '../components/Accounts/Checkout';
import CardEdit from '../components/Accounts/CardEdit';

const ManageRouter = () => (
    <div>
        <Switch>
            <Route exact path={`/twitter-booster`} render={() => <Redirect to="/twitter-booster/dashboard"/>} />
            <Route path={`/twitter-booster/dashboard`} component={Dashboard} />
            <Route path={`/twitter-booster/account-targets`} component={AccountTargets} />
            <Route path={`/twitter-booster/manage-accounts`} component={Accounts} />
            <Route path={`/twitter-booster/checkout`} component={Checkout} />
            <Route path={`/twitter-booster/CardEdit`} component={CardEdit} />
            <Route path={`/twitter-booster/keyword-targets`} component={KeywordTargets} />
            <Route path={`/twitter-booster/auto-dm`} component={AutoDM} />
            <Route path={`/twitter-booster/followers`} component={Followers} />
            <Route path={`/twitter-booster/clean-up-list`} component={CleanupList} />
            <Route path={`/twitter-booster/recent-unfollowers`} component={RecentUnfollowers} />
            <Route path={`/twitter-booster/recent-followers`} component={RecentFollowers} />
            <Route path={`/twitter-booster/inactive-following`} component={InactiveFollowing} />
            <Route path={`/twitter-booster/following`} component={Following} />
            <Route path={`/twitter-booster/WhiteList`} component={WhiteList} />
            <Route path={`/twitter-booster/BlackList`} component={BlackList} />
        </Switch>
    </div>
);

export default ManageRouter;