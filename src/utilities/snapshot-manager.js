import constants from '../config/constants';
import db from '../models/db';
import events from '../config/events';
import { translate } from './translate'
import ui from '../config/ui';

import Button from '../components/ui/button';

class SnapshotManager {
  constructor(name, form, serializer, hydrator) {
    this.formName = name;
    this.form = form;
    this.serializer = serializer;
    this.hydrator = hydrator;

    this.saveSnapshotButton = new Button($('#save-snapshot-button'), this);
    this.loadSnapshotButton = new Button($('#load-snapshot-button'), this);

    this.initSaveSnapshotButton();
    this.initLoadSnapshotButton();
  }

  initSaveSnapshotButton() {
    let currentData = {};

    db.snapshots.toArray((data) => {
      data.unshift(constants.DB_FIELDS_SNAPSHOTS);
      currentData = Object.assign({}, data);
    });

    const saveSnapshotForm = $(`<p>
      <input
        type="text"
        id="save-snapshot-name"
        name="save-snapshot-name"
        class="form-control"
        placeholder="${translate('analytics.modals.saveSnapshot.placeholder')}"
      >
    </p>`);

    this.saveSnapshotButton.on(events.BUTTONS.BUTTON.CLICK, (event) => {
      ui.modal.showModal(
        translate('analytics.modals.saveSnapshot.title'),
        saveSnapshotForm,
        {
          primaryText: translate('analytics.modals.saveSnapshot.primaryText'),
          callback: (event) => {
            this.saveSnapshotFormData(saveSnapshotForm, event);
          }
        }
      );
    })
  }

  initLoadSnapshotButton() {
    let currentData = {};
    this.loadSnapshotButton.on(events.BUTTONS.BUTTON.CLICK, (event) => {
      db.snapshots
        .where(':id')
        .startsWith(this.formName)
        // .orderBy(':id')
        .toArray((data) => {
          data.unshift(constants.DB_FIELDS_SNAPSHOTS);

          const options = data.map((row) => {
            if (row.index) {
              const value = row.index.replace(`${this.formName}#`, '');
              return `<option value="${value}">${value}</option>`;
            }
          })

          const loadSnapshotField = $(`
            <select id="load-snapshot-name" class="select2 form-control">
              ${options}
            </select>
          `);

          const loadSnapshotForm = $(`<p></p>`).append(loadSnapshotField);
          loadSnapshotField.select2();

          ui.modal.showModal(
            translate('analytics.modals.loadSnapshot.title'),
            loadSnapshotForm,
            {
              primaryText: translate('analytics.modals.loadSnapshot.primaryText'),
              callback: (event) => {
                this.loadSnapshotFormData(loadSnapshotForm, event);
                loadSnapshotField.select2('destroy');
              }
            }
          );
        });
    });
  }

  async saveSnapshotFormData(form, event) {
    let snapshotName = $(form).find('#save-snapshot-name').val();
    if (!snapshotName) {
      snapshotName = `snapshot-${new Date().getTime() / 1000}`;
    }

    return db.snapshots.put({
      index: `${this.formName}#${snapshotName}`,
      fields: this.serializer()
    });
  }

  async loadSnapshotFormData(form, event) {
    let snapshotName = $(form).find('#load-snapshot-name').val();
    if (!snapshotName) {
      return;
    }

    return db.snapshots.get(`${this.formName}#${snapshotName}`, (data) => {
      if (data) {
        this.hydrator(data.fields);
      } else {
        return false;
      }
    });
  }
}

export default SnapshotManager;

