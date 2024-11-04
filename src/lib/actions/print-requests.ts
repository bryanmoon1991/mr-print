'use server';

import QueueManager from '@/lib/redis/qclient'

export async function checkForDuplicate(accountId: string, newJob: any) {
  'use server';

  const existingJobs = await QueueManager.getJobs(accountId)
  return existingJobs.some((job) => JSON.stringify(job) === JSON.stringify(newJob));

}

export async function reprint(accountId: string, newJob: any) {
  'use server';
}
