import React, { useState, useEffect, useMemo } from "react";
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
  const [searchResults, setSearched] = useState([]);
  const [isStarred, setStarred] = useState(false);

  const displayChannelName = channel => channel ? `#${channel.name}` : " ";

  const handleStarred = () => {
    setStarred((state) => {
      setStarred(!state);
      addStarred(!state);
    });
  }

  const addStarred = (isStarred) => {
    const {createdUser: cu} = currentUser;
    const {ref, set, getDatabase, remove} = firebase.database;
    const db = getDatabase();
    if(isStarred){
      const info = {
        name: currentChannel.name,
        details: currentChannel.details,
        id: currentChannel.id,
        createdBy : {
          avatar: cu.photoURL,
          name: cu.displayName
        }
      }
      set(ref(db, `users/${cu.uid}/starred/${currentChannel.id}`), info);
    }

    else remove(ref(db, `users/${cu.uid}/starred/${currentChannel.id}`));
  }

  useEffect(() => {
    if (currentChannel && currentUser) {
      setChannel((state) => state = currentChannel);
      alreadyStarredInDB();
      getMessages();
    }
  }, [currentChannel]);

  const alreadyStarredInDB = () => {
    const {createdUser: cu} = currentUser;
    const {ref, onValue, getDatabase} = firebase.database;
    const db = getDatabase();
    onValue(ref(db, `users/${cu.uid}/starred/${currentChannel.id}`), (snap) => {
      if(snap.val()) setStarred(true);
    });

  }

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

      else {
        countUniqueUser([]);
        setMessage([]);
      }
    });
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const searchMsg = () => {
    const channelMsgs = [...messagesArray];
    const regex = new RegExp(searchTerm, 'gi');
    const searchResults = channelMsgs.reduce((acc, msg) => {
      if ((msg.content && msg.content.match(regex)) ||
        (msg.user.name.match(regex))) {
        acc.push(msg);
      }
      return acc;
    }, []);

    setSearched(searchResults);
  }

  useMemo(() => {
    return searchMsg();
  }, [searchTerm]);

  const countUniqueUser = messages => {
    const uniqueUser = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) acc.push(message.user.name);
      return acc;
    }, []);

    const plural = (uniqueUser.length > 1) || false;
    const length = uniqueUser.length;
    const numUser = length && plural ? `${length} users` : `1 user`;
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
    if (percent > 0) setpg(true);
  }

  const checkToStarr = (channel) => {
    const {createdUser: cu} = currentUser;
    const {ref, onValue, getDatabase} = firebase.database;
    const db = getDatabase();
    let d;
    onValue(ref(db, `users/${cu.uid}/starred`), (snap) => {
      const data = snap.val();
      if(data && channel){
         d = data[channel.id];
      }
    });

    return d? true : false;
  }

  return (
    <React.Fragment>
      <MessageHeader
        handleSearchChange={handleSearchChange}
        channelName={displayChannelName(channel)}
        isStarred={checkToStarr(channel)}
        users={users}
        handleStarred={handleStarred}
      />

      <Segment>
        <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
          {searchTerm ? displayMessages(searchResults) : displayMessages(messagesArray)}
        </Comment.Group>
      </Segment>

      <MessageForm isProgressBar={isProgressBar} currentUser={currentUser} />
    </React.Fragment>
  )
}

export default Messages;
