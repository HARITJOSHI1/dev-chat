import React, { useState, useEffect } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";

const Messages = ({ currentChannel, currentUser }) => {
  const [channel, setChannel] = useState(null);
  const [messagesArray, setMessage] = useState([]);
  const [progressBar, setpg] = useState(false);
  const [users, countUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const displayChannelName = channel => channel ? `#${channel.name}` : " ";

  useEffect(() => {
    if (currentChannel && currentUser) {
      setChannel((state) => state = currentChannel);
      getMessages();
    }

  }, [currentChannel]);

  const getMessages = () => {
    let loadedMsg;
    const { ref, getDatabase, onValue } = firebase.database;
    const db = getDatabase();
    const channelRef = ref(db, `messages/${currentChannel.id}`);
    onValue(channelRef, (snap) => {
      const data = snap.val();
      if (data) {
        loadedMsg = Object.keys(data).map(key => (data[key]));
        countUniqueUser(loadedMsg);
        setMessage(loadedMsg);
      }

      else{
        setMessage([]);
      }
    });
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const countUniqueUser = messages => {
    const uniqueUser = messages.reduce((acc, message) => {
      if(!acc.includes(message.user.name)) acc.push(message.user.name);
      return acc;
    }, []);

    const plural = (uniqueUser.length > 1 ) || false; 
    const numUser = uniqueUser.length && plural ? `${uniqueUser.length} users` : "1 user";
    countUser(numUser);
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

    const isProgressBar = percent => {
      if(percent > 0) setpg(true);
    }

  return (
    <React.Fragment>
      <MessageHeader searchTerm = {searchTerm} handleSearchChange = {handleSearchChange} channelName = {displayChannelName(channel)} users = {users}/>

      <Segment>
        <Comment.Group className={progressBar? 'messages__progress' : 'messages'}>
          {displayMessages(messagesArray)}
        </Comment.Group>
      </Segment>

      <MessageForm isProgressBar = {isProgressBar} currentUser={currentUser} />
    </React.Fragment>
  )
}

export default Messages;
