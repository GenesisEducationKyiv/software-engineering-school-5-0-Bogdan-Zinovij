import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TokenModule } from './token/token.module';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema }),
    DatabaseModule,
    SubscriptionModule,
    TokenModule,
  ],
})
export class AppModule {}
