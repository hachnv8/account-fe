
import { Component, OnInit } from '@angular/core';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';

@Component({
    selector: 'app-boxicons',
    templateUrl: './boxicons.component.html',
    styleUrls: ['./boxicons.component.scss'],
    imports: [PagetitleComponent]
})

/**
 * Boxicons component
 */
export class BoxiconsComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  constructor() { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Icons' }, { label: 'Boxicons', active: true }];
  }
}
