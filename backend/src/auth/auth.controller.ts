import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { RequestWithUser } from './interfaces/RequestWithUser.interface';

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
    @UseGuards(AuthGuard)
    profile(@Req() request: RequestWithUser ) {
        return {
            ...request['user']
        }
    }
}
