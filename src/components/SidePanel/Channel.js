import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";
import firebase from "../../firebase";

class Channel extends Component {

    state = {
        user: this.props.currentUser.createdUser,
        channels: [],
        channelName: "",
        channelDetails: "",
        modal: false
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
        else return;
    }

    isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails;

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

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
                                />
                            </Form.Field>

                            <Form.Field>
                                <Input
                                    fluid
                                    label="About the Channel"
                                    name="channelDetails"
                                    onChange={this.handleChange}
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

export default Channel;
