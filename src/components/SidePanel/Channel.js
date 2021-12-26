import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";
import { connect } from 'react-redux';
import { setCurrentChannel } from '../actions';
import firebase from "../../firebase";
import Loader from "react-loader-spinner";

class Channel extends Component {

    state = {
        user: this.props.currentUser.createdUser,
        channels: [],
        channelName: "",
        channelDetails: "",
        activeChannel: '',
        modal: false
    }

    componentDidMount() {
        const { ref, getDatabase, onValue } = firebase.database;
        let loadedChannels;
        const db = getDatabase();
        const channelRef = ref(db, 'channels/');
        onValue(channelRef, (snap) => {
            const data = snap.val();
            loadedChannels = Object.keys(data).map(key => (data[key]));
            this.setState({ channels: loadedChannels }, () => {
                this.props.setCurrentChannel(this.state.channels[0]);
                this.setState({ activeChannel: this.state.channels[0].id })
            });
        });

    }

    componentWillUnmount(){
        firebase.database.off();
    }

    addChannel({ channelName, channelDetails, user }) {
        const { push, ref, child, set, update, getDatabase } = firebase.database;
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
        this.props.setCurrentChannel(channel);
        this.setState({ activeChannel: channel.id })
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

export default connect(null, { setCurrentChannel })(Channel);
