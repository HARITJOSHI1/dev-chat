import React, { useState, useEffect } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";

const Messages = ({ currentChannel, currentUser }) => {
  const [channel, setChannel] = useState(null);
  const [messagesArray, setMessage] = useState([]);

  useEffect(() => {
    if (currentChannel && currentUser) {
      setChannel((state) => state = currentChannel);
      getMessages(channel);
    }

  }, [currentChannel]);

  const getMessages = (channel) => {
    let loadedMsg;
    const { ref, getDatabase, onValue } = firebase.database;
    const db = getDatabase();
    const channelRef = ref(db, `messages/${currentChannel.id}`);
    onValue(channelRef, (snap) => {
      const data = snap.val();
      if (data) {
        loadedMsg = Object.keys(data).map(key => (data[key]));
        setMessage(loadedMsg);
      }

      else{
        setMessage([]);
      }
    });
  }

  const displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={currentUser.createdUser}
      />
    ));

  return (
    <React.Fragment>
      <MessageHeader />

      <Segment>
        <Comment.Group className="messages">
          {displayMessages(messagesArray)}
        </Comment.Group>
      </Segment>

      <MessageForm currentUser={currentUser} />
    </React.Fragment>
  )
}

export default Messages;
