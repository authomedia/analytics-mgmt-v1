import Logger from 'js-logger';
import ModelBase from '../models/model-base';

class FileField extends ModelBase {
  constructor(field) {
    super()
    this.field = field;
    this.init()
  }

  init() {
    this.field.on('change', (e) => {
      const file = e.target.files[0];
      this.emit('change', file);

      if (file !== undefined) {
        this.handleFile(file);
      } else {
        this.handleWarn('No file selected');
      }
    });
  }

  handleFile(file) {
    Logger.info(`Selected ${file.name}`);
  }
}

export default FileField;
