const pool = require('../config/db');
const { analyzeProfile } = require('../services/githubService');

/**
 * POST /api/profiles/analyze
 * Body: { "username": "octocat" }
 *
 * Fetches the GitHub profile, computes insights, and UPSERTS it into MySQL
 * (if the username already exists, it refreshes the stored data instead of
 * erroring out — handy for re-running analysis on someone already tracked).
 */
async function analyzeAndStoreProfile(req, res) {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'username is required in the request body' });
    }

    const insights = await analyzeProfile(username.trim());

    const sql = `
      INSERT INTO profiles (
        username, name, bio, avatar_url, public_repos, followers,
        following, public_gists, company, location, blog,
        twitter_username, account_created_at, most_used_language,
        total_stars_earned, top_repo_name, top_repo_stars
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        bio = VALUES(bio),
        avatar_url = VALUES(avatar_url),
        public_repos = VALUES(public_repos),
        followers = VALUES(followers),
        following = VALUES(following),
        public_gists = VALUES(public_gists),
        company = VALUES(company),
        location = VALUES(location),
        blog = VALUES(blog),
        twitter_username = VALUES(twitter_username),
        account_created_at = VALUES(account_created_at),
        most_used_language = VALUES(most_used_language),
        total_stars_earned = VALUES(total_stars_earned),
        top_repo_name = VALUES(top_repo_name),
        top_repo_stars = VALUES(top_repo_stars)
    `;

    await pool.query(sql, [
      insights.username,
      insights.name,
      insights.bio,
      insights.avatarUrl,
      insights.publicRepos,
      insights.followers,
      insights.following,
      insights.publicGists,
      insights.company,
      insights.location,
      insights.blog,
      insights.twitterUsername,
      new Date(insights.accountCreatedAt),
      insights.mostUsedLanguage,
      insights.totalStarsEarned,
      insights.topRepoName,
      insights.topRepoStars
    ]);

    const [rows] = await pool.query(
      'SELECT * FROM profiles WHERE username = ?',
      [insights.username]
    );

    return res.status(201).json({
      message: 'Profile analyzed and stored successfully',
      data: rows[0]
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error in analyzeAndStoreProfile:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/profiles
 * Returns the list of every profile that has ever been analyzed/stored.
 */
async function getAllProfiles(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM profiles ORDER BY analyzed_at DESC'
    );
    return res.status(200).json({ count: rows.length, data: rows });
  } catch (error) {
    console.error('Error in getAllProfiles:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/profiles/:username
 * Returns the stored insight data for ONE specific profile.
 */
async function getProfileByUsername(req, res) {
  try {
    const { username } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM profiles WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: `No stored analysis found for username "${username}". Analyze it first via POST /api/profiles/analyze`
      });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error('Error in getProfileByUsername:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  analyzeAndStoreProfile,
  getAllProfiles,
  getProfileByUsername
};
