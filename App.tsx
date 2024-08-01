/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import Modal from 'react-native-modal';

const serverAddress = 'http://192.168.4.20:5000';

const socket = io(serverAddress);

const ChatScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  const [username, setUserName] = useState('');
  const [launch, updateLaunch] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    socket.on('receiveMessage', (newMessage: any) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
    });

    socket.on('updateUserList', clientNames => {
      console.log('Updated client names:', clientNames);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('updateUserList');
    };
  });

  const addUserName = () => {
    socket.emit('getName', username);
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        text: message,
        createdAt: new Date(),
        user: username,
      };

      socket.emit('sendMessage', newMessage);
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!launch ? (
        <Modal animationIn="zoomIn" animationInTiming={800} isVisible={true}>
          <View style={styles.modal}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your Username"
              onChangeText={text => {
                setUserName(text);
              }}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                addUserName();
                updateLaunch(true);
              }}>
              <Text style={{color: 'white'}}>Save</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      ) : (
        <>
          <FlatList
            data={messages}
            renderItem={({item}) => (
              <View>
                <Text
                  style={[
                    styles.user,
                    {
                      alignSelf:
                        item.user === username ? 'flex-end' : 'flex-start',
                      marginStart: item.user === username ? 0 : 5,
                      marginEnd: item.user === username ? 0 : 5,
                    },
                  ]}>
                  {item.user === username ? 'You' : item.user}
                </Text>

                <Text
                  style={[
                    styles.message,
                    {
                      backgroundColor: item.user === username ? 'red' : 'grey',
                      alignSelf:
                        item.user === username ? 'flex-end' : 'flex-start',
                    },
                  ]}>
                  {item.text}
                </Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message"
            />
            <Button title="Send" onPress={sendMessage} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
  },
  messageContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderRadius: 10,
    backgroundColor: 'red',
    borderBottomColor: '#ccc',
  },
  message: {
    fontSize: 22,
    paddingHorizontal: 10,
    paddingVertical: 3,
    color: 'white',
    borderRadius: 8,
    flexWrap: 'wrap',
    alignSelf: 'baseline',
  },
  user: {
    fontSize: 12,
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    color: 'black',
    marginRight: 10,
  },
  modal: {
    backgroundColor: 'white',
    width: '50%',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'column',
  },
  button: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 10,
  },
  textInput: {
    borderColor: 'black',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
});

export default ChatScreen;
