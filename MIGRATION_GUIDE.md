# Express to NestJS Migration Guide

This document provides a complete reference for migrating from Express.js to NestJS architecture.

## 🔄 Mapping Reference

| Express Pattern | NestJS Equivalent | Location |
|-----------------|-------------------|----------|
| Express app setup | NestFactory.create() | `main.ts` |
| Routes | Decorators (@Get, @Post, etc.) | Controllers |
| Route handlers | Controller methods | `*.controller.ts` |
| Middleware | Middleware, Guards, Pipes | `common/` directory |
| Express middleware | NestJS Middleware | `app.module.ts` |
| Authentication middleware | Guard + Strategy | `auth/guards`, `auth/strategies` |
| Business logic | Service (@Injectable) | `*.service.ts` |
| Models/Schemas | TypeORM Entities | `database/entities/` |
| Database config | TypeOrmModule.forRoot() | `config/database.config.ts` |
| Error handling | ExceptionFilter | `common/filters/` |
| Validation | Pipes + DTOs | `dto/` directories |
| Response transformation | Interceptors | `common/interceptors/` |

## 📁 File Structure Mapping

### Express Structure → NestJS Structure

```
// Express
routes/
  ├── auth.routes.js
  ├── classes.routes.js
  └── assignments.routes.js

// Becomes NestJS
src/
  ├── auth/
  │   ├── auth.controller.ts
  │   ├── auth.service.ts
  │   ├── auth.module.ts
  │   ├── dto/
  │   │   ├── login.dto.ts
  │   │   └── register.dto.ts
  │   └── strategies/
  │       └── jwt.strategy.ts
  ├── classes/
  │   ├── classes.controller.ts
  │   ├── classes.service.ts
  │   ├── classes.module.ts
  │   └── dto/
  └── assignments/
      ├── assignments.controller.ts
      ├── assignments.service.ts
      ├── assignments.module.ts
      └── dto/
```

## 🔌 Code Pattern Conversion

### 1. Express Routes → NestJS Controller + Service

**Express Route Handler:**
```javascript
// routes/auth.js
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**NestJS Controller + Service:**
```typescript
// src/auth/auth.controller.ts
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}

// src/auth/auth.service.ts
async login(loginDto: LoginDto) {
  const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
  
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  const isValid = await bcrypt.compare(loginDto.password, user.password);
  if (!isValid) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  const token = this.jwtService.sign({ id: user.id, email: user.email });
  return { token, user };
}
```

### 2. Express Middleware → NestJS Middleware/Guards

**Express Middleware:**
```javascript
// middleware/auth.middleware.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**NestJS Guard:**
```typescript
// src/auth/guards/jwt.guard.ts
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedException('No token');
    }
    
    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

// Usage in controller
@UseGuards(AuthGuard('jwt'))
@Get('me')
getMe(@Req() req) {
  return req.user;
}
```

### 3. Express Database Models → NestJS Entities

**Express Model (Mongoose):**
```javascript
// models/User.js
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['student', 'teacher', 'admin'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
```

**NestJS Entity (TypeORM):**
```typescript
// src/database/entities/user.entity.ts
@Entity('users')
export class User {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column('text')
  name: string;

  @Column('text', { default: 'student' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 4. Express DTOs → NestJS Class-Validator DTOs

**Express Validation:**
```javascript
// Express validation in route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email' });
  }
  
  // ... rest of handler
});
```

**NestJS DTO with Validation:**
```typescript
// src/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// Applied automatically in controller
@Post('login')
@UsePipes(new ValidationPipe())
async login(@Body() loginDto: LoginDto) {
  // loginDto is already validated
  return this.authService.login(loginDto);
}
```

## 🚀 Migration Steps

### Step 1: Project Setup
```bash
npm i -g @nestjs/cli
nest new tuition-sir-nestjs
cd tuition-sir-nestjs
npm install --save @nestjs/typeorm typeorm sqlite3 mysql2
```

### Step 2: Create Database Layer
- Create TypeORM entities for each Express model
- Setup database configuration
- Create migrations (if needed)

### Step 3: Create Modules
- Create feature modules (auth, classes, assignments, etc.)
- Each module contains:
  - DTOs (dto/)
  - Service (*.service.ts)
  - Controller (*.controller.ts)
  - Module file (*.module.ts)

### Step 4: Authentication
- Setup Passport strategy
- Create JWT guard
- Create auth service
- Add to auth module

### Step 5: Common Utilities
- Create exception filters
- Create guards
- Create decorators
- Create interceptors

### Step 6: Database Integration
- Update TypeORM config
- Create entities for all data models
- Setup database synchronization

### Step 7: Testing & Validation
- Create unit tests for services
- Create e2e tests for controllers
- Validate database schema

## 📊 Routing Comparison

### Express Routes
```javascript
// routes/classes.js
router.get('/', getAllClasses);
router.post('/', createClass);
router.get('/:id', getClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);
```

### NestJS Routes
```typescript
// classes/classes.controller.ts
@Controller('api/classes')
export class ClassesController {
  @Get()
  async findAll() { }

  @Post()
  async create(@Body() dto: CreateClassDto) { }

  @Get(':id')
  async findById(@Param('id') id: string) { }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateClassDto) { }

  @Delete(':id')
  async delete(@Param('id') id: string) { }
}
```

## 🔐 Permission System

### Express Role Check
```javascript
const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

router.delete('/:id', checkRole(['teacher', 'admin']), deleteClass);
```

### NestJS Role Guard
```typescript
@Delete(':id')
@UseGuards(RolesGuard)
@RequireRoles('teacher', 'admin')
async delete(@Param('id') id: string) { }
```

## 📝 Summary of Benefits

After migration to NestJS, you'll have:

1. ✅ **Modular Architecture** - Clear separation of concerns
2. ✅ **Type Safety** - Full TypeScript support with strict typing
3. ✅ **Built-in IoC Container** - Dependency injection
4. ✅ **Decorators** - Clean, expressive syntax
5. ✅ **Testing Framework** - Jest integrated
6. ✅ **CLI** - Code generation tools
7. ✅ **Middleware/Guards/Pipes** - Layered architecture
8. ✅ **Database Agnostic** - TypeORM supports multiple databases
9. ✅ **API Documentation** - Swagger integration built-in
10. ✅ **Error Handling** - Centralized exception filters

## 🆘 Common Challenges & Solutions

### Challenge 1: Database Connection
**Express**: Direct connection, manual error handling  
**NestJS**: Module-based, centralized through TypeOrmModule

### Challenge 2: Authentication
**Express**: Manual middleware setup, token handling  
**NestJS**: Passport integration, guards, strategies

### Challenge 3: Validation
**Express**: Manual validation in routes  
**NestJS**: Automatic with class-validator and pipes

### Challenge 4: Error Handling
**Express**: Try-catch in each route  
**NestJS**: Global exception filter

### Challenge 5: Testing
**Express**: Manual setup, various frameworks  
**NestJS**: Jest built-in with testing utilities

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Passport.js Strategies](http://www.passportjs.org)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

---

**Migration Completed**: ✅ Full NestJS setup with all modules  
**Ready to**: Deploy to production with confidence!
