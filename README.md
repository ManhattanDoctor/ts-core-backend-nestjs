# @ts-core/backend-nestjs

Библиотека, основанная на NestJS, предназначенная для создания серверных приложений. Основные компоненты библиотеки включают в себя механизмы управления зависимостями, обработки ошибок, логирования, работы с сокетами и транспортными протоколами.

## Установка

```bash
npm install @ts-core/backend-nestjs
```

## Требования

- Node.js >= 18
- NestJS >= 11.x
- TypeScript >= 5.x

### Peer Dependencies

```json
{
  "@nestjs/common": "^11.1.0",
  "@nestjs/core": "^11.1.0",
  "@nestjs/platform-socket.io": "^11.1.0",
  "@nestjs/websockets": "^11.1.0",
  "@ts-core/common": "~3.0.60",
  "@ts-core/backend": "~3.0.28"
}
```

---

## Компоненты

### 1. Application Injector

Глобальный инжектор для доступа к `ModuleRef` из любой точки приложения.

```typescript
import { APPLICATION_INJECTOR } from '@ts-core/backend-nestjs';
import { ModuleRef } from '@nestjs/core';

// Установка инжектора (обычно в bootstrap)
@Module({})
export class AppModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    APPLICATION_INJECTOR(this.moduleRef);
  }
}

// Получение инжектора в любом месте
const injector = APPLICATION_INJECTOR();
const service = injector.get(MyService);
```

---

### 2. Обработка ошибок (Error Filters)

Централизованная система обработки ошибок с поддержкой цепочки фильтров.

#### AllErrorFilter

Главный фильтр, который делегирует обработку специализированным фильтрам.

```typescript
import {
  AllErrorFilter,
  HttpExceptionFilter,
  ExtendedErrorFilter,
  AxiosErrorFilter,
  ValidationExceptionFilter
} from '@ts-core/backend-nestjs/error/filter';

// В main.ts или app.module.ts
app.useGlobalFilters(
  new AllErrorFilter(
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
    new ExtendedErrorFilter(),
    new AxiosErrorFilter()
  )
);
```

#### Доступные фильтры

| Фильтр | Описание |
|--------|----------|
| `AllErrorFilter` | Корневой фильтр, делегирует обработку другим фильтрам |
| `HttpExceptionFilter` | Обрабатывает стандартные NestJS HttpException |
| `ExtendedErrorFilter` | Обрабатывает ExtendedError из @ts-core/common |
| `AxiosErrorFilter` | Обрабатывает ошибки HTTP-клиента Axios |
| `ValidationExceptionFilter` | Обрабатывает ошибки валидации |

#### Создание кастомного фильтра

```typescript
import { IExceptionFilter } from '@ts-core/backend-nestjs/error/filter';
import { ArgumentsHost } from '@nestjs/common';

export class CustomErrorFilter implements IExceptionFilter<CustomError> {

  instanceOf(item: any): item is CustomError {
    return item instanceof CustomError;
  }

  catch(exception: CustomError, host: ArgumentsHost): any {
    const response = host.switchToHttp().getResponse();
    response.status(400).json({
      code: exception.code,
      message: exception.message
    });
  }
}
```

---

### 3. Логирование (Logger)

Расширенный логгер с цветным выводом и отображением времени между логами.

```typescript
import { DefaultLogger } from '@ts-core/backend-nestjs/logger';
import { LoggerModule } from '@ts-core/backend-nestjs/logger';
import { LoggerLevel } from '@ts-core/common';

// Создание логгера
const logger = new DefaultLogger(LoggerLevel.DEBUG, 'MyService');

logger.log('Информационное сообщение');
logger.warn('Предупреждение');
logger.error('Ошибка');
logger.debug('Отладочная информация');

// Отключение отображения времени между логами
logger.isTimeDifferenceEnabled = false;
```

#### Интеграция с NestJS модулем

```typescript
import { LoggerModule } from '@ts-core/backend-nestjs/logger';

@Module({
  imports: [
    LoggerModule.forRoot({ level: LoggerLevel.DEBUG })
  ]
})
export class AppModule {}
```

---

### 4. WebSocket (Socket Server)

Абстрактный класс для создания WebSocket серверов с поддержкой верификации клиентов.

```typescript
import { SocketServer, originAnyPreflightHandler } from '@ts-core/backend-nestjs/socket';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

interface ClientData {
  userId: string;
  role: string;
}

@WebSocketGateway({
  namespace: '/events',
  handlePreflightRequest: originAnyPreflightHandler
})
export class EventsGateway extends SocketServer<ClientData> {

  @WebSocketServer()
  protected namespace: Namespace;

  // Верификация клиента при подключении
  protected async clientVerify(client: Socket): Promise<ClientData> {
    const token = client.handshake.auth.token;

    if (!token) {
      throw new Error('Unauthorized');
    }

    // Проверка токена и получение данных пользователя
    const userData = await this.authService.validateToken(token);
    return { userId: userData.id, role: userData.role };
  }

  // Обработка успешной верификации
  protected async clientVerifySucceedHandler(client: Socket, data: ClientData): Promise<void> {
    this.log(`Client ${data.userId} connected`);
    client.join(`user:${data.userId}`);
  }

  // Обработка неудачной верификации
  protected async clientVerifyFailedHandler(client: Socket, error: ExtendedError): Promise<void> {
    this.error(`Connection rejected: ${error.message}`);
    client.emit('error', { message: 'Authentication failed' });
    client.disconnect(true);
  }

  // Обработка отключения
  protected async clientDisconnectedHandler(client: Socket): Promise<void> {
    this.log(`Client disconnected`);
  }
}
```

---

### 5. Transport Module

Модуль для настройки различных транспортных протоколов.

