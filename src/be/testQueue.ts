import { getRedisClient } from "@/be/redis";

export interface TestNotification {
  id: string;
  donor_name: string;
  amount: number;
  message: string;
  paid_at: string;
  isTest: boolean;
}

const TEST_QUEUE_TTL_SECONDS = 60 * 60;

function testQueueKey(userId: string) {
  return `overlay:test:${userId}`;
}

export async function addTestNotification(userId: string, notification: TestNotification) {
  const redis = await getRedisClient();
  const key = testQueueKey(userId);
  await redis.rPush(key, JSON.stringify(notification));
  await redis.expire(key, TEST_QUEUE_TTL_SECONDS);
}

export async function getTestNotifications(userId: string): Promise<TestNotification[]> {
  const redis = await getRedisClient();
  const key = testQueueKey(userId);
  const rawList = await redis.lRange(key, 0, -1);
  const notifications: TestNotification[] = [];

  for (const raw of rawList) {
    try {
      notifications.push(JSON.parse(raw) as TestNotification);
    } catch (error) {
      console.warn("[test-queue] invalid notification skipped", error);
    }
  }

  return notifications;
}

export async function removeTestNotification(userId: string, notificationId: string) {
  const redis = await getRedisClient();
  const key = testQueueKey(userId);
  
  // Fetch all items
  const rawList = await redis.lRange(key, 0, -1);
  
  // Find the one to remove and use lRem
  for (const raw of rawList) {
    try {
      const parsed = JSON.parse(raw) as TestNotification;
      if (parsed.id === notificationId) {
        await redis.lRem(key, 1, raw);
        break;
      }
    } catch (e) {
      // ignore parse errors
    }
  }
}
