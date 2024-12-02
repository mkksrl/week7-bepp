const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app'); // Your Express app
const api = supertest(app);
const Job = require('../models/jobModel');

const jobs = [
  {
    title: 'Test 1',
    type: 'Full-time',
    description: 'Test description 1',
    company: {
      name: 'Company 1',
      contactEmail: 'company1@compan1.fi',
      contactPhone: '04073571',
    },
  },
  {
    title: 'Test 2',
    type: 'Part-time',
    description: 'Test description 2',
    company: {
      name: 'Company 2',
      contactEmail: 'company2@compan2.fi',
      contactPhone: '040735712',
    },
  },
];

describe('Job Controller', () => {
  beforeEach(async () => {
    await Job.deleteMany({});
    await Job.insertMany(jobs);
  });

  afterAll(() => {
    mongoose.connection.close();
  });

  // Test GET /api/jobs
  it('should return all jobs as JSON when GET /api/jobs is called', async () => {
    const response = await api
      .get('/api/jobs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body).toHaveLength(jobs.length);
  });

  // Test POST /api/jobs
  it('should create a new job when POST /api/jobs is called', async () => {
    const newJob = {
      title: 'Test 3',
      type: 'Remote',
      description: 'Test description 3',
      company: {
        name: 'Company 3',
        contactEmail: 'company3@company3.fi',
        contactPhone: '040735713',
      },
    };

    await api
      .post('/api/jobs')
      .send(newJob)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const jobsAfterPost = await Job.find({});
    expect(jobsAfterPost).toHaveLength(jobs.length + 1);
    const jobNames = jobsAfterPost.map((job) => job.name);
    expect(jobNames).toContain(newJob.name);
  });

  // Test GET /api/jobs/:id
  it('should return one job by ID when GET /api/jobs/:id is called', async () => {
    const job = await Job.findOne();
    await api
      .get(`/api/jobs/${job._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  it('should return 404 for a non-existing job ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await api.get(`/api/jobs/${nonExistentId}`).expect(404);
  });

  // Test PUT /api/jobs/:id
  it('should update one jobs with partial data when PUT /api/jobs/:id is called', async () => {
    const job = await Job.findOne();
    const updatedJob = {
      company: {
        name: 'Company 4',
        contactEmail: 'company4@company4.fi',
        contactPhone: '040735714',
      },
    };

    await api
      .put(`/api/jobs/${job._id}`)
      .send(updatedJob)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const updatedJobCheck = await Job.findById(job._id);
    expect(updatedJobCheck.info).toBe(updatedJob.info);
    expect(updatedJobCheck.price).toBe(updatedJob.price);
  });

  it('should return 400 for invalid job ID when PUT /api/jobs/:id', async () => {
    const invalidId = '12345';
    await api.put(`/api/jobs/${invalidId}`).send({}).expect(400);
  });

  // Test DELETE /api/jobs/:id
  it('should delete one jobs by ID when DELETE /api/jobs/:id is called', async () => {
    const job = await Job.findOne();
    await api.delete(`/api/jobs/${job._id}`).expect(204);

    const deletedJobCheck = await Job.findById(job._id);
    expect(deletedJobCheck).toBeNull();
  });

  it('should return 400 for invalid job ID when DELETE /api/jobs/:id', async () => {
    const invalidId = '12345';
    await api.delete(`/api/jobs/${invalidId}`).expect(400);
  });
});
