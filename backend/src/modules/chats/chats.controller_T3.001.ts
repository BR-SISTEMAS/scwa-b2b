import { 
  Controller, 
  Post, 
  Get, 
  Put,
  Body, 
  Param, 
  UseGuards,
  Headers,
  HttpStatus,
  HttpCode,
  Logger
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { ChatsService_T3_001 } from './chats.service_T3.001'
import { StartConversationDto_T3_001 } from './dto/start-conversation.dto_T3.001'
import { UpdateQueueDto_T3_001 } from './dto/update-queue.dto_T3.001'

@ApiTags('chats')
@Controller('chats')
export class ChatsController_T3_001 {
  private readonly logger = new Logger(ChatsController_T3_001.name)

  constructor(private readonly chatsService: ChatsService_T3_001) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Start new conversation',
    description: 'Initiate a new chat conversation and join the queue'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Conversation started successfully',
    schema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string' },
        queuePosition: { type: 'number' },
        status: { type: 'string' },
        estimatedWaitTime: { type: 'number' }
      }
    }
  })
  async startConversation(
    @Body() dto: StartConversationDto_T3_001,
    @Headers('x-company-id') companyId: string
  ) {
    this.logger.log(`Starting conversation for company: ${companyId}`)
    
    // TODO: Validar companyId com auth guard
    if (!companyId) {
      throw new Error('Company ID is required')
    }

    return await this.chatsService.startConversation(dto, companyId)
  }

  @Get(':conversationId/queue-status')
  @ApiOperation({ 
    summary: 'Get queue status',
    description: 'Check current queue position and status for a conversation'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Queue status retrieved',
    schema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string' },
        status: { type: 'string' },
        queuePosition: { type: 'number', nullable: true },
        agentName: { type: 'string', nullable: true },
        lastMessage: { type: 'object', nullable: true },
        estimatedWaitTime: { type: 'number', nullable: true }
      }
    }
  })
  async getQueueStatus(
    @Param('conversationId') conversationId: string
  ) {
    this.logger.log(`Getting queue status for conversation: ${conversationId}`)
    return await this.chatsService.getQueueStatus(conversationId)
  }

  @Put(':conversationId/queue')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update queue position',
    description: 'Update conversation status and queue position (agent only)'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Queue position updated'
  })
  async updateQueuePosition(
    @Param('conversationId') conversationId: string,
    @Body() dto: UpdateQueueDto_T3_001
  ) {
    this.logger.log(`Updating queue for conversation: ${conversationId}`)
    
    // TODO: Validar permissões de agente
    
    return await this.chatsService.updateQueuePosition(conversationId, dto)
  }

  @Get('company/:companyId/queue')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get active queue',
    description: 'List all active conversations in queue for a company (agent view)'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Active queue retrieved',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          conversationId: { type: 'string' },
          position: { type: 'number' },
          clientName: { type: 'string' },
          startedAt: { type: 'string', format: 'date-time' },
          lastMessage: { type: 'string', nullable: true },
          status: { type: 'string' }
        }
      }
    }
  })
  async getActiveQueue(
    @Param('companyId') companyId: string
  ) {
    this.logger.log(`Getting active queue for company: ${companyId}`)
    
    // TODO: Validar permissões de agente da empresa
    
    return await this.chatsService.getActiveQueue(companyId)
  }
}
