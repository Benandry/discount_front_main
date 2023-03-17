import { Component, OnInit } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { Router, Params, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service'

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {

  base64Logo: any;
  key: string;
  order:any;
  constructor(
    public firebasePrvd: FirebaseService,
  	public route: ActivatedRoute
  ) {
  	this.route.params.subscribe((params)=>{
  		// this.key = params.key

  		this.firebasePrvd.fetchById('order',params.key).then((order)=>{
  			this.order = order;
  			this.key = params.key
  		})
  		
  	});
  }

  ngOnInit(): void {
  	// this.generatePdf();
  	let url = './assets/img/ar1.jpg'

  	this.getBase64ImageFromURL(url).then((base)=>{
  		this.base64Logo = base;
  	})
  	
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
    });
  }

  generatePdf(){
	  const documentDefinition = {
	  	content: [
	  		{
	  			image: this.base64Logo,
	  			width: 200,
      		alignment : 'center',
	  			margin: [0,0,0,10]
	  		},
	  		{
	  			text: 'FICHE DE COMMANDE',
	  			fontSize: 12,
	  			alignment: 'center',
	  			margin: [0,0,0,20]
	  		},{
	  			qr: this.key,
	  			foreground: '#ffc902', 
	  			// background: '#ffc902',
	  			fit: '75',
	  			alignment: 'right'
	  		},{
	  			columns: [
	  			[{
	  				text: this.order.customer.name,
	  			},{
	  				text: this.order.customer.district + ', ' + this.order.customer.city + ' ' + this.order.customer.region,
	  			},{
	  				text: this.order.customer.phone,
	  			},{
	  				text: 'Date de Livraison : ' + this.order.customer.delivry_date
	  			}]]
	  		},{
	  			table:{
	  				headerRows: 1,
	  				widths: [ '*', '*', '*'],
	  				body: this.createTable()
	  				// body: [
			    //       [ 'First', 'Second', 'Third', 'The last one' ],
			    //       [ 'Value 1', 'Value 2', 'Value 3', 'Value 4' ],
			    //       [ { text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4' ]
			    //     ]

	  			},
	  			margin: [0,20,0,0]
	  		}

	  	],
	  	footer: {
	        text: 'AR. DISCOUNT © 2020 Hikam Societe Multiple.',
	        alignment: 'center',
	        bold: true,
	        color: '#ffc902'
	      }
	  };
	  pdfMake.createPdf(documentDefinition).open();
	}

	createTable(){
		let total = 0;
		let body:any = [
          [{
          	text:'Produits',
          	bold:true
          },{
          	text: 'Quantité',
          	bold: true
          }, {
          	text: 'Montant',
          	bold: true
          } ]
        ];
		for(let key in this.order.products){
			let product = this.order.products[key];
			total += (product.quantity * product.price)
			let row = [product.name,product.quantity + ' ' + product.unity, product.quantity * product.price + ' kmf']
			body.push(row);
		}

    if (this.order.livraison) {
      let livraison = [{
        text: 'Livraison',
      },{
        text: this.order.livraison.region,
      }, {
        text: this.order.livraison.price + ' kmf'
      }];

      total += Number(this.order.livraison.price);

      body.push(livraison);
    }

		let totalRow = [{
			text: 'Total',
			bold: true
		},
		{
			text: '',
			bold: false
		}, 
		{
			text: total +' kmf',bold:true
		}]
		
		body.push(totalRow);


		return body;
	}

}
