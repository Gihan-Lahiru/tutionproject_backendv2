import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    private sanitizeUser;
    findAll(): Promise<{
        users: import("../database/entities/user.entity").User[];
    }>;
    findStudents(): Promise<{
        users: any[];
    }>;
    getMe(req: any): Promise<import("../database/entities/user.entity").User>;
    getProfile(req: any): Promise<{
        user: any;
    }>;
    updateProfile(req: any, updateUserDto: any): Promise<{
        user: any;
    }>;
    createStudent(createUserDto: any): Promise<{
        user: any;
    }>;
    uploadProfilePicture(req: any, file: Express.Multer.File): Promise<{
        message: string;
        profile_picture: string;
        user: any;
    }>;
    findById(id: string): Promise<any>;
    findByRole(role: string): Promise<import("../database/entities/user.entity").User[]>;
    update(id: string, updateUserDto: any): Promise<any>;
    updateStudent(id: string, updateUserDto: any): Promise<{
        user: any;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    deleteStudent(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map