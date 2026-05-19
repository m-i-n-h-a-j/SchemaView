import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  private buildUrl(serviceUrl: ServiceUrl, url: string) {
    return `${serviceUrl}/api/${url}`;
  }

  get<T>(
    serviceUrl: ServiceUrl,
    url: string,

    options?: {
      withCredentials?: boolean;
      headers?: any;
      params?: any;
      responseType?: any;
    },
  ): Observable<T> {
    return this.http.get<T>(this.buildUrl(serviceUrl, url), options);
  }

  post<T>(
    serviceUrl: ServiceUrl,
    url: string,
    body: any,

    options?: {
      withCredentials?: boolean;
      headers?: any;
      params?: any;
    },
  ): Observable<T> {
    return this.http.post<T>(this.buildUrl(serviceUrl, url), body, options);
  }

  put<T>(
    serviceUrl: ServiceUrl,
    url: string,
    body: any,

    options?: {
      withCredentials?: boolean;
      headers?: any;
      params?: any;
    },
  ): Observable<T> {
    return this.http.put<T>(this.buildUrl(serviceUrl, url), body, options);
  }

  delete<T>(
    serviceUrl: ServiceUrl,
    url: string,

    options?: {
      withCredentials?: boolean;
      headers?: any;
      params?: any;
    },
  ): Observable<T> {
    return this.http.delete<T>(this.buildUrl(serviceUrl, url), options);
  }
}
