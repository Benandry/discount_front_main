import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';

import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

import { IndexComponent } from './front/index/index.component';

import { FirebaseService } from './services/firebase.service';
import { LocalStorageService } from './services/local-storage.service';

import { ConfirmationDialogService } from './services/confirmation-dialog.service';

import { FIREBASE_CONFIG } from './app.firebase.config';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { OrderComponent } from './front/order/order.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ContactComponent } from './front/contact/contact.component';
import { SuccessComponent } from './front/success/success.component';
import { FilterPipe, SearchPipe } from './pipe/filter.pipe';
import { CgvComponent } from './front/cgv/cgv.component';
import { SalePointComponent } from './front/sale-point/sale-point.component';
import { AccountComponent } from './front/account/account.component';
import { LoginComponent } from './front/login/login.component';
import { OrderDetailsComponent } from './front/order-details/order-details.component';
import { AgmCoreModule } from '@agm/core';
import { RegisterComponent } from './front/register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    IndexComponent,
    ConfirmationDialogComponent,
    OrderComponent,
    ContactComponent,
    SuccessComponent,
    FilterPipe,
    SearchPipe,
    CgvComponent,
    SalePointComponent,
    AccountComponent,
    LoginComponent,
    OrderDetailsComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    FormsModule,
    RouterModule,
    AppRoutingModule,
    AngularFireDatabaseModule,
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFirestoreModule,
    // StorageServiceModule
    OwlDateTimeModule, 
    OwlNativeDateTimeModule, 
    BrowserAnimationsModule,
    AgmCoreModule.forRoot({
      apiKey:'AIzaSyDKXqBCvLBeSwdoGzRIPbABhPKBCXZnFzc',
      libraries: ["places"]
    }),
  ],
  providers: [
    FirebaseService,
    ConfirmationDialogService,
    LocalStorageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
