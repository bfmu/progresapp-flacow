import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private readonly from: string;

    constructor(
        @Inject('MAIL_TRANSPORT') private readonly transport: any,
        private readonly config: ConfigService,
    ) {
        this.from = this.config.get('EMAIL_FROM') || '"FLACOW" <no-reply@flacow.com>';
    }

    async verify() {
        try {
            const host = this.config.get('SMTP_HOST');
            const port = this.config.get('SMTP_PORT');
            const secure = this.config.get('SMTP_SECURE');
            // No imprimimos credenciales
            // eslint-disable-next-line no-console
            console.log(`[Mail] Verifying transporter → host=${host} port=${port} secure=${secure}`);
            const ok = await this.transport.verify();
            // eslint-disable-next-line no-console
            console.log(`[Mail] Transporter verify:`, ok);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[Mail] Transporter verify error:', err?.message || err);
        }
    }

    async sendMail(to: string, subject: string, text: string) {
        await this.transport.sendMail({
            from: this.from,
            to,
            subject,
            text,
        });
    }

    async sendPasswordResetEmail(to: string, resetUrl: string) {
        // Intento de verify en caliente si SMTP_DEBUG=true
        if (this.config.get('SMTP_DEBUG') === 'true') {
            await this.verify();
        }
        await this.transport.sendMail({
            from: this.from,
            to,
            subject: 'Reset your password',
            html: `
                <p>Hello,</p>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>If you did not request a password reset, please ignore this email.</p>
            `
        })
    }
}