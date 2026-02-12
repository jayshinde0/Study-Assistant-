# Student Profile API Documentation

## Base URL
`/api/profile`

## Endpoints

### 1. Get Current User's Profile
**GET** `/api/profile`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "userId": "ObjectId",
    "name": "string",
    "email": "string",
    "username": "string",
    "avatar": "string",
    "bio": "string",
    "totalStudyHours": 45.5,
    "totalQuizzesTaken": 12,
    "averageAccuracy": 78.5,
    "currentStreak": 5,
    "longestStreak": 12,
    "totalXP": 450,
    "topicsStudied": 8,
    "topicsMastered": 3,
    "averageQuizScore": 76.2,
    "badges": [],
    "goals": [],
    "followers": [],
    "following": [],
    "joinedAt": "2024-01-15T10:30:00Z",
    "lastActiveAt": "2024-01-20T14:22:00Z"
  }
}
```

### 2. Get Profile by Username
**GET** `/api/profile/:username`

**Authentication:** Not required (public profiles)

**Parameters:**
- `username` (string, required) - Username of the profile to retrieve

**Response:** Same as endpoint 1

**Error Responses:**
```json
{
  "success": false,
  "error": {
    "message": "Profile not found"
  }
}
```

### 3. Update Current User's Profile
**PUT** `/api/profile`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "bio": "string",
  "avatar": "string",
  "school": "string",
  "grade": "string",
  "major": "string",
  "learningStyle": "Visual|Auditory|Kinesthetic|Reading|Mixed",
  "preferences": {
    "theme": "light|dark",
    "notifications": true,
    "emailNotifications": true,
    "showOnLeaderboard": true
  }
}
```

**Response:** Updated profile object (same structure as endpoint 1)

### 4. Follow a User
**POST** `/api/profile/follow/:userId`

**Authentication:** Required (Bearer token)

**Parameters:**
- `userId` (string, required) - ID of user to follow

**Response:**
```json
{
  "success": true,
  "data": {
    "followerProfile": { /* profile object */ },
    "followingProfile": { /* profile object */ }
  }
}
```

### 5. Unfollow a User
**POST** `/api/profile/unfollow/:userId`

**Authentication:** Required (Bearer token)

**Parameters:**
- `userId` (string, required) - ID of user to unfollow

**Response:** Same as endpoint 4

### 6. Get Leaderboard
**GET** `/api/profile/leaderboard/top`

**Authentication:** Not required

**Query Parameters:**
- `limit` (number, optional, default: 10) - Number of top performers to return
- `sortBy` (string, optional, default: "totalXP") - Sort field (totalXP, averageAccuracy, topicsMastered, currentStreak)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "name": "string",
      "username": "string",
      "avatar": "string",
      "totalXP": 1250,
      "averageAccuracy": 85.5,
      "topicsMastered": 15,
      "currentStreak": 8
    }
  ]
}
```

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "message": "Authentication required"
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "message": "Profile not found"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "message": "Failed to [operation]: [error details]"
  }
}
```

## Usage Examples

### Get Current User's Profile
```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Another User's Profile
```bash
curl -X GET http://localhost:5000/api/profile/john_doe
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Passionate learner",
    "school": "XYZ University",
    "learningStyle": "Visual"
  }'
```

### Follow a User
```bash
curl -X POST http://localhost:5000/api/profile/follow/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Top 20 Performers by Accuracy
```bash
curl -X GET "http://localhost:5000/api/profile/leaderboard/top?limit=20&sortBy=averageAccuracy"
```

## Profile Statistics Auto-Update

The following statistics are automatically updated:

### From Quiz Completion
- `totalQuizzesTaken` - Incremented by 1
- `averageAccuracy` - Recalculated average
- `totalXP` - Increased by (accuracy / 10)
- `averageQuizScore` - Recalculated average

### From Study Sessions
- `totalStudyHours` - Accumulated from completed Pomodoro sessions

### Manual Updates
- `topicsStudied` - Updated via topic progress service
- `topicsMastered` - Updated when topic accuracy reaches 100%
- `currentStreak` - Updated based on daily activity
- `longestStreak` - Updated when current streak exceeds previous longest

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Profile visibility is controlled by `isPublic` field (default: true)
- Follower/following relationships are bidirectional
- Badges and goals are arrays that can be extended
- Learning style defaults to "Mixed" if not specified
