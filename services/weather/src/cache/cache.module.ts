import { Module, Global } from '@nestjs/common';
import { RedisCacheService } from './infrastructure/redis-cache.service';
import { CacheService } from './domain/cache.service';

@Global()
@Module({
  providers: [
    {
      provide: CacheService,
      useClass: RedisCacheService,
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
