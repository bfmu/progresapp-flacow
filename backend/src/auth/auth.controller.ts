import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { ActiveUser } from 'src/common/active-user.decorator';
import { ActiveUserI } from 'src/common/active-user.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthGuard } from './guard/google-auth.guard';
import { GoogleIdTokenDto } from './dto/google-id-token.dto';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    register(@Body() registerDto: RegisterDto){
        return this.authService.register(registerDto);
    }

    @Get('profile')
    @Auth(['user'])
    profile(@ActiveUser() user: ActiveUserI) {
        return {
            ...user
        }
    }

    @Post('forgot-password')
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @Post('reset-password')
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
    }

    // ─── Google Web OAuth (Passport redirect flow) ──────────────────────────────

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
        // Passport redirects to Google — no body needed
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    googleAuthCallback(@Req() req: Request, @Res() res: Response) {
        const frontendUrl =
            this.configService.get<string>('FRONTEND_BASE_URL') ?? 'http://localhost:4321';

        // If passport set an error (e.g. user denied), redirect to login with error
        if (!req.user) {
            return res.redirect(`${frontendUrl}/app/login?error=google_denied`);
        }

        void this.authService.signToken(req.user as any).then(({ accessToken }) => {
            res.redirect(`${frontendUrl}/app/auth/callback?token=${accessToken}`);
        });
    }

    // ─── Google Mobile (id_token endpoint) ──────────────────────────────────────

    @Post('google/id-token')
    async googleIdToken(@Body() dto: GoogleIdTokenDto) {
        const mobileClientId = this.configService.get<string>('GOOGLE_MOBILE_CLIENT_ID');
        if (!mobileClientId) {
            throw new HttpException(
                'Google mobile OAuth not configured',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
        return this.authService.loginWithGoogleIdToken(dto.idToken);
    }
}
