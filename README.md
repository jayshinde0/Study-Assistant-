# Study Assistant - Complete Documentation

## 📚 Table of Contents

---

## 1️⃣ Getting Started

### Installation & Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 2️⃣ Features

### ✅ Feature 1: Upload Study Materials

#### A. PDF URL Upload
- Paste direct link to PDF
- System extracts text automatically
- Generates quiz from content

**How to Use:**
1. Go to **Content** tab
2. Click **📄 PDF URL**
3. Enter title
4. Paste PDF URL
5. Click **Upload Material**

**Supported URLs:**
- https://arxiv.org/pdf/1706.03762.pdf
- https://arxiv.org/pdf/1512.03385.pdf
- Any public PDF URL

---

#### B. Local File Upload
- Upload PDF, DOCX, DOC, or TXT files
- Automatic text extraction
- Topic identification
- Quiz generation

**How to Use:**
1. Go to **Content** tab
2. Click **📁 File Upload**
3. Enter title
4. Select file (PDF, DOCX, DOC, TXT)
5. Click **Upload Material**

**Supported Formats:**
| Format | Extension | Max Size |
|--------|-----------|----------|
| PDF | .pdf | 50MB |
| Word | .docx | 50MB |
| Word 97-2003 | .doc | 50MB |
| Text | .txt | 50MB |

---

#### C. Text Upload
- Paste text directly
- No file needed
- Instant processing

**How to Use:**
1. Go to **Content** tab
2. Click **📝 Text Upload**
3. Enter title
4. Paste text content
5. Click **Upload Material**

---

#### D. YouTube Upload
- Paste YouTube video URL
- Extract transcript
- Generate quiz from video

**How to Use:**
1. Go to **Content** tab
2. Click **🎥 YouTube URL**
3. Enter title
4. Paste YouTube URL
5. Click **Upload Material**

---

### ✅ Feature 2: Adaptive Learning & Topic Intelligence

#### What It Does
- Tracks performance per topic
- Identifies weak/medium/strong topics
- Adapts future quizzes to weak areas
- Provides personalized recommendations
- Schedules revision dates

#### How It Works

**Step 1: Topic Tracking**
- After quiz submission
- Accuracy calculated per topic
- Mastery level assigned

**Step 2: Mastery Levels**
- 🔴 **Weak** (< 50%) → Revision in 1 day
- 🟡 **Medium** (50-80%) → Revision in 3 days
- 🟢 **Strong** (> 80%) → Revision in 7 days

**Step 3: Adaptive Quiz Generation**
- Next quiz focuses on weak topics
- More questions on weak areas
- Personalized learning path

**Step 4: Recommendations**
- Suggests weak topics to practice
- Lists topics due for revision
- Tracks improvement over time

---

### ✅ Feature 3: Quiz Generation & Submission

#### Generate Quiz
1. Go to **Content** tab
2. Click **Generate Quiz** on any material
3. Wait for AI to create questions
4. Review topics covered

#### Take Quiz
1. Answer all questions
2. Submit answers
3. Get score and accuracy
4. See correct answers

#### Topic Tracking
- Accuracy tracked per topic
- Performance stored in database
- Used for adaptive learning

---

### ✅ Feature 4: Analytics & Dashboard

#### View Topic Mastery
1. Go to **Analytics** tab
2. See **Topic Mastery** section
3. View weak/medium/strong topics
4. Check revision schedule

#### Sections

**💡 Personalized Recommendation**
- What to focus on next
- Weak topics to practice
- Topics due for revision

**🔴 Weak Topics (Need Practice)**
- Topics < 50% accuracy
- Revision scheduled for 1 day
- Focus area for next quiz

**🟡 Medium Topics (Keep Practicing)**
- Topics 50-80% accuracy
- Revision scheduled for 3 days
- Continue practicing

**🟢 Strong Topics (Mastered)**
- Topics > 80% accuracy
- Revision scheduled for 7 days
- Well understood

**📅 Topics Due for Revision**
- Topics needing review
- Scheduled revision dates
- Priority topics

---

## 3️⃣ Complete Workflow

```
1. Upload Material
   ├─ PDF URL
   ├─ File Upload (PDF/DOCX/TXT)
   ├─ Text Upload
   └─ YouTube URL
   
2. Extract Content
   ├─ Extract text
   ├─ Extract topics
   └─ Store in database
   
3. Generate Quiz
   ├─ Create questions
   ├─ Assign topics
   └─ Show to user
   
4. Take Quiz
   ├─ Answer questions
   ├─ Submit answers
   └─ Get score
   
5. Track Performance
   ├─ Calculate accuracy per topic
   ├─ Assign mastery level
   └─ Schedule revision
   
6. Adaptive Learning
   ├─ Identify weak topics
   ├─ Focus next quiz on weak areas
   └─ Improve performance
   
7. View Analytics
   ├─ See topic mastery
   ├─ Get recommendations
   └─ Track progress
```

---

