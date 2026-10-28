# Yalla Egypt — Bilingual Tourism Website

A production-ready bilingual (English/Arabic) tourism website for a personal Egyptian tour guide brand.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES Modules), Vite
- **Backend**: Node.js, Express.js (Vercel serverless compatible)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (email/password + custom claims)
- **Images**: Cloudinary (signed uploads)
- **Deployment**: Vercel

## Project Structure
/
├── index.html
├── tours/
├── booking/
├── about/
├── contact/
├── login/
├── dashboard/
├── assets/
│ ├── images/
│ ├── css/
│ └── js/
│ ├── core/
│ ├── i18n/
│ ├── ui/
│ ├── pages/
│ └── dashboard/
├── server/
│ ├── app.js
│ ├── index.js
│ ├── config/
│ ├── middleware/
│ ├── services/
│ └── routes/
├── api/
│ └── [...path].js
├── public/
├── scripts/
├── firestore.rules
├── firestore.indexes.json
├── vercel.json
├── vite.config.js
└── package.json

text

## Local Development

### 1. Install dependencies

```bash
npm install
