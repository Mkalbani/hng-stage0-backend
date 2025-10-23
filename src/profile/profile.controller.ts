import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async getProfile(@Res() res: Response) {
    try {
      const profileData = await this.profileService.getProfileWithCatFact();

      return res
        .status(HttpStatus.OK)
        .header('Content-Type', 'application/json')
        .json(profileData);
    } catch (error) {
      console.error('Error in profile endpoint:', error);

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .header('Content-Type', 'application/json')
        .json({
          status: 'error',
          message: 'Failed to fetch profile data',
        });
    }
  }
}
