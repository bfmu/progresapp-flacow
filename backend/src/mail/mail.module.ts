import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    {
      provide: 'MAIL_TRANSPORT',
      useFactory: async (configService: ConfigService) => {
        const nodemailer = await import('nodemailer');
        const port = Number(configService.get('SMTP_PORT', 587));
        const explicitSecure = configService.get('SMTP_SECURE');
        const secure = explicitSecure !== undefined ? explicitSecure === 'true' : port === 465;
        const debug = configService.get('SMTP_DEBUG') === 'true';
        return nodemailer.createTransport({
          host: configService.get('SMTP_HOST'),
          port,
          secure,
          requireTLS: port === 587,
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS') || configService.get('SMTP_PASSWORD'),
          },
          tls: {
            minVersion: 'TLSv1.2',
          },
          logger: debug,
          debug,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [MailService],
})
export class MailModule {}
