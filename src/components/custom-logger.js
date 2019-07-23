import moment from 'moment';
import Logger from 'js-logger';

import ui from '../config/ui';

const customLogger = function (messages, context) {
  messages = Array.from(messages);
  let options = {};
  let action;

  //console.log(messages);
  if (typeof(messages[messages.length -1]) == 'object') {
    options = messages.pop();
    action = options['action'] || {};
  }

  let logMessage = $('<li></li>');

  let content = [
    $(`<span class='logger-timestamp'>${moment().format('hh:mm:ss')}</span>`),
    $(`<span class='logger-${context.level.name.toLowerCase()}'>${context.level.name}:</span>`)
  ];

  $.each(messages, (i, message) => {
    content.push($(`<span class='logger-message'>${message}</span>`));
  });

  if (action !== undefined) {
    let link = $('<a>');
    let linkContent = []

    if (action.icon) {
      linkContent.push($(`<span class="oi oi-${action.icon}"></span>`));
    }

    if (action.text) {
      linkContent.push(action.text);
    }

    link.html(linkContent);
    link.attr('href', '#');
    link.on('click', action.click)
    content.push(link);
  }

  ui.formControl.logger.append($(logMessage.html(content)));

  let loggerContainer = ui.formControl.logger.parent()
  loggerContainer.prop('scrollTop', loggerContainer.prop('scrollHeight'));

  Logger.createDefaultHandler()(messages, context);
}

export default customLogger;
