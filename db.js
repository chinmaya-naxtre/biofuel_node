const Datastore = require("nedb");
const stateDb = new Datastore("database/state.db");
const cityDb = new Datastore("database/city.db");
const adminDb = new Datastore("database/admin.db");
const localDb = new Datastore("database/local.db");
stateDb.loadDatabase();
cityDb.loadDatabase();
adminDb.loadDatabase();
localDb.loadDatabase();

module.exports = { stateDb, cityDb, adminDb, localDb };
