import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { monthlyEarningChart } from './data';
import { ChartType } from './dashboard.model';
import { BsModalService, BsModalRef, ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { EventService } from '../../../core/services/event.service';

import { ConfigService } from '../../../core/services/config.service';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TransactionComponent } from 'src/app/shared/widget/transaction/transaction.component';
import { LoaderComponent } from 'src/app/shared/ui/loader/loader.component';
import { StatComponent } from 'src/app/shared/widget/stat/stat.component';
import { TaskService } from 'src/app/core/services/task.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  imports: [LoaderComponent, CommonModule, NgApexchartsModule, BsDropdownModule, ModalModule, TransactionComponent, StatComponent]
})
export class DefaultComponent implements OnInit {
  modalRef?: BsModalRef;
  isVisible: string;

  monthlyEarningChart: ChartType;
  transactions: any;
  statData: any;
  config: any = {
    backdrop: true,
    ignoreBackdropClick: true
  };

  isActive: string;
  totalTasks: number = 0;
  completedTasks: number = 0;

  @ViewChild('content') content;
  @ViewChild('center', { static: false }) center?: ModalDirective;
  constructor(
    private modalService: BsModalService,
    private configService: ConfigService,
    private eventService: EventService,
    private taskService: TaskService
  ) {
  }

  ngOnInit() {

    /**
     * horizontal-vertical layput set
     */
    const attribute = document.body.getAttribute('data-layout');

    this.isVisible = attribute;
    const vertical = document.getElementById('layout-vertical');
    if (vertical != null) {
      vertical.setAttribute('checked', 'true');
    }
    if (attribute == 'horizontal') {
      const horizontal = document.getElementById('layout-horizontal');
      if (horizontal != null) {
        horizontal.setAttribute('checked', 'true');
      }
    }

    /**
     * Fetches the data
     */
    this.fetchData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.center?.show()
    }, 2000);
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    this.monthlyEarningChart = monthlyEarningChart;

    this.isActive = 'year';
    this.configService.getConfig().subscribe(data => {
      this.transactions = data.transactions;
      this.statData = data.statData;
    });

    this.taskService.getAllTasks().subscribe(tasks => {
      this.totalTasks = tasks.length;
      this.completedTasks = tasks.filter(t => t.status === 'done').length;
    });
  }
  opencenterModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }


  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }
}
