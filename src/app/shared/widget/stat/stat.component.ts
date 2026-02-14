
import { Component, OnInit, Input } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-stat',
    templateUrl: './stat.component.html',
    styleUrls: ['./stat.component.scss'],
    imports: [ModalModule]
})
export class StatComponent implements OnInit {

  @Input() title: string;
  @Input() value: string;
  @Input() icon: string;

  constructor() { }

  ngOnInit() {
  }

}
