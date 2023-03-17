import { Component, OnInit } from '@angular/core';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service'
import { AngularFireDatabase } from '@angular/fire/database';
import * as firebase from 'firebase/app';
import 'firebase/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  value = {
    login: '',
    password: ''
  };

  errorMessage: string;


  constructor(
    public router: Router,
    public firebasePrvd: FirebaseService,
    public firebase: AngularFireDatabase,
  ) { }

  ngOnInit(): void {
  }

  login(){
      this.errorMessage = '';
      this.doLogin(this.value)
      .then(res => {
        setTimeout(() => {

            this.checkUserRole(this.value.login).then((data)=>{
              let userConnected = data[0];

              if (userConnected.type) {
                localStorage.removeItem('role');
                localStorage.setItem('role',userConnected.type)
                this.router.navigate(['account/']);
              } else {
                this.errorMessage = 'Opérations non valide!';
                this.logout();
              }

            })

        }, 5000);
      }, err => {
      setTimeout(() => {
        switch (err.code) {
          case "auth/user-not-found":
          this.errorMessage = 'Il n\'y a pas d\'enregistrement d\'utilisateur correspondant à cet identifiant. L\'utilisateur peut avoir été supprimé.';
          break;
          case "auth/wrong-password":
          this.errorMessage = 'Le mot de passe n\'est pas valide ou l\'utilisateur ne possède pas de mot de passe.';
          break;
        }

      }, 5000);
      })
  
  }

  doLogin(value){
    return new Promise<any>((resolve, reject) => {
      // firebase.initializeApp(FIREBASE_CONFIG)
      firebase.auth().signInWithEmailAndPassword(value.login, value.password)
      .then(res => {
        resolve(res);
      }
      , err => reject(err))
    })
  }

  checkUserRole(email){
    var ref = this.firebase.database.ref('user').orderByChild('email').equalTo(email);
    return new Promise((resolve)=>{
      ref.on('value', function(snapshot) {
        var res = [];
        snapshot.forEach(function(data) {
          let user = data.val();
          user['key'] = data.key;
          res.push(user);
        });
        resolve(res);
      });
    });
  }

  doLogout(){
    return new Promise((resolve)=>{
      firebase.auth().signOut().then(function() {
        resolve(true)
      }).catch(function(error) {
        resolve(error);
      });
    })
  }

  logout(){
    this.doLogout().then((out)=>{
      // localStorage.removeItem('login')
      // localStorage.removeItem('role')
      this.router.navigate(['/login'])
    })
  }

  closeAlert(){
    this.errorMessage = '';
  }

}
