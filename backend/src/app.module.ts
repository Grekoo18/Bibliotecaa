import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccessModule } from './access/access.module';
import { BooksModule } from './books/books.module';
import { LoansModule } from './loans/loans.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AccessModule,
    BooksModule,
    LoansModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
