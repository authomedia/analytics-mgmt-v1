import moment from 'moment';

import Page from '../page';
import TableGenerator from '../../utilities/table-generator';
import Utilities from '../../components/utilities';

import constants from '../../config/constants';
import ui from '../../config/ui';
import db from '../../models/db';


class AdministrationMetricsCache extends Page {
  constructor() {
    super()
    this.wrapper = $('#metrics-cache-table-wrapper');

    this.tableGenerator = new TableGenerator();

    this.loadData();
  }

  loadData() {
    db.metricsCache.toArray((data) => {
      this.currentData = data.map((item) => {
        return {
          index: item.index,
          data: `<pre><code>${JSON.stringify(item.data, null, 2)}</code></pre>`,
          timestamp: moment(item.timestamp).fromNow(),
          action: `<a href="#" class="delete-metric-cache" data-metric-cache-index="${item.index}">Delete</a>`
        }
      });

      this.currentData.unshift(['index', 'data', 'timestamp', 'action']);

      this.updateTable(this.currentData);
      ui.loggedIn();
    });
  }

  updateTable(data) {
    this.tableGenerator.setData(data);
    this.tableGenerator.generateTable(this.wrapper);

    $('.delete-metric-cache').on('click', async (event) => {
      const elem = event.currentTarget;
      const index = $(elem).data('metric-cache-index');
      console.log(index);

      await db.metricsCache.delete(index.toString())
      this.loadData()
    })
  }
}

export default () => {
  $(function() {
    new AdministrationMetricsCache();
  });
}
