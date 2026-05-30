export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  emoji: string;
  featured?: boolean;
  available?: boolean;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  description?: string;
}

export const categories: Category[] = [
  { id: 'clasicas', name: "LAS CLASICAS DE NITO'S", emoji: '🍕', description: 'Nuestras pizzas clásicas favoritas' },
  { id: 'vegetarianas', name: "LAS VEGETARIANAS NITO'S", emoji: '🥬', description: 'Opciones deliciosas sin carne' },
  { id: 'especiales', name: "LOS ESPECIALES DE NITO'S", emoji: '⭐', description: 'Creaciones especiales del chef' },
  { id: 'armala', name: 'ARMALA CON 4 INGREDIENTES', emoji: '🛠️', description: 'Elige tus ingredientes favoritos' },
  { id: 'hamburguesas', name: 'HAMBURGUESAS', emoji: '🍔', description: 'Jugosas hamburguesas artesanales' },
  { id: 'hotdogs', name: "HOT DOG'S", emoji: '🌭', description: 'Hot dogs estilo Nito' },
  { id: 'snacks', name: 'SNACKS', emoji: '🍟', description: 'Acompañamientos irresistibles' },
  { id: 'bebidas', name: 'BEBIDAS', emoji: '🥤', description: 'Refrescantes bebidas' },
  { id: 'paquetes', name: 'PAQUETES', emoji: '🎁', description: 'Combos completos para disfrutar' },
  { id: 'promos', name: 'PROMOS', emoji: '🔥', description: 'Ofertas especiales por tiempo limitado' },
];

