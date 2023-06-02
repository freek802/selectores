import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private baseUrl: string = 'https://restcountries.com/v3.1/';

  private _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];
  constructor(private httpClient: HttpClient) {}

  get regions(): Region[] {
    return [...this._regions];
  }

  getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
    const url = `${this.baseUrl}alpha/${alphaCode}?fields=name,borders,cca3`;

    return this.httpClient.get<Country>(url).pipe(
      map((country) => ({
        name: country.name,
        cca3: country.cca3,
        borders: country.borders ?? [],
      }))
    );
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);

    const url = `${this.baseUrl}region/${region}?fields=name,borders,cca3`;

    return this.httpClient.get<Country[]>(url).pipe(
      map((countries) =>
        countries.map((country) => ({
          name: country.name,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      )
    );
  }

  getCountriesBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([]);

    const countriesRequests: Observable<SmallCountry>[] = [];

    borders.forEach((code) => {
      const request = this.getCountryByAlphaCode(code);
      countriesRequests.push(request);
    });

    return combineLatest(countriesRequests);
  }
}
