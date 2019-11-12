import { Component, ViewChild, ElementRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { 
         AngularFirestore,
         AngularFirestoreCollection
       } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, timestamp } from 'rxjs/operators';

import { Plugins } from '@capacitor/core';
import { ReturnStatement } from '@angular/compiler';
const { Geolocation } = Plugins;

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  // Firebase Data
  locations: Observable<any>;
  locationsCollection: AngularFirestoreCollection<any>;

  // Map related
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  markers = [];

  // Misc
  isTracking = false;
  watch: string;
  user = null;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.anonLogin();
  }

  ionViewWillEnter() {
    this.loadMap();
  }

  // Perform an anonymous login and load data
  anonLogin() {
    this.afAuth.auth.signInAnonymously().then(res => {
      this.user = res.user;

      this.locationsCollection = this.afs.collection(
        `locations/${this.user.uid}/track`,
        ref => ref.orderBy('timestamp')
      );

      // Make sure we also get Firebase item ID!
      this.locations = this.locationsCollection.snapshotChanges().pipe(
        map(actions => 
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
          )
      );

      // Update Map Marker on every change 
      this.locations.subscribe(locations => {
        this.updateMap(locations);
      });
    });
  }

  // Initialize a blank Map

  loadMap() {
    let latLng = new google.maps.latLng(36.938406, -1.359259);

    let mapOptions = {
      center: latLng,
      zoom: 5,
      mapTypeId: google.maps.mapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

}
