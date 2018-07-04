# React-Native-fetch
Encapsulation of the fetch



> How to use fetch

     
    try {
        let restult = await fetch.fetchRequest('api/……’,null,'GET')  
       	// 这里是同步的！！！！！！ 同步
     } catch (e) {
       // do something
     }

or with saga

```
//首先创建一个API.js

import * as fetch from './fetch';

export  function introBanners(param) {
  return fetch.fetchRequest('api/......',param,'GET');
}
```

 ```
// 在saga文件中
function* getIntroBanner({bannerParam:{param,onSuccess,onFailure}}) {
  try {
    const res = yield call(api.introBanners,param);
    yield fork(onSuccess, res)
  } catch (err) {
    yield fork(onFailure, err)
  }
}

 ```

