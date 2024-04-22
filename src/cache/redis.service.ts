import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly cluster;

  constructor() {
    const appId = process.env.APP_ID;
    const redisSocketPath = process.env.REDDIS_SOCKET_PATH;

    this.cluster =
      appId == 'production'
        ? new Redis({
            path: redisSocketPath,
            retryStrategy: (times) => {
              // Xác định chiến lược tự động thử lại
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
          })
        : new Redis({
            host: process.env.HOST_REDIS,
            password: process.env.PASSWORD_REDIS,
            port: Number(process.env.PORT_REDIS),
          });
  }

  async set(key: string, value: string | number, secondsExpireTime?: number) {
    try {
      await this.cluster.set(key, value);
      if (secondsExpireTime && secondsExpireTime > 0) {
        await this.cluster.expire(key, secondsExpireTime);
      }
    } catch (error) {}
  }

  async get(key: string) {
    try {
      return this.cluster.get(key, (err, data) => {
        if (err) {
          console.error(err);
        } else {
          return data;
        }
      });
    } catch (error) {}
  }

  async ttlKey(key: string) {
    const ttl = await this.cluster.ttl(key);
    return ttl;
  }

  // async findKeyCluster(key: string) {
  //   let allKeys = [];
  //   const cKey = await Promise.all(this.cluster.nodes('master').map((node) => node.keys(`*${key}*`)));
  //   if (cKey) {
  //     for (const key of cKey) {
  //       allKeys = allKeys.concat(key);
  //     }
  //   }
  //   return allKeys;
  // }

  async ttl(key: string) {
    try {
      return this.cluster.ttl(key, (err, data) => {
        if (err) {
          console.error(err);
        } else {
          return data;
        }
      });
    } catch (error) {}
  }

  // async scanKey(key: string) {
  //   let keys = [];
  //   keys = await new Promise((resolve, reject) => {
  //     const stream = this.cluster.scanStream({ match: `*${key}*` });
  //     let keys = [];
  //     stream.on('data', (resultKeys) => {
  //       keys = keys.concat(resultKeys);
  //     });
  //     stream.on('end', () => {
  //       resolve(keys);
  //     });
  //     stream.on('error', (error) => {
  //       reject(error);
  //     });
  //   });

  //   return keys;
  // }

  async findKey(key: string) {
    const result = [];
    await this.cluster.keys(`*${key}*`, function (err, keys) {
      if (err) return console.log(err);

      for (let i = 0, len = keys.length; i < len; i++) {
        if (keys[i]) {
          result.push(keys[i]);
        }
      }
    });
    return result;
  }

  async delete(key: string) {
    return this.cluster.del(key);
  }

  async getdel(key: string) {
    return this.cluster.getdel(key);
  }

  async incrby(key: string, incrbyNumber: number) {
    await this.cluster.incrby(key, incrbyNumber);
  }

  async hincrby(key: string, field: string, incrbyNumber: number) {
    await this.cluster.hincrby(key, field, incrbyNumber);
  }

  async hget(key: string) {
    return await this.cluster.hgetall(key);
  }

  async hset(key: string, field: string, fieldValue: any) {
    return await this.cluster.hset(key, field, fieldValue);
  }

  async setLock(key: string, value: string, milisecondExpire: number) {
    try {
      return await this.cluster.set(key, value, 'PX', Math.round(milisecondExpire), 'NX', 'GET');
    } catch (error) {}
  }

  async exists(key: string) {
    return await this.cluster.exists(key);
  }

  sadd(key: string, valueData: any) {
    return this.cluster.sadd(key, valueData);
  }

  //Kiểm tra 1 phần tử trong set
  sismember(key: string, valueData: any) {
    return this.cluster.sismember(key, valueData);
  }

  // Lấy 1 set
  smembers(key: string) {
    return this.cluster.smembers(key);
  }

  // Xóa một phần tửu trong set
  srem(key: string, valueData: any) {
    return this.cluster.srem(key, valueData);
  }
}
