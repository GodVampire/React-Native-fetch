import { Navigation } from 'react-native-navigation';


class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject)=> {
      this.resolve = resolve
      this.reject = reject
    })
  }
}

export class InvalidSetAccessToken extends Error {

}

export class AccessTokenRefreshAborted extends Error {

}

class AccessTokenService {
    constructor() {
      this.setToken = this.setToken.bind(this)
      this.abort = this.abort.bind(this)
      this.get = this.get.bind(this)
      this.refresh = this.refresh.bind(this)
      this._isToast = false
    }

	// 需要检测登录 就get
    async get(isToast = false) {
      const token = ….
	// 先 获取本地 是否有token

      console.log("get",token)
      if (token) {
        return token
      } else {
        this._isToast = isToast
        return this.refresh()
      }
    }

    // 当请求成功之后 set
    async setToken(token) {
      console.log("setToken",token, this._token)
      if (this._token) { //有未解决的Promise
        // 可以再这保存一下得到的token

        this._token.resolve(token)
        this._token = null
        Navigation.dismissModal()
      } else {
         console.log("else")
        // throw new InvalidSetToken("setToken called before refresh")
      }
    }

 	// 退出登录页,不登录 就abort
    abort() {
      if (this._token) {
        // this._token.reject(new TokenRefreshAborted("token refresh aborted"))
        this._token = null
      }
      Navigation.dismissModal()
    }

	// 过期就刷新
    refresh() {
      console.log("refresh _token")
      if (!this._token) {
        this._token = new Deferred()
	// 跳转
        Navigation.showModal({
          screen: "login",
          animationType: 'slide-up',
          passProps: {
            toastMsg:this._isToast ? "请先登录" : "",
          }
        });
      }
      return this._token.promise
    }
}

// 这是个单例哦~
export default new AccessTokenService()
