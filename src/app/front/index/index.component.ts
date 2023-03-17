import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { FirebaseService } from '../../services/firebase.service'
import { LocalStorageService } from '../../services/local-storage.service';
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service'
import { Router, Params, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  products = [];
  order: any = [];
  type = '';
  categorieFilter = '';
  familyFilter = '';
  categorieList = [];
  familyList = [];

  
  constructor(
  	public firebasePrvd: FirebaseService,
    private dialog: ConfirmationDialogService,
    public router: Router,
    public storage : LocalStorageService,

  ) {
    this.loadListCategorie();
    this.loadListProduct();
  }

  ngOnInit(): void {
    
  }

  changeCategorieFilter(key){
    this.loadListFamily(key);
    this.loadListProduct(key);
  }

  loadListProduct(categorie?:string, family?:string){
    if (localStorage.getItem('ard-order')) {
      
      let order = JSON.parse(localStorage.getItem('ard-order'));
      this.firebasePrvd.fetchAll('product').then((products:any)=>{
        this.products = [];
        for (let k in products){
          let product = products[k];
          if (product.stock > 0) {
            let exist = false;
            for(let i in order){
              let key = order[i].key;
              if (key == k) {
                product['key'] = key;
                product['quantity'] = order[i].quantity;
                if(categorie){
                  if(product['categorie'] == categorie){
                    if(family){
                      if(product['family'] == family){
                        this.products.push(product);
                      }
                    } else {
                      this.products.push(product);
                    }
                  }
                } else {
                  this.products.push(product);
                }
                this.order.push(order[i]);
                exist = true;
              }
            } if (!exist) {
              product['key'] = k;
              product['quantity'] = 0;
              if(categorie){
                if(product['categorie'] == categorie){
                  if(family){
                    if(product['family'] == family){
                      this.products.push(product);
                    }
                  } else {
                    this.products.push(product);
                  }
                }
              } else {
                this.products.push(product);
              }
            }
          }
        }
      })

    } else {
      this.firebasePrvd.fetchAll('product').then((products:any)=>{
        this.products = [];
        for(let key in products){
          let product = products[key];
          if (product.stock > 0) {
            product['key'] = key;
            product['quantity'] = 0;
            if(categorie){
              if(product['categorie'] == categorie){
                if(family){
                  if(product['family'] == family){
                    this.products.push(product);
                  }
                } else {
                  this.products.push(product);
                }
              }
            } else {
              this.products.push(product);
            }
          }
        }
      })
    }
  }

  loadListFamily(key){
    let path = 'categorie/' + key + '/family';
    this.firebasePrvd.fetchAll(path).then((families:any)=>{
      this.familyList = [];
      for (let id in families) {
        let family = families[id];
        family['key'] = id;
        this.familyList.push(family);
      }
    })
  }

  loadListCategorie(){
    this.firebasePrvd.fetchAll('categorie').then((list:any)=>{
    this.categorieList = [];
    let num = 1;

      for(let key in list){
        let categorie = list[key];
        categorie['key'] = key;
        categorie['num'] = num;
        num += 1;
        this.categorieList.push(categorie);
      }

      // console.log(this.products)
    })

  }

  addToCart(product:any)
  {
    // this.getQuantity(event);
    //Verify the valeur of quatity of the product
      if(product.quantity > 0)
      {
          if (!product.quantity) {
            this.dialog.confirm(
              'NON VALIDE',
              'Entrez une quantité valide'
            )
          } else {

            if (product.stock < product.quantity) {
              this.dialog.confirm(
                'INVALIDE',
                'Le quantité que vous avez saisi depasse le stock disponible!'
              )
            } else {
              this.dialog.confirm(
                'AJOUTER AU PANIER',
                'Voulez-vous ajouter '+ product.quantity + ' ' + product.unity + ' de ' + product.name  +' à votre Panier?'
              ).then((confirmed)=>{
                // We remove by quantity the product in the stock
                product.stock -= product.quantity;
                // alert(product.stock);
                this.pushToCart(product);
                //Add to 0 the value of quantity
                // product.quantity = 0;
              }).catch(()=>{
                for(let k in this.products){
                    if (product == this.products[k]) {
                      this.products[k].quantity = 0;
                    }
                  }
              })
            }
        }
      }else{
        
        this.dialog.confirm(
          'Quantité invalide',
          'Entrez une quantité supérieur à 0'
        )
      }

  }


  pushToCart(product){
    
      let order = {
        key: product.key,
        quantity: product.quantity,
        name: product.name,
        price: product.price,
        unity: product.unity,
        duration : product.duration,
        duration_type : product.duration_type
      };

      if (!this.order.length) {
        this.order.push(order);
      } 
      else {
        let exist = false;
        for(let i in this.order){
          if (this.order[i].key == product.key) {
            this.order[i].quantity = product.quantity;
            exist = true;
          }
        }
        if (!exist) {
          this.order.push(order);
        }
      }

      // localStorage.removeItem('ard-order');
      // console.log("test");
      // console.log(this.order);
      
      this.storage.setItem('ard-order', JSON.stringify(this.order))
  }

  myOrder(){

    if (this.order.length != 0) {
      this.storage.setItem('ard-order',JSON.stringify(this.order));
      this.router.navigate(['order']);
    } else {
      this.dialog.confirm(
        'PANIER VIDE',
        'Veuillez ajouter des produits!'
      )
    }
  }

  removeToCart(product){

    if (product.quantity > 0) {
      this.dialog.confirm(
        'RETIRER',
        'Voulez-vous retirer cette produit de votre Panier?'
      ).then((confirmed)=>{
        for(var i=0;i < this.order.length; i++){
          if (this.order[i].key == product.key) {
            this.order.splice(i,1);
          }
        }
        product.stock = product.stock + parseInt(product.quantity);
        
        product.quantity = 0;
        this.storage.setItem('ard-order',JSON.stringify(this.order))
      }).catch(()=>{})

    }


  }

  clearCart(){
    this.dialog.confirm(
      'VIDER',
      'Voulez-vous vider votre Panier?'
    ).then((confirmed)=>{
      this.order = [];

      for(let key in this.products){
        let product = this.products[key];
        product.quantity = 0;
      }

      localStorage.removeItem('ard-order');

    }).catch(()=>{})
  }

  getQuantity(product){
    let first_stock = product.stock;
    product.stock -= product.quantity;

    if(product.quantity >= first_stock ){
      
      product.stock = 10;
      this.dialog.confirm(
        'INVALIDE',
        'Le quantité que vous avez saisi depasse le stock disponible! '+ product.quantity + ' ' + product.unity +' mais le stock  est '+first_stock
      )
      
    }
    
  }

}
