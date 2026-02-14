export interface School {
  id: string;
  name: string;
  address: string;
  desa: string;
  district: string;
  districtId: number;
  province: string;
  provinceId: number;
  regency: string;
  regencyId: number;
}

export interface Province {
  id: number;
  name: string;
}

export interface Regency {
  id: number;
  name: string;
  provinceId: number;
}

export interface District {
  id: number;
  name: string;
  regencyId: number;
}
