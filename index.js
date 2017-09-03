/**
 * Wrapper for One Signal Push Notification Delivery
 * 
 * @author Mohammad Fares <faressoft.com@gmail.com>
 */

var request = require('request');

/**
 * One Signal Client
 *
 * @param  {String}  apiKey  REST API Key
 * @param  {String}  appId   OneSignal App ID
 * @param  {Boolean} sandbox use the sandbox certificate for iOS (default: false)
 */
function OneSignal(apiKey, appId, sandbox) {

  // Default value for sandbox argument
  if (typeof sandbox === 'undefined') {
    sandbox = false;
  }

  /**
   * The api key of Signal One
   * @type {String}
   */
  const API_KEY = apiKey;

  /**
   * The app id of Signal One
   * @type {String}
   */
  const APP_ID = appId;

  /**
   * Use sandbox certificate
   * @type {String}
   */
  const SANDBOX = apiKey;

  /**
   * Handle resolving or rejecting One Signal response
   * 
   * @param  {Object}   error
   * @param  {Object}   response
   * @param  {String}   body
   * @param  {Function} reject
   * @param  {Function} resolve
   */
  function responseHandle(error, response, body, reject, resolve) {

    if (error) {
      return reject(error);
    }

    try {
      body = JSON.parse(body);
    } catch (e) {
      return reject(new Error('Wrong JSON Format'));
    }

    resolve(body);
    
  }

  /**
   * Register a new device and its identifier to OneSignal and get OneSignal ID
   * 
   * @param  {String} identifier the device token
   * @param  {String} osType     ios, android
   * @return {Promise}           resolve with OneSignal ID
   */
  this.addDevice = function(identifier, osType) {

    var deviceType = osType == 'ios' ? 0 : 1;
    
    var options = {
      method: 'POST',
      url: 'https://onesignal.com/api/v1/players',
      headers: { 
        authorization: 'Basic ' + API_KEY,
        'cache-control': 'no-cache',
        'content-type': 'application/json; charset=utf-8' 
      },
      body: JSON.stringify({
        app_id: APP_ID,
        device_type: deviceType,
        identifier: identifier,
        language: 'en',
        test_type: SANDBOX ? 1 : null
      })
    };

    return new Promise(function(resolve, reject) {
      
      request(options, function(error, response, body) {

        responseHandle(error, response, body, reject, function(body) {
          
          resolve(body.id);

        });

      });

    });

  };

  /**
   * Update the identifier of an existing device
   * 
   * @param  {String} oneSignalId   the one signal device id
   * @param  {String} newIdentifier the new device token
   * @return {Promise}
   */
  this.editDevice = function(oneSignalId, newIdentifier) {

    var options = {
      method: 'PUT',
      url: 'https://onesignal.com/api/v1/players/' + oneSignalId,
      headers: { 
        authorization: 'Basic ' + API_KEY,
        'cache-control': 'no-cache',
        'content-type': 'application/json; charset=utf-8' 
      },
      body: JSON.stringify({
        app_id: APP_ID,
        identifier: newIdentifier
      })
    };

    return new Promise(function(resolve, reject) {
      
      request(options, function(error, response, body) {

        responseHandle(error, response, body, reject, resolve);

      });

    });

  };

    /**
     * Create and send a notification
     *
     * @param  {String} message      the notification message
     * @param  {Object} data         any custom data
     * @param  {Array}  oneSignalIds a list of OneSignal devices ids
     * @return {Promise}
     */
    this.createNotification = function(message, data, oneSignalIds) {

        var options = {
            method: 'POST',
            url: 'https://onesignal.com/api/v1/notifications',
            headers: {
                authorization: 'Basic ' + API_KEY,
                'cache-control': 'no-cache',
                'content-type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                app_id: APP_ID,
                include_player_ids: oneSignalIds,
                contents: {
                    en: message
                },
                data: data
            })
        };

        return new Promise(function(resolve, reject) {

            request(options, function(error, response, body) {

                responseHandle(error, response, body, reject, resolve);

            });

        });

    };

    /**
     * Create and send a notification
     *
     * @param  {Object} body      {include_player_ids: [array_of_player_id], "heading": {en: "title", "ru": "title", ...}, contents: {en: "mess", "ru": "mess", ...}, data:{Object},.....}
     * @return {Promise}
     */
    this.createNotificationManuelly = function(body) {

        body.app_id = APP_ID

        var options = {
            method: 'POST',
            url: 'https://onesignal.com/api/v1/notifications',
            headers: {
                authorization: 'Basic ' + API_KEY,
                'cache-control': 'no-cache',
                'content-type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(body)
        };

        return new Promise(function(resolve, reject) {

            request(options, function(error, response, body) {

                responseHandle(error, response, body, reject, resolve);

            });

        });
    };

    /**
     * Create and send a notification
     *
     * @param  {Object} heading      {en: "title", "ru": "title", ...}
     * @param  {Object} message      {en: "text", "ru": "text", ...}
     * @param  {Object} data         any custom data
     * @param  {Array} segments      array of String segments
     * @param  {Int} badgeCount      int value of badget count
     * @param  {Array}  oneSignalIds a list of OneSignal devices ids
     * @return {Promise}
     */
    this.createNotificationOverrideFull = function(heading,message, data, segments, badgeCount, oneSignalIds) {

        if(segments == undefined || segments == null || segments.length == 0){
            segments = ["All"]
        }

        var options = {
            method: 'POST',
            url: 'https://onesignal.com/api/v1/notifications',
            headers: {
                authorization: 'Basic ' + API_KEY,
                'cache-control': 'no-cache',
                'content-type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                app_id: APP_ID,
                include_player_ids: oneSignalIds,
                heading: heading,
                contents: {
                    en: message
                },
                segments: segments,
                badge_count: badgeCount,
                data: data
            })
        };

        return new Promise(function(resolve, reject) {

            request(options, function(error, response, body) {

                responseHandle(error, response, body, reject, resolve);

            });

        });
    };
  
}

////////////////////////////////////////////////////
// Module //////////////////////////////////////////
////////////////////////////////////////////////////

/**
 * Create a new client
 * 
 * @param  {String}  apiKey  REST API Key
 * @param  {String}  appId   OneSignal App ID
 * @param  {Boolean} sandbox use the sandbox certificate for iOS (default: false)
 * @return {Object}          new instance of one signal client wrapper
 */
module.exports = function(apiKey, appId, sandbox) {
    
  return new OneSignal(apiKey, appId, sandbox);

};
