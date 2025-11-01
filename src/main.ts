import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Transfers API")
    .setDescription("API for managing money transfers with audit logging")
    .setVersion("1.0")
    .addApiKey({ type: "apiKey", in: "header", name: "x-api-key" }, "api-key")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("docs", app, document)

  await app.listen(process.env.PORT || 3000)
  console.log(`Application is running on: ${await app.getUrl()}`)
}

bootstrap()
