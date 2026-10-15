const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();


const connection = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false,
  },
  maxRetriesPerRequest: null,
});

// Initialize BullMQ Queue
const emailQueue = new Queue('emailQueue', { connection });

// Initialize Background Worker
const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    const { orderId, email } = job.data;
    console.log(`[Email Worker] Processing confirmation email for Order: ${orderId} sent to ${email}`);
    // Simulate email dispatch delay or call mailer provider (e.g., SendGrid/Nodemailer)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`[Email Worker] Successfully dispatched confirmation for Order: ${orderId}`);
  },
  { connection }
);

emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed successfully.`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} has failed with ${err.message}`);
});

module.exports = { emailQueue };