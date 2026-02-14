import { Component, OnInit } from '@angular/core';

import { revenueBarChart, statData } from './data';

import { ChartType } from './profile.model';

import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { StatComponent } from 'src/app/shared/widget/stat/stat.component';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    imports: [PagetitleComponent, NgApexchartsModule,StatComponent,NgApexchartsModule]
})

/**
 * Contacts-profile component
 */
export class ProfileComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  revenueBarChart: ChartType;
  statData:any;
  constructor() { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Contacts' }, { label: 'Profile', active: true }];

    // fetches the data
    this._fetchData();
  }

  /**
   * Fetches the data
   */
  private _fetchData() {
    this.revenueBarChart = revenueBarChart;
    this.statData = statData;
  }
}
