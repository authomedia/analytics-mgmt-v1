import Dexie from 'dexie';

const db = new Dexie(process.env.DB_NAME);

db.version(1).stores({
    customDimensions: `index, name, scope, active`
});

export default db;
