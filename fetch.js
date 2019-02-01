import queryString from 'query-string'; 

const rootNode = {
  userHeader: {},
  accessTokenKey: 'Access-Token',
  baseUrl: null,
  timeOutMessage: 'request timeout',
  timeOutTime: 10000,
};

export default {
  request: _request,
  setUserHeader: _set('userHeader'),
  setAccessToken: _set('accessTokenKey'),
  setBaseUrl: _set('baseUrl'),
  setTimeoutMessage: _set('timeOutMessage'),
  setTimeoutTime: _set('timeOutTime'),
};

async function _request(url, params = null, method = 'GET', accessToken) {
  try {
    return await _fetchRequestInner(url, params, method, accessToken);
  } catch (e) {
    throw err;
  }
}

async function _fetchRequestInner(url, params = null, method = 'GET', accessToken = rootNode.userHeader) {
  const headers = {};
  
  if (accessToken) {
    headers[rootNode.accessTokenKey] = accessToken;
  }

  const URL = rootNode.baseUrl + url;

  let response = await _timeout_fetch(_fetchWithParams(URL, {
      method,
      headers,
      params
  }));

  const result = await response.json();

  _log_request(URL, method, {headers, params}, response);
  
  if (response.ok) {
    return result;
  } else {
    let err = new ApiError(result)
    throw err;
  }
}

async function _fetchWithParams(url, {params = null, headers = {}, method}) {
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

function _timeout_fetch(fetch_promise, timeout = rootNode.timeOutTime) {
    let timeout_fn = null;

    let timeout_promise = new Promise(function(resolve, reject) {
        timeout_fn = function() {
            reject({message: rootNode.timeOutMessage});
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

function _set(key) {
  return function (value) {
      rootNode[key] = value;
  };
}

function _log_request(url, method, options, response) {
  console.log('| ' + url + '| ' + method);
  console.log('| ' + JSON.stringify(options.headers));
  console.log('| ' + options.params);
  console.log(response);
  console.log('------------------------------');
}

class ApiError extends Error {
  constructor(error) {
    super(error.message || error.error);
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
