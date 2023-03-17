import { Component, OnInit } from '@angular/core';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service'
import { ConfirmationDialogService } from '../../services/confirmation-dialog.service';

declare var google: any;

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {

	edit : boolean = false;
	order: any;
	key  : string;
	total: number = 0;
  showMap = false;
  zoom = 15;
  map: any;

  startPosition = {
    lat: 0,
    lng : 0
  };

  endPosition = {
    lat: 0,
    lng : 0
  };

  currentPosition = {
    lat: 0,
    lng : 0
  };
  
  constructor(
  	public firebasePrvd: FirebaseService,
  	public route: ActivatedRoute,
    private dialog: ConfirmationDialogService,
  	public router : Router

  ) {
  	this.route.params.subscribe((params)=>{
  		this.key = params.key
	  	this.firebasePrvd.fetchById('order',this.key).then((order:any)=>{

        if (order.livraison) {
          this.firebasePrvd.fetchById('livraison',order.livraison.key).then((livraison:any)=>{
            order.livraison.region = livraison.region;

            if(order.status == 10) {
              this.showMap = true;
              let place = livraison['place'];
              this.endPosition.lat = place['lat'];
              this.endPosition.lng = place['lng'];

              this.firebasePrvd.fetchById('delivery',this.key).then((delivery:any)=>{
                this.startPosition = delivery['startPosition'];
                this.addMarker(this.startPosition,'A');
                this.watchPosition();
              })

            }
          })
        }

  			for(let i in order.products){
  				let item = order.products[i];
  				let amount = Number(item.price) * Number(item.quantity);
      		this.total += amount;
          let productKey = item.key;
          this.firebasePrvd.fetchById('product',productKey).then((product:any)=>{
            product.key = productKey;
            order.products[i].product = product;
          })
  			}
  			this.order = order;
	  	})
  	})
  }

  ngOnInit(): void {
  }

  prec(){
  	this.router.navigate(['account']);
  }

  deleteOrder(){
  	this.dialog.confirm(
  	'SUPPRIMER',
  	'Voulez-vous supprimer cette commande ?'
  	).then((ok)=>{
  		this.firebasePrvd.delete('order',this.key);
  		this.router.navigate(['account']);
  	}).catch(()=>{

  	})
  }

  validateOrder(){
  	this.dialog.confirm(
  	'VALIDER',
  	'Voulez-vous valider cette commande ?'
  	).then((ok)=>{
  		let order = {
  			status : 0
  		};
  		let save = this.firebasePrvd.save('order',order,this.key);
  		if (save) {
  			this.order.status = 0;
  		}
  	}).catch(()=>{
  	})
  }

  editOrder(){
    this.edit = true;
  }

  SaveEditOrder(){
  	console.log(this.order);
  	let products = [];
  	for(let key in this.order.products){
  		let item = this.order.products[key];

  		if (item.quantity > 0) {
	  		let product = {
	  			key : item.product.key,
	  			price : item.price,
	  			quantity: item.quantity,
	  		};
	  		products.push(product);
  		}
  	}

  	let order = {
      amount: this.total,
      customer: this.order.customer,
      products: products,
      status: 5,
      payment: this.order.payment,
      user: this.order.user
    }

    let ok = this.firebasePrvd.save('order',order,this.key);

    this.edit = false;

  }

  calculTotal(quantity){
  	this.total = 0;
  	for(let key in this.order.products){
  		let product = this.order.products[key];
  		this.total += (product.quantity * product.price);
  	}
  }

  removeOrder(item){
    this.dialog.confirm(
      'RETIRER',
      'Voulez vous retirer du Panier?'
    ).then((confirm)=>{
      let amount = item.quantity * item.price;
      this.total -= amount;
      item.quantity = 0;
    }).catch(()=>{
    })
  }

  CancelEditOrder(){
    window.location.reload();
  }

  saveInfoLivraison(){
    this.dialog.confirm(
      'ENREGISTRER',
      'Voulez-vous Enregistrer les modifications?'
    ).then((confirm)=>{
      let customer = this.order.customer;
      if (customer.name != '') {
        this.firebasePrvd.save('order/' + this.key, customer, 'customer');
      } else{
        this.dialog.confirm(
          'CHAMPS OBLIGATOIRE',
          'Veuillez remplir les champs obligatoires!'
        ).then((confirm)=>{

        }).catch(()=>{})
      }
    }).catch(()=>{})

  }

  saveInfoPaiement(){
    this.dialog.confirm(
      'ENREGISTRER',
      'Voulez-vous Enregistrer les modifications?'
    ).then((confirm)=>{
      let payment = this.order.payment;
      if (payment.name != '') {
        this.firebasePrvd.save('order/' + this.key, payment, 'payment');
      } else{
        this.dialog.confirm(
          'CHAMPS OBLIGATOIRE',
          'Veuillez remplir les champs obligatoires!'
        ).then((confirm)=>{

        }).catch(()=>{})
      }
    }).catch(()=>{})
  }

  onMapReady(map: any) {
    this.map = map;
    this.addMarker(this.endPosition,'B');
  }

  addMarker(position,label){
    var marker = new google.maps.LatLng(position.lat, position.lng);

    
    if(label == 'A'){
      var url = './assets/img/a.png';
      let icon = {
         url: url ,
         size: {
           width: 32,
           height: 32
         }
      }

      new google.maps.Marker({
        position: marker, 
        icon : icon,
        map: this.map, 
        // label: label
      });
    }

    if(label == 'B'){
      new google.maps.Marker({
        position: marker, 
        map: this.map, 
        // label: label
      });
    }
    
    if(label == 'L'){
      var url = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';

      let icon = {
         url: url ,
         size: {
           width: 32,
           height: 32
         },
      }

      new google.maps.Marker({
        position: marker, 
        icon : icon,
        map: this.map, 
        // label: label
      });
    }


  }

  watchPosition(){
    if(this.key) {
      this.firebasePrvd.getById('delivery',this.key).subscribe((delivery:any)=>{
        this.currentPosition = delivery['currentPosition'];
        this.addMarker(this.currentPosition,'L');
      });
    }
  }

}
