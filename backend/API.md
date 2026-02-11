# API Documentation

## Authentication

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: { user: { id, name, email }, token }
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { user: { id, name, email }, token }
```

### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>

Response: { user object with stats }
```

## Content Management

### Upload Content
```
POST /api/content/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Biology Chapter 5",
  "text": "Content text here...",
  "fileType": "text"
}

Response: { content object }
```

### Get All Content
```
GET /api/content
Authorization: Bearer <token>

Response: [{ content objects }]
```

### Get Content by ID
```
GET /api/content/:id
Authorization: Bearer <token>

Response: { content object }
```

### Generate Summaries
```
POST /api/content/:id/summarize
Authorization: Bearer <token>

Response: { content with summaries }
```

### Toggle Bookmark
```
POST /api/content/:id/bookmark
Authorization: Bearer <token>

Response: { updated content }
```

## Quiz

### Generate Quiz
```
POST /api/quiz/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentId": "content_id_here"
}

Response: { quiz object with questions }
```

### Submit Quiz
```
POST /api/quiz/:id/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": ["answer1", "answer2", ...]
}

Response: { quiz with score and accuracy }
```

### Get Quiz History
```
GET /api/quiz/history
Authorization: Bearer <token>

Response: [{ quiz objects }]
```

## Analytics

### Get Performance
```
GET /api/analytics/performance
Authorization: Bearer <token>

Response: {
  user: { xp, streak, totalQuizzesTaken, averageAccuracy },
  topicStats: [{ topic, accuracy, questionsAttempted }],
  recentQuizzes: [...]
}
```

### Get Recommendations
```
GET /api/analytics/recommendations
Authorization: Bearer <token>

Response: [{ topic, action, reason }]
```

### Get Progress Trend
```
GET /api/analytics/trend?days=30
Authorization: Bearer <token>

Response: [{ date, averageAccuracy, quizzesCompleted }]
```

## Resources

### Summarize YouTube
```
POST /api/resources/youtube
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=...",
  "title": "Video Title"
}

Response: { url, title, summary }
```

### Summarize Web Article
```
POST /api/resources/web
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com/article"
}

Response: { url, summary }
```
