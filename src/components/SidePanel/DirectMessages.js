import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import firebase from '../../firebase';
import {setCurrentChannel, setPrivateChannel} from "../actions";
import {connect} from "react-redux";

class DirectMessages extends React.Component {
    state = {
        user: this.props.currentUser.createdUser,
        users: []
    }

    componentDidMount() {
        const { user } = this.state;
        let loadedUser = [];
        const { ref, onChildAdded, getDatabase } = firebase.database;
        const db = getDatabase();
        onChildAdded(ref(db, "users/"), (snap) => {
            if (user.uid !== snap.key) {
                let user = snap.val();
                user["uid"] = snap.key;
                user["status"] = 'offline';
                loadedUser.push(user);
            }
        });

        this.setState({ users: loadedUser }, this.addOnlineUser);
    }

    addOnlineUser = () => {
        const { user } = this.state;
        const { ref, onChildAdded, getDatabase, set, onChildRemoved } = firebase.database;
        const db = getDatabase();
        set(ref(db, `presence/${user.uid}`), true);
        onChildAdded(ref(db, "presence/"), (snap) => {
            if (user.id !== snap.key) this.addStatus(snap.key, true);
        });

        onChildRemoved(ref(db, "presence/"), (snap) => {
            if (user.id !== snap.key) this.addStatus(snap.key, false);
        });
    }

    addStatus = (userId, connected = true) => {
        const { users } = this.state;
        if (users.length) {
            const updatedActiveUsers = this.state.users.map((user) => {
                if (user.uid === userId) {
                    user['status'] = (connected ? 'online' : 'offline');
                }
                return user;
            });

            this.setState({ users: updatedActiveUsers });
        }
    }

    isUserOnline = user => user.status === "online";
    handlePrivateChannel = (user) => {
        const{user: currentUser} = this.state;
        const channelId =  `${user.uid}/${currentUser.uid}`;
        const channelInfo = {
            id: channelId,
            name: user.name
        }

        this.props.setCurrentChannel(channelInfo);
        this.props.setPrivateChannel(true);
    }

    render() {
        const { users } = this.state;

        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail" /> DIRECT MESSAGES
                    </span>{' '}
                    ({users.length})
                </Menu.Item>
                {users.map(user => (
                    <Menu.Item
                        key={user.uid}
                        onClick={this.handlePrivateChannel.bind(this, user)}
                        style={{ opacity: 0.7, fontStyle: "italic" }}
                    >
                        <Icon
                            name="circle"
                            color={this.isUserOnline(user) ? "green" : "red"}
                        />
                        @ {user.name}
                    </Menu.Item>
                ))}
            </Menu.Menu>
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(DirectMessages);