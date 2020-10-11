import Page from '../page';
import TableGenerator from '../../utilities/table-generator';
import Utilities from '../../components/utilities';

import constants from '../../config/constants';
import ui from '../../config/ui';
import db from '../../models/db';


class AdministrationSnapshots extends Page {
  constructor() {
    super()
    this.wrapper = $('#snapshots-table-wrapper');

    this.tableGenerator = new TableGenerator();

    this.loadData();
  }

  loadData() {
    db.snapshots.toArray((data) => {
      this.currentData = data.map((item) => {
        return {
          index: item.index,
          fields: `<pre><code>${JSON.stringify(item.fields, null, 2)}</code></pre>`,
          action: `<a href="#" class="delete-snapshot" data-snapshot-index="${item.index}">Delete</a>`
        }
      });

      this.currentData.unshift(['index', 'fields', 'action']);

      this.updateTable(this.currentData);
      ui.loggedIn();
    });
  }

  updateTable(data) {
    console.log(data);
    this.tableGenerator.setData(data);
    this.tableGenerator.generateTable(this.wrapper);

    $('.delete-snapshot').on('click', async (event) => {
      const elem = event.currentTarget;
      const index = $(elem).data('snapshot-index');

      await db.snapshots.delete(index);
      this.loadData();
    })
  }
}

export default () => {
  $(function() {
    new AdministrationSnapshots();
  });
}
