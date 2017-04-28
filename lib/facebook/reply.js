'use strict';

const rp = require('minimal-request-promise'),
  breakText = require('../breaktext');

module.exports = function fbReply(recipient, message, fbAccessToken) {
  console.log('this is my version of fbReply. recipient: ' + recipient);
  console.log('this is my version of fbReply.  message: ' + message);
  console.log('this is my version of fbReply.  token: ' + fbAccessToken);
  console.log('this is my version of fbReply.  Sending message %j', message);
  var sendSingle = function sendSingle (message) {
  console.log('send single');
      if (typeof message === 'object' && typeof message.claudiaPause === 'number') {
        return new Promise(resolve => setTimeout(resolve, parseInt(message.claudiaPause, 10)));
      }

      var finalFBToken = fbAccessToken;
      if (message.claudiaTokenOveride && message.claudiaTokenOveride.length > 0) {
        console.log("overriding fb token");
        finalFBToken = message.claudiaTokenOveride;
      }
      console.log("final token: " + finalFBToken);

      const messageBody = {
        recipient: {
          id: recipient
        }
      };
      if (message.hasOwnProperty('notification_type')) {
        messageBody.notification_type = message.notification_type;
        delete message.notification_type;
      }
      if (message.hasOwnProperty('sender_action')) {
        messageBody.sender_action = message.sender_action;
      } else {
        messageBody.message = message;
      }
      const options = {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageBody)
      };
      console.log('getting rid of the $ thinggy');
      return rp.post('`https://graph.facebook.com/v2.6/me/messages?access_token=' + finalFBToken, options);
    },
    sendAll = function () {
      if (!messages.length) {
        return Promise.resolve();
      } else {
        return sendSingle(messages.shift()).then(sendAll);
      }
    },
    messages = [];

  function breakTextAndReturnFormatted(message) {
    return breakText(message, 640).map(m => ({ text: m }));
  }

  if (typeof message === 'string') {
    messages = breakTextAndReturnFormatted(message);
  } else if (Array.isArray(message)) {
    message.forEach(msg => {
      if (typeof msg === 'string') {
        messages = messages.concat(breakTextAndReturnFormatted(msg));
      } else {
        messages.push(msg);
      }
    });
  } else if (!message) {
    return Promise.resolve();
  } else {
    messages = [message];
  }
  return sendAll();
};
