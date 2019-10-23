import React from 'react';

const TabComponent = ({ TabNav, props }) => (
    <div className="tab-cnt">
        <div className="tab-head">
            <div className="tab-nav-item">
                <a href="#personal-info">Personal information</a>
            </div>
            <div className="tab-nav-item">
                <a href="#personal-info">Company information</a>
            </div>
        </div>
        <div className="tab-body">
            {props.children}
        </div>
    </div>
);

export default TabComponent;