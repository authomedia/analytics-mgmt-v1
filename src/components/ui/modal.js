import Logger from 'js-logger';

class Modal {
  constructor(ui) {
    this.ui = ui;
  }

  showModal(title, body, modalOptions) {
    let opts = $.extend(this.ui.modals.defaults, modalOptions);

    this.modal = this.ui.modals.modal;

    this.modal.off('shown.bs.modal');
    this.modal.on('shown.bs.modal', (e) => {
      console.log('foo');
      return opts.onShown(e);
    });

    this.modal.modal(opts);

    this.ui.modals.container.append(this.modal);
    this.updateBody(body);
    this.updateTitle(title)

    let primaryBtn = this.modal.find('.btn.btn-primary');
    let secondaryBtn = this.modal.find('.btn.btn-secondary');

    primaryBtn.html(opts.primaryText);
    secondaryBtn.html(opts.secondaryText);

    primaryBtn.off('click');
    primaryBtn.on('click', (event) => {
      this.hideModal();
      return opts.callback(event);
    });

    this.modal.modal('show');
  }

  hideModal() {
    this.modal.off('shown.bs.modal');
    this.modal.modal('hide');
  }

  updateBody(body) {
    this.modal.find('.modal-body').html(body);
  }

  updateTitle(title) {
    this.modal.find('.modal-title').html(title);
  }
}

export default Modal;
