const axios = require('axios');
require('dotenv').config();

const GITHUB_API_BASE = 'https://api.github.com';

// Optional auth header — works fine without a token too, just lower rate limit
const githubHeaders = process.env.GITHUB_TOKEN
  ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  : {};

/**
 * Fetches the raw profile object for a GitHub username.
 * Throws a 404-style error if the user doesn't exist.
 */
async function fetchGithubUser(username) {
  try {
    const { data } = await axios.get(`${GITHUB_API_BASE}/users/${username}`, {
      headers: githubHeaders
    });
    return data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      const notFoundError = new Error(`GitHub user "${username}" not found`);
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    throw error;
  }
}

/**
 * Fetches ALL public repos for a user (handles pagination).
 * Used to compute most-used language, total stars, and top repo.
 */
async function fetchAllRepos(username) {
  let repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data } = await axios.get(
      `${GITHUB_API_BASE}/users/${username}/repos`,
      {
        headers: githubHeaders,
        params: { per_page: perPage, page }
      }
    );

    repos = repos.concat(data);

    if (data.length < perPage) break; // last page reached
    page += 1;
  }

  return repos;
}

/**
 * Derives extra insights from the list of repos:
 * - most frequently used language
 * - total stars across all repos
 * - the single most-starred repo
 */
function computeRepoInsights(repos) {
  const languageCounts = {};
  let totalStars = 0;
  let topRepo = { name: null, stars: 0 };

  for (const repo of repos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }

    totalStars += repo.stargazers_count || 0;

    if ((repo.stargazers_count || 0) > topRepo.stars) {
      topRepo = { name: repo.name, stars: repo.stargazers_count };
    }
  }

  const mostUsedLanguage =
    Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    mostUsedLanguage,
    totalStars,
    topRepoName: topRepo.name,
    topRepoStars: topRepo.stars
  };
}

/**
 * Full analysis pipeline for one username:
 * fetch profile -> fetch repos -> compute insights -> return a flat object
 * ready to insert into MySQL.
 */
async function analyzeProfile(username) {
  const profile = await fetchGithubUser(username);
  const repos = await fetchAllRepos(username);
  const { mostUsedLanguage, totalStars, topRepoName, topRepoStars } =
    computeRepoInsights(repos);

  return {
    username: profile.login,
    name: profile.name,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    publicRepos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    publicGists: profile.public_gists,
    company: profile.company,
    location: profile.location,
    blog: profile.blog,
    twitterUsername: profile.twitter_username,
    accountCreatedAt: profile.created_at,
    mostUsedLanguage,
    totalStarsEarned: totalStars,
    topRepoName,
    topRepoStars
  };
}

module.exports = { analyzeProfile };
