import { Component, OnInit, ViewChild, ViewEncapsulation, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/core';;
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import listPlugin from '@fullcalendar/list';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { category, calendarEvents, createEventId, localeList, externalModel, externalEvents } from './data';

import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { LoaderComponent } from 'src/app/shared/ui/loader/loader.component';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import allLocales from '@fullcalendar/core/locales-all';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [PagetitleComponent, LoaderComponent, CommonModule, FullCalendarModule, ReactiveFormsModule]
})
export class CalendarComponent implements OnInit {

  modalRef?: BsModalRef;
  externalEvents!: externalModel[]
  breadCrumbItems: Array<{}>;
  @ViewChild('modalShow') modalShow: TemplateRef<any>;
  @ViewChild('editmodalShow') editmodalShow: TemplateRef<any>;
  localeList = localeList
  formEditData: UntypedFormGroup;
  submitted = false;
  category: any[];
  newEventDate: any;
  editEvent: any;
  calendarEvents: any[];
  // event form
  formData: UntypedFormGroup;

  calendarOptions: CalendarOptions = {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
    ],
    headerToolbar: {
      left: 'dayGridMonth,dayGridWeek,dayGridDay',
      center: 'title',
      right: 'prevYear,prev,next,nextYear'
    },
    initialView: "dayGridMonth",
    themeSystem: "bootstrap",
    initialEvents: calendarEvents,
    weekends: true,
    editable: true,
    locales: allLocales,
    locale: 'en',
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    dateClick: this.openModal.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false,
      hour12: true
    }
  };
  currentEvents: EventApi[] = [];
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  ngOnInit(): void {
    this.externalEvents = externalEvents

    this.breadCrumbItems = [{ label: 'Skote' }, { label: 'Calendar', active: true }];

    this.formData = this.formBuilder.group({
      title: ['', [Validators.required]],
      category: ['', [Validators.required]],
    });

    this.formEditData = this.formBuilder.group({
      editTitle: ['', [Validators.required]],
      editCategory: [],
    });
    this._fetchData();

  }


  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeDraggable()
    }, 500)
  }

  private initializeDraggable() {
    const externalEventContainerEl = document.getElementById('external-events')

    if (externalEventContainerEl) {
      new Draggable(externalEventContainerEl, {
        itemSelector: '.external-event',
        eventData: (eventEl) => ({
          id: Math.floor(Math.random() * 11000),
          title: eventEl.innerText,
          allDay: true,
          start: new Date(),
          className: eventEl.getAttribute('id'),
        }),
      })
    }
  }
  createEvent() {

    if (!this.calendarComponent) {
      console.error('Calendar component is not ready yet.');
      return;
    }

    const calendarApi = this.calendarComponent.getApi();
    const today = new Date();

    this.newEventDate = {
      date: today,
      dateStr: today.toISOString().split('T')[0],
      view: { calendar: calendarApi }
    };

    this.formData.reset();
    this.submitted = false;
    this.modalRef = this.modalService.show(this.modalShow);
  }

  /**
   * Event click modal show
   */
  handleEventClick(clickInfo: EventClickArg) {
    this.editEvent = clickInfo.event;
    var category = clickInfo.event.classNames;
    this.formEditData = this.formBuilder.group({
      editTitle: clickInfo.event.title,
      editCategory: category instanceof Array ? clickInfo.event.classNames[0] : clickInfo.event.classNames,
    });
    this.modalRef = this.modalService.show(this.editmodalShow);
  }

  /**
   * Events bind in calander
   * @param events events
   */
  handleEvents(events: EventApi[]) {
    this.currentEvents = events;

  }

  constructor(
    private modalService: BsModalService,
    private formBuilder: UntypedFormBuilder
  ) { }

  get form() {
    return this.formData.controls;
  }

  /**
   * Delete-confirm
   */
  confirm() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#34c38f',
      cancelButtonColor: '#f46a6a',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.value) {
        this.deleteEventData();
        Swal.fire('Deleted!', 'Event has been deleted.', 'success');
      }
    });
  }

  position() {
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Event has been saved',
      showConfirmButton: false,
      timer: 1000,
    });
  }

  /**
   * Event add modal
   */
  openModal(event?: any) {
    this.newEventDate = event;
    this.modalRef = this.modalService.show(this.modalShow);
  }


  /**
   * save edit event data
   */
  editEventSave() {
    const editTitle = this.formEditData.get('editTitle').value;
    const editCategory = this.formEditData.get('editCategory').value;

    const editId = this.calendarEvents.findIndex(
      (x) => x.id + '' === this.editEvent.id + ''
    );

    this.editEvent.setProp('title', editTitle);
    this.editEvent.setProp('classNames', editCategory);

    this.calendarEvents[editId] = {
      ...this.editEvent,
      title: editTitle,
      id: this.editEvent.id,
      classNames: editCategory + ' ' + 'text-white',
    };

    this.position();
    this.formEditData = this.formBuilder.group({
      editTitle: '',
      editCategory: '',
    });
    this.modalService.hide();
  }

  /**
   * Delete event
   */
  deleteEventData() {
    this.editEvent.remove();
    this.modalService.hide();
  }

  /**
   * Close event modal
   */
  closeEventModal() {
    this.formData = this.formBuilder.group({
      title: '',
      category: '',
    });
    this.modalService.hide();
  }

  /**
   * Save the event
   */
  saveEvent() {
    this.submitted = true;

    if (this.formData.invalid) return;

    if (!this.newEventDate || !this.newEventDate.view?.calendar) {
      console.error('Calendar not initialized');
      return;
    }

    const title = this.formData.get('title')?.value;
    const className = this.formData.get('category')?.value + ' text-white';

    const calendarApi = this.newEventDate.view.calendar;

    calendarApi.addEvent({
      id: createEventId(),
      title,
      start: this.newEventDate.dateStr,   // ✅ SAFE
      end: this.newEventDate.dateStr,
      classNames: [className],
      allDay: true
    });

    this.position();
    this.formData.reset();
    this.modalService.hide();
    this.submitted = false;
  }


  /**
   * Fetches the data
   */
  private _fetchData() {
    // Event category
    this.category = category;
    // Calender Event Data
    this.calendarEvents = calendarEvents;
    // form submit
    this.submitted = false;
  }

  dropList(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.listItems, event.previousIndex, event.currentIndex);
  }
  listItems = ['Event 1', 'Event 2', 'Event 3'];
  handleDrop(event: any): void {
    this.calendarEvents.push({
      title: event.item.data,
      date: event.dateStr,
    });
  }

  changeLocale(locale: string) {
    this.calendarOptions = {
      ...this.calendarOptions,
      locale: locale
    };
  }
}
