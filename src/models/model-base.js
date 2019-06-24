import i18n from '../config/i18n';
import Toast from '../components/toast';
import ui from '../config/ui';

class ModelBase {
  constructor(locale) {
    this.translate = i18n[process.env.LOCALE];
    this.toast = new Toast();
  }

  handleError(errorMsg) {
    this.toast.showMessage(this.translate.titles.error, errorMsg);
  }

  handleSuccess(message) {
    this.toast.showMessage(this.translate.titles.success, message)
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
