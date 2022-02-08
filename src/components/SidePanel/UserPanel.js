import React, { Component } from 'react';
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from "semantic-ui-react";
import { connect } from "react-redux";
import firebase from '../../firebase';
import AvatarEditor from "react-avatar-editor";
import uuidv4 from "uuid/v4";
import { setUser } from "../actions";

class UserPanel extends Component {

    state = {
        user: this.props.currentUser,
        modal: false,
        previewImage: '',
        croppedImage: '',
        blob: null
    }

    handleChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('load', () => this.setState({ previewImage: reader.result }));
    }

    handleCropImage = () => {
        if (this.avatarEditor) {
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageUrl,
                    blob
                });
            });
        }
    }

    uploadAvatar = () => {
        // const pathToUpload = this.channel.id;
        const { user, blob } = this.state;
        const { getStorage, sref, uploadBytesResumable, getDownloadURL } = firebase.storage;
        const storage = getStorage();
        const filepath = `chat/public/${user.createdUser.uid}/avatar/${uuidv4()}.jpg`;
        const storageRef = sref(storage, filepath);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed',
            (snapshot) => { },

            (error) => {
                console.log(error);
            },

            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    if (downloadURL) {
                        this.saveInUser(downloadURL, user);
                    }
                });
            }
        );
    }

    saveInUser = (downloadURL, user) => {
        const { set, ref, getDatabase} = firebase.database;
        const { updateProfile } = firebase;
        const auth = firebase.auth();
        const db = getDatabase();
        const userRef = ref(db, `users/${user.createdUser.uid}/photo`);

        set(userRef, downloadURL).then(() => {
            updateProfile(auth.currentUser, {
                photoURL: downloadURL
            }).then(() => {
                user.createdUser.photoURL = downloadURL;
                this.props.setUser(user.createdUser);
                this.closeModal();
            });
        });
    }

    handleSignOut = () => {
        const { user } = this.state;
        const auth = firebase.auth();
        const { remove, ref, getDatabase } = firebase.database;
        firebase.signOut(auth).then(() => {
            const db = getDatabase();
            remove(ref(db, `/presence/${user.uid}`)).then(() => {
                remove(ref(db, `typing/${this.props.channel.id}/${user.uid}`));
            });
        }).catch(e => console.error(e));
    }

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });

    dropdownOptions = () => [
        {
            key: "user",
            text: <span>Signed in as <strong>{this.state.user.createdUser.displayName}</strong></span>,
            disabled: true
        },

        {
            key: "avatar",
            text: <span onClick={this.openModal}>Change Avatar</span>,
        },

        {
            key: "signOut",
            text: <span onClick={this.handleSignOut}>Sign Out</span>,
        }

    ]

    render() {
        const { user, modal, previewImage, croppedImage } = this.state;
        return (
            <Grid style={{ backgroundColor: this.props.primaryColor }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: "2rem", margin: 0 }}>
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                        <Header>
                            <Image src={user.createdUser.photoURL} spaced="right" size="small" avatar />
                            <Dropdown style={{ color: "#ffffff", fontSize: "1.2rem" }} trigger={<span>{user.createdUser.displayName}</span>} options={this.dropdownOptions()} />
                        </Header>
                    </Grid.Row>

                    <Modal basic open={modal} onClose={this.closeModal}>
                        <Modal.Header>Change Avatar</Modal.Header>
                        <Modal.Content>
                            <Input onChange={this.handleChange} fluid type="file" label="New Avatar" name="previewImage" />
                            <Grid centered stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui center aligned grid">
                                        {previewImage && (
                                            <AvatarEditor
                                                ref={node => (this.avatarEditor = node)}
                                                image={previewImage}
                                                width={120}
                                                height={120}
                                                border={50}
                                                scale={1.2}
                                            />
                                        )}
                                    </Grid.Column>
                                    <Grid.Column>{croppedImage && (
                                        <Image
                                            style={{ margin: '3.5em auto' }}
                                            width={100}
                                            height={100}
                                            src={croppedImage}
                                        />
                                    )}</Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {croppedImage &&
                                <Button color="green" inverted onClick={this.uploadAvatar()}>
                                    <Icon name="save" /> Change Avatar
                                </Button>}
                            <Button color="green" inverted onClick={this.handleCropImage}>
                                <Icon name="image" /> Preview
                            </Button>
                            <Button color="red" inverted onClick={this.closeModal}>
                                <Icon name="remove" /> Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>

                </Grid.Column>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        currentChannel: state.channel.currentChannel
    }
}


export default connect(mapStateToProps, { setUser })(UserPanel);