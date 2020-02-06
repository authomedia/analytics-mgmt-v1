class Utilities {
  static compareArrays(arr1, arr2) {
    if (arr1.length == arr2.length
        && arr1.every(function(u, i) {
            return u === arr2[i];
        })
    ) {
       return true;
    } else {
       return false;
    }
  }

  static titleize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

export default Utilities;
