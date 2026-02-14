import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { provideToastr } from 'ngx-toastr';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { rootReducer } from './store';

// Import the necessary effects
import { FilemanagerEffects } from './store/filemanager/filemanager.effects';
import { OrderEffects } from './store/orders/order.effects';
import { AuthenticationEffects } from './store/Authentication/authentication.effects';
import { CartEffects } from './store/Cart/cart.effects';
import { ProjectEffects } from './store/ProjectsData/project.effects';
import { usersEffects } from './store/UserGrid/user.effects';
import { userslistEffects } from './store/UserList/userlist.effect';
import { JoblistEffects } from './store/Job/job.effects';
import { CandidateEffects } from './store/Candidate/candidate.effects';
import { InvoiceDataEffects } from './store/Invoices/invoice.effects';
import { ChatEffects } from './store/Chat/chat.effect';
import { tasklistEffects } from './store/Tasks/tasks.effect';
import { OrdersEffects } from './store/Crypto/crypto.effects';
import { CustomerEffects } from './store/customer/customer.effects';
import { MailEffects } from './store/Email/email.effects';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageService } from './core/services/language.service';
import { provideFlatpickrDefaults } from 'angularx-flatpickr';
import { NgxEditorModule } from 'ngx-editor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader();
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: {
        prefix: 'assets/i18n/',
        suffix: '.json'
      },
    },
    provideFlatpickrDefaults(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideToastr(),
    provideCharts(withDefaultRegisterables()),
    provideStore(rootReducer),
    importProvidersFrom(
      NgxEditorModule.forRoot({
        locals: {
          // menu
          bold: 'Bold',
          italic: 'Italic',
          code: 'Code',
          blockquote: 'Blockquote',
          underline: 'Underline',
          strike: 'Strike',
          bullet_list: 'Bullet List',
          ordered_list: 'Ordered List',
          heading: 'Heading',
          h1: 'Header 3',
          h2: 'Header 2',
          h3: 'Header 3',
          h4: 'Header 4',
          h5: 'Header 5',
          h6: 'Header 6',
          align_left: 'Left Align',
          align_center: 'Center Align',
          align_right: 'Right Align',
          align_justify: 'Justify',
          text_color: 'Text Color',
          background_color: 'Background Color',

          // popups, forms, others...
          url: 'URL',
          text: 'Text',
          openInNewTab: 'Open in new tab',
          insert: 'Insert',
          altText: 'Alt Text',
          title: 'Title',
          remove: 'Remove',
          enterValidUrl: 'Please enter a valid URL',
          required: 'This is required'
        },
      }),),
    provideEffects([
      FilemanagerEffects,
      OrderEffects,
      AuthenticationEffects,
      CartEffects,
      ProjectEffects,
      usersEffects,
      userslistEffects,
      JoblistEffects,
      CandidateEffects,
      InvoiceDataEffects,
      ChatEffects,
      tasklistEffects,
      OrdersEffects,
      CustomerEffects,
      MailEffects,
      LanguageService
    ]),

    // 🔑 CORRECTLY CONFIGURE TranslateModule using the imported function
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
        defaultLanguage: 'en', // Set your default language
      })

    ),


    { provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } }
  ]
};