import i18n from '../config/i18n';
import util from 'util';

const locale = i18n[process.env.LOCALE];

function translate(message, interpolations) {
  const keys = message.split('.');
  let obj = locale;
  keys.forEach((key) => {
    obj = fetchKey(obj, key);
  });
  if (interpolations !== undefined) {
 	 return util.format(obj, ...interpolations);
  } else {
  	return obj;
  }
}

function fetchKey(obj, key) {
  return obj[key];
}

export {
  translate
}
