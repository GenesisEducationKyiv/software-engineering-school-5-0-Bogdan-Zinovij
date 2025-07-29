import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate as isUuid } from 'uuid';
import { Token } from '../domain/token.domain';
import { TokenRepository } from '../domain/token.repository.interface';
import { TokenErrorCode } from '../constants/token.errors';
import { LoggerPort } from '@libs/logger';

@Injectable()
export class TokenService {
  constructor(
    @Inject('TokenRepository')
    private readonly tokenRepository: TokenRepository,
    private readonly logger: LoggerPort,
  ) {}

  async create(): Promise<Token> {
    const value = uuidv4();
    const token = await this.tokenRepository.create(value);

    this.logger.debug(`Token created: ${token.value}`, 'TokenService');

    return token;
  }

  async findByValue(value: string): Promise<Token> {
    if (!isUuid(value)) {
      throw new Error(TokenErrorCode.INVALID_TOKEN);
    }

    const found = await this.tokenRepository.findByValue(value);
    if (!found) {
      throw new Error(TokenErrorCode.TOKEN_NOT_FOUND);
    }

    return found;
  }

  async findById(id: string): Promise<Token> {
    if (!isUuid(id)) {
      throw new Error(TokenErrorCode.INVALID_TOKEN);
    }

    const found = await this.tokenRepository.findById(id);
    if (!found) {
      throw new Error(TokenErrorCode.TOKEN_NOT_FOUND);
    }

    return found;
  }

  async remove(id: string): Promise<void> {
    await this.tokenRepository.remove(id);
  }
}
