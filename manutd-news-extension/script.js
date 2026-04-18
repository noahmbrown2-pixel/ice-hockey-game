// RSS Feed sources for Man Utd news
const RSS_FEEDS = [
  {
    name: 'BBC Sport',
    url: 'https://feeds.bbci.co.uk/sport/football/teams/manchester-united/rss.xml'
  },
  {
    name: 'ESPN',
    url: 'https://www.espn.com/espn/rss/soccer/news'
  },
  {
    name: 'Sky Sports',
    url: 'https://www.skysports.com/rss/12040' // Man Utd RSS
  }
];

// RSS to JSON converter API (free, no key needed)
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

// Update date and time
function updateDateTime() {
  const now = new Date();

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date').textContent = now.toLocaleDateString('en-GB', dateOptions);

  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  document.getElementById('current-time').textContent = now.toLocaleTimeString('en-GB', timeOptions);
}

// Fetch RSS feed and convert to JSON
async function fetchFeed(feed) {
  try {
    const response = await fetch(RSS2JSON_API + encodeURIComponent(feed.url));
    const data = await response.json();

    if (data.status === 'ok') {
      return data.items.map(item => ({
        ...item,
        source: feed.name
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching ${feed.name}:`, error);
    return [];
  }
}

// Filter for Man Utd related content
function isManUtdRelated(item) {
  const keywords = [
    'manchester united', 'man utd', 'man united', 'mufc',
    'old trafford', 'red devils', 'united'
  ];

  const text = `${item.title} ${item.description || ''}`.toLowerCase();
  return keywords.some(keyword => text.includes(keyword));
}

// Fetch all news from all sources
async function fetchAllNews() {
  const newsGrid = document.getElementById('news-grid');
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');

  // Show loading
  loading.style.display = 'flex';
  error.style.display = 'none';
  newsGrid.innerHTML = '';

  try {
    // Fetch all feeds in parallel
    const feedPromises = RSS_FEEDS.map(feed => fetchFeed(feed));
    const results = await Promise.all(feedPromises);

    // Combine and flatten all results
    let allNews = results.flat();

    // Filter for Man Utd related news (for general feeds like ESPN)
    allNews = allNews.filter(item => {
      // BBC and Sky Sports Man Utd feeds are already filtered
      if (item.source === 'BBC Sport' || item.source === 'Sky Sports') {
        return true;
      }
      return isManUtdRelated(item);
    });

    // Remove duplicates based on title similarity
    const seenTitles = new Set();
    allNews = allNews.filter(item => {
      const normalizedTitle = item.title.toLowerCase().substring(0, 50);
      if (seenTitles.has(normalizedTitle)) {
        return false;
      }
      seenTitles.add(normalizedTitle);
      return true;
    });

    // Sort by date (newest first)
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Take top 20 articles
    allNews = allNews.slice(0, 20);

    // Hide loading
    loading.style.display = 'none';

    if (allNews.length === 0) {
      error.innerHTML = '<p>📰 No news found at the moment. Try again later!</p><button onclick="fetchAllNews()">Try Again</button>';
      error.style.display = 'block';
      return;
    }

    // Render news cards
    renderNews(allNews);

  } catch (err) {
    console.error('Error fetching news:', err);
    loading.style.display = 'none';
    error.style.display = 'block';
  }
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
}

// Strip HTML tags from description
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
}

// Render news cards
function renderNews(newsItems) {
  const newsGrid = document.getElementById('news-grid');

  newsItems.forEach(item => {
    const card = document.createElement('article');
    card.className = 'news-card';

    const description = stripHtml(item.description).substring(0, 200);

    card.innerHTML = `
      <a href="${item.link}" target="_blank" rel="noopener noreferrer">
        <span class="news-source">${item.source}</span>
        <h2>${item.title}</h2>
        <p class="news-description">${description}${description.length >= 200 ? '...' : ''}</p>
        <div class="news-meta">
          <span class="news-date">📅 ${formatDate(item.pubDate)}</span>
          <span class="read-more">Read more →</span>
        </div>
      </a>
    `;

    newsGrid.appendChild(card);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateDateTime();
  setInterval(updateDateTime, 60000); // Update time every minute
  fetchAllNews();
});
