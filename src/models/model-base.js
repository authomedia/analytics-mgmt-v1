import i18n from '../config/i18n';
import Toast from '../components/toast';
import Modal from '../components/modal';
import ui from '../config/ui';

class ModelBase {
  constructor(locale) {
    this.translate = i18n[process.env.LOCALE];
    this.toast = new Toast();
    this.modal = new Modal();
  }

  handleError(errorMsg) {
    this.toast.showMessage(this.translate.titles.error, errorMsg, 'warn');
  }

  handleSuccess(message) {
    this.toast.showMessage(this.translate.titles.success, message, 'info')
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
