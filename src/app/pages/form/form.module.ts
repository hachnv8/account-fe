import { NgModule } from '@angular/core';
import { FlatpickrDirective } from 'angularx-flatpickr';

import { FormRoutingModule } from './form-routing.module';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};

@NgModule({
  declarations: [],
  imports: [
    FormRoutingModule,
    FlatpickrDirective
  ]
})
export class FormModule { }
