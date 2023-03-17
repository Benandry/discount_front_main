import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

interface ICache { [ key: string ]: BehaviorSubject<any>; }
type serializable = object | Object;

@Injectable()
export class LocalStorageService {
  private cache: ICache;

  constructor () {
    this.cache = Object.create( null );
  }

  setItem<T extends serializable>( key: string, value: any ): BehaviorSubject<any> {
    localStorage.setItem( key, value );

    if ( this.cache[ key ] ) {
      this.cache[ key ].next( value );
      return this.cache[ key ];
    }

    return this.cache[ key ] = new BehaviorSubject( value );
  }

  getItem<T extends serializable>( key: string ): BehaviorSubject<any> {
    if ( this.cache[ key ] )
      return this.cache[ key ];
    else
      return this.cache[ key ] = new BehaviorSubject(localStorage.getItem( key ));
  }

  removeItem ( key: string ) {
    localStorage.removeItem( key );
    if ( this.cache[ key ] )
      this.cache[ key ].next( undefined );
  }
}