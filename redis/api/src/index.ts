import express from 'express'
import type { Request, Response } from 'express'
import { client, cacheGetOrDb, wrapWithInvalidation } from './cache.js'
import { MongoClient, ObjectId } from 'mongodb'

const app = express()
app.use(express.json())
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

async function start() {
  try {
    if (!client.isOpen) await client.connect()
    console.log('Connected to Redis')
  } catch (err) {
    console.warn('Proceeding without Redis; cache helpers will fallback to DB')
  }

  // MongoDB setup
  const mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://221141_db_user:Itmh0soC52v6tCHA@cluster0.smouza3.mongodb.net/university_db?appName=Cluster0'
  const mongoClient = new MongoClient(mongoUrl)
  try {
    await mongoClient.connect()
    console.log('Connected to MongoDB')
  } catch (err) {
    console.warn('Failed to connect to MongoDB, falling back to sample data', err)
  }

  // TODO: Neo4j setup - Implement connection to Neo4j for academic network
  // const neo4jDriver = neo4j.driver(uri, neo4j.auth.basic(user, password))

  // TODO: Cassandra setup - Implement connection to Cassandra for analytics
  // const cassandraClient = new cassandra.Client({ contactPoints: [...], keyspace: 'university_analytics' })

  // Helper function to get DB
  const getDb = () => mongoClient.db('university_db')

  // Students endpoints
  app.get('/api/students', async (req: Request, res: Response) => {
    try {
      // TODO: Implement MongoDB query for students
      // const students = await getDb().collection('students').find().toArray()
      res.json([]) // Placeholder
    } catch (err) {
      res.status(500).send('Internal error')
    }
  })

  app.get('/api/students/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    if (!id) return res.status(400).send('id required')
    const key = `student:${id}`
    const dbFn = async () => {
      // TODO: Implement MongoDB query for student by ID
      // Try MongoDB first
      try {
        const db = getDb()
        const students = db.collection('students')
        let query: any
        if (ObjectId.isValid(id)) {
          query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
        } else {
          query = { _id: id }
        }
        const student = await students.findOne(query)
        if (student) return student
      } catch (err) {
        console.error('Mongo lookup failed:', err)
      }
      // Fallback sample
      return {
        _id: id,
        name: 'Sample Student',
        email: 'student@university.edu',
        programId: 'CS_BSC',
        enrollmentYear: 2023,
        courses: [{ courseId: 'CS101', semester: 'Fall2024', grade: 'A' }]
      }
    }
    try {
      const data = await cacheGetOrDb(key, 300, dbFn)
      if (!data) return res.status(404).send('Not found')
      res.json(data)
    } catch (err) {
      res.status(500).send('Internal error')
    }
  })

  app.post('/api/students', async (req: Request, res: Response) => {
    const student = req.body
    // TODO: Implement MongoDB insert for student
    // TODO: Sync to Neo4j - create student node
    // TODO: Update Cassandra analytics if needed
    res.status(201).json({ _id: 'new_id', ...student })
  })

  app.put('/api/students/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const updates = req.body
    // TODO: Implement MongoDB update for student
    // TODO: Sync to Neo4j - update student node
    res.json({ _id: id, ...updates })
  })

  app.delete('/api/students/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    // TODO: Implement MongoDB delete for student
    // TODO: Sync to Neo4j - remove student node and relationships
    res.json({ deleted: true })
  })

  // Programs endpoints
  app.get('/api/programs', async (req: Request, res: Response) => {
    try {
      // TODO: Implement MongoDB query for programs
      res.json([]) // Placeholder
    } catch (err) {
      res.status(500).send('Internal error')
    }
  })

  app.get('/api/programs/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const key = `program:${id}`
    const dbFn = async () => {
      // TODO: Implement MongoDB query for program by ID
      return {
        _id: id,
        programName: 'Sample Program',
        department: 'Engineering',
        requiredCredits: 120
      }
    }
    try {
      const data = await cacheGetOrDb(key, 300, dbFn)
      if (!data) return res.status(404).send('Not found')
      res.json(data)
    } catch (err) {
      res.status(500).send('Internal error')
    }
  })

  app.post('/api/programs', async (req: Request, res: Response) => {
    const program = req.body
    // TODO: Implement MongoDB insert for program
    res.status(201).json({ _id: 'new_id', ...program })
  })

  app.put('/api/programs/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const updates = req.body
    // TODO: Implement MongoDB update for program
    res.json({ _id: id, ...updates })
  })

  app.delete('/api/programs/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    // TODO: Implement MongoDB delete for program
    res.json({ deleted: true })
  })

  // Courses endpoints
  app.get('/api/courses', async (req: Request, res: Response) => {
    try {
      // TODO: Implement MongoDB query for courses
      res.json([]) // Placeholder
    } catch (err) {
      res.status(500).send('Internal error')
    }
  })

  app.get('/api/courses/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const key = `course:${id}`
    const dbFn = async () => {
      // TODO: Implement MongoDB query for course by ID
      return {
        _id: id,
        courseName: 'Sample Course',
        creditHours: 3
      }
    }
    try {
      const data = await cacheGetOrDb(key, 300, dbFn)
      if (!data) return res.status(404).send('Not found')
      res.json(data)
    } catch (err) {
      res.status(500).send('Internal error')
    }
  })

  app.post('/api/courses', async (req: Request, res: Response) => {
    const course = req.body
    // TODO: Implement MongoDB insert for course
    // TODO: Sync to Neo4j - create course node
    res.status(201).json({ _id: 'new_id', ...course })
  })

  app.put('/api/courses/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const updates = req.body
    // TODO: Implement MongoDB update for course
    // TODO: Sync to Neo4j - update course node
    res.json({ _id: id, ...updates })
  })

  app.delete('/api/courses/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    // TODO: Implement MongoDB delete for course
    // TODO: Sync to Neo4j - remove course node and relationships
    res.json({ deleted: true })
  })

  // Enrollments endpoints
  app.get('/api/enrollments', async (req: Request, res: Response) => {
    try {
      // TODO: Implement MongoDB query for enrollments
      res.json([]) // Placeholder
    } catch (err) {
      res.status(500).send('Internal error')
    }
  })

  app.get('/api/enrollments/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const key = `enrollment:${id}`
    const dbFn = async () => {
      // TODO: Implement MongoDB query for enrollment by ID
      return {
        _id: id,
        studentId: 'STU001',
        courseId: 'CS101',
        semester: 'Fall2024',
        grade: 'A',
        enrollmentDate: new Date().toISOString()
      }
    }
    try {
      const data = await cacheGetOrDb(key, 300, dbFn)
      if (!data) return res.status(404).send('Not found')
      res.json(data)
    } catch (err) {
      res.status(500).send('Internal error')
    }
  })

  app.post('/api/enrollments', async (req: Request, res: Response) => {
    const enrollment = req.body
    // TODO: Implement MongoDB insert for enrollment
    // TODO: Sync to Neo4j - create TAKES relationship
    // TODO: Update Cassandra course_popularity
    res.status(201).json({ _id: 'new_id', ...enrollment })
  })

  app.put('/api/enrollments/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    const updates = req.body
    // TODO: Implement MongoDB update for enrollment
    // TODO: Sync to Neo4j - update relationship
    res.json({ _id: id, ...updates })
  })

  app.delete('/api/enrollments/:id', async (req: Request, res: Response) => {
    const id = req.params.id
    // TODO: Implement MongoDB delete for enrollment
    // TODO: Sync to Neo4j - remove relationship
    res.json({ deleted: true })
  })

  // Analytics endpoints (read from Cassandra)
  app.get('/api/analytics/course-popularity/:semester', async (req: Request, res: Response) => {
    const semester = req.params.semester
    // TODO: Implement Cassandra query for course popularity
    res.json([]) // Placeholder
  })

  app.get('/api/analytics/student-activity/:studentId', async (req: Request, res: Response) => {
    const studentId = req.params.studentId
    // TODO: Implement Cassandra query for student activity
    res.json({}) // Placeholder
  })

  // Graph endpoints (read from Neo4j)
  app.get('/api/graph/student-network/:studentId', async (req: Request, res: Response) => {
    const studentId = req.params.studentId
    // TODO: Implement Neo4j query for student network
    res.json({ nodes: [], relationships: [] }) // Placeholder
  })

  app.get('/api/graph/course-prerequisites/:courseId', async (req: Request, res: Response) => {
    const courseId = req.params.courseId
    // TODO: Implement Neo4j query for course prerequisites
    res.json([]) // Placeholder
  })

  // Legacy endpoint for backward compatibility
  app.get('/api/profile/:id', async (req: Request, res: Response) => {
    // Redirect to students endpoint
    res.redirect(`/api/students/${req.params.id}`)
  })

  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`))
}

start()
