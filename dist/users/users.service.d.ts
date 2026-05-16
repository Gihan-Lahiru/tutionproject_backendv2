import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    create(userData: any): Promise<User[]>;
    update(id: string, updateUserDto: any): Promise<User>;
    findByRole(role: string, status?: string): Promise<User[]>;
    approve(id: string): Promise<User>;
    reject(id: string, reason?: string): Promise<User>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=users.service.d.ts.map