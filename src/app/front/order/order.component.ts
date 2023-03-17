import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service'
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service'
import { AngularFireDatabase } from '@angular/fire/database';
declare var google;
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Pipe, PipeTransform } from '@angular/core';
import { FilterPipe } from '../../pipe/filter.pipe';
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  @ViewChild("districtLocation")
  public districtLocationElementRef: ElementRef;

  order: any;
  total: number = 0;
  customer = {
  	name: '',
  	city: '',
  	district: '',
  	region: '',
  	phone: '',
    delivry_date: null
  };
  location:any;
  step : number = 1;
  payment = {
    name: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    payment_mode: '1',
    payment_phone_number : '',
    payment_card_number : ''
  };
  register = {
    name: '',
    email: '',
    password: '',
    confirm_password: ''
  };
  errorMessage : string = '';
  userConnected:any;
    value = {
    login: '',
    password: ''
  };
  searchText: string = "";
  livraisons = [];
  livraison = {
    key: '',
    price: 0
  };

  accept : any;

  duration = false;

  constructor(
    public router: Router,
    public firebasePrvd: FirebaseService,
    private ngZone: NgZone,
    public firebase: AngularFireDatabase,
    private dialog: ConfirmationDialogService,
  ) {
  }

  ngAfterViewInit(){
    // this.autocomplete();
  }

  next(step, logout ?: boolean){

    if(this.step == 6 && step == 7){
      this.autocomplete();
    }

    if (this.step == 6 && step == 8) {
      // this.with_delivery = false;
      this.livraison = {
        key: '',
        price: 0
      };
    }
    
    switch (step) {
      case 3:
        if (logout == true) {
          this.logout();
        }
        if (localStorage.getItem('customer')) {
          let customer = JSON.parse(localStorage.getItem('customer'));
          this.customer = {
            name: customer.name,
            city: customer.city,
            district: customer.district,
            region: customer.region,
            phone: customer.phone,
            delivry_date : ''
          }
        }
        break;
      case 4:
        this.errorMessage = '';
      case 5:
        this.errorMessage = '';
        this.currentUser().then((userConnected:any)=>{
          if (userConnected) {
            this.checkUserRole(userConnected.email).then((data)=>{
                this.userConnected = data[0];
            })
          }
        })
        break;
      case 6:

        if (this.customer.name != '' && this.customer.city != '' && this.customer.district != '' && this.customer.region != '' && this.customer.phone != '' && this.customer.delivry_date != '') {
          localStorage.removeItem('customer');
          localStorage.setItem('customer',JSON.stringify(this.customer));
        } else {
          step = 3;
          this.dialog.confirm(
            'ERREUR',
            'Veuillez remplir les champs requis!'
          ).then((confirm)=>{
          }).catch(()=>{})
        }

        break;
    }
    this.step = step;
  }
  
  ngOnInit(): void {

    this.firebasePrvd.fetchAll('livraison').then((livraisons:any)=>{
      for(let key in livraisons){
        let livraison = livraisons[key];
        livraison.key = key;
        this.livraisons.push(livraison);
      }
    });

  	if (localStorage.getItem('customer')) {
  		this.customer = JSON.parse(localStorage.getItem('customer'));
  	}

  	this.order = JSON.parse(localStorage.getItem('ard-order'));

  	for(let key in this.order){
      let amount = Number(this.order[key].price) * Number(this.order[key].quantity) 
      this.total += amount;

      if(this.order[key].duration) {
        this.duration = true;
      }
    }
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

  backToStore(){

  	localStorage.setItem('customer',JSON.stringify(this.customer));

    this.router.navigate(['index']);
  }

  private parseDateToStringWithFormat(date: Date): string {
    let result: string;
    let dd = date.getDate().toString();
    let mm = (date.getMonth() + 1).toString();
    let hh = date.getHours().toString();
    let min = date.getMinutes().toString();
    dd = dd.length === 2 ? dd : "0" + dd;
    mm = mm.length === 2 ? mm : "0" + mm;
    hh = hh.length === 2 ? hh : "0" + hh;
    min = min.length === 2 ? min : "0" + min;
    result = [date.getFullYear(), '-', mm, '-', dd, 'T', hh, ':', min].join('');

    return result;
  }

  saveOrder(status){

    let msg = '';

    switch (status) {
      case 0:
        msg = 'valider';
        break;
      case 5:
        msg = 'enregistrer';
        break;

    }

    if (this.accept == true) {
      if (this.payment.name != '' && this.payment.address != ''  && this.payment.phone != '' && (this.payment.whatsapp != '' ||  this.payment.email != '')) {
        this.dialog.confirm(
          'VALIDER ?',
          'Voulez-vous '+ msg +' votre commande ?'
        ).then((confirmed)=>{

          this.customer.delivry_date = this.parseDateToStringWithFormat(this.customer.delivry_date);
          let user : any;
          if (this.userConnected) {
            user = this.userConnected.key;
          } else {
            user = null;
          }

          let order = {
            amount: this.total,
            customer: this.customer,
            products: this.order,
            status: status,
            user: user,
            payment: this.payment,
            livraison: null
          }

          if (this.livraison.key && this.livraison.price) {
            order.livraison = this.livraison
          }
          var saved = this.firebasePrvd.save('order',order);
          if (saved) {

            if (status == 0) {
              for(let i in this.order){
                let key = this.order[i].key;
                this.firebasePrvd.fetchById('product',key).then((product:any)=>{
                  product.stock = product.stock - this.order[i].quantity
                  let ok = this.firebasePrvd.save('product',product,key);
                  
                  // if (ok) {
                  //   localStorage.removeItem('order');
                  //   localStorage.removeItem('customer');

                  //   this.router.navigate(['success/' + saved]);
                  // }
                })
              }
            }

            localStorage.removeItem('ard-order');
            localStorage.removeItem('customer');
            this.router.navigate(['success/' + saved]);

          }
        }).catch(()=>{

        })
      } else {
        this.dialog.confirm(
          'ERREUR',
          'Veuillez remplir les champs requis!'
        )
      }
    } else {
      this.dialog.confirm(
        'CONDITIONS DE VENTE',
        'Veuillez accepter les conditions de vente'
      ).then(()=>{

      }).catch(()=>{})
    }
            
  }

  autocomplete(){
      let autocomplete = new google.maps.places.Autocomplete(this.districtLocationElementRef.nativeElement);
      autocomplete.setComponentRestrictions({'country': ['km']});
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }

          this.customer.district = place.name;

          // this.customer.location = this.location;
        });
      });
    
  }

  closeAlert(){
    this.errorMessage = '';
  }

  createAccount(){
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

  doRegister(value){
     return new Promise<any>((resolve, reject) => {
       firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
       .then(res => {
         resolve(res);
       }, err => reject(err))
     })
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

        this.step = 3;
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

  login(){
      this.doLogin(this.value)
      .then(res => {
        setTimeout(() => {

            this.checkUserRole(this.value.login).then((data)=>{
              let userConnected = data[0];

              this.userConnected = userConnected

              if (localStorage.getItem('customer')) {
                let customer = JSON.parse(localStorage.getItem('customer'));
                this.customer = {
                  name: customer.name,
                  city: customer.city,
                  district: customer.district,
                  region: customer.region,
                  phone: customer.phone,
                  delivry_date: ''
                }
              }

              if (userConnected.type == 2) {
                localStorage.removeItem('role');
                localStorage.setItem('role',userConnected.type)
                // this.router.navigate(['people/' + userConnected.key]);
                this.step = 3;
              }

            })

        }, 5000);
      }, err => {
      setTimeout(() => {
        switch (err.code) {
          case "auth/invalid-email":
            this.errorMessage= "Adresse Email invalide"
            break;
          case "auth/user-not-found":
            this.errorMessage = 'Il n\'y a pas d\'enregistrement d\'utilisateur correspondant à cet identifiant. L\'utilisateur peut avoir été supprimé.';
            break;
          case "auth/wrong-password":
            this.errorMessage = 'Le mot de passe n\'est pas valide ou l\'utilisateur ne possède pas de mot de passe.';
            break;
        }

        console.log(err)
      }, 5000);
      })
  
  }

  doLogin(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.login, value.password)
      .then(res => {
        console.log(res)
        resolve(res);
      }
      , err => reject(err))
    })
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
      // console.log(out)
      // localStorage.removeItem('login')
      // localStorage.removeItem('role')
      // this.router.navigate(['/index'])
      this.userConnected = '';
    })
  }

  setLivraison(livraison){
    this.livraison = {
      key: livraison.key,
      price: livraison.price
    };

    this.step = 8;
  }

}
