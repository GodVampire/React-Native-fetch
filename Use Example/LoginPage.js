import React, {Component} from 'react';
import { StyleSheet, TouchableOpacity, View} from 'react-native';
import fetch from './fetch';
import AccessTokenService from './AccessTokenService';

export default class LoginPage extends Component{
  
  _requstLogin = () => {
    try {
      let restult = await fetch.fetchRequest('api/.......', {psw:123}, 'POST', true);
      console.log("login success", restult);
    } catch (e) {
       // do something
    }
  }

  _backAction = () => {
    AccessTokenService.abort()
  }

  render() {
    return (
      <View style={styles.container}>
          <TouchableOpacity onPress={this._requsetSomething} >
              <Text> Touch me login in </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._backAction} >
              <Text> Touch me back frist page </Text>
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
