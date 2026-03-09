import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutputData } from '@editorjs/editorjs';
import { EditorJsComponent } from 'src/app/shared/ui/editorjs/editorjs.component';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, EditorJsComponent, PagetitleComponent],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent {

  breadCrumbItems: Array<{}>;
  editorData?: OutputData;

  constructor() {
    this.breadCrumbItems = [{ label: 'Utility' }, { label: 'Notes', active: true }];
  }

  onEditorDataChange(data: OutputData) {
    this.editorData = data;
    console.log('Editor data saved:', data);
  }

}
