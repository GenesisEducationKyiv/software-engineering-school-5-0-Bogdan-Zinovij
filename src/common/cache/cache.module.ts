import { Module, Global } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';
import { CacheService } from './cache.service';

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
