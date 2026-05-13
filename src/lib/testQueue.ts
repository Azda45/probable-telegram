export interface TestNotification {
  id: string;
  donor_name: string;
  amount: number;
  message: string;
  paid_at: string;
  isTest: boolean;
}

// Gunakan globalThis agar state tidak hilang saat Hot Module Replacement (HMR) di mode development
const globalForTestQueue = globalThis as unknown as {
  testQueue: Map<string, TestNotification[]>;
};

export const testQueue = globalForTestQueue.testQueue || new Map<string, TestNotification[]>();

if (process.env.NODE_ENV !== "production") {
  globalForTestQueue.testQueue = testQueue;
}

export function addTestNotification(userId: string, notification: TestNotification) {
  const current = testQueue.get(userId) || [];
  current.push(notification);
  testQueue.set(userId, current);
}

export function getTestNotifications(userId: string): TestNotification[] {
  const current = testQueue.get(userId) || [];
  testQueue.set(userId, []); // Kosongkan setelah diambil
  return current;
}
