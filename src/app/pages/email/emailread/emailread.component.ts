import { Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { fetchmailData } from 'src/app/store/Email/email.action';
import { selectData } from 'src/app/store/Email/email.selector';
import { Editor, NgxEditorModule } from 'ngx-editor';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';


@Component({
  selector: 'app-emailread',
  templateUrl: './emailread.component.html',
  styleUrls: ['./emailread.component.scss'],
  imports: [NgxEditorModule, BsDropdownModule],
  schemas: [NO_ERRORS_SCHEMA]
})

/**
 * Email read Component
 */
export class EmailreadComponent implements OnInit {

  modalRef?: BsModalRef;
  emailData: any;
  public index: number;
  editor: Editor;
  html = '<p>Content of the editor.</p>';
  // bread crumb items
  breadCrumbItems: Array<{}>;
  emailId: number | null = null;
  returnedArray: any = []

  constructor(private route: ActivatedRoute, private modalService: BsModalService, public store: Store) {
      this.route.params.subscribe(params => {
        // tslint:disable-next-line: radix
        this.emailId = parseInt(params.id, 10);
        this.index = params.id;
      this.index = params.id;
    });
  }

  ngOnInit() {
    this.editor = new Editor();
    this.breadCrumbItems = [{ label: 'Email' }, { label: 'Read Email', active: true }];
    // Fetch data
    this.store.dispatch(fetchmailData());
    this.store.select(selectData).subscribe(data => {
      this.emailData = data
      this.returnedArray = data
      // this.customersData = this.returnedArray.slice(0, 8)
    })
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  open(content) {
    this.modalRef = this.modalService.show(content);
  }
}
