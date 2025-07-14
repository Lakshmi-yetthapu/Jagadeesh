import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ticket {
  id?: number;
  user_id: number;
  ticket_date: string;
  name: string;
  description: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getTickets(userId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets/${userId}`);
  }

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/tickets`, ticket);
  }

  updateTicket(ticketId: number, ticket: Ticket): Observable<any> {
    return this.http.put(`${this.apiUrl}/tickets/${ticketId}`, ticket);
  }

  deleteTicket(ticketId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tickets/${ticketId}`);
  }
}
