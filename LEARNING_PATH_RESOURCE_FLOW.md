# Learning Path - Resource Fetching Flow

## Overview
The Learning Path component fetches resources from multiple sources to provide students with comprehensive learning materials for each topic they're studying.

---

## Complete Resource Fetching Flow

```
User clicks on a topic in Learning Path
    ↓
Frontend: handleTopicClick(topic)
    ├─ setSelectedTopic(topic)
    ├─ fetchTopicDetails(topic)
    └─ fetchResources(topic)
    ↓
Backend: GET /resources/topic/:topic
    ├─ Check for curated resources
    ├─ If not found, fetch from external sources
    └─ Return combined resources
    ↓
Frontend: Display resources in modal
    ├─ Videos (YouTube)
    ├─ Articles (Wikipedia, Dev.to, Medium)
    └─ Courses (Coursera, Udemy, Khan Academy, edX)
```

---

## Step-by-Step Breakdown

### Step 1: Frontend - User Clicks Topic

**File:** `frontend/src/pages/LearningPath.jsx`

```javascript
const handleTopicClick = (topic) => {
  setSelectedTopic(topic);           // Store selected topic
  setResources(null);                // Clear previous resources
  fetchTopicDetails(topic.topic);    // Fetch topic stats
  fetchResources(topic.topic);       // Fetch learning resources
};
```

### Step 2: Frontend - Fetch Resources

**File:** `frontend/src/pages/LearningPath.jsx`

```javascript
const fetchResources = async (topic) => {
  try {
    setResourcesLoading(true);
    
    // Call backend API
    const res = await client.get(`/resources/topic/${encodeURIComponent(topic)}`);
    
    // Extract resources from response
    setResources(res.data.data.resources);
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    setResources(null);
  } finally {
    setResourcesLoading(false);
  }
};
```

**API Call:**
```
GET /api/resources/topic/Data%20Structures
```

### Step 3: Backend - Route Handler

**File:** `backend/src/routes/resources.js`

```javascript
router.get('/topic/:topic', authenticate, async (req, res, next) => {
  try {
    const { topic } = req.params;

    // Validate topic
    if (!topic || topic.trim().length === 0) {
      throw new AppError('Topic is required', 400);
    }

    console.log(`📚 Fetching resources for topic: ${topic}`);

    // First try to get curated resources
    let resources = externalResourceService.getCuratedResources(topic);

    // If no curated resources, fetch from external sources
    if (!resources) {
      resources = await externalResourceService.getResourcesForTopic(topic);
    }

    res.status(200).json({
      success: true,
      data: {
        topic,
        resources,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});
```

### Step 4: Backend - Resource Service

**File:** `backend/src/services/externalResourceService.js`

#### 4.1 Check Curated Resources First

```javascript
getCuratedResources(topic) {
  const curatedResources = {
    'Data Structures': {
      videos: [...],
      articles: [...],
      courses: [...]
    },
    'Algorithms': {
      videos: [...],
      articles: [...],
      courses: [...]
    },
    // ... more topics
  };

  return curatedResources[topic] || null;
}
```

**Curated Topics Available:**
- Data Structures
- Algorithms
- Machine Learning

#### 4.2 Fetch from External Sources (if not curated)

```javascript
async getResourcesForTopic(topic) {
  const resources = {
    videos: [],
    articles: [],
    documents: [],
    courses: []
  };

  // Fetch from multiple sources in parallel
  const [videos, articles, courses] = await Promise.allSettled([
    this.fetchYouTubeVideos(topic),
    this.fetchArticles(topic),
    this.fetchCourses(topic)
  ]);

  // Combine results
  if (videos.status === 'fulfilled') {
    resources.videos = videos.value;
  }
  if (articles.status === 'fulfilled') {
    resources.articles = articles.value;
  }
  if (courses.status === 'fulfilled') {
    resources.courses = courses.value;
  }

  return resources;
}
```

---

## Resource Sources

