import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';

const port = env.PORT || 3001;

app.listen(port, () => {
  console.log(`Yalla Egypt API listening on http://localhost:${port}`);
});