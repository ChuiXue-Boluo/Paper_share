const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const fieldsRouter = require('./routes/fields');
const papersRouter = require('./routes/papers');
const { errorHandler, notFoundHandler } = require('./middleware/error');

const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(config.uploadDir)));

app.get('/api/health', (_req, res) => {
  res.json({ code: 0, data: { ok: true }, message: 'ok' });
});

app.use('/api/fields', fieldsRouter);
app.use('/api/papers', papersRouter);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
