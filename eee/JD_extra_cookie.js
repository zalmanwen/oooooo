/*

Author: 2Ya
Github: https://github.com/domping
Version: v1.1.0

===================
特别说明：
1.获取多个京东cookie文件，不和野比大佬的文件冲突。暂不支持野比大佬脚本签到。
2.若是要使用京东多合一签到，请使用修改版地址：https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_sign.js
===================
===================
使用方式：复制 https://home.m.jd.com/myJd/newhome.action 到浏览器打开 ，在个人中心自动获取 cookie，
若弹出成功则正常使用。否则继续再此页面继续刷新一下试试
===================

===================
[MITM]
hostname = me-api.jd.com

【Surge脚本配置】:
===================
[Script]
获取京东Cookie = type=http-request,pattern=^https:\/\/me-api\.jd\.com\/user_new\/info\/GetJDUserInfoUnion,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js,script-update-interval=0

===================
【Loon脚本配置】:
===================
[Script]
http-request ^https:\/\/me-api\.jd\.com\/user_new\/info\/GetJDUserInfoUnion tag=获取京东Cookie, script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js

===================
【 QX  脚本配置 】 :
===================

[rewrite_local]
^https:\/\/me-api\.jd\.com\/user_new\/info\/GetJDUserInfoUnion  url script-request-header https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra_cookie.js

 */
const APIKey = 'CookiesJD';
const $ = new API('ql', true);
const CacheKey = `#${APIKey}`;
const $ql = new QL_API();
const CookieJD = '#CookieJD';
const CookieJD2 = '#CookieJD2';

const jdHelp = JSON.parse($.read('#jd_ck_remark') || '{}');
let remark = [];
try {
  remark = JSON.parse(jdHelp.remark || '[]');
} catch (e) {
  console.log(e);
}

let cookie1 = $.read(CookieJD) || '';
let cookie2 = $.read(CookieJD2) || '';

function getUsername(ck) {
  if (!ck) return '';
  console.log(ck);
  return decodeURIComponent(ck.match(/pt_pin=(.+?);/)[1]);
}

const mute = '#cks_get_mute';
$.mute = $.read(mute);
(async () => {
  if ($request) await GetCookie();
})().finally(() => {
  $.done();
});

function getCache() {
  return JSON.parse($.read(CacheKey) || '[]');
}

function updateJDHelp(username) {
  if (remark.length) {
    const newRemark = remark.map(item => {
      if (item.username === username) {
        return {...item, status: '正常'};
      }
      return item;
    });
    jdHelp.remark = JSON.stringify(newRemark, null, `\t`);
    $.write(JSON.stringify(jdHelp), '#jd_ck_remark');
  }
}

