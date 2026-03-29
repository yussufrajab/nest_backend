import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: 60 * 1000, // 1 minute default TTL
        max: 100, // Maximum number of items in cache
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
