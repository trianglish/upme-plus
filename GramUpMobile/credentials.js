import AsyncStorage from '@react-native-community/async-storage';

export const saveCredentials = (username, password) =>
  AsyncStorage.setItem('account', JSON.stringify({ username, password }))

export const getCredentials = () =>
  AsyncStorage.getItem('account').then(JSON.parse)
