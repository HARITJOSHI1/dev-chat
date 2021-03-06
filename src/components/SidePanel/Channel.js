import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button, Label } from "semantic-ui-react";
import { connect } from 'react-redux';
import { setCurrentChannel, setNotifications } from '../actions';
import firebase from "../../firebase";
import Loader from "react-loader-spinner";

class Channel extends Component {

    state = {
        user: this.props.currentUser.createdUser,
        channels: [],
        channelName: "",
        channelDetails: "",
        channel: null,
        activeChannel: '',
        notifications: this.props.notifications,
        modal: false
    }

    componentDidMount() {
        const { ref, getDatabase, onValue} = firebase.database;
        let loadedChannels;
        let channelkeys;
        const db = getDatabase();
        const channelRef = ref(db, 'channels/');
        onValue(channelRef, (snap) => {
            const data = snap.val();
            channelkeys = Object.keys(data);
            loadedChannels = Object.keys(data).map(key => (data[key]));
            this.setState({ channels: loadedChannels }, () => {
                this.props.setCurrentChannel(this.state.channels[0]);
                this.setState({ channel: this.state.channels[0] });
                this.setState({ activeChannel: this.state.channels[0].id });
                channelkeys.forEach(id => {
                    this.addNotifListener(id);
                });
            });
        });
    }

    addNotifListener(channelId) {
        const { ref, getDatabase, onChildAdded, onValue } = firebase.database;
        const db = getDatabase();
        let total = 0;

        onValue(ref(db, `messages/${channelId}`), (snap) => {
            const data = snap.val();
            if (this.state.channel && data) total = Object.keys(data).length;

            onChildAdded(ref(db, `messages/${channelId}`), (snap) => {
                if (this.state.channel) {
                    this.handleNotifications(
                        channelId,
                        this.state.channel.id,
                        this.state.notifications,
                        total);
                }
            });
        });
    }

    handleNotifications(channelId, currentChannelId, notifications, total) {
        const index = notifications.findIndex(notification => notification.id === channelId);

        if (index !== -1) {
            if (channelId !== currentChannelId) {
                const lastTotal = notifications[index].lastTotal;
                if ((total - lastTotal) > 0) {
                    notifications[index].count = (total - lastTotal);
                    notifications[index].total = total;
                }
            }
        }

        else {
            notifications.push({
                id: channelId,
                total,
                lastTotal: total,
                count: 0
            });
        }

        this.setState({ notifications }, () => this.props.setNotifications(notifications));
    }

    componentWillUnmount() {
        const { ref, getDatabase, off } = firebase.database;
        const db = getDatabase();
        off(ref(db));
    }

    addChannel({ channelName, channelDetails, user }) {
        console.log(channelName, channelDetails);
        const { push, ref, child, update, getDatabase } = firebase.database;
        const db = getDatabase();
        const key = push(child(ref(db), 'channels')).key;
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        }

        const data = {};
        data['channels/' + key] = newChannel;
        update(ref(db), data).then(() => {
            this.setState({ channelName: "", channelDetails: "" });
            this.setState({ modal: false });
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.isFormValid(this.state)) {
            this.addChannel(this.state);
        }
        else this.setState({ modal: false });
    }

    isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails;

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    setCurrentChannel(channel) {
        const { ref, getDatabase, remove } = firebase.database;
        const db = getDatabase();
        if (!this.props.isPrivate) {
            const typingRef = ref(db, `typing/${this.props.currentChannel.id}/${this.state.user.uid}`);
            remove(typingRef);
        }

        else {
            const typingRef = ref(db, `privateTyping/${this.props.currentChannel.id}`);
            remove(typingRef);
        }
        this.props.setCurrentChannel(channel);
        this.setState({ channel });
        this.setState({ activeChannel: channel.id });
        this.clearNotifications(channel);
    }

    clearNotifications(channel) {
        const updatedNotif = [...this.state.notifications];
        updatedNotif.forEach(notif => {
            if (notif.id === channel.id) {
                notif.count = 0;
                notif.lastTotal = notif.total;
            }
        });

        this.setState({ notifications: updatedNotif }, () => this.props.setNotifications(updatedNotif));
    }

    getNotificationsCount(channel) {
        let count = null;
        const el = this.state.notifications.find(e => {
            return (e.id === channel.id) && (e.total > 0);
        });

        if (el) count = el.count;
        return count;
    }

    displayChannels = (channels) => (
        channels.length > 0 &&
        channels.map(channel => (
            <Menu.Item
                key={channel.id}
                onClick={() => this.setCurrentChannel(channel)}
                name={channel.name}
                style={{ opacity: 0.7 }}
                active={channel.id === this.state.activeChannel}
            >
                # {channel.name}
                {this.getNotificationsCount(channel) ? <Label color="red">{this.getNotificationsCount(channel)}</Label> : null
                }
            </Menu.Item>
        ))
    )

    render() {
        const { channels, modal } = this.state;
        return (
            <React.Fragment>
                <Menu.Menu>
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" style={{ cursor: "pointer" }} /> CHANNELS
                        </span>

                        {" "}

                        ({channels.length}) <Icon name="add" style={{ cursor: "pointer" }} onClick={() => this.setState({ modal: true })} />
                    </Menu.Item>
                    {!channels.length ? (<Loader
                        style={{
                            position: "absolute",
                            top: "28%",
                            left: "35%",
                            transform: "translate(-50%, -50%)",
                        }}
                        type="Oval"
                        color="#c6c1c6"
                        height={23}
                        width={23}
                    />) : this.displayChannels(channels)}
                </Menu.Menu>

                <Modal basic open={modal} onClose={() => this.setState({ modal: false })}>
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Name of a Channel"
                                    name="channelName"
                                    onChange={this.handleChange}
                                    autoComplete="off"
                                />
                            </Form.Field>

                            <Form.Field>
                                <Input
                                    fluid
                                    label="About the Channel"
                                    name="channelDetails"
                                    onChange={this.handleChange}
                                    autoComplete="off"
                                />
                            </Form.Field>

                        </Form>
                    </Modal.Content>

                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark" /> Add
                        </Button>

                        <Button color="red" onClick={() => this.setState({ modal: false })} inverted>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>

            </React.Fragment>

        );
    }
}


const mapStateToProps = (state) => {
    return {
        notifications: state.notifications,
        currentChannel: state.channel.currentChannel,
        isPrivate: state.channel.isPrivate
    }
}

export default connect(mapStateToProps, { setCurrentChannel, setNotifications })(Channel);
