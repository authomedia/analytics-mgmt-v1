import Utilities from '../components/utilities';
import Validator from './validator';
import { translate } from './translate';
import util from 'util';


class CustomDimensionsValidator extends Validator {
  constructor() {
    super()
    this.headerRow = 0; // Don't think anything else will work properly

    this.validators = {
      index: {
        validate: this.validateRange,
        message: translate('validations.range', ['Index']),
        min: 1,
        max: 26
      },
      name: {
        validate: this.validateLength,
        message: translate('validations.length', ['Name']),
        min: 1,
        max: 50
      },
      scope: {
        validate: this.validateInclusion,
        message: translate('validations.inclusion', ['Scope']),
        inclusion: [
          'HIT',
          'SESSION',
          'USER',
          'PRODUCT'
        ]
      },
      active: {
        validate: this.validateRange,
        message: translate('validations.range', ['Active']),
        min: 0,
        max: 1
      }
    }
  }

  validate(data) {
    super.validate(data);

    if (!this.validateHeaders(data)) {
      return false;
    }

    const dataRows = this.getRows(data);

    return dataRows.every((row) => {
      return Object.keys(this.validators).every((field, i) => {
        return this.validateField(field, row[i])
      });
    })
  }

  getRows(data) {
    return data.slice(this.headerRow + 1, data.length);
  }

  validateHeaders(data) {
    if (!Utilities.compareArrays(data[this.headerRow], Object.keys(this.validators))) {
      const message = util.format(
        translate('validations.matches', ['Headers', Object.keys(this.validators).join(', ')])
      )
      this.errors['headers'] = message;
      return false;
    } else {
      return true;
    }
  }
}

export default CustomDimensionsValidator;
