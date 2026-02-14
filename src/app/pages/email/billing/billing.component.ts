
import { Component, OnInit } from '@angular/core';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';

@Component({
    selector: 'app-billing',
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss'],
    imports: [PagetitleComponent]
})
export class BillingComponent implements OnInit {

  breadCrumbItems: Array<{}>;
// set the currenr year
year: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Email Template' }, { label: 'Billing Email', active: true }];

  }
}
