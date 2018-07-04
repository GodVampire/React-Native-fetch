
// how to use
// 先 npm install query-string
/*

     try {
           let restult = await fetch.fetchRequest('api/……’,null,'GET')  
	   // 这里是同步的！！！！！！ 同步
    
         } catch (e) {
            // do something
         }

*/





import queryString from 'query-string';
import  AccessTokenService from "./service/AccessTokenService";


class ApiError extends Error {
    constructor(error) {
      super(error.message || error.error);
      console.log("ApiError",error)
      for (let key in error) {
        if (key != "error" && key != "message") {
          Object.defineProperty(this, key, {
            value : error[key],
            writable : false,
            enumerable : true,
            configurable : true
          });
        }
      }
    }
}

/**
 * 让fetch也可以timeout
 *  timeout不是请求连接超时的含义，它表示请求的response时间，包括请求的连接、服务器处理及服务器响应回来的时间
 * fetch的timeout即使超时发生了，本次请求也不会被abort丢弃掉，它在后台仍然会发送到服务器端，只是本次请求的响应内容被丢弃而已
 * @param {Promise} fetch_promise    fetch请求返回的Promise
 * @param {number} [timeout=10000]   单位：毫秒，这里设置默认超时时间为10秒
 * @return 返回Promise
 */
function timeout_fetch(fetch_promise,timeout = 10000) {
    let timeout_fn = null;

    //这是一个可以被reject的promise
    let timeout_promise = new Promise(function(resolve, reject) {
        timeout_fn = function() {
            reject({message:"请求超时"});
        };
    });

    //这里使用Promise.race，以最快 resolve 或 reject 的结果来传入后续绑定的回调
    let abortable_promise = Promise.race([
        fetch_promise,
        timeout_promise
    ]);

    setTimeout(function() {
        timeout_fn();
    }, timeout);

    return abortable_promise ;
}

let common_url = 'https://.............’;  //服务器地址



async function fetchWithParams(url, {params = null, headers = {}, method}) {
  headers['Accept'] = 'application/json'

  let body;

  if (params) {
    const encodedParams = queryString.stringify(params)

    if (method == "GET") {
      url += "?" + encodedParams
    } else {
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
      body = encodedParams
    }
  }
  console.log("url", url, "method", method,"headers", headers, "body", body)
  return fetch(url, {method, headers, body})
}

/**
 * @param {string} url 接口地址
 * @param {string} method 请求方法：GET、POST，只能大写
 * @param {JSON} [params=''] body的请求参数，默认为空
 * @return 返回Promise
 */
async function fetchRequestInner(url, params = null, method = 'GET', accessToken = null) {
  const headers = {
     // "access-token":token  //用户登陆后返回的token，某些涉及用户数据的接口需要在header中加上token
  };
  console.log("=================开始请求==========================")

  if (accessToken) {
    headers["Access-Token"] = accessToken
  }

  console.log("-----------params--------------","url:",url,"method:",method,"header:",headers,"params:",params)

  let response = await timeout_fetch(fetchWithParams(common_url + url, {
      method,
      headers,
      params
  }))

  const result = await response.json()
  console.log("-----------result--------------","result:",result)
  console.log("=================请求结束==========================")
  if (response.ok) {
    return result;
  } else {
    let err = new ApiError(result)
    console.log("throw ApiError========",err)
    throw err;
  }
}


export async function fetchRequest(url, params = null, method = 'GET', requiresAuth = true) {
  let accessToken;

  if (requiresAuth) {
    accessToken = await AccessTokenService.get()
  }

  try {
    return await fetchRequestInner(url, params, method, accessToken);
  } catch (e) {
    console.log(e)
    if (requiresAuth && e.status == 401) {
      //clear Userinfo 异地登录
      accessToken = await AccessTokenService.refresh()
      return fetchRequestInner(url, params, method, accessToken);
    } else {
      throw e
    }
  }
}
