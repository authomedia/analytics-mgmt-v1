import Logger from 'js-logger';

class Modal {
  constructor(ui) {
    this.ui = ui;
  }

  showModal(title, body, modalOptions) {
    let opts = $.extend(this.ui.modals.defaults, modalOptions);

    this.modal = this.ui.modals.modal

    this.modal.modal(opts);

    this.ui.modals.container.append(this.modal);

    this.modal.find('.modal-title').html(title);
    this.modal.find('.modal-body').html(body);

    let primaryBtn = this.modal.find('.btn.btn-primary');
    let secondaryBtn = this.modal.find('.btn.btn-secondary');

    primaryBtn.html(opts.primaryText);
    secondaryBtn.html(opts.secondaryText);

    primaryBtn.off('click');
    primaryBtn.on('click', (event) => {
      this.modal.modal('hide');
      return opts.callback(event);
    });

    this.modal.modal('show');
  }

  hideModal() {
    this.modal.modal('hide');
  }
}

export default Modal;
