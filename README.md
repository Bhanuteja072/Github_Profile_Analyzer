# GitHub Profile Analyzer API

A backend service that analyzes a GitHub user's public profile and stores useful insights in MySQL.

## Tech Stack
- Node.js + Express.js
- MySQL (via `mysql2`)
- GitHub REST API (third-party data source)

## Features
- Fetch a GitHub user's public profile data by username
- Compute and store insights: public repos, followers, following, public gists, most-used language, total stars earned across all repos, top starred repo
- List every profile that has been analyzed so far
- Fetch stored data for a single profile by username
- Re-analyzing an already-stored username refreshes (upserts) its data instead of erroring

## Project Structure
```
github-profile-analyzer/
├── schema.sql
├── package.json
└── src/
    ├── server.js
    ├── config/db.js
    ├── db/initDb.js
    ├── services/githubService.js
    ├── controllers/profileController.js
    └── routes/profileRoutes.js
```

## Setup Instructions

### 1. Clone & install
```bash
git clone <your-repo-url>
cd github-profile-analyzer
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your MySQL credentials:
```bash
cp .env.example .env
```
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=github_analyzer
GITHUB_TOKEN=
```
`GITHUB_TOKEN` is optional — it raises the GitHub API rate limit from 60 requests/hour to 5,000/hour. Generate one at https://github.com/settings/tokens (no scopes needed for public data).

### 3. Run the app
```bash
npm start
```
On first run, the app automatically creates the `github_analyzer` database and `profiles` table if they don't already exist — no manual SQL needed (though `schema.sql` is provided too, in case you'd rather run it yourself).

The server starts at `http://localhost:5000`.

## API Endpoints

| Method | Endpoint                     | Description                                      |
|--------|-------------------------------|---------------------------------------------------|
| GET    | `/`                            | Health check                                       |
| POST   | `/api/profiles/analyze`        | Analyze a GitHub username and store insights       |
| GET    | `/api/profiles`                | List all stored/analyzed profiles                  |
| GET    | `/api/profiles/:username`      | Get stored data for one specific profile           |

### POST /api/profiles/analyze
**Body:**
```json
{ "username": "octocat" }
```
**Response (201):**
```json
{
  "message": "Profile analyzed and stored successfully",
  "data": {
    "id": 1,
    "username": "octocat",
    "name": "The Octocat",
    "public_repos": 8,
    "followers": 18000,
    "most_used_language": "Ruby",
    "total_stars_earned": 14000,
    "top_repo_name": "Spoon-Knife",
    "top_repo_stars": 13000
  }
}
```

### GET /api/profiles
Returns `{ count, data: [...] }` — every profile ever analyzed.

### GET /api/profiles/:username
Returns `{ data: {...} }` for one stored profile, or 404 if it hasn't been analyzed yet.

## Database Schema
See `schema.sql`. Core table: `profiles` — one row per analyzed GitHub username, with `username` as a unique key (so re-analysis updates rather than duplicates).

## Testing
A Postman collection is included: `postman_collection.json`. Import it into Postman and set the `baseUrl` variable to either `http://localhost:5000` or your deployed URL.
