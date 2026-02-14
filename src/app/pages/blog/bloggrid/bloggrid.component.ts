
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';

@Component({
    selector: 'app-bloggrid',
    templateUrl: './bloggrid.component.html',
    styleUrls: ['./bloggrid.component.scss'],
    imports: [PagetitleComponent, TabsModule, RouterModule, TooltipModule]
})
export class BloggridComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  constructor() { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Blog' }, { label: 'Blog Grid', active: true }];

  }
}
