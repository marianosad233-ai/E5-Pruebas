export interface Pokemon {
  id?: string; // Optional
  name: string;
  image?: string; // Optional
  initialMove: string;
  tricks: Tricks[];
}

export interface Tricks {
  detail: string;
  variant: Tricks[];
}
