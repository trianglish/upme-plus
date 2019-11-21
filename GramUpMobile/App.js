/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState, Fragment } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  StatusBar,
  Button,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import Prompt from 'react-native-prompt';

import { WebView, WebViewSharedProps } from 'react-native-webview';
import { withWebViewBridge } from 'react-native-webview-bridge-seamless';

const WebViewWithBridge = withWebViewBridge(WebView);

import { instagram, processMessage } from './processMessage';

const source = { uri: 'https://gramup-react-native.caffeinum.now.sh' };

const sendMessage = async message => {
  console.log('message', message)

  if (message.method === 'ping') return { status: 'ok', pong: 'pong' }

  return new Promise((resolve, reject) => {
    processMessage(message, response => resolve(response))
  })
}

const tryLogin = async (username, password) => {
  const res = await instagram.login(username, password, true)
}

const isLoggedIn = () => {
  return instagram.is_logged_in
}

const App = () => {

  const [ username, setUsername ] = useState('')
  const [ password, setPassword ] = useState('')

  const [ step, goToStep ] = useState(isLoggedIn() ? 'logged_in' : 'none')

  const finishStep = () => {
    console.log('state', step, username, password)

    if (step === 'login') {
      if (!!username && !!password) {
        tryLogin(username, password)
          .then(() => goToStep('logged_in'))
      } else {
        goToStep('none')
      }
    } else if (step === 'get_username') {
      goToStep('get_password')
    } else if (step === 'get_password') {
      goToStep('login')
    } else if (step === 'logged_in') {
      alert('Already logged in')
    } else {
      goToStep('none')
    }
  }

  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
      <ScrollView>
        <View style={styles.body}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              Gram Up!
            </Text>

            {isLoggedIn() && (
              <Text style={styles.sectionTitle}>
                @{instagram.user.username}
              </Text>
            )}
          </View>

          {!isLoggedIn() && (
            <View style={styles.loginView}>
              <Text>Username</Text>
              <TextInput
                style={styles.formInput}
                textContentType="username"
                onChangeText={(value) => setUsername('' + value)}
                value={username}
              />

              <Text>Password</Text>
              <TextInput
                style={styles.formInput}
                textContentType="password"
                onChangeText={(value) => setPassword('' + value)}
                value={password}
              />
              <Button
                title="Login"
                onPress={() => {
                  tryLogin(username, password)
                    .then(() => goToStep('logged_in'))
                }}
              />
            </View>
          )}

          <WebViewWithBridge
            style={styles.webview}
            source={source}
            reactNativeApi={{
              sendMessage,
            }}
          />

        </View>
        </ScrollView>
      </SafeAreaView>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },

  loginButton: {
    flex: 0.5,
  },

  loginView: {
    fontSize: 24,
    color: 'black',

    flex: 1,
    // height: Dimensions.get('window').height,

    marginLeft: 20,
    marginTop: 20,
    marginRight: 20,
  },

  webview: {
    width:  Dimensions.get('window').width,
    height: Dimensions.get('window').height - 100,
    // height: 650,

    marginLeft: 0,
    marginTop: 20,
    marginRight: 0,

    borderColor: 'red',
    borderWidth: 2,
    borderStyle: 'solid',
  },

  formInput: {
    fontSize: 24,
    color: 'black',

    borderColor: 'green',
    borderWidth: 2,
    borderStyle: 'solid',
  },

  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
    flex: 0.5,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
