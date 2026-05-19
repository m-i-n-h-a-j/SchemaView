import { environment } from '../../../../environments/environment';

export const ServiceUrl = {
  ApiServer: environment.apiUrl,
} as const;

export type ServiceUrl = (typeof ServiceUrl)[keyof typeof ServiceUrl];
