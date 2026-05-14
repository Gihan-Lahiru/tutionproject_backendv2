import { Request } from 'express';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassesController {
    private classesService;
    constructor(classesService: ClassesService);
    create(createClassDto: CreateClassDto, req: Request): Promise<import("../database/entities/class.entity").Class>;
    findAll(): Promise<import("../database/entities/class.entity").Class[]>;
    findById(id: string): Promise<import("../database/entities/class.entity").Class>;
    update(id: string, updateClassDto: UpdateClassDto, req: any): Promise<import("../database/entities/class.entity").Class>;
    delete(id: string, req: any): Promise<{
        message: string;
    }>;
    getStudents(id: string): Promise<import("../database/entities/user.entity").User[]>;
    enrollStudent(id: string, req: any): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=classes.controller.d.ts.map