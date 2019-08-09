/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';

import { WebView, WebViewSharedProps } from 'react-native-webview';
import { withWebViewBridge } from 'react-native-webview-bridge-seamless';

const WebViewWithBridge = withWebViewBridge(WebView);

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import instagram from './src/instagram/';

const VERSION = 'react-native-0.0.1';
const source = { uri: 'http://localhost:1234' };

const sendMessage = async message => {
  console.log('message', message)

  if (message.method === 'ping') return { status: 'ok', pong: 'pong' }

  return new Promise((resolve, reject) => {
    processMessage(message, response => resolve(response))
  })
}

const processMessage = async (message, sendResponse) => {
  try {
    const { method, params } = message

    if (method === 'ping') {
      return sendResponse({ status: 'ok', pong: 'pong' })
    }

    if (method === 'version') {
      return sendResponse({ status: 'ok', version: VERSION })
    }

    const res = await instagram.callMethod(method, ...params)

    return sendResponse(res)
  } catch (err) {
    return sendResponse({ status: 'error', error: err.message })
  }
}

const App = () => {
  return (
    <Fragment>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
      <ScrollView>
        <View style={styles.body}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Gram Up!</Text>
          </View>

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

  webview: {
    width: 375,
    height: 650,

    marginLeft: 0,
    marginTop: 20,
    marginRight: 0,

    borderColor: 'red',
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
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
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