## 4️⃣ API Endpoints

### Content Upload
```
POST /api/content/upload
POST /api/content/upload-file
```

### Quiz
```
POST /api/quiz/generate
POST /api/quiz/:id/submit
GET /api/quiz/history
```

### Analytics
```
GET /api/analytics/performance
GET /api/analytics/recommendations
GET /api/analytics/topic-mastery
GET /api/analytics/trend
```

---

## 5️⃣ Testing

### Automated Tests

**Test Adaptive Learning:**
```bash
cd backend
node test-adaptive-learning.js
```

**Test DBMS & DSA:**
```bash
cd backend
node test-dbms-dsa-pdf.js
```

**Test File Upload:**
```bash
cd backend
node test-local-file-upload.js
```

**Test PDF Upload:**
```bash
cd backend
node test-pdf-section.js
```

---

## 6️⃣ Troubleshooting

### Upload Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "No file uploaded" | File not selected | Click upload area |
| "Invalid file type" | Wrong format | Use PDF, DOCX, DOC, TXT |
| "File size exceeds" | File too large | Compress or split file |
| "Could not extract" | Empty/corrupted file | Check file integrity |

### Quiz Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Quiz not generated" | Topics not extracted | Re-upload with better content |
| "No topics extracted" | Content too short | Upload longer document |
| "Topics unclear" | Content unclear | Use structured content |

### Analytics Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "No mastery data" | No quizzes taken | Take at least one quiz |
| "Topics not updating" | Quiz submission failed | Check quiz submission |
| "Accuracy at 0%" | Answers not matching | Check answer format |

---

## 7️⃣ Quick Reference

### Upload Methods

**PDF URL:**
```
Content → PDF URL → Paste Link → Upload
```

**File Upload:**
```
Content → File Upload → Select File → Upload
```

**Text:**
```
Content → Text Upload → Paste Text → Upload
```

**YouTube:**
```
Content → YouTube URL → Paste URL → Upload
```

### Check Progress

**View Topics:**
```
Analytics → Topic Mastery
```

**Get Recommendations:**
```
Analytics → Personalized Recommendation
```

**See Weak Topics:**
```
Analytics → Weak Topics (Need Practice)
```

---

## 8️⃣ Features Summary

✅ **Upload Materials**
- PDF URL
- Local files (PDF, DOCX, TXT)
- Text content
- YouTube videos

✅ **Automatic Processing**
- Text extraction
- Topic identification
- Quiz generation

✅ **Adaptive Learning**
- Topic performance tracking
- Mastery level assignment
- Adaptive quiz generation
- Personalized recommendations

✅ **Analytics**
- Topic mastery breakdown
- Weak/medium/strong topics
- Revision scheduling
- Progress tracking

✅ **User Interface**
- Clean, intuitive design
- Easy navigation
- Visual feedback
- Progress indicators

---

## 9️⃣ Technology Stack

### Backend
- Node.js + Express
- MongoDB
- Ollama (AI)
- pdf-parse (PDF extraction)
- mammoth (DOCX extraction)

### Frontend
- React
- Tailwind CSS
- Framer Motion
- Recharts

---

## 🔟 Support & Documentation

### Main Guides
- `PDF_AND_FILE_UPLOAD_GUIDE.md` - Upload guide
- `ADAPTIVE_LEARNING_IMPLEMENTATION.md` - Adaptive learning
- `TESTING_ADAPTIVE_LEARNING.md` - Testing guide
- `IMPLEMENTATION_COMPLETE.md` - Implementation details

### Quick References
- `PDF_FILE_UPLOAD_QUICK_REFERENCE.md` - Quick ref
- `FILE_UPLOAD_CHEATSHEET.md` - Commands
- `QUICK_REFERENCE.md` - 30-second overview

### User Guides
- `FRONTEND_FILE_UPLOAD_GUIDE.md` - Frontend guide
- `TOPIC_MASTERY_GUIDE.md` - Topic mastery
- `LOCAL_FILE_UPLOAD_QUICK_START.md` - Quick start

---

## 🎉 Getting Started

### For Users
1. Go to **Content** tab
2. Choose upload method
3. Upload material
4. Generate quiz
5. Check **Analytics**

### For Developers
1. Install: `npm install`
2. Start: `npm run dev`
3. Test: `node test-adaptive-learning.js`
4. Read: `IMPLEMENTATION_COMPLETE.md`

---

## 📞 Quick Links

| Topic | Link |
|-------|------|
| Upload Guide | `PDF_AND_FILE_UPLOAD_GUIDE.md` |
| Adaptive Learning | `ADAPTIVE_LEARNING_IMPLEMENTATION.md` |
| Testing | `TESTING_ADAPTIVE_LEARNING.md` |
| Implementation | `IMPLEMENTATION_COMPLETE.md` |
| Quick Ref | `PDF_FILE_UPLOAD_QUICK_REFERENCE.md` |

---

**Happy Learning! 🚀**
