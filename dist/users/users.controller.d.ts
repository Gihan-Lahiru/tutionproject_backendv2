import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("../database/entities/user.entity").User[]>;
    getMe(req: any): Promise<import("../database/entities/user.entity").User>;
    findById(id: string): Promise<import("../database/entities/user.entity").User>;
    findByRole(role: string): Promise<import("../database/entities/user.entity").User[]>;
    update(id: string, updateUserDto: any): Promise<import("../database/entities/user.entity").User>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map