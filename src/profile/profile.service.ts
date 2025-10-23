import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';

interface CatFactResponse {
  fact: string;
  length: number;
}

interface ProfileResponse {
  status: string;
  user: {
    email: string;
    name: string;
    stack: string;
  };
  timestamp: string;
  fact: string;
}

@Injectable()
export class ProfileService {
  private readonly CAT_FACT_API = 'https://catfact.ninja/fact';
  private readonly REQUEST_TIMEOUT = 5000; // 5 seconds

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getProfileWithCatFact(): Promise<ProfileResponse> {
    // Fetch cat fact from external API
    const catFact = await this.fetchCatFact();

    // Get current UTC timestamp in ISO 8601 format
    const timestamp = new Date().toISOString();

    // Return profile data with required structure
    return {
      status: 'success',
      user: {
        email:
          this.configService.get<string>('USER_EMAIL') ||
          'your-email@example.com',
        name: this.configService.get<string>('USER_NAME') || 'Your Full Name',
        stack:
          this.configService.get<string>('USER_STACK') || 'NestJS/TypeScript',
      },
      timestamp,
      fact: catFact,
    };
  }

  private async fetchCatFact(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<CatFactResponse>(this.CAT_FACT_API)
          .pipe(timeout(this.REQUEST_TIMEOUT)),
      );

      return response.data.fact;
    } catch (error) {
      console.error('Failed to fetch cat fact:', error.message);

      // Fallback message if Cat Facts API fails
      throw new HttpException(
        'Failed to fetch cat fact from external API',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
