import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { Request, Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller('requests')
@UseGuards(AuthGuard('jwt'))
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async createRequest(
    @Body() data: Prisma.RequestCreateInput,
  ): Promise<Request> {
    return this.requestsService.createRequest(data);
  }

  @Get(':id')
  async getRequestById(@Param('id') id: string): Promise<Request> {
    return this.requestsService.getRequestById(id);
  }

  @Get()
  async getRequests(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('where') where?: Prisma.RequestWhereInput,
    @Query('orderBy') orderBy?: Prisma.RequestOrderByWithRelationInput,
  ): Promise<{ requests: Request[]; total: number }> {
    return this.requestsService.getRequests({ skip, take, where, orderBy });
  }

  @Put(':id')
  async updateRequest(
    @Param('id') id: string,
    @Body() data: Prisma.RequestUpdateInput,
  ): Promise<Request> {
    return this.requestsService.updateRequest(id, data);
  }

  @Delete(':id')
  async deleteRequest(@Param('id') id: string): Promise<Request> {
    return this.requestsService.deleteRequest(id);
  }
}
