import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaintenanceComponent } from './maintenance/maintenance.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';

import { ConfirmmailComponent } from './confirmmail/confirmmail.component';

import { VerificationComponent } from './verification/verification.component';

import { SteptwoverificationComponent } from './steptwoverification/steptwoverification.component';

import { ComingsoonComponent } from './comingsoon/comingsoon.component';

const routes: Routes = [
    {
        path: 'maintenance',
        component: MaintenanceComponent
    },
    {
        path: 'coming-soon',
        component: ComingsoonComponent
    },
    {
        path: '404',
        component: Page404Component
    },
    {
        path: '500',
        component: Page500Component
    },

    {
        path: 'lock-screen-1',
        component: LockscreenComponent
    },

    {
        path: 'confirm-mail',
        component: ConfirmmailComponent
    },

    {
        path: 'email-verification',
        component: VerificationComponent
    },

    {
        path: 'two-step-verification',
        component: SteptwoverificationComponent
    },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class ExtrapagesRoutingModule { }