async function GetCookie() {
  const Referer = $request.headers['Referer'] || '';
  if (!Referer) return;
  try {
    if ($request.headers && $request.url.indexOf('GetJDUserInfoUnion') > -1) {
      const CV = $request.headers['Cookie'] || $request.headers['cookie'];
      if (CV.match(/(pt_key=.+?pt_pin=|pt_pin=.+?pt_key=)/)) {
        const CookieValue = CV.match(/pt_key=.+?;/) + CV.match(/pt_pin=.+?;/);
        const DecodeName = getUsername(CookieValue);
        let updateIndex = null, CookieName, tipPrefix;

        if ($ql.ql) {
          await $ql.login();
          if ($ql.headers.Authorization) {
            const qlCk = (await $ql.getEnvs('JD_COOKIE')).data;
            const current = qlCk.find(
              item => getUsername(item.value) === DecodeName);
            if (current) {
              current.value = CookieValue;
              await $ql.editEnvs(current);
            } else {
              await $ql.addEnvs({name: 'JD_COOKIE', value: CookieValue});
            }
            if ($.mute !== 'true') $.notify(
              '用户名: ' + DecodeName, '', '同步更新青龙成功🎉');
          }
        }

        if (cookie1) {
          if (getUsername(cookie1) === DecodeName) {
            $.write(CookieValue, CookieJD);
            updateJDHelp(DecodeName);
            if ($.mute === 'true') return;
            return $.notify('用户名: ' + DecodeName, '', '更新 Cookie 成功 🎉');
          }
        }

        if (cookie2) {
          if (getUsername(cookie2) === DecodeName) {
            $.write(CookieValue, CookieJD2);
            updateJDHelp(DecodeName);
            if ($.mute === 'true') return;
            return $.notify('用户名: ' + DecodeName, '', '更新 Cookie 成功 🎉');
          }
        }

        const CookiesData = getCache();
        const updateCookiesData = [...CookiesData];

        CookiesData.forEach((item, index) => {
          if (getUsername(item.cookie) === DecodeName) updateIndex = index;
        });

        if (updateIndex !== null) {
          updateCookiesData[updateIndex].cookie = CookieValue;
          CookieName = '【账号' + (updateIndex + 1) + '】';
          tipPrefix = '更新京东';
        } else {
          updateCookiesData.push({
            userName: DecodeName,
            cookie: CookieValue,
          });
          CookieName = '【账号' + updateCookiesData.length + '】';
          tipPrefix = '首次写入京东';
        }
        const cacheValue = JSON.stringify(updateCookiesData, null, `\t`);
        $.write(cacheValue, CacheKey);
        updateJDHelp(DecodeName);
        if (updateIndex !== null && $.mute === 'true') return;
        $.notify(
          '用户名: ' + DecodeName,
          '',
          tipPrefix + CookieName + 'Cookie成功 🎉',
        );
      } else {
        $.notify('写入京东Cookie失败', '', '请查看脚本内说明, 登录网页获取 ‼️');
      }
    } else {
      $.notify('写入京东Cookie失败', '', '请检查匹配URL或配置内脚本类型 ‼️');
    }
  } catch (eor) {
    // $.notify('写入京东Cookie失败', '', '请重试 ⚠️');
    console.log(
      `\n写入京东Cookie出现错误 ‼️\n${JSON.stringify(
        eor,
      )}\n\n${eor}\n\n${JSON.stringify($request.headers)}\n`,
    );
  }
}

function QL_API() {
  return new (class QL {
    constructor() {
      this.$ = new API('ql', true);
      const ipAddress = this.$.read('ip') || '';
      this.baseURL = `http://${ipAddress}`;
      this.account = {
        password: this.$.read('password'),
        username: this.$.read('username'),
      };
      if (!this.account.password ||
        !this.account.username) return this.ql = false;
    }

    ql = true;
    headers = {
      'Content-Type': `application/json;charset=UTF-8`,
      Authorization: '',
    };

    getURL(key = '') {
      return `${this.baseURL}/api/envs${key}`;
    }

    login() {
      const opt = {
        headers: this.headers,
        body: JSON.stringify(this.account),
        url: `${this.baseURL}/api/login`,
      };
      return this.$.http.post(opt).then((response) => {
        const loginRes = JSON.parse(response.body);
        if (loginRes.code !== 200) {
          return this.$.notify(title, '', loginRes.msg);
        }
        this.headers.Authorization = `Bearer ${loginRes.token}`;
      });
    }

    getEnvs(keyword = '') {
      const opt = {
        url: this.getURL() + `?searchValue=${keyword}`,
        headers: this.headers,
      };
      return this.$.http.get(opt).then((response) => JSON.parse(response.body));
    }

    addEnvs(cookies) {
      const opt = {
        url: this.getURL(),
        headers: this.headers,
        body: JSON.stringify(cookies),
      };
      return this.$.http.post(opt).then(
        (response) => JSON.parse(response.body));
    }

    editEnvs(ids) {
      const opt = {
        url: this.getURL(),
        headers: this.headers,
        body: JSON.stringify(ids),
      };
      return this.$.http.put(opt).then(
        (response) => JSON.parse(response.body));
    }

    delEnvs(ids) {
      const opt = {
        url: this.getURL(),
        headers: this.headers,
        body: JSON.stringify(ids),
      };
      return this.$.http.delete(opt).then(
        (response) => JSON.parse(response.body));
    }

    disabled(ids) {
      const opt = {
        url: this.getURL(`/disable`),
        headers: this.headers,
        body: JSON.stringify(ids),
      };
      return this.$.http.put(opt).then((response) => JSON.parse(response.body));
    }
  });
}

