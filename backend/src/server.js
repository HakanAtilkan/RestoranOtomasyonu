const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const apiRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Restoran Otomasyonu API' });
});

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadi' });
});

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT} uzerinde calisiyor`);
});

