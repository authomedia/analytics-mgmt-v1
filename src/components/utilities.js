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

  static mapRows(headers, rows) {
    return rows.map((row, i) => {
      if (Array.isArray(row)) {
        let obj = {};
        row.map((col, j) => {
          obj[headers[j].toString()] = col;
        });
        return obj;
      } else {
        return row
      }
    });
  }

  static mapHeaders(headers) {
    let obj = {};
    headers.map((col, i) => {
      obj[col] = col;
    });
    return obj
  }
}

export default Utilities;
