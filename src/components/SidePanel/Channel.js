import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";

class Channel extends Component {

    state = {
        channels: [],
        channelName: "",
        channelDetails: "",
        modal: false
    }

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
                            <Icon name="exchange" style= {{cursor: "pointer"}} /> CHANNELS
                        </span>

                        {" "}

                        ({channels.length}) <Icon name="add" style= {{cursor: "pointer"}} onClick={() => this.setState({ modal: true })} />
                    </Menu.Item>
                </Menu.Menu>

                <Modal basic open={modal} onClose={() => this.setState({ modal: false })}>
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form>
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
                        <Button color="green" inverted>
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
