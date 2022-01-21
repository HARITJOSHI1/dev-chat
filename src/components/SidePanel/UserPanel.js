import React, { Component } from 'react';
import { Grid, Header, Icon, Dropdown, Image } from "semantic-ui-react";
// import { connect } from "react-redux";
import firebase from '../../firebase';

class UserPanel extends Component {

    state = {
        user: this.props.currentUser.createdUser
    }

    handleSignOut = () => {
        const {user} = this.state;
        const auth = firebase.auth();
        const { remove, ref, getDatabase } = firebase.database;
        firebase.signOut(auth).then(() => {
            const db = getDatabase();
            remove(ref(db, `/presence/${user.uid}`));
        }).catch(e => console.error(e));
    }

dropdownOptions = () => [
    {
        key: "user",
        text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
        disabled: true
    },

    {
        key: "avatar",
        text: <span>Change avatar</span>,
    },

    {
        key: "signOut",
        text: <span onClick={this.handleSignOut}>Sign Out</span>,
    }

]

render() {
    const { user } = this.state;
    return (
        <Grid style={{ backgroundColor: this.props.primaryColor }}>
            <Grid.Column>
                <Grid.Row style={{ padding: "2rem", margin: 0 }}>
                    <Header inverted floated="left" as="h2">
                        <Icon name="code" />
                        <Header.Content>DevChat</Header.Content>
                    </Header>
                    <Header>
                        <Image src={user.photoURL} spaced="right" size="small" avatar />
                        <Dropdown style={{ color: "#ffffff", fontSize: "1.2rem" }} trigger={<span>{user.displayName}</span>} options={this.dropdownOptions()} />
                    </Header>
                </Grid.Row>
            </Grid.Column>
        </Grid>
    );
}
}


export default UserPanel;