// routes/academicNetworkRoutes.ts
import express from 'express';
import {
  createStudentCtrl,
  getAllStudentsCtrl,
  getStudentByIdCtrl,
  updateStudentCtrl,
  deleteStudentCtrl,
  createInstructorCtrl,
  getAllInstructorsCtrl,
  getInstructorByIdCtrl,
  updateInstructorCtrl,
  deleteInstructorCtrl,
  createCourseCtrl,
  getAllCoursesCtrl,
  getCourseByIdCtrl,
  updateCourseCtrl,
  deleteCourseCtrl,
  createDepartmentCtrl,
  getAllDepartmentsCtrl,
  getDepartmentByIdCtrl,
  updateDepartmentCtrl,
  deleteDepartmentCtrl,
  addTakesCtrl,
  getTakesCtrl,
  updateTakesCtrl,
  deleteTakesCtrl,
  addTeachesCtrl,
  getTeachesCtrl,
  updateTeachesCtrl,
  deleteTeachesCtrl,
  addBelongsToCtrl,
  getBelongsToCtrl,
  deleteBelongsToCtrl,
  addMemberOfCtrl,
  getMemberOfCtrl,
  deleteMemberOfCtrl,
  addPrerequisiteOfCtrl,
  getPrerequisiteOfCtrl,
  deletePrerequisiteOfCtrl,
  addAdvisedByCtrl,
  getAdvisedByCtrl,
  deleteAdvisedByCtrl,
  getAdvisedStudentsWithPrereqsCtrl
} from '../controllers/academicNetworkController';

const router = express.Router();

// Nodes CRUD
router.post('/students', createStudentCtrl);
router.get('/students', getAllStudentsCtrl);
router.get('/students/:id', getStudentByIdCtrl);
router.put('/students/:id', updateStudentCtrl);
router.delete('/students/:id', deleteStudentCtrl);

router.post('/instructors', createInstructorCtrl);
router.get('/instructors', getAllInstructorsCtrl);
router.get('/instructors/:id', getInstructorByIdCtrl);
router.put('/instructors/:id', updateInstructorCtrl);
router.delete('/instructors/:id', deleteInstructorCtrl);

router.post('/courses', createCourseCtrl);
router.get('/courses', getAllCoursesCtrl);
router.get('/courses/:id', getCourseByIdCtrl);
router.put('/courses/:id', updateCourseCtrl);
router.delete('/courses/:id', deleteCourseCtrl);

router.post('/departments', createDepartmentCtrl);
router.get('/departments', getAllDepartmentsCtrl);
router.get('/departments/:id', getDepartmentByIdCtrl);
router.put('/departments/:id', updateDepartmentCtrl);
router.delete('/departments/:id', deleteDepartmentCtrl);

// Relationships CRUD

// TAKES
router.post('/relationships/takes', addTakesCtrl);
router.get('/relationships/takes/:studentId', getTakesCtrl);
router.put('/relationships/takes/:studentId/:courseId', updateTakesCtrl);
router.delete('/relationships/takes/:studentId/:courseId', deleteTakesCtrl);

// TEACHES
router.post('/relationships/teaches', addTeachesCtrl);
router.get('/relationships/teaches/:instructorId', getTeachesCtrl);
router.put('/relationships/teaches/:instructorId/:courseId', updateTeachesCtrl);
router.delete('/relationships/teaches/:instructorId/:courseId', deleteTeachesCtrl);

// BELONGS_TO
router.post('/relationships/belongs-to', addBelongsToCtrl);
router.get('/relationships/belongs-to/:courseId', getBelongsToCtrl);
router.delete('/relationships/belongs-to/:courseId/:departmentId', deleteBelongsToCtrl);

// MEMBER_OF
router.post('/relationships/member-of', addMemberOfCtrl);
router.get('/relationships/member-of/:instructorId', getMemberOfCtrl);
router.delete('/relationships/member-of/:instructorId/:departmentId', deleteMemberOfCtrl);

// PREREQUISITE_OF
router.post('/relationships/prerequisite-of', addPrerequisiteOfCtrl);
router.get('/relationships/prerequisite-of/:prereqCourseId', getPrerequisiteOfCtrl);
router.delete('/relationships/prerequisite-of/:prereqCourseId/:dependentCourseId', deletePrerequisiteOfCtrl);

// ADVISED_BY
router.post('/relationships/advised-by', addAdvisedByCtrl);
router.get('/relationships/advised-by/:studentId', getAdvisedByCtrl);
router.delete('/relationships/advised-by/:studentId/:instructorId', deleteAdvisedByCtrl);

// Complex Query
router.get('/complex/advised-students-by-course-prereqs/:courseId', getAdvisedStudentsWithPrereqsCtrl);

export default router;