import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import firebase from '../../firebase';
import { setCurrentChannel, setPrivateChannel } from "../actions";
import { connect } from "react-redux";

class DirectMessages extends React.Component {
    state = {
        user: this.props.currentUser.createdUser,
        users: [],
        active: null
    }

    componentDidMount() {
        window.addEventListener('beforeunload', function (e) {
            e.preventDefault();
            const { ref, getDatabase, remove } = firebase.database;
            const db = getDatabase();
            remove(ref(db, `/presence/${user.uid}`));
            remove(ref(db, `typing/${this.props.channel.id}/${user.uid}`));
        }, false);

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
        let flag = false;
        set(ref(db, `presence/${user.uid}`), true);
        onChildAdded(ref(db, "presence/"), (snap) => {
            if (user.uid !== snap.key) {
                this.addStatus(snap.key, true);
                flag = true;
            }
        });

        if (!flag) this.addStatus(null, false);

        onChildRemoved(ref(db, "presence/"), (snap) => {
            if (user.id !== snap.key) this.addStatus(snap.key, false);
        });
    }

    addStatus = (userId, connected = true) => {
        const { users } = this.state;
        if (users.length) {
            const updatedActiveUsers = users.map((user) => {
                if (user.uid === userId) {
                    user['status'] = (connected ? 'online' : 'offline');
                }
                return user;
            });

            this.setState({ users: updatedActiveUsers });
        }
    }

    isUserOnline = user => user.status === "online";
    isSelected = (idx) => {
        this.setState({ active: idx });
    }

    handlePrivateChannel = (user) => {
        const { user: currentUser } = this.state;
        const channelId = `${user.uid}/${currentUser.uid}`;
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
                {users.map((user, idx) => (
                    <Menu.Item
                        key={user.uid}
                        active={idx === this.state.active}
                        onClick={() => {
                            this.handlePrivateChannel(user);
                            this.isSelected(idx);
                        }}
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

const mapStateToProps = (state) => {
    return {
        channel: state.channel.currenyChannel
    }
}

export default connect(mapStateToProps, { setCurrentChannel, setPrivateChannel })(DirectMessages);