import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseService } from '../../services/firebase.service'
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Router, Params, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  orders = [];

  user : any;

  duration = false;

  constructor(
  	public firebasePrvd: FirebaseService,
    public router: Router,
    public firebase: AngularFireDatabase,
  ) {
  	this.myOrders()
  }

  ngOnInit(): void {
  }

  myOrders(){
  	this.currentUser().then((user:any)=>{

      if (user) {
    		this.checkUserRole(user.email).then((data:any)=>{
    			this.user = data[0];
    			this.getOrders(this.user.key).then((orders:any)=>{
    				console.log(orders);
    				for(let key in orders){
    					let order = orders[key];
              for(let i in order.products){
                let item = order.products[i];
                let productKey = item.key;
                this.firebasePrvd.fetchById('product',productKey).then((product:any)=>{
                  if (product) {
                    product.key = productKey;
                    order.products[i].product = product;
                    if(product.duration) {
                      this.duration = true;
                    }
                  }
                })
              }
              if (order.livraison) {
                this.firebasePrvd.fetchById('livraison',order.livraison.key).then((livraison:any)=>{
                  order.livraison.region = livraison.region
                })
              }
    					this.orders.push(order);
    				}
    			})
    		})
      } else {
        this.router.navigate(['login'])
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

  getOrders(user){
    var ref = this.firebase.database.ref('order').orderByChild('user').equalTo(user);
    return new Promise((resolve)=>{
      ref.on('value', function(snapshot) {
        var childs = [];
        snapshot.forEach(function(data) {
          let item = data.val();
          item['key'] = data.key
          childs.push(item);
        });
        resolve(childs);
      });
    });
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

  orderDetails(key){
    this.router.navigate(['order-details/' + key]);
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
      this.router.navigate(['/index'])
    })
  }

}
