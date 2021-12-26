import React from "react";
import { Segment, Button, Input } from "semantic-ui-react";
import { connect } from "react-redux";
import firebase from "../../firebase";
import Message from "./Message";

class MessageForm extends React.Component {
    channel;
    state = {
        message: "",
        loading: false,
        user: this.props.currentUser.createdUser,
        write: false,
        errors: [],
    };

    componentDidUpdate() {
        this.channel = this.props.currentChannel;
    }

    onMessageChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    createMessage(message) {
        return {
            timestamp: Date.now(),
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL,
            },
            content: message,
        };
    }

    sendMessage = async (message) => {
        this.setState({ loading: true });
        if (message) {
            const { push, ref, child, set, getDatabase } = firebase.database;
            const db = getDatabase();
            const id = push(child(ref(db), this.channel.id)).key;

            set(
                ref(db, `messages/${this.channel.id}/` + id),
                this.createMessage(message)
            )
                .then(() => {
                    this.setState({ loading: false, message: "" });
                })
                .catch((err) => {
                    console.error(err);
                    this.setState({
                        loading: false,
                        message: "",
                        error: this.state.errors.concat(err),
                    });
                });
        } else {
            this.setState({
                loading: false,
                errors: this.state.errors.concat({ message: "Add a message" }),
            });
        }
    };

    render() {
        const { message, errors } = this.state;
        return (
            <Segment className="message__form">
                <Input
                    fluid
                    value={message}
                    name="message"
                    onChange={this.onMessageChange}
                    style={{ marginBottom: "0.7em" }}
                    label={<Button icon={"add"} />}
                    labelPosition="left"
                    placeholder="Write your message"
                    className={
                        errors.some((err) => err.message.includes("message")) ? "error" : ""
                    }
                />{" "}
                <Button.Group icon widths="2">
                    <Button
                        onClick={this.sendMessage.bind(this, message)}
                        color="orange"
                        content="Add Reply"
                        labelPosition="left"
                        icon="edit"
                    />
                    <Button
                        color="teal"
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                    />
                </Button.Group>{" "}
            </Segment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        currentChannel: state.channel.currentChannel,
    };
};

export default connect(mapStateToProps)(MessageForm);
