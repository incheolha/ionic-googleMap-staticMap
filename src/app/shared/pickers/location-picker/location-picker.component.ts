import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation } from '../../location.model';
import { of } from 'rxjs';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  selectedLocationImage: string;
  isLoading = false;

  constructor(private modalCtrl: ModalController, private http: HttpClient) { }

  ngOnInit() {}

  onPickLocation() {
    this.modalCtrl.create( {
                            component: MapModalComponent
                  }).then( modalEl => {

                  modalEl.onDidDismiss().then(modalData => {
                    console.log(modalData.data);

                    if(!modalData) {
                      return;
                    }

                    const placeLocation: PlaceLocation = {
                      lat: modalData.data.lat,
                      lng: modalData.data.lng,
                      address: null,
                      staticMapImgUrl: null
                    }
                    this.isLoading = true;
                    this.getGeoAddress(modalData.data.lat, modalData.data.lng)
                            .pipe(
                                    switchMap(address => {
                                      placeLocation.address = address;
                                      return of(this.getMapImage(placeLocation.lat, placeLocation.lng, 14));
                                    })
                            )
                            .subscribe( staticImagUrl => {
                             console.log( staticImagUrl);
                             placeLocation.staticMapImgUrl = staticImagUrl;
                             this.selectedLocationImage = staticImagUrl;
                             this.isLoading = false;
                            });

                  });
      modalEl.present();
    });
  }


  private getGeoAddress(lat: number, lng: number) {
    return this.http.get<any>(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=
      ${environment.googleMapAPIkey}`
    )
    .pipe(
      map( geoData => {
        if(!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
        }
        return geoData.results[0].formatted_address;
      })
    )
  }

  private getMapImage(lat: number, lng: number, zoom: number) {

      return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
      &markers=color:red%7Clabel:Place%7C${lat},${lng}
      &key=${environment.googleMapAPIkey}`;
  }
}
