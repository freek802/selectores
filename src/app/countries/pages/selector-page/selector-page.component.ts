import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styleUrls: ['./selector-page.component.css'],
})
export class SelectorPageComponent implements OnInit {
  public countriesByRegion: SmallCountry[] = [];
  public bordersByCountry: SmallCountry[] = [];
  public spinner: boolean = false;
  public zeroBorders: boolean = false;

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    borders: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  onRegionChanged(): void {
    this.myForm
      .get('region')!
      .valueChanges.pipe(
        tap(() => {
          this.spinner = true;
          this.myForm.get('country')!.setValue('');
        }),
        tap(() => (this.bordersByCountry = [])),
        switchMap((region) =>
          this.countriesService.getCountriesByRegion(region)
        )
      )
      .subscribe((countries) => {
        this.countriesByRegion = countries;
        this.spinner = false;
      });
  }

  onCountryChanged(): void {
    this.myForm
      .get('country')!
      .valueChanges.pipe(
        tap(() => {
          this.spinner = true;
          this.myForm.get('borders')!.setValue('');
        }),
        tap(() => (this.bordersByCountry = [])),
        filter((value: string) => value.length > 0),
        switchMap((alphacode) =>
          this.countriesService.getCountryByAlphaCode(alphacode)
        ),
        switchMap((country) =>
          this.countriesService.getCountriesBordersByCodes(country.borders)
        )
      )
      .subscribe((countries) => {
        this.bordersByCountry = countries;
        if (countries.length === 0) {
          this.zeroBorders = true;
        } else {
          this.zeroBorders = false;
        }
        this.spinner = false;
      });
  }
}
