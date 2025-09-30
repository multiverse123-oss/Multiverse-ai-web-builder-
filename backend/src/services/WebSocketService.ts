// backend/src/services/WebSocketService.ts
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export class WebSocketService {
  private wss: WebSocketServer;
  private connections: Map<string, WebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const userId = this.getUserIdFromRequest(request);
      
      if (userId) {
        this.connections.set(userId, ws);
        console.log(`User ${userId} connected to WebSocket`);
      }

      ws.on('message', (message) => {
        this.handleMessage(userId, message.toString());
      });

      ws.on('close', () => {
        if (userId) {
          this.connections.delete(userId);
          console.log(`User ${userId} disconnected from WebSocket`);
        }
      });

      // Send welcome message
      this.sendToUser(userId, {
        type: 'connection_established',
        message: 'WebSocket connection established'
      });
    });
  }

  public sendBuildProgress(projectId: string, progress: number, status: string, logs: string[] = []) {
    const message = {
      type: 'build_progress',
      projectId,
      progress,
      status,
      logs,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all users watching this project
    this.broadcastToProject(projectId, message);
  }

  public sendBuildComplete(projectId: string, success: boolean, deploymentUrl?: string) {
    const message = {
      type: 'build_complete',
      projectId,
      success,
      deploymentUrl,
      timestamp: new Date().toISOString()
    };

    this.broadcastToProject(projectId, message);
  }

  private broadcastToProject(projectId: string, message: any) {
    const messageString = JSON.stringify(message);
    
    this.connections.forEach((ws, userId) => {
      // In a real implementation, you'd check if user has access to this project
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageString);
      }
    });
  }

  public sendToUser(userId: string, message: any) {
    const ws = this.connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(userId: string, message: string) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'subscribe_project':
          // Handle project subscription
          break;
        case 'unsubscribe_project':
          // Handle project unsubscription
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private getUserIdFromRequest(request: any): string | null {
    // Extract user ID from auth token or query parameters
    return request.headers['user-id'] || null;
  }
}
