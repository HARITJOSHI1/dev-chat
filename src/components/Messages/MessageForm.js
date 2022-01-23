import React from "react";
import uuidv4 from "uuid/v4";
import { Segment, Button, Input } from "semantic-ui-react";
import { connect } from "react-redux";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";
import { setNotifications } from "../actions";
import { onValue } from "firebase/database";

class MessageForm extends React.Component {
    channel;
    state = {
        uploadState: null,
        percentageUploaded: 0,
        message: "",
        loading: false,
        user: this.props.currentUser.createdUser,
        write: false,
        errors: [],
        modal: false
    };

    openModal = () => this.setState({ modal: true });
    closeModal = () => this.setState({ modal: false });

    uploadFile = (file, metadata) => {
        const pathToUpload = this.channel.id;
        const { getStorage, sref, uploadBytesResumable, getDownloadURL } = firebase.storage;
        const storage = getStorage();
        const filepath = `chat/public/${uuidv4()}.jpg`;
        const storageRef = sref(storage, filepath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        this.setState({ uploadState: "uploading" }, () => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    if (snapshot.state === "running") {
                        this.props.isProgressBar(progress);
                        this.setState({ percentageUploaded: progress });
                    }
                },

                (error) => {
                    console.log(error);
                },

                () => {
                    // Handle successful uploads on complete
                    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        if (!this.props.isPrivate) this.sendFileMessage(downloadURL, pathToUpload);
                        else {
                            const [user, currentUser] = this.channel.id.split('/');
                            const path1 = `${user}/${currentUser}`;
                            const path2 = `${currentUser}/${user}`;
                            this.sendFileMessage(downloadURL, path1);
                            this.sendFileMessage(downloadURL, path2);
                        }
                    });
                }
            );
        });
    }

    sendFileMessage(fileUrl, pathToUpload) {
        const { push, ref, child, set, getDatabase, onValue } = firebase.database;
        const db = getDatabase();
        const id = push(child(ref(db), pathToUpload)).key;

        set(
            ref(db, `messages/${pathToUpload}/` + id),
            this.createMessage(fileUrl)
        )
            .then(() => {
                this.setState({ loading: false, uploadState: "done" });
                this.updatedNotifications();
            })
            .catch((err) => {
                console.error(err);
                this.setState({
                    loading: false,
                    uploadState: "failed",
                    error: this.state.errors.concat(err),
                });
            });
    }

    updatedNotifications = () => {
        const { ref, getDatabase, onValue } = firebase.database;
        const db = getDatabase();
        onValue(ref(db, `messages/${this.channel.id}`), (snap) => {
            const data = snap.val();
            const total = Object.keys(data).length;
            const { notifications, setNotifications } = this.props;
            notifications.forEach(notif => {
                if (notif.id === this.channel.id) {
                    notif.total = total;
                    notif.lastTotal = total;
                }
            });

            setNotifications(notifications);
        });
    }

    componentDidUpdate() {
        this.channel = this.props.currentChannel;
    }

    onMessageChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    createMessage(fileUrl = null) {
        const message = {
            timestamp: Date.now(),
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL,
            },
        };

        if (fileUrl) message.image = fileUrl;
        else message.content = this.state.message;
        return message;
    }

    sendMessage = (message, path) => {
        this.setState({ loading: true });
        if (message) {
            const { push, ref, child, set, getDatabase, remove } = firebase.database;
            const db = getDatabase();
            const id = push(child(ref(db), this.channel.id)).key;

            set(
                ref(db, path + `/${id}`),
                this.createMessage()
            )
                .then(() => {
                    this.setState({ loading: false, message: "" });
                    this.updatedNotifications();
                    if (!this.props.isPrivate) {
                        const typingRef = ref(db, `typing/${this.channel.id}/${this.state.user.uid}`);
                        remove(typingRef);
                    }

                    else {
                        const typingRef = ref(db, `privateTyping/${this.channel.id}`);
                        remove(typingRef);
                    }
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

    onTyping = () => {
        if (this.state.message) {
            const { set, ref, getDatabase } = firebase.database;
            const db = getDatabase();
            if (!this.props.isPrivate) {
                const typingRef = ref(db, `typing/${this.channel.id}/${this.state.user.uid}`);
                set(typingRef, this.state.user.displayName);
            }

            else {
                const typingRef = ref(db, `privateTyping/${this.channel.id}`);
                set(typingRef, {
                    name: this.state.user.displayName,
                    channelId: this.channel.id,
                    userId: this.state.user.uid
                });
            }
        }

        else {
            const { ref, getDatabase, remove } = firebase.database;
            const db = getDatabase();
            if (!this.props.isPrivate) {
                const typingRef = ref(db, `typing/${this.channel.id}/${this.state.user.uid}`);
                remove(typingRef);
            }

            else {
                const typingRef = ref(db, `privateTyping/${this.channel.id}`);
                remove(typingRef);
            }
        }
    }

    render() {
        const { message, errors, modal, uploadState, percentageUploaded } = this.state;
        return (
            <Segment className="message__form">
                <Input
                    fluid
                    value={message}
                    name="message"
                    onChange={this.onMessageChange}
                    onKeyDown={this.onTyping}
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
                        onClick={() => {
                            if (!this.props.isPrivate) this.sendMessage(message, `messages/${this.channel.id}/`);

                            else {
                                const [user, currentUser] = this.channel.id.split('/');
                                const path1 = `messages/${user}/${currentUser}`;
                                const path2 = `messages/${currentUser}/${user}`;
                                this.sendMessage(message, path1);
                                this.sendMessage(message, path2);
                            }
                        }
                        }
                        color="orange"
                        content="Add Reply"
                        labelPosition="left"
                        icon="edit"
                    />
                    <Button
                        color="teal"
                        onClick={this.openModal}
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                    />
                    <FileModal uploadFile={this.uploadFile} modal={modal} closeModal={this.closeModal} />

                </Button.Group>{" "}

                <ProgressBar
                    uploadState={uploadState}
                    percentageUploaded={percentageUploaded}
                />
            </Segment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        currentChannel: state.channel.currentChannel,
        isPrivate: state.channel.isPrivate,
        notifications: state.notifications
    };
};

export default connect(mapStateToProps, { setNotifications })(MessageForm);
