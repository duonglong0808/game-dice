import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SendMessageWsService {
  constructor(private readonly httpService: HttpService) {}

  updateStatusDice(gameDiceId: number, status: number) {
    try {
      return this.httpService.axiosRef.post(`${process.env.API_WSK}/dice/status`, {
        gameDiceId,
        status,
      });
    } catch (error) {
      console.log('🛫🛫🛫 ~ file: send-message-ws.service.ts:14 ~ updateStatusDice ~ error:', error);
    }
  }

  upPointByUser(data: { userId: number; points: number; type: number }[]) {
    try {
      return this.httpService.axiosRef.post(`${process.env.API_WSK}/user/point`, {
        data,
      });
    } catch (error) {
      console.log('🛫🛫🛫 ~ file: send-message-ws.service.ts:14 ~ updateStatusDice ~ error:', error);
    }
  }
}
