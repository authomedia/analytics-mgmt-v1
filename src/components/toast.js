import ui from '../config/ui';
import Logger from 'js-logger';

class Toast {
  constructor() {
    $(() => {
      this.initToast();
    });
  }

  initToast() {
    $('.toast').remove();
  }

  showMessage(title, message, options = {}, level='info') {
    Logger[level](title, message, options); // must clone with events!
    this.showToast(title, message, options);
  }

  showToast(title, message, options, toastOptions) {
    let opts = $.extend(ui.notifications.defaults, toastOptions);
    let toast = ui.notifications.toast.clone().toast(opts);

    ui.notifications.container.append(toast);

    toast.find('.toast-header strong').html(title);

    message = $(`<span>${message}</span>`);
    if (options.action) {
      message.append(this.buildActionLink(options.action));
    }

    toast.find('.toast-body').html(message);

    toast.toast('show');
  }

  buildActionLink(action) {
    if (action !== undefined) {
      let link = $('<a>');
      let linkContent = [];

      if (action.icon) {
        linkContent.push($(`<span class="oi oi-${action.icon}"></span>`));
      }

      if (action.text) {
        linkContent.push(action.text);
      }

      link.html(linkContent);
      link.attr('href', '#');
      link.on('click', action.click)
      return link;
    }
  }
}

export default Toast
