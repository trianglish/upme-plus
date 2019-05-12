/**
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, SafeAreaView, WebView } from 'react-native';

import Instagram from './src/instagram/'
// import { WebView, WebViewSharedProps } from 'react-native-webview';
// import { withWebViewBridge } from 'react-native-webview-bridge-seamless';

// import WebViewBridge from 'react-native-webview-bridge';

const source = { uri: 'https://insta.gramup.me' };

type Props = {};

const injectChrome = `
  window.chrome = {
    runtime: {
      postMessage: () => {},
      sendMessage: (id, message, options, callback) => {
        window.ReactNativeWebView.postMessage(JSON.stringify(message))
      },
    },
    storage: {},
  }
`

export default class App extends Component<Props> {
  webViewRef = null;

  componentDidMount() {
    const run = `
     document.body.style.backgroundColor = 'blue';
     true;
   `;

    setTimeout(() => {
      this.webViewRef.injectJavaScript(run);
    }, 5000);

    // this.webViewRef.onMessage = this.onMessage
  }

  onMessage = event => {
    alert(event.nativeEvent.data)
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>

        <Text style={styles.welcome}>Gram Up! Bot</Text>

        <WebView
          ref={ref => this.webViewRef = ref}
          style={styles.webview}
          source={source}
          onMessage={this.onMessage}
          injectedJavaScript={injectChrome}
          />

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  webview: {
    // marginTop: '20',
    // width: '100%',
    width: 360,
    // marginLeft: 0,
    // marginRight: 0,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
