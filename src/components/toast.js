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

  showMessage(title, message, level='info') {
    Logger[level](`${title}: ${message}`);
    this.showToast(title, message);
  }

  showToast(title, message, toastOptions) {
    let opts = $.extend(ui.notifications.defaults, toastOptions);
    let toast = ui.notifications.toast.clone().toast(opts);

    ui.notifications.container.append(toast);

    toast.find('.toast-header strong').html(title);
    toast.find('.toast-body').html(message);

    toast.toast('show');
  }
}

export default Toast
