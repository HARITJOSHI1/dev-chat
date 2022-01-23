import React, { Component } from 'react';
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from '../actions';
import { Menu, Icon } from "semantic-ui-react";
import firebase from "../../firebase";

class Starred extends Component {
    state = {
        activeChannel: false,
        starredChannels: []
    }

    componentDidMount() {
        const { cu } = this.props;
        const { ref, getDatabase, onValue, onChildRemoved } = firebase.database;
        const db = getDatabase();
    
        onValue(ref(db, `users/${cu.uid}/starred`), (snap) => {
            const data = snap.val();
            if(data){
                const loadedChannels = Object.keys(data).map(key => (data[key]));
                this.setState({starredChannels: loadedChannels});
            }

            onChildRemoved(ref(db, `users/${cu.uid}/starred`), (snap) => {
                const newStarredChannels = [...this.state.starredChannels];
                newStarredChannels.forEach((channel, idx, arr) => {
                    if(channel.id === snap.key) arr.splice(idx, 1);
                });

                this.setState({starredChannels: newStarredChannels});
            });
        });
    }

    setActiveChannel(channel) {
        this.setState({ activeChannel: channel.id });
    }

    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
    }

    displayChannels = (starredChannels) => (
        starredChannels.length > 0 &&
        starredChannels.map((channel, idx) => (
            <Menu.Item
                key={idx}
                onClick={this.changeChannel.bind(this, channel)}
                name={channel.name}
                style={{ opacity: 0.7 }}
                active={channel.id === this.state.activeChannel}
            >
                # {channel.name}
            </Menu.Item>
        ))
    )

    render() {
        const { starredChannels } = this.state;

        return (
            <Menu.Menu>
                <Menu.Item>
                    <span>
                        <Icon name="star" style={{ cursor: "pointer" }} /> STARRED
                    </span>

                    ({starredChannels.length})

                </Menu.Item>
                {this.displayChannels(starredChannels)}
            </Menu.Menu>

        );
    }
}

const mapStateToProps = (state) => {
    return {
        cu: state.user.currentUser.createdUser
    }
}

export default connect(mapStateToProps, { setCurrentChannel, setPrivateChannel })(Starred);
