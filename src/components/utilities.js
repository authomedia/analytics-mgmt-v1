class Utilities {
  populateOptions(items, select, keyField, valueField, dataFields) {
    var selectElem = $(select);

    selectElem.empty()

    $.each(items, function(key, value) {
      var selectOption = $("<option></option>")
                         .attr("value", value[valueField])
                         .text(value[keyField]);
      selectElem.append(selectOption)

      $.each(dataFields, function(i, dataKey) {
        console.log(dataKey, value[dataKey])
        selectOption.data(dataKey, value[dataKey])
      });
    });

    // Set height to match the number of items

    selectElem
      .attr("size", selectElem.children('option').length);
  }
}

export default Utilities;