### 1. YouTube Videos

**API:** YouTube Data API v3

```javascript
async fetchYouTubeVideos(topic) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      q: `${topic} tutorial educational`,
      part: 'snippet',
      type: 'video',
      maxResults: 5,
      order: 'relevance',
      key: apiKey,
      videoDuration: 'medium' // 4-20 minutes
    },
    timeout: 5000
  });

  return response.data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium.url,
    channel: item.snippet.channelTitle,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    type: 'video',
    platform: 'YouTube',
    duration: '4-20 min'
  }));
}
```

**Response Format:**
```json
{
  "id": "video_id",
  "title": "Data Structures Tutorial",
  "description": "Learn data structures...",
  "thumbnail": "https://...",
  "channel": "freeCodeCamp",
  "url": "https://youtube.com/watch?v=...",
  "type": "video",
  "platform": "YouTube",
  "duration": "4-20 min"
}
```

### 2. Articles & Documentation

**Sources:**
- Wikipedia API
- Dev.to API
- Medium (search link)

#### Wikipedia

```javascript
const wikiResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
  params: {
    action: 'query',
    list: 'search',
    srsearch: topic,
    format: 'json',
    srlimit: 3
  },
  timeout: 5000
});

// Returns: Wikipedia articles with search snippets
```

#### Dev.to

```javascript
const devtoResponse = await axios.get('https://dev.to/api/articles', {
  params: {
    tag: topic.toLowerCase().replace(/ /g, '-'),
    per_page: 3
  },
  timeout: 5000
});

// Returns: Technical articles from Dev.to community
```

#### Medium

