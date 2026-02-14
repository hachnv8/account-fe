import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.scss'],
    standalone: false
})

/**
 * Categories Component
 */
export class CategoriesComponent implements OnInit {

  breadCrumbItems: Array<{}>;

  constructor() { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Jobs' }, { label: 'Job Categories', active: true }];
  }

}
