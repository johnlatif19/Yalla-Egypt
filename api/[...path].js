import app from '../server/app.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 30
};

export default function handler(req, res) {
  return app(req, res);
}