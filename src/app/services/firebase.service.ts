import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(public firebase: AngularFireDatabase) { }

  fetchById(path:string, id:string){
  	return new Promise((resolve)=>{
  		this.firebase.object(`${path}/${id}`).valueChanges().subscribe((object)=>{
  			resolve(object);
  		})
  	})
  }

  fetchAll(path){
  	return new Promise((resolve)=>{
  		this.firebase.object(path).valueChanges().subscribe((list)=>{
  			resolve(list);
  		})
  	})
  }

  save(path:string,object:any, key?:string){
  	if (key) {
  		return this.firebase.list(path).update(key,object);
  	} else {
  		return this.firebase.list(path).push(object).key
  	}
  }

  getById(path:string, id:string){
  	return this.firebase.object(`${path}/${id}`).valueChanges();
  }

  delete(path:string, key:string){
    this.firebase.list(path).remove(key);
  }

  setStorage(key:string,value:any){

  }

  getStorage(key:string){
    
  }
}