export const products: Product[] = [
  // LAS CLASICAS DE NITO'S
  { id: 'p1', name: "Nito's Chica", price: 100, category: 'clasicas', emoji: '🍕', description: 'La pizza insignia de Nito en tamaño individual', featured: true },
  { id: 'p2', name: "Nito's Mediana", price: 119, category: 'clasicas', emoji: '🍕', description: 'La pizza insignia de Nito para compartir', featured: true },
  { id: 'p3', name: "Nito's Mega", price: 290, category: 'clasicas', emoji: '🍕', description: 'La pizza insignia en tamaño mega para toda la familia' },
  { id: 'p4', name: 'Clásica Chica', price: 100, category: 'clasicas', emoji: '🍕', description: 'Pizza clásica con los ingredientes tradicionales' },
  { id: 'p5', name: 'Clásica Mediana', price: 119, category: 'clasicas', emoji: '🍕', description: 'Pizza clásica mediana para compartir' },
  { id: 'p6', name: 'Clásica Grande', price: 170, category: 'clasicas', emoji: '🍕', description: 'Pizza clásica grande, ideal para la familia' },
  { id: 'p7', name: 'Clásica Familiar', price: 210, category: 'clasicas', emoji: '🍕', description: 'Pizza clásica tamaño familiar' },
  { id: 'p8', name: 'Clásica Mega', price: 290, category: 'clasicas', emoji: '🍕', description: 'La más grande de las clásicas' },
  { id: 'p9', name: 'Hawaiana Chica', price: 100, category: 'clasicas', emoji: '🍕', description: 'Piña y jamón, un clásico tropical', featured: true },
  { id: 'p10', name: 'Hawaiana Mediana', price: 119, category: 'clasicas', emoji: '🍕', description: 'Piña y jamón en tamaño mediano' },
  { id: 'p11', name: 'Mexicana Familiar', price: 210, category: 'clasicas', emoji: '🍕', description: 'Con chorizo, jalapeño y lo mejor de México' },
  { id: 'p12', name: 'Mexicana Mega', price: 290, category: 'clasicas', emoji: '🍕', description: 'Sabores mexicanos en tamaño mega' },
  { id: 'p13', name: 'Suprema Chica', price: 100, category: 'clasicas', emoji: '🍕', description: 'Todo lo mejor en una pizza chica' },
  { id: 'p14', name: 'Suprema Mediana', price: 119, category: 'clasicas', emoji: '🍕', description: 'La supreme en tamaño mediano' },
  { id: 'p15', name: 'Suprema Grande', price: 170, category: 'clasicas', emoji: '🍕', description: 'Suprema con todos los ingredientes' },
  { id: 'p16', name: 'Suprema Familiar', price: 210, category: 'clasicas', emoji: '🍕', description: 'La supreme para toda la familia' },
  { id: 'p17', name: 'Suprema Mega', price: 290, category: 'clasicas', emoji: '🍕', description: 'La pizza suprema más grande' },
  { id: 'p18', name: 'Carnes Frias Chica', price: 100, category: 'clasicas', emoji: '🍕', description: 'Salchicha, jamón y pepperoni' },

  // LAS VEGETARIANAS NITO'S
  { id: 'p19', name: 'Vegetariana Chica', price: 100, category: 'vegetarianas', emoji: '🥬', description: 'Verduras frescas en cada rebanada' },
  { id: 'p20', name: 'Vegetariana Mediana', price: 119, category: 'vegetarianas', emoji: '🥬', description: 'Pizza vegetariana mediana' },
  { id: 'p21', name: 'Vegetariana Grande', price: 170, category: 'vegetarianas', emoji: '🥬', description: 'Grande y llena de vegetales frescos' },
  { id: 'p22', name: 'Vegetariana Familiar', price: 210, category: 'vegetarianas', emoji: '🥬', description: 'Para toda la familia, 100% vegetales' },

  // LOS ESPECIALES DE NITO'S
  { id: 'p23', name: 'Especial Chica', price: 110, category: 'especiales', emoji: '⭐', description: 'Creación especial del chef', featured: true },
  { id: 'p24', name: 'Especial Mediana', price: 129, category: 'especiales', emoji: '⭐', description: 'Especial mediana con ingredientes premium' },
  { id: 'p25', name: 'Especial Grande', price: 180, category: 'especiales', emoji: '⭐', description: 'Grande y extraordinaria' },
  { id: 'p26', name: 'Especial Familiar', price: 220, category: 'especiales', emoji: '⭐', description: 'Especial familiar para compartir' },

  // ARMALA CON 4 INGREDIENTES
  { id: 'p27', name: 'Armala Chica', price: 90, category: 'armala', emoji: '🛠️', description: 'Elige 4 ingredientes para tu pizza' },
  { id: 'p28', name: 'Armala Mediana', price: 109, category: 'armala', emoji: '🛠️', description: 'Mediana con tus 4 ingredientes favoritos' },
  { id: 'p29', name: 'Armala Grande', price: 160, category: 'armala', emoji: '🛠️', description: 'Grande, personalizada a tu gusto' },
  { id: 'p30', name: 'Armala Familiar', price: 200, category: 'armala', emoji: '🛠️', description: 'Familiar con los ingredientes que tú elijas' },

  // HAMBURGUESAS
  { id: 'p31', name: 'Americana', price: 65, category: 'hamburguesas', emoji: '🍔', description: 'Clásica hamburguesa americana', featured: true },
  { id: 'p32', name: 'Hawaiana', price: 70, category: 'hamburguesas', emoji: '🍔', description: 'Con piña y toque tropical' },
  { id: 'p33', name: 'Doble', price: 85, category: 'hamburguesas', emoji: '🍔', description: 'Doble carne, doble sabor' },
  { id: 'p34', name: 'Con Tocino', price: 75, category: 'hamburguesas', emoji: '🍔', description: 'Crujiente tocino incluido' },

  // HOT DOG'S
  { id: 'p35', name: 'Clásico', price: 45, category: 'hotdogs', emoji: '🌭', description: 'El hot dog de siempre' },
  { id: 'p36', name: 'Con Tocino', price: 55, category: 'hotdogs', emoji: '🌭', description: 'Envuelto en tocino crujiente' },
  { id: 'p37', name: 'Especial', price: 60, category: 'hotdogs', emoji: '🌭', description: 'Con todos los toppings especiales' },

  // SNACKS
  { id: 'p38', name: 'Papas a la Francesa', price: 60, category: 'snacks', emoji: '🍟', description: 'Crujientes y doradas', featured: true },
  { id: 'p39', name: 'Alitas (6 pcs)', price: 80, category: 'snacks', emoji: '🍗', description: '6 alitas con salsa especial' },
  { id: 'p40', name: 'Nuggets (8 pcs)', price: 70, category: 'snacks', emoji: '🐔', description: '8 piezas crujientes de pollo' },
  { id: 'p41', name: 'Aros de Cebolla', price: 55, category: 'snacks', emoji: '🧅', description: 'Crujientes y dorados' },

  // BEBIDAS
  { id: 'p42', name: 'Refresco 600ml', price: 25, category: 'bebidas', emoji: '🥤', description: 'Coca-Cola, Fanta o Sprite' },
  { id: 'p43', name: 'Agua Natural', price: 20, category: 'bebidas', emoji: '💧', description: 'Agua purificada' },
  { id: 'p44', name: 'Agua de Sabor', price: 25, category: 'bebidas', emoji: '🧃', description: 'Deliciosa agua de sabor del día' },
  { id: 'p45', name: 'Cerveza', price: 35, category: 'bebidas', emoji: '🍺', description: 'Cerveza fría' },
  { id: 'p46', name: 'Jarra', price: 60, category: 'bebidas', emoji: '🍹', description: 'Jarra de agua de sabor o cerveza' },

  // PAQUETES
  { id: 'p47', name: 'Paquete Familiar', price: 399, category: 'paquetes', emoji: '🎁', description: '2 pizzas grandes + papas + refresco', featured: true },
  { id: 'p48', name: 'Paquete Pareja', price: 249, category: 'paquetes', emoji: '🎁', description: '1 pizza mediana + snacks + 2 refrescos' },
  { id: 'p49', name: 'Paquete Kids', price: 149, category: 'paquetes', emoji: '🎁', description: 'Pizza chica + nuggets + refresco' },

  // PROMOS
  { id: 'p50', name: '2x1 Pizzas Lunes', price: 170, category: 'promos', emoji: '🔥', description: 'Todos los lunes, 2 pizzas por el precio de 1', featured: true },
  { id: 'p51', name: 'Pizza + Refresco', price: 145, category: 'promos', emoji: '🔥', description: 'Pizza chica + refresco 600ml' },
  { id: 'p52', name: '3 Pizzas Grande', price: 450, category: 'promos', emoji: '🔥', description: '3 pizzas grandes a precio especial' },
];

export const featuredProducts = products.filter(p => p.featured);

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter(p => p.category === categoryId);
}

export function formatPrice(price: number): string {
  return `$${price}`;
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
  );
}
