import React from 'react';

const ChannelItems = ({ channels, setAction }) => (
    channels.map((channel) => (
        <ChannelItem key={channel.id} channel={channel} setAction={setAction} />
    ))
);

const ChannelItem = ({ channel, setAction }) => (

    <div className={`item-row clearfix no-hover`}>
                    
        <div>
            <div className="profile-info">
                <div className="user-info">
                    <img src={channel.avatar} />
                    <div>
                        <p className="profile-name">{ channel.name }  <span className="profile-state"></span></p>
                        <p className="profile-username">@{ channel.username }</p>
                    </div>
                </div>

                <div className="item-actions pull-right">
                    <img src={`/images/trash-icon.svg`} className={`user-action mrnone`} onClick={() => setAction({id: channel.id, type: "delete"})} />
                </div>
                
            </div>
        </div>
  </div>
);

export default ChannelItems;