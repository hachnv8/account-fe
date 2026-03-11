import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotesRoutingModule } from './notes-routing.module';
import { NotesListComponent } from './notes-list/notes-list.component';


@NgModule({
  declarations: [
    NotesListComponent
  ],
  imports: [
    CommonModule,
    NotesRoutingModule
  ]
})
export class NotesModule { }