```typescript
import { TransportModule, TransportType } from '@ts-core/backend-nestjs/transport';

@Module({
  imports: [
    // Локальный транспорт (по умолчанию)
    TransportModule.forRoot(),

    // HTTP транспорт
    TransportModule.forRoot({
      type: TransportType.HTTP,
      options: {
        baseUrl: 'http://api.example.com'
      }
    }),

    // AMQP транспорт (RabbitMQ)
    TransportModule.forRoot({
      type: TransportType.AMQP,
      options: {
        host: 'localhost',
        port: 5672,
        username: 'guest',
        password: 'guest'
      }
    })
  ]
})
export class AppModule {}
```

#### Использование Transport

```typescript
import { Transport } from '@ts-core/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyService {
  constructor(private transport: Transport) {}

  async sendCommand() {
    await this.transport.send(new MyCommand({ data: 'value' }));
  }
}
```

---

### 6. Guards

#### SomeOfGuard

Guard, который проверяет, что хотя бы один из указанных guards разрешает доступ.

```typescript
import { SomeOfGuard } from '@ts-core/backend-nestjs/guard';
import { SetMetadata, UseGuards } from '@nestjs/common';

// Декоратор для указания списка guards
const SomeOf = (...guards: any[]) => SetMetadata(SomeOfGuard, guards);

@Controller('resource')
@UseGuards(SomeOfGuard)
export class ResourceController {

  @Get()
  @SomeOf(AdminGuard, OwnerGuard)  // Доступ если AdminGuard ИЛИ OwnerGuard
  findAll() {
    return this.resourceService.findAll();
  }
}
```

---

### 7. Controllers

#### DefaultController

Базовый абстрактный контроллер с общей функциональностью.

```typescript
import { DefaultController } from '@ts-core/backend-nestjs/controller';

@Controller('users')
export class UserController extends DefaultController<UserDto, User> {

  constructor(private userService: UserService) {
    super();
  }

  @Post()
  async create(@Body() dto: UserDto): Promise<User> {
    return this.userService.create(dto);
  }
}
```

---

### 8. HTTP Utilities

#### ConvertRequestMethod

Конвертация HTTP методов между Axios и NestJS форматами.

```typescript
import { ConvertRequestMethod } from '@ts-core/backend-nestjs/transport/http';
import { RequestMethod } from '@nestjs/common';

const nestMethod: RequestMethod = ConvertRequestMethod('get');  // RequestMethod.GET
const nestMethod2: RequestMethod = ConvertRequestMethod('POST'); // RequestMethod.POST
```

#### GetRequestDataMethod

Утилита для извлечения данных из HTTP запросов.

```typescript
import { GetRequestDataMethod } from '@ts-core/backend-nestjs/transport/http';
```

---

## Структура проекта

```
src/
├── index.ts                    # Главный экспорт
├── ApplicationInjector.ts      # Глобальный DI инжектор
├── controller/
│   ├── index.ts
│   └── DefaultController.ts    # Базовый контроллер
├── error/
│   └── filter/
│       ├── index.ts
│       ├── IExceptionFilter.ts      # Интерфейс фильтра
│       ├── AllErrorFilter.ts        # Корневой фильтр
│       ├── HttpExceptionFilter.ts   # HTTP ошибки
│       ├── ExtendedErrorFilter.ts   # ExtendedError
│       ├── AxiosErrorFilter.ts      # Axios ошибки
│       └── ValidationExceptionFilter.ts
├── guard/
│   ├── index.ts
│   └── SomeOfGuard.ts          # OR-логика для guards
├── logger/
│   ├── index.ts
│   ├── LoggerModule.ts         # NestJS модуль
│   └── DefaultLogger.ts        # Реализация логгера
├── socket/
│   ├── index.ts
│   └── SocketServer.ts         # WebSocket сервер
└── transport/
    ├── index.ts
    ├── TransportModule.ts      # Модуль транспорта
    └── http/
        ├── index.ts
        ├── ConvertRequestMethod.ts
        └── GetRequestDataMethod.ts
```

---

## Полный пример приложения

```typescript
import { NestFactory } from '@nestjs/core';
import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { LoggerLevel } from '@ts-core/common';

import {
  APPLICATION_INJECTOR,
  TransportModule,
  TransportType,
  LoggerModule,
  AllErrorFilter,
  HttpExceptionFilter,
  ExtendedErrorFilter,
  DefaultLogger
} from '@ts-core/backend-nestjs';

@Module({
  imports: [
    LoggerModule.forRoot({ level: LoggerLevel.DEBUG }),
    TransportModule.forRoot({ type: TransportType.LOCAL })
  ]
})
export class AppModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    APPLICATION_INJECTOR(this.moduleRef);
  }
}

async function bootstrap() {
  const logger = new DefaultLogger(LoggerLevel.DEBUG, 'Bootstrap');

  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalFilters(
    new AllErrorFilter(
      new HttpExceptionFilter(),
      new ExtendedErrorFilter()
    )
  );

  await app.listen(3000);
  logger.log('Application started on port 3000');
}

bootstrap();
```

---

## Связанные пакеты

| Пакет | Описание |
|-------|----------|
| [@ts-core/common](https://github.com/ManhattanDoctor/ts-core-common) | Базовые утилиты и классы |
| [@ts-core/backend](https://github.com/ManhattanDoctor/ts-core-backend) | Серверные компоненты |

---

## Лицензия

ISC

## Автор

Renat Gubaev <renat.gubaev@gmail.com>

## Ссылки

- [GitHub](https://github.com/ManhattanDoctor/ts-core-backend-nestjs)
- [Issues](https://github.com/ManhattanDoctor/ts-core-backend-nestjs/issues)
