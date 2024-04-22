import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseModule } from 'nestjs-firebase';
import { FirebaseService } from './utils/firebase-service';
import { UserModule } from './user/user.module';
import { RedisService } from './cache/redis.service';
import { PaginationMiddleware } from './middlewares';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards';
import { UploadModule } from './upload/upload.module';
import { SequelizeModule } from '@nestjs/sequelize';
// import { User } from './model';
import { Dialect } from 'sequelize';
import { Environment } from './constants';
import { SendMailService } from './send-mail/send-mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { GameDiceModule } from './dice/dice.module';
import { DiceDetailModule } from './dice-detail/dice.module';

console.log(__dirname);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`, `.env.${process.env.NODE_ENV}`],
      isGlobal: true,
      expandVariables: true,
    }),

    MailerModule.forRootAsync({
      // imports: [ConfigModule], // import module if not enabled globally
      useFactory: async (config: ConfigService) => ({
        // transport: config.get("MAIL_TRANSPORT"),
        // or
        transport: {
          host: process.env.MAIL_HOST,
          port: +process.env.MAIL_PORT,
          service: 'Gmail',
          secure: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
          tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"No Reply" <${process.env.MAIL_FROM}>`,
        },

        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    // Connect to Models
    SequelizeModule.forRoot({
      dialect: process.env.DATABASE_DIALECT as Dialect,
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DBNAME,
      synchronize: process.env.APP_ID == Environment.Development,
      autoLoadModels: true,
      // logging: false,
      retry: {
        max: 5, // Số lần thử lại tối đa
      },
      // Lắng nghe sự kiện khi có lỗi kết nối
      dialectOptions: {
        connectTimeout: 8000, // Thời gian chờ kết nối (30 giây)
      },
      logging: (log) => {
        console.log(log); // Để theo dõi log kết nối trong quá trình phát triển
      },
    }),
    // SequelizeModule.forFeature([User]),
    // FireBase
    FirebaseModule.forRoot({
      googleApplicationCredential: {
        clientEmail: process.env.CLIENT_EMAIL,
        privateKey: process.env.PRIVATE_KEY,
        projectId: process.env.PROJECT_ID,
      },
      storageBucket: process.env.STORAGE_BUCKET,
    }),
    UserModule,
    AuthModule,
    UploadModule,
    GameDiceModule,
    DiceDetailModule,
  ],
  providers: [
    //
    FirebaseService,
    RedisService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    SendMailService,
  ],
})
export class AppModule implements NestModule {
  // Add middleware
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaginationMiddleware).forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
