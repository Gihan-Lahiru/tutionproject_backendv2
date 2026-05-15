import { Repository } from 'typeorm';
import { Class } from '../database/entities/class.entity';
import { User } from '../database/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassesService {
    private classRepository;
    private userRepository;
    constructor(classRepository: Repository<Class>, userRepository: Repository<User>);
    create(createClassDto: CreateClassDto, userId: string): Promise<Class>;
    findAll(): Promise<Class[]>;
    findById(id: string): Promise<Class>;
    update(id: string, updateClassDto: UpdateClassDto, userId: string): Promise<Class>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    getStudents(classId: string): Promise<User[]>;
    enrollStudent(classId: string, studentId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=classes.service.d.ts.map