import queryString from 'query-string'; // query-string can make you get with params
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

function timeout_fetch(fetch_promise,timeout = 10000) {
    let timeout_fn = null;

    let timeout_promise = new Promise(function(resolve, reject) {
        timeout_fn = function() {
            reject({message:"request timeout"});
        };
    });

    let abortable_promise = Promise.race([
        fetch_promise,
        timeout_promise
    ]);

    setTimeout(function() {
        timeout_fn();
    }, timeout);

    return abortable_promise;
}

const basic_url = ''; // remeber set

async function fetchWithParams(url, {params = null, headers = {}, method}) {
  headers['Accept'] = 'application/json';
  let body;
  if (params) {
    const encodedParams = queryString.stringify(params);
    if (method == "GET") {
      url += "?" + encodedParams;
    } else {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = encodedParams;
    }
  }
  return fetch(url, {method, headers, body});
}

async function fetchRequestInner(url, params = null, method = 'GET', accessToken = null) {
  const headers = {};

  if (accessToken) {
    headers["Access-Token"] = accessToken;
  }

  let response = await timeout_fetch(fetchWithParams(basic_url + url, {
      method,
      headers,
      params
  }));

  const result = await response.json();

  if (response.ok) {
    return result;
  } else {
    let err = new ApiError(result)
    throw err;
  }
}


export async function fetchRequest(url, params = null, method = 'GET', requiresAuth = true) {
  let accessToken;

  if (requiresAuth) {
    accessToken = await AccessTokenService.get();
    console.log("will continue request");
  }
  
  try {
    return await fetchRequestInner(url, params, method, accessToken);
  } catch (e) {
    if (requiresAuth && e.status == 401) { // login with other device
      // can clear Userinfo 
      accessToken = await AccessTokenService.refresh()
      return fetchRequestInner(url, params, method, accessToken);
    } else {
      throw e
    }
  }
}
