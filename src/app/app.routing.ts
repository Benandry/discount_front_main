import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
// front
import { IndexComponent } from './front/index/index.component';
import { OrderComponent } from './front/order/order.component';
import { ContactComponent } from './front/contact/contact.component';
import { SuccessComponent } from './front/success/success.component';
import { CgvComponent } from './front/cgv/cgv.component';
import { SalePointComponent } from './front/sale-point/sale-point.component';
import { AccountComponent } from './front/account/account.component';
import { LoginComponent } from './front/login/login.component';
import { OrderDetailsComponent } from './front/order-details/order-details.component';
import { RegisterComponent } from './front/register/register.component';

const routes: Routes =[
    { path: '', redirectTo: 'index', pathMatch: 'full' },
    { path: 'index',      component: IndexComponent },
    { path: 'order',      component: OrderComponent },
    { path: 'contact',      component: ContactComponent },
    { path: 'success/:key',      component: SuccessComponent },
    { path: 'cgv',      component: CgvComponent },
    { path: 'cgv',      component: CgvComponent },
    { path: 'sale-point',      component: SalePointComponent },
    { path: 'account',      component: AccountComponent },
    { path: 'login',      component: LoginComponent },
    { path: 'order-details/:key',      component: OrderDetailsComponent },
    { path: 'register',      component: RegisterComponent },
    
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes,{
      useHash: true
    })
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
