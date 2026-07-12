const app = require('./app');
const config = require('./config');
const { initDb } = require('./db/init');

initDb();

app.listen(config.port, () => {
  console.log(`PaperShare API listening on http://localhost:${config.port}`);
});
