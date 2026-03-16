import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotesComponent } from './notes/notes.component';
import { NotesListComponent } from './notes-list/notes-list.component';
import { NoteDictionaryComponent } from './note-dictionary/note-dictionary.component';

const routes: Routes = [
  {
    path: 'change-requests',
    component: NotesComponent
  },
  {
    path: 'list',
    component: NotesListComponent
  },
  {
    path: 'dictionary',
    component: NoteDictionaryComponent
  },
  {
    path: '',
    redirectTo: 'change-requests',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotesRoutingModule { }
