import EventEmitter from 'events';
import i18n from '../config/i18n';
import Toast from '../components/ui/toast';
import Modal from '../components/ui/modal';
import ui from '../config/ui';

class ModelBase extends EventEmitter {
  constructor(locale) {
    super();
    this.translate = i18n[process.env.LOCALE];
    this.toast = new Toast();
    this.modal = new Modal();
  }

  handleSuccess(message, action = {}) {
    this.toast.showMessage(this.translate.titles.success, message, action, 'info')
  }

  handleWarn(message, action = {}) {
    this.toast.showMessage(this.translate.titles.error, message, action, 'warn');
  }

  handleError(message, action = {}) {
    this.toast.showMessage(this.translate.titles.error, message, action, 'error');
  }

  debug(string) {
    ui.formControl.debug.append(`${string}\n`);
  }

  debugJson(object) {
    let formattedJson = JSON.stringify(object, null, 2);
    ui.formControl.debug.append(formattedJson);
  }
}

export default ModelBase;
