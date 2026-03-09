import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import Table from '@editorjs/table';
import Warning from '@editorjs/warning';
import Embed from '@editorjs/embed';

@Component({
    selector: 'app-editorjs',
    standalone: true,
    template: `<div #editorContainer class="editorjs-container"></div>`,
    styles: [`
    .editorjs-container {
      background-color: #fff;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
      padding: 15px;
      min-height: 200px;
    }
  `]
})
export class EditorJsComponent implements OnInit, OnDestroy {

    @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

    @Input() data?: OutputData;
    @Input() readOnly: boolean = false;

    @Output() dataChange = new EventEmitter<OutputData>();

    private editor?: EditorJS;

    ngOnInit(): void {
        this.initEditor();
    }

    ngOnDestroy(): void {
        if (this.editor) {
            this.editor.destroy();
        }
    }

    private initEditor() {
        this.editor = new EditorJS({
            holder: this.editorContainer.nativeElement,
            data: this.data,
            readOnly: this.readOnly,
            placeholder: 'Let\'s write an awesome note!',
            tools: {
                header: {
                    class: Header as any, // type workaround
                    inlineToolbar: true,
                    config: {
                        placeholder: 'Enter a header',
                        levels: [1, 2, 3, 4],
                        defaultLevel: 2
                    }
                },
                list: {
                    class: List as any,
                    inlineToolbar: true,
                },
                checklist: {
                    class: Checklist as any,
                    inlineToolbar: true,
                },
                quote: {
                    class: Quote as any,
                    inlineToolbar: true,
                    config: {
                        quotePlaceholder: 'Enter a quote',
                        captionPlaceholder: 'Quote\'s author',
                    },
                },
                code: {
                    class: CodeTool as any,
                },
                delimiter: {
                    class: Delimiter as any,
                },
                inlineCode: {
                    class: InlineCode as any,
                },
                marker: {
                    class: Marker as any,
                },
                table: {
                    class: Table as any,
                    inlineToolbar: true,
                    config: {
                        rows: 2,
                        cols: 3,
                    },
                },
                warning: {
                    class: Warning as any,
                    inlineToolbar: true,
                    shortcut: 'CMD+SHIFT+W',
                    config: {
                        titlePlaceholder: 'Title',
                        messagePlaceholder: 'Message',
                    },
                },
                embed: {
                    class: Embed as any,
                    config: {
                        services: {
                            youtube: true,
                            coub: true
                        }
                    }
                }
            },
            onChange: () => {
                this.saveData();
            }
        });
    }

    private saveData() {
        if (this.editor) {
            this.editor.save().then((outputData) => {
                this.dataChange.emit(outputData);
            }).catch((error) => {
                console.error('Saving failed: ', error);
            });
        }
    }

}
