import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('map', {static: false}) mapElementRef: ElementRef;

  constructor(private modalCtrl: ModalController, private renderer: Renderer2) { }

  googleMaps: any;
  clickListener: any;

  ngOnInit() {}


  ngAfterViewInit() {
        console.log('this is the after view init...');
    this.getGoogleMaps()
                      .then( googleMaps => {
                        this.googleMaps = googleMaps;
                        const mapEl = this.mapElementRef.nativeElement;
                        console.log(mapEl);
                        const map = new googleMaps.Map(mapEl, {
                          center: { lat: -34.397, lng: 150.644},
                          zoom: 8
                        });
                        console.log(map);
                      this.googleMaps.event.addListenerOnce(map, 'idle', () => {
                          this.renderer.addClass(mapEl, 'visible');
                        });

                      this.clickListener = map.addListener('click', event => {
                          const selectedCoords = {
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng()
                          };
                          this.modalCtrl.dismiss(selectedCoords);
                        });

                      })
                      .catch( err => {
                        console.log(err);
                      });
  }

  ngOnDestroy(): void {
    if(this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }
  onCancel() {
    this.modalCtrl.dismiss();
  }


  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if ( googleModule && googleModule.maps) {
          return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
      'https://maps.googleapis.com/maps/api/js?key='+environment.googleMapAPIkey;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google Maps SDK not available');
        }
      };
    });
  }
}
