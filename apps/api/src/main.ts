import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

type RequestLike = {
  method: string;
  originalUrl?: string;
  url: string;
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  statusCode: number;
  on(event: "finish", listener: () => void): void;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"]
  });
  const config = app.get(ConfigService);
  const port = config.get<number>("API_PORT") ?? 4000;
  const logger = new Logger("Bootstrap");

  app.enableCors({
    origin: config.get<string>("WEB_ORIGIN") ?? "http://localhost:3000"
  });
  app.setGlobalPrefix("api");
  app.use(createRequestLogger());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  await app.listen(port);
  logger.log(`Capital OS API listening on http://localhost:${port}/api`);
}

void bootstrap();

function createRequestLogger() {
  const logger = new Logger("HTTP");

  return (request: RequestLike, response: ResponseLike, next: () => void) => {
    const startedAt = Date.now();
    const method = request.method;
    const url = request.originalUrl ?? request.url;
    const userAgent = request.headers["user-agent"];
    const ip = request.ip ?? request.headers["x-forwarded-for"] ?? "unknown";

    response.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      const message = `${method} ${url} ${response.statusCode} ${durationMs}ms ip=${String(
        ip
      )} ua="${String(userAgent ?? "-")}"`;

      if (response.statusCode >= 500) {
        logger.error(message);
        return;
      }

      if (response.statusCode >= 400) {
        logger.warn(message);
        return;
      }

      logger.log(message);
    });

    next();
  };
}
