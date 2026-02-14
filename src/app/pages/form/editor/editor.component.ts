import { Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { Editor, NgxEditorModule, Toolbar, Validators } from 'ngx-editor';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [PagetitleComponent, NgxEditorModule],
  schemas: [NO_ERRORS_SCHEMA]
})

/**
 * Form-editor component
 */
export class EditorComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  editor: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  form = new FormGroup({
    editorContent: new FormControl('', Validators.required()),
  });

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

}
