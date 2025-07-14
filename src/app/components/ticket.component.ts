import { Component } from '@angular/core';
import { TicketService, Ticket } from '../services/ticket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-ticket',
  imports: [FormsModule, CommonModule],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent {
userId = 1;
  tickets: Ticket[] = [];

  newTicket: Ticket = {
    user_id: this.userId,
    ticket_date: new Date().toISOString(),
    name: '',
    description: '',
    status: 'Open',
  };

  constructor(
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {
    this.getTickets();
  }

  getTickets() {
    this.ticketService.getTickets(this.userId).subscribe((data) => {
      this.tickets = data;
      this.cdr.detectChanges(); 
    });
  }

createTicket() {
  this.newTicket.user_id = this.userId;
  this.newTicket.ticket_date = new Date().toISOString();

  this.ticketService.createTicket(this.newTicket).subscribe((createdTicket) => {
    console.log('Created Ticket:', createdTicket);
    this.tickets.push(createdTicket);

    this.newTicket = {
      user_id: this.userId,
      ticket_date: new Date().toISOString(),
      name: '',
      description: '',
      status: 'Open',
    };
  });
}


updateTicket(ticket: Ticket) {
  const updated: Ticket = { ...ticket, status: 'Closed' };
  this.ticketService.updateTicket(ticket.id!, updated).subscribe(() => {
    const index = this.tickets.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      this.tickets[index] = updated;
    }
  });
}


 deleteTicket(ticketId: number) {
  this.ticketService.deleteTicket(ticketId).subscribe(() => {
    this.tickets = this.tickets.filter(t => t.id !== ticketId);
  });
}

}
