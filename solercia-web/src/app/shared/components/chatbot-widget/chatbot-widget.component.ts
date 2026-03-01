import { Component, signal, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.css'
})
export class ChatbotWidgetComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = signal(false);
  isLoading = signal(false);
  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  sessionId = signal('');

  private apiUrl = '/api/v1/chat';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.sessionId.set(this.generateSessionId());
    this.messages.set([{
      role: 'bot',
      content: '¡Hola! Soy BokiBot, el asistente virtual de Solercia. ¿En qué puedo ayudarte hoy? Puedo ayudarte a agendar citas o resolver tus preguntas.',
      timestamp: new Date()
    }]);
  }

  ngOnDestroy(): void {}

  toggleChat(): void {
    this.isOpen.update(v => !v);
  }

  async sendMessage(): Promise<void> {
    const message = this.userInput().trim();
    if (!message || this.isLoading()) return;

    this.messages.update(msgs => [...msgs, {
      role: 'user',
      content: message,
      timestamp: new Date()
    }]);

    this.userInput.set('');
    this.isLoading.set(true);
    this.scrollToBottom();

    try {
      const response = await this.callApi(message);
      this.messages.update(msgs => [...msgs, {
        role: 'bot',
        content: response,
        timestamp: new Date()
      }]);
    } catch {
      this.messages.update(msgs => [...msgs, {
        role: 'bot',
        content: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date()
      }]);
    } finally {
      this.isLoading.set(false);
      this.scrollToBottom();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private async callApi(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.post<{ message: string; data: { response: string } }>(this.apiUrl, {
        message,
        sessionId: this.sessionId(),
        source: 'web'
      }).subscribe({
        next: (res) => resolve(res.data?.response || res.message || 'Respuesta recibida'),
        error: (err) => reject(err)
      });
    });
  }

  private generateSessionId(): string {
    return `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }
}