function ENV() {
  const isQX = typeof $task !== 'undefined';
  const isLoon = typeof $loon !== 'undefined';
  const isSurge = typeof $httpClient !== 'undefined' && !isLoon;
  const isJSBox = typeof require == 'function' && typeof $jsbox != 'undefined';
  const isNode = typeof require == 'function' && !isJSBox;
  const isRequest = typeof $request !== 'undefined';
  const isScriptable = typeof importModule !== 'undefined';
  return {isQX, isLoon, isSurge, isNode, isJSBox, isRequest, isScriptable};
}

function HTTP(defaultOptions = {baseURL: ''}) {
  const {isQX, isLoon, isSurge, isScriptable, isNode} = ENV();
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];
  const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  function send(method, options) {
    options = typeof options === 'string' ? {url: options} : options;
    const baseURL = defaultOptions.baseURL;
    if (baseURL && !URL_REGEX.test(options.url || '')) {
      options.url = baseURL ? baseURL + options.url : options.url;
    }
    options = {...defaultOptions, ...options};
    const timeout = options.timeout;
    const events = {
      ...{
        onRequest: () => {},
        onResponse: (resp) => resp,
        onTimeout: () => {},
      },
      ...options.events,
    };

    events.onRequest(method, options);

    let worker;
    if (isQX) {
      worker = $task.fetch({method, ...options});
    } else if (isLoon || isSurge || isNode) {
      worker = new Promise((resolve, reject) => {
        const request = isNode ? require('request') : $httpClient;
        request[method.toLowerCase()](options, (err, response, body) => {
          if (err) reject(err);
          else
            resolve({
              statusCode: response.status || response.statusCode,
              headers: response.headers,
              body,
            });
        });
      });
    } else if (isScriptable) {
      const request = new Request(options.url);
      request.method = method;
      request.headers = options.headers;
      request.body = options.body;
      worker = new Promise((resolve, reject) => {
        request.loadString().then((body) => {
          resolve({
            statusCode: request.response.statusCode,
            headers: request.response.headers,
            body,
          });
        }).catch((err) => reject(err));
      });
    }

    let timeoutid;
    const timer = timeout
      ? new Promise((_, reject) => {
        timeoutid = setTimeout(() => {
          events.onTimeout();
          return reject(
            `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`,
          );
        }, timeout);
      })
      : null;

    return (timer
        ? Promise.race([timer, worker]).then((res) => {
          clearTimeout(timeoutid);
          return res;
        })
        : worker
    ).then((resp) => events.onResponse(resp));
  }

  const http = {};
  methods.forEach(
    (method) =>
      (http[method.toLowerCase()] = (options) => send(method, options)),
  );
  return http;
}

