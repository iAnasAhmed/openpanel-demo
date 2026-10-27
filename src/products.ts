export type Product = { id: string; name: string; origin: string; notes: string; price: number; tone: [string, string] };

export const products: Product[] = [
  { id: 'ethiopia', name: 'Yirgacheffe', origin: 'Ethiopia', notes: 'Jasmine · bergamot · peach', price: 16, tone: ['#e9c46a', '#b5651d'] },
  { id: 'colombia', name: 'Huila', origin: 'Colombia', notes: 'Red apple · caramel · cocoa', price: 14, tone: ['#d97b52', '#6b2d1a'] },
  { id: 'kenya', name: 'Nyeri AA', origin: 'Kenya', notes: 'Blackcurrant · grapefruit', price: 18, tone: ['#b0485f', '#3d1424'] },
  { id: 'brazil', name: 'Cerrado', origin: 'Brazil', notes: 'Hazelnut · milk chocolate', price: 12, tone: ['#a07a54', '#3b2a1c'] },
  { id: 'guatemala', name: 'Antigua', origin: 'Guatemala', notes: 'Brown sugar · orange', price: 15, tone: ['#c98f3c', '#5a3412'] },
  { id: 'decaf', name: 'Night Shift', origin: 'Decaf blend', notes: 'Toffee · dark cherry', price: 13, tone: ['#6c6f8f', '#1e2036'] },
];
