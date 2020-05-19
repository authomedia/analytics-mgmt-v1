import util from 'util';
import Utilities from '../components/utilities';

class Validator {
  constructor() {
    this.errors = {}
    this.validators = {}
  }

  validate(data) {
    this.errors = {};
  }

  errorsToString(separator = '\n') {
    return Object.values(this.errors).join(separator);
  }

  validateField(field, value) {
    const validator = this.validators[field];
    if (validator) {
      return (validator.validate(this, field, value, validator));
    }
  }

  validateRange(self, field, data, validator) {
    const valid = (!data.isNaN && (data >= validator.min && data <= validator.max));
    return self.errorHandler(self, field, valid, validator, [validator.min, validator.max])
  }

  validateLength(self, field, data, validator) {
    const valid = (data.length >= validator.min && data.length <= validator.max);
    return self.errorHandler(self, field, valid, validator, [validator.min, validator.max])
  }

  validateInclusion(self, field, data, validator) {
    const valid = (validator.inclusion.includes(data));
    return self.errorHandler(self, field, valid, validator, [validator.inclusion.join(', ')])
  }

  validateMatches(self, field, data, validator) {
    const valid = (!Utilities.compareArrays(data, Object.keys(validator)));
    return self.errorHandler(self, field, valid, validator, [Object.keys(validator).join(', ')])
  }

  errorHandler(self, field, valid, validator, args) {
    if (valid) {
      return true;
    } else {
      self.errors[field] = util.format(validator.message, ...args);
      return false;
    }
  }
}

export default Validator;
