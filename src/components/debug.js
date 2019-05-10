import formControl from '../config/formControl';

function debug(msg) {
  formControl.debug.val(msg);
  console.log(msg);
}

export default debug;
