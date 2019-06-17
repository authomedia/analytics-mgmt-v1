import ui from '../config/ui';

class Toast {
  constructor() {
    $(() => {
      this.initToast();
    });
  }

  initToast() {
    $('.toast').remove();
  }

  showMessage(title, message) {
    this.showToast(title, message);
  }

  showToast(title, message, toastOptions) {
    var opts = $.extend(ui.notifications.defaults, toastOptions);

    var toast = ui.notifications.toast.clone().toast(opts)

    ui.notifications.container.append(toast);

    toast.find('.toast-header strong').html(title);
    toast.find('.toast-body').html(message);

    toast.toast('show');
  }
}

export default Toast
