import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';
let token = '';

const api = axios.create({
  baseURL: BASE_URL
});

api.interceptors.request.use(config => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create sample files for testing
function createSampleFiles() {
  console.log('📝 Creating sample files...\n');

  // DBMS file
  const dbmsContent = `DATABASE MANAGEMENT SYSTEMS

1. INTRODUCTION TO DBMS
A Database Management System (DBMS) is software that manages databases. It provides an interface for users and applications to create, read, update, and delete data. Key features include data security, concurrent access, and data integrity.

2. RELATIONAL DATABASE MODEL
The relational model organizes data into tables (relations) with rows (tuples) and columns (attributes). Each table has a primary key that uniquely identifies each row. Foreign keys establish relationships between tables.

3. SQL (STRUCTURED QUERY LANGUAGE)
SQL is used to query and manipulate data in relational databases. Main commands include:
- SELECT: Retrieve data
- INSERT: Add new data
- UPDATE: Modify existing data
- DELETE: Remove data
- CREATE: Create tables
- ALTER: Modify table structure

4. NORMALIZATION
Normalization is the process of organizing data to reduce redundancy. Normal forms include:
- 1NF (First Normal Form): Eliminate repeating groups
- 2NF (Second Normal Form): Remove partial dependencies
- 3NF (Third Normal Form): Remove transitive dependencies
- BCNF (Boyce-Codd Normal Form): Stricter than 3NF

5. INDEXING
Indexes improve query performance by creating a sorted structure for quick data retrieval. Types include:
- Primary Index: On primary key
- Secondary Index: On non-key attributes
- Composite Index: On multiple columns

6. TRANSACTIONS
A transaction is a sequence of operations that must all succeed or all fail. ACID properties ensure data consistency:
- Atomicity: All or nothing
- Consistency: Valid state to valid state
- Isolation: No interference between transactions
- Durability: Permanent once committed

7. CONCURRENCY CONTROL
Manages simultaneous access to data. Techniques include:
- Locking: Prevents conflicts
- Timestamps: Orders transactions
- Optimistic Concurrency: Assumes conflicts are rare

8. QUERY OPTIMIZATION
Improves query execution efficiency through query parsing, optimization, compilation, and execution.`;

  fs.writeFileSync('sample-dbms.txt', dbmsContent);
  console.log('✅ Created: sample-dbms.txt');

  // DSA file
  const dsaContent = `DATA STRUCTURES AND ALGORITHMS

1. ARRAYS
Arrays are collections of elements stored in contiguous memory locations. They provide O(1) access time but O(n) insertion/deletion time. Multi-dimensional arrays extend this concept.

2. LINKED LISTS
Linked lists consist of nodes connected by pointers. Types include:
- Singly Linked List: Each node points to next
- Doubly Linked List: Each node points to next and previous
- Circular Linked List: Last node points to first
Operations: Insert O(1), Delete O(1), Search O(n)

3. STACKS
LIFO (Last In First Out) data structure. Operations:
- Push: Add element O(1)
- Pop: Remove element O(1)
- Peek: View top element O(1)
Applications: Expression evaluation, backtracking, function calls

4. QUEUES
FIFO (First In First Out) data structure. Types:
- Simple Queue: Standard FIFO
- Circular Queue: Efficient space usage
- Priority Queue: Elements have priorities
- Deque: Double-ended queue

5. TREES
Hierarchical data structure with root and child nodes. Types:
- Binary Tree: Each node has at most 2 children
- Binary Search Tree: Left < Parent < Right
- AVL Tree: Self-balancing BST
- Red-Black Tree: Balanced with color properties
Traversals: Inorder, Preorder, Postorder, Level-order

6. GRAPHS
Collection of vertices connected by edges. Types:
- Directed Graph: Edges have direction
- Undirected Graph: Edges have no direction
- Weighted Graph: Edges have weights
Algorithms: BFS, DFS, Dijkstra, Floyd-Warshall

7. SORTING ALGORITHMS
- Bubble Sort: O(n²) - Simple but slow
- Selection Sort: O(n²) - Finds minimum
- Insertion Sort: O(n²) - Builds sorted array
- Merge Sort: O(n log n) - Divide and conquer
- Quick Sort: O(n log n) average - Partition-based
- Heap Sort: O(n log n) - Uses heap structure

8. SEARCHING ALGORITHMS
- Linear Search: O(n) - Checks each element
- Binary Search: O(log n) - Requires sorted array
- Hash Table Search: O(1) average - Uses hashing

9. DYNAMIC PROGRAMMING
Solves problems by breaking into subproblems and storing results. Examples:
- Fibonacci: Overlapping subproblems
- Knapsack: Optimal substructure
- Longest Common Subsequence: String matching

10. GREEDY ALGORITHMS
Makes locally optimal choices hoping for global optimum. Examples:
- Activity Selection: Maximum non-overlapping activities
- Huffman Coding: Optimal prefix codes
- Dijkstra's Algorithm: Shortest path`;

  fs.writeFileSync('sample-dsa.txt', dsaContent);
  console.log('✅ Created: sample-dsa.txt\n');
}

async function testLocalFileUpload() {
  try {
    console.log('🧪 Testing Local File Upload\n');

    // Create sample files
    createSampleFiles();

    // 1. Register
    console.log('1️⃣ Registering user...');
    const email = `file-upload-${Date.now()}@example.com`;
    await api.post('/auth/register', {
      name: 'File Upload Tester',
      email,
      password: 'password123'
    });
    console.log('✅ User registered\n');

    // 2. Login
    console.log('2️⃣ Logging in...');
    const loginRes = await api.post('/auth/login', {
      email,
      password: 'password123'
    });
    token = loginRes.data.data.token;
    console.log('✅ Logged in\n');

    // 3. Upload DBMS file
    console.log('3️⃣ Uploading DBMS file...');
    const dbmsForm = new FormData();
    dbmsForm.append('file', fs.createReadStream('sample-dbms.txt'));
    dbmsForm.append('title', 'Database Management Systems - Complete Guide');

    const dbmsRes = await api.post('/content/upload-file', dbmsForm, {
      headers: dbmsForm.getHeaders()
    });
    const dbmsContentId = dbmsRes.data.data._id;
    console.log('✅ DBMS file uploaded:', dbmsContentId);
    console.log('   Topics:', dbmsRes.data.data.topics.join(', '));
    console.log('   Extracted:', dbmsRes.data.data.extractedCharacters, 'characters\n');

    // 4. Upload DSA file
    console.log('4️⃣ Uploading DSA file...');
    const dsaForm = new FormData();
    dsaForm.append('file', fs.createReadStream('sample-dsa.txt'));
    dsaForm.append('title', 'Data Structures and Algorithms - Complete Guide');

    const dsaRes = await api.post('/content/upload-file', dsaForm, {
      headers: dsaForm.getHeaders()
    });
    const dsaContentId = dsaRes.data.data._id;
    console.log('✅ DSA file uploaded:', dsaContentId);
    console.log('   Topics:', dsaRes.data.data.topics.join(', '));
    console.log('   Extracted:', dsaRes.data.data.extractedCharacters, 'characters\n');

    // 5. Generate DBMS Quiz
    console.log('5️⃣ Generating DBMS quiz...');
    const dbmsQuizRes = await api.post('/quiz/generate', {
      contentId: dbmsContentId
    });
    const dbmsQuizId = dbmsQuizRes.data.data._id;
    console.log('✅ DBMS Quiz generated:', dbmsQuizId);
    console.log('   Questions:', dbmsQuizRes.data.data.questions.length);
    console.log('   Topics:', dbmsQuizRes.data.data.questions.map(q => q.topic).join(', '), '\n');

    // 6. Generate DSA Quiz
    console.log('6️⃣ Generating DSA quiz...');
    const dsaQuizRes = await api.post('/quiz/generate', {
      contentId: dsaContentId
    });
    const dsaQuizId = dsaQuizRes.data.data._id;
    console.log('✅ DSA Quiz generated:', dsaQuizId);
    console.log('   Questions:', dsaQuizRes.data.data.questions.length);
    console.log('   Topics:', dsaQuizRes.data.data.questions.map(q => q.topic).join(', '), '\n');

    // 7. Submit DBMS Quiz
    console.log('7️⃣ Submitting DBMS quiz...');
    const dbmsAnswers = dbmsQuizRes.data.data.questions.map((_, idx) =>
      dbmsQuizRes.data.data.questions[idx].options[0]
    );
    const dbmsSubmitRes = await api.post(`/quiz/${dbmsQuizId}/submit`, { answers: dbmsAnswers });
    console.log('✅ DBMS Quiz submitted');
    console.log('   Score:', dbmsSubmitRes.data.data.score, '/', dbmsQuizRes.data.data.questions.length);
    console.log('   Accuracy:', dbmsSubmitRes.data.data.accuracy + '%\n');

    // 8. Submit DSA Quiz
    console.log('8️⃣ Submitting DSA quiz...');
    const dsaAnswers = dsaQuizRes.data.data.questions.map((_, idx) =>
      dsaQuizRes.data.data.questions[idx].options[0]
    );
    const dsaSubmitRes = await api.post(`/quiz/${dsaQuizId}/submit`, { answers: dsaAnswers });
    console.log('✅ DSA Quiz submitted');
    console.log('   Score:', dsaSubmitRes.data.data.score, '/', dsaQuizRes.data.data.questions.length);
    console.log('   Accuracy:', dsaSubmitRes.data.data.accuracy + '%\n');

    // 9. Check Topic Mastery
    console.log('9️⃣ Checking combined topic mastery...');
    const masteryRes = await api.get('/analytics/topic-mastery');
    const mastery = masteryRes.data.data;
    console.log('✅ Combined Topic Mastery:');
    console.log('   Total Topics:', mastery.totalTopics);
    console.log('   Weak Topics:', mastery.weakTopics.length);
    console.log('   Medium Topics:', mastery.mediumTopics.length);
    console.log('   Strong Topics:', mastery.strongTopics.length);
    console.log('   Revision Due:', mastery.revisionDue.length, '\n');

    // 10. Get Recommendations
    console.log('🔟 Getting recommendations...');
    const recRes = await api.get('/analytics/recommendations');
    console.log('✅ Recommendations:');
    console.log('   Recommendation:', recRes.data.data.recommendation);
    console.log('   Weak Topics:', recRes.data.data.weakTopics.join(', ') || 'None\n');

    console.log('═══════════════════════════════════════');
    console.log('✅ Local File Upload Testing Complete!');
    console.log('═══════════════════════════════════════');

    // Cleanup
    console.log('\n🗑️ Cleaning up sample files...');
    fs.unlinkSync('sample-dbms.txt');
    fs.unlinkSync('sample-dsa.txt');
    console.log('✅ Cleanup complete');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testLocalFileUpload();