```javascript
// Medium doesn't have public API, so we provide search link
articles.push({
  title: `Search "${topic}" on Medium`,
  description: 'Find articles and stories about this topic',
  url: `https://medium.com/search?q=${encodeURIComponent(topic)}`,
  type: 'article',
  platform: 'Medium',
  source: 'Medium'
});
```

### 3. Online Courses

**Platforms:**
- Coursera
- Udemy
- Khan Academy
- edX

```javascript
async fetchCourses(topic) {
  const courses = [];

  // Coursera
  courses.push({
    title: `Coursera: ${topic} Courses`,
    description: 'Find professional courses on Coursera',
    url: `https://www.coursera.org/search?query=${encodeURIComponent(topic)}`,
    type: 'course',
    platform: 'Coursera',
    level: 'Beginner to Advanced'
  });

  // Udemy
  courses.push({
    title: `Udemy: ${topic} Courses`,
    description: 'Find affordable courses on Udemy',
    url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(topic)}`,
    type: 'course',
    platform: 'Udemy',
    level: 'All Levels'
  });

  // Khan Academy
  courses.push({
    title: `Khan Academy: ${topic}`,
    description: 'Free educational videos and exercises',
    url: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(topic)}`,
    type: 'course',
    platform: 'Khan Academy',
    level: 'Free'
  });

  // edX
  courses.push({
    title: `edX: ${topic} Courses`,
    description: 'University-level courses',
    url: `https://www.edx.org/search?q=${encodeURIComponent(topic)}`,
    type: 'course',
    platform: 'edX',
    level: 'University Level'
  });

  return courses;
}
```

---

## Frontend Display

### Modal Structure

**File:** `frontend/src/pages/LearningPath.jsx`

```javascript
{selectedTopic && topicDetails && (
  <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      {/* Topic Header */}
      <h2 className="text-2xl font-bold">{topicDetails.topic}</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div>{topicDetails.accuracy}% Accuracy</div>
        <div>{topicDetails.correctAnswers} Correct</div>
        <div>{topicDetails.totalQuestions} Total</div>
      </div>

      {/* Related Study Materials */}
      {topicDetails.relatedContent.length > 0 && (
        <div>
          <h3>Related Study Materials</h3>
          {topicDetails.relatedContent.map(content => (
            <div key={content.id}>{content.title}</div>
          ))}
        </div>
      )}

      {/* External Resources */}
      {resources && (
        <div>
          {/* Videos */}
          {resources.videos && resources.videos.length > 0 && (
            <div>
              <h3>Video Tutorials</h3>
              {resources.videos.slice(0, 3).map((video, idx) => (
                <a key={idx} href={video.url} target="_blank">
                  <img src={video.thumbnail} alt={video.title} />
                  <p>{video.title}</p>
                  <p>{video.channel}</p>
                </a>
              ))}
            </div>
          )}

          {/* Articles */}
          {resources.articles && resources.articles.length > 0 && (
            <div>
              <h3>Articles & Documentation</h3>
              {resources.articles.slice(0, 3).map((article, idx) => (
                <a key={idx} href={article.url} target="_blank">
                  <p>{article.title}</p>
                  <p>{article.description}</p>
                  <span>{article.platform}</span>
                </a>
              ))}
            </div>
          )}

          {/* Courses */}
          {resources.courses && resources.courses.length > 0 && (
            <div>
              <h3>Online Courses</h3>
              {resources.courses.slice(0, 3).map((course, idx) => (
                <a key={idx} href={course.url} target="_blank">
                  <p>{course.title}</p>
                  <p>{course.description}</p>
                  <span>{course.platform}</span>
                  <span>{course.level}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Questions */}
      {topicDetails.recentQuestions.length > 0 && (
        <div>
          <h3>Recent Questions</h3>
          {topicDetails.recentQuestions.map((q, idx) => (
            <div key={idx}>
              <span>{q.isCorrect ? '✓' : '✗'}</span>
              <p>{q.question}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  </motion.div>
)}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LearningPath.jsx                                          │
│  ├─ Display learning path topics                           │
│  ├─ User clicks topic                                      │
│  └─ handleTopicClick(topic)                                │
│      ├─ fetchTopicDetails(topic)                           │
│      └─ fetchResources(topic)                              │
│          └─ GET /api/resources/topic/:topic                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  routes/resources.js                                       │
│  └─ GET /topic/:topic                                      │
│      └─ externalResourceService.getResourcesForTopic()     │
│          ├─ getCuratedResources(topic)                     │
│          │  └─ Check hardcoded curated list                │
│          │                                                 │
│          └─ If not found, fetch from external sources:     │
│             ├─ fetchYouTubeVideos(topic)                   │
│             │  └─ YouTube API v3                           │
│             │                                              │
│             ├─ fetchArticles(topic)                        │
│             │  ├─ Wikipedia API                            │
│             │  ├─ Dev.to API                               │
│             │  └─ Medium search link                       │
│             │                                              │
│             └─ fetchCourses(topic)                         │
│                ├─ Coursera search link                     │
│                ├─ Udemy search link                        │
│                ├─ Khan Academy search link                 │
│                └─ edX search link                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL APIs                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ├─ YouTube Data API v3                                    │
│  │  └─ Returns: Video metadata, thumbnails, URLs           │
│  │                                                         │
│  ├─ Wikipedia API                                          │
│  │  └─ Returns: Article titles, snippets, URLs             │
│  │                                                         │
│  ├─ Dev.to API                                             │
│  │  └─ Returns: Technical articles, descriptions           │
│  │                                                         │
│  └─ Course Platforms (search links)                        │
│     ├─ Coursera                                            │
│     ├─ Udemy                                               │
│     ├─ Khan Academy                                        │
│     └─ edX                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Display Resources in Modal                                │
│  ├─ Video Tutorials (YouTube)                              │
│  ├─ Articles & Documentation                               │
│  │  ├─ Wikipedia                                           │
│  │  ├─ Dev.to                                              │
│  │  └─ Medium                                              │
│  └─ Online Courses                                         │
│     ├─ Coursera                                            │
│     ├─ Udemy                                               │
│     ├─ Khan Academy                                        │
│     └─ edX                                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## API Response Example

```json
{
  "success": true,
  "data": {
    "topic": "Data Structures",
    "resources": {
      "videos": [
        {
          "id": "RBSGKlAvoiM",
          "title": "Data Structures Fundamentals",
          "description": "Learn the basics of data structures...",
          "thumbnail": "https://i.ytimg.com/vi/...",
          "channel": "freeCodeCamp",
          "url": "https://www.youtube.com/watch?v=RBSGKlAvoiM",
          "type": "video",
          "platform": "YouTube",
          "duration": "4-20 min"
        }
      ],
      "articles": [
        {
          "title": "Data Structures Explained",
          "description": "A comprehensive guide to data structures...",
          "url": "https://www.geeksforgeeks.org/data-structures/",
          "type": "article",
          "platform": "GeeksforGeeks",
          "source": "Wikipedia"
        }
      ],
      "courses": [
        {
          "title": "Coursera: Data Structures Courses",
          "description": "Find professional courses on Coursera",
          "url": "https://www.coursera.org/search?query=Data%20Structures",
          "type": "course",
          "platform": "Coursera",
          "level": "Beginner to Advanced"
        }
      ]
    },
    "timestamp": "2026-02-12T10:30:00Z"
  }
}
```

---

## Caching Strategy

Currently, resources are fetched fresh each time a topic is clicked. For optimization:

```javascript
// Could implement caching like:
const resourceCache = new Map();

async getResourcesForTopic(topic) {
  // Check cache first
  if (resourceCache.has(topic)) {
    return resourceCache.get(topic);
  }

  // Fetch from external sources
  const resources = await this.fetchFromExternalSources(topic);

  // Cache for 1 hour
  resourceCache.set(topic, resources);
  setTimeout(() => resourceCache.delete(topic), 3600000);

  return resources;
}
```

---

## Error Handling

```javascript
// Each fetch uses Promise.allSettled to handle partial failures
const [videos, articles, courses] = await Promise.allSettled([
  this.fetchYouTubeVideos(topic),
  this.fetchArticles(topic),
  this.fetchCourses(topic)
]);

// If one fails, others still return results
if (videos.status === 'fulfilled') {
  resources.videos = videos.value;
}
if (articles.status === 'fulfilled') {
  resources.articles = articles.value;
}
if (courses.status === 'fulfilled') {
  resources.courses = courses.value;
}
```

---

## API Keys Required

To fetch resources, you need:

1. **YouTube API Key** - For video search
   - Set in: `backend/.env` as `YOUTUBE_API_KEY`
   - Get from: [Google Cloud Console](https://console.cloud.google.com)

2. **Wikipedia API** - Free, no key needed
3. **Dev.to API** - Free, no key needed
4. **Course Platforms** - Search links only, no API needed

---

## Performance Considerations

- **Parallel Fetching:** Uses `Promise.allSettled()` for concurrent requests
- **Timeout:** 5 seconds per API call
- **Limit Results:** Shows only top 3-5 results per category
- **Lazy Loading:** Resources only fetched when topic is clicked
- **Error Resilience:** If one source fails, others still work

---

## Future Enhancements

1. **Caching:** Cache resources for 1 hour
2. **Filtering:** Filter by difficulty level, language
3. **Ratings:** Show community ratings for resources
4. **Bookmarking:** Save favorite resources
5. **Recommendations:** ML-based resource recommendations
6. **Offline Mode:** Cache popular resources locally
7. **Custom Resources:** Allow users to add their own resources

---

## Summary

The Learning Path fetches resources through a multi-source strategy:

1. **Check Curated Resources** - Pre-defined for common topics
2. **Fetch from External APIs** - YouTube, Wikipedia, Dev.to
3. **Provide Search Links** - Coursera, Udemy, Khan Academy, edX
4. **Display in Modal** - Organized by type (videos, articles, courses)
5. **Handle Errors Gracefully** - Partial failures don't break the experience

This ensures students always have access to comprehensive learning materials for any topic in their learning path.
