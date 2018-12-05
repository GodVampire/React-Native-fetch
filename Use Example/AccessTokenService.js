import { Navigation } from 'react-native-navigation';


class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject)=> {
      this.resolve = resolve;
      this.reject = reject;
    })
  }
}

export class InvalidSetAccessToken extends Error {

}

export class AccessTokenRefreshAborted extends Error {

}

class AccessTokenService {
    constructor() {
      this.setToken = this.setToken.bind(this);
      this.abort = this.abort.bind(this);
      this.get = this.get.bind(this);
      this.refresh = this.refresh.bind(this);
    }

	  // check is login status
    async get() {
      const token = "123456789"; // get from loc 
      if (token) {
        return token;
      } else {
        return this.refresh();
      }
    }

    // when login success  save login status
    async setToken(token) {
      if (this._token) { 
        // save token  !!! // UserDefult.save(token) 
        this._token.resolve(token);
        this._token = null;
        Navigation.dismissModal();
      } else {
        // throw new InvalidSetToken("setToken called before refresh")
      }
    }

 	  // back login page use abort
    abort() {
      if (this._token) {
        // this._token.reject(new TokenRefreshAborted("token refresh aborted"))
        this._token = null;
      }
      Navigation.dismissModal()
    }

	  // need reget AuthToken
    refresh() {
      if (!this._token) {
        this._token = new Deferred();
        // modal to login Page
        Navigation.showModal("LoginPage");
      }
      return this._token.promise;
    }
}

export default new AccessTokenService()
