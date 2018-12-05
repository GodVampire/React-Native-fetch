/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { StyleSheet, TouchableOpacity, View} from 'react-native';
import fetch from './fetch';

export default class App extends Component{
  
  _requsetSomething = () => {
    try {
      let restult = await fetch.fetchRequest('api/.......', null, 'GET', true);
      console.log("get request response", restult);
    } catch (e) {
       // do something
    }
  }
  
  render() {
    return (
      <View style={styles.container}>
          <TouchableOpacity onPress={this._requsetSomething} >
              <Text> Touch me build a request. </Text>
          </TouchableOpacity>
      </View>
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
});
