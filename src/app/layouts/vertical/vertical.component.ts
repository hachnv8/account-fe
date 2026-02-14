import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';

import { EventService } from '../../core/services/event.service';
import { FooterComponent } from '../footer/footer.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

// import { SIDEBAR_TYPE } from "../layouts.model";

@Component({
  selector: 'app-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss'],
  imports: [RouterModule, FooterComponent, TopbarComponent, SidebarComponent]
})

/**
 * Vertical component
 */
export class VerticalComponent implements OnInit, AfterViewInit {

  isCondensed: any = false;
  sidebartype: string;

  constructor(private router: Router, private eventService: EventService) {
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        document.body.classList.remove('sidebar-enable');
      }
    });
  }

  ngOnInit() {
    document.body.setAttribute('data-layout', 'vertical');
  }

  isMobile() {
    const ua = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
  }

  ngAfterViewInit() {
  }

  /**
   * On mobile toggle button clicked
   */
  onToggleMobileMenu() {
    this.isCondensed = !this.isCondensed;
    document.body.classList.toggle('sidebar-enable');
    document.body.classList.toggle('vertical-collpsed');

    if (window.screen.width <= 768) {
      document.body.classList.remove('vertical-collpsed');
    }
  }
}
