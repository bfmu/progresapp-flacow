import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { ActiveUser } from 'src/common/active-user.decorator';
import { ActiveUserI } from 'src/common/active-user.interface';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
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
}
