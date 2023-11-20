class RateLimitedRequester {
  private requestsPerSecond: number;
  private requestsPerMinute: number;
  private queue: (() => Promise<any>)[] = [];
  private minuteWindowQueue: number[] = [];
  private lastRequestTime = 0;

  constructor(
    requestsPerSecond: number,
    requestsPerMinute: number,
    queue: (() => Promise<any>)[] = [],
  ) {
    this.requestsPerSecond = requestsPerSecond;
    this.requestsPerMinute = requestsPerMinute;
    this.queue = queue;
  }

  async enqueue(request: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await request());
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.queue.length === 0) return;
    const now = Date.now();

    // Clear minute window queue of requests older than a minute
    while (
      this.minuteWindowQueue.length &&
      now - this.minuteWindowQueue[0] > 60000
    ) {
      this.minuteWindowQueue.shift();
    }

    // Check rate limits
    if (
      now - this.lastRequestTime < 1000 / this.requestsPerSecond ||
      this.minuteWindowQueue.length >= this.requestsPerMinute
    ) {
      setTimeout(() => this.processQueue(), 1000 / this.requestsPerSecond);
      return;
    }

    // Execute next request
    this.lastRequestTime = now;
    this.minuteWindowQueue.push(now);
    const nextRequest = this.queue.shift();
    nextRequest?.();
  }
}

export default RateLimitedRequester;
