import { applyDecorators, UseGuards } from "@nestjs/common";
import { Roles } from "./roles.decorator";
import { AuthGuard } from "../guard/auth.guard";
import { RolesGuard } from "../guard/roles.guard";

export function Auth(roles: String[]){
    return applyDecorators(
        Roles(roles),
        UseGuards(AuthGuard, RolesGuard)
    )
}