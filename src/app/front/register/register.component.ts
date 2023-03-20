import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseService } from 'app/services/firebase.service';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(
    public firebasePrvd: FirebaseService,
    public firebase: AngularFireDatabase,
  ) { }

  ngOnInit(): void {
  }

  userConnected:any;
  register = {
    name: '',
    email: '',
    password: '',
    confirm_password: ''
  };

  errorMessage : string = '';

  createAccount()
  {
    if (this.register.email && this.register.name && this.register.password && this.register.confirm_password) {
      if (this.register.password == this.register.confirm_password) {
        this.verifyUser(this.register.email).then((data:any)=>{
          if (data && data.length > 0) {
            this.errorMessage= "L'adresse e-mail est déjà utilisée par un autre compte"
          } else {
            let user = {
              name: this.register.name,
              email: this.register.email,
              type: 2
            }
            let saved = this.firebasePrvd.save('user',user);
            if (saved) {
                this.createCredential({
                  email: this.register.email,
                  password: this.register.password
                })
            }
          }
        })
      } else {
        this.errorMessage = 'Mot de passe non confirmé!';
      }

    } else {
      this.errorMessage = 'Tous les champs sont obligatoir!';
    }

  }


  verifyUser(email){
    var ref = this.firebase.database.ref('user').orderByChild('email').equalTo(email);
    return new Promise((resolve)=>{
      ref.on('value', function(snapshot) {
        var res = [];
        snapshot.forEach(function(data) {
          res.push(data.val());
        });
        resolve(res);
      });
    });
  }

  createCredential(value){
    this.tryRegister(value)
  }

  tryRegister(value){
    this.doRegister(value)
    .then(res => {
      this.checkUserRole(res.user.email).then((data)=>{
        this.userConnected = data[0];
        console.log(this.userConnected)
        this.errorMessage = "";
        this.register = {
          name: '',
          email: '',
          password: '',
          confirm_password: ''
        };
      })
    }, err => {
      console.log(err);

      switch (err.code) {
        case "auth/invalid-email":
          this.errorMessage= "Adresse Email invalide"
          break;
        case "auth/weak-password":
          this.errorMessage= "Le mot de passe doit contenir au moins 6 caractères"
          break;
        case "auth/email-already-in-use":
          this.errorMessage= "L'adresse e-mail est déjà utilisée par un autre compte"
          break;
      }

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

  doRegister(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
      .then(res => {
        resolve(res);
      }, err => reject(err))
    })
 }

}
