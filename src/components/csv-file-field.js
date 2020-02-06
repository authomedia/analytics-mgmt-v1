import csv from 'csv'
import TableBuilder from 'table-builder'
import FileField from '../components/file-field';

class CsvFileField extends FileField {
  handleFile(file) {
    super.handleFile(file);

    const output = [];

    file.text().then((data) => {
      let parser = csv.parse(data);

      parser.on('error', (err) => {
        this.handleError(err.message);
        this.emit('error', err);
      });

      parser.on('readable', () => {
        let record
        while (record = parser.read()) {
          output.push(record)
        }
        this.emit('readable', record);
      });

      parser.on('end', () => {
        this.handleSuccess('Imported CSV data successfully');
        this.emit('end', output);
      });

      parser.end();
    });
  }
}

export default CsvFileField;
