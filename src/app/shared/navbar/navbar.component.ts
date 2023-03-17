import { Component, OnInit, ElementRef } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { AngularFireDatabase } from '@angular/fire/database'; 
import { LocalStorageService } from '../../services/local-storage.service';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service'

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    private toggleButton: any;
    private sidebarVisible: boolean;

    userConnected: any;

    connected : boolean = false;

    order: any = [];

    constructor(
        public location: Location, 
        private element : ElementRef,
        public firebase: AngularFireDatabase,
        public storage : LocalStorageService,
        public router: Router,
        public dialog: ConfirmationDialogService,
    ) {
        this.sidebarVisible = false;
    }

    ngOnInit() {

        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];

        this.currentUser().then((connected:any)=>{
          if (!connected) {
            this.connected = false;
          } else {
            this.checkUserRole(connected.email).then((data)=>{
              this.userConnected = data[0];
              if (this.userConnected.type == 2) {
                this.connected = true;
              }
            })
          }
        });

        window.addEventListener('click',() =>{
            // if(this.sidebarVisible === true){
            //     this.sidebarClose();
            // }
        });

        this.storage.getItem('ard-order').subscribe((value)=>{
          this.order = [];
          if(value){
            this.order = JSON.parse(value)
          }
        })
    }

    currentUser(){
      return new Promise((resolve)=>{
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            resolve(user)
          } else {
            resolve(false)
          }
        });
      });
    }

    checkUserRole(email){
      var ref = this.firebase.database.ref('user').orderByChild('email').equalTo(email);
      return new Promise((resolve)=>{
        ref.on('value', function(snapshot) {
          var res = [];
          snapshot.forEach(function(data) {
            let user = data.val();
            user['key'] = data.key
            res.push(user);
          });
          resolve(res);
        });
      });
    }
    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const html = document.getElementsByTagName('html')[0];
        // console.log(html);
        // console.log(toggleButton, 'toggle');

        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);
        html.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const html = document.getElementsByTagName('html')[0];
        // console.log(html);
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        html.classList.remove('nav-open');
    };
    sidebarToggle() {
        // const toggleButton = this.toggleButton;
        // const body = document.getElementsByTagName('body')[0];
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    };
    isHome() {
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }
        if( titlee === '/home' ) {
            return true;
        }
        else {
            return false;
        }
    }
    isDocumentation() {
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }
        if( titlee === '/documentation' ) {
            return true;
        }
        else {
            return false;
        }
    }

    myOrder(){
      if (this.order.length != 0) {
        localStorage.setItem('myOrder',JSON.stringify(this.order));
        this.router.navigate(['order']);
      } else {
        this.dialog.confirm(
          'PANIER VIDE',
          'Veuillez ajouter des produits!'
        )
      }
    }
}