function API(name = 'untitled', debug = false) {
  const {isQX, isLoon, isSurge, isNode, isJSBox, isScriptable} = ENV();
  return new (class {
    constructor(name, debug) {
      this.name = name;
      this.debug = debug;

      this.http = HTTP();
      this.env = ENV();

      this.node = (() => {
        if (isNode) {
          const fs = require('fs');

          return {
            fs,
          };
        } else {
          return null;
        }
      })();
      this.initCache();

      const delay = (t, v) =>
        new Promise(function(resolve) {
          setTimeout(resolve.bind(null, v), t);
        });

      Promise.prototype.delay = function(t) {
        return this.then(function(v) {
          return delay(t, v);
        });
      };
    }

    // persistance

    // initialize cache
    initCache() {
      if (isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || '{}');
      if (isLoon || isSurge)
        this.cache = JSON.parse($persistentStore.read(this.name) || '{}');

      if (isNode) {
        // create a json for root cache
        let fpath = 'root.json';
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            {flag: 'wx'},
            (err) => console.log(err),
          );
        }
        this.root = {};

        // create a json file with the given name if not exists
        fpath = `${this.name}.json`;
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            {flag: 'wx'},
            (err) => console.log(err),
          );
          this.cache = {};
        } else {
          this.cache = JSON.parse(
            this.node.fs.readFileSync(`${this.name}.json`),
          );
        }
      }
    }

    // store cache
    persistCache() {
      const data = JSON.stringify(this.cache);
      if (isQX) $prefs.setValueForKey(data, this.name);
      if (isLoon || isSurge) $persistentStore.write(data, this.name);
      if (isNode) {
        this.node.fs.writeFileSync(
          `${this.name}.json`,
          data,
          {flag: 'w'},
          (err) => console.log(err),
        );
        this.node.fs.writeFileSync(
          'root.json',
          JSON.stringify(this.root),
          {flag: 'w'},
          (err) => console.log(err),
        );
      }
    }

    write(data, key) {
      this.log(`SET ${key}`);
      if (key.indexOf('#') !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          return $persistentStore.write(data, key);
        }
        if (isQX) {
          return $prefs.setValueForKey(data, key);
        }
        if (isNode) {
          this.root[key] = data;
        }
      } else {
        this.cache[key] = data;
      }
      this.persistCache();
    }

    read(key) {
      this.log(`READ ${key}`);
      if (key.indexOf('#') !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          return $persistentStore.read(key);
        }
        if (isQX) {
          return $prefs.valueForKey(key);
        }
        if (isNode) {
          return this.root[key];
        }
      } else {
        return this.cache[key];
      }
    }

    delete(key) {
      this.log(`DELETE ${key}`);
      if (key.indexOf('#') !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          return $persistentStore.write(null, key);
        }
        if (isQX) {
          return $prefs.removeValueForKey(key);
        }
        if (isNode) {
          delete this.root[key];
        }
      } else {
        delete this.cache[key];
      }
      this.persistCache();
    }

    // notification
    notify(title, subtitle = '', content = '', options = {}) {
      const openURL = options['open-url'];
      const mediaURL = options['media-url'];

      if (isQX) $notify(title, subtitle, content, options);
      if (isSurge) {
        $notification.post(
          title,
          subtitle,
          content + `${mediaURL ? '\n多媒体:' + mediaURL : ''}`,
          {
            url: openURL,
          },
        );
      }
      if (isLoon) {
        let opts = {};
        if (openURL) opts['openUrl'] = openURL;
        if (mediaURL) opts['mediaUrl'] = mediaURL;
        if (JSON.stringify(opts) == '{}') {
          $notification.post(title, subtitle, content);
        } else {
          $notification.post(title, subtitle, content, opts);
        }
      }
      if (isNode || isScriptable) {
        const content_ =
          content +
          (openURL ? `\n点击跳转: ${openURL}` : '') +
          (mediaURL ? `\n多媒体: ${mediaURL}` : '');
        if (isJSBox) {
          const push = require('push');
          push.schedule({
            title: title,
            body: (subtitle ? subtitle + '\n' : '') + content_,
          });
        } else {
          console.log(`${title}\n${subtitle}\n${content_}\n\n`);
        }
      }
    }

    // other helper functions
    log(msg) {
      if (this.debug) console.log(msg);
    }

    info(msg) {
      console.log(msg);
    }

    error(msg) {
      console.log('ERROR: ' + msg);
    }

    wait(millisec) {
      return new Promise((resolve) => setTimeout(resolve, millisec));
    }

    done(value = {}) {
      if (isQX || isLoon || isSurge) {
        $done(value);
      } else if (isNode && !isJSBox) {
        if (typeof $context !== 'undefined') {
          $context.headers = value.headers;
          $context.statusCode = value.statusCode;
          $context.body = value.body;
        }
      }
    }
  })(name, debug);
}
