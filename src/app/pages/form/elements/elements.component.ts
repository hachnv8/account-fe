
import { Component, OnInit } from '@angular/core';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';


@Component({
    selector: 'app-elements',
    templateUrl: './elements.component.html',
    styleUrls: ['./elements.component.scss'],
    imports: [PagetitleComponent]
})

/**
 * Form-elements component
 */
export class ElementsComponent implements OnInit {

  // bread crumb items
  breadCrumbItems: Array<{}>;

  constructor() { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Forms' }, { label: 'Form Elements', active: true }];
  }
}
