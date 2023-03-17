import { Component, OnInit } from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { FirebaseService } from '../../services/firebase.service'

@Component({
  selector: 'app-sale-point',
  templateUrl: './sale-point.component.html',
  styleUrls: ['./sale-point.component.css']
})
export class SalePointComponent implements OnInit {

	pointsalelist = [];

  constructor(
    public firebasePrvd: FirebaseService,
  ) { }

  ngOnInit(): void {
  	this.list();
  }

  list(){
  	this.firebasePrvd.fetchAll('pointsale').then((list:any)=>{
  		for(let key in list){
  			let pointsale = list[key];
  			this.pointsalelist.push(pointsale);
  		}
  	})
  }

}
