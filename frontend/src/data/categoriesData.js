// Central Single Source of Truth for Categories & Subcategories

export const CATEGORIES_DATA = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Smartphone',
    description: 'Flagship smartphones, pro laptops, 4K displays & studio audio',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=85',
    subcategories: [
      'Smartphones',
      'Laptops',
      'Tablets',
      'Headphones',
      'Earbuds',
      'Smart Watches',
      'Speakers',
      'Cameras',
      'Monitors',
      'Keyboards',
      'Mice',
      'Power banks',
      'Networking devices'
    ]
  },
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion',
    icon: 'Sparkles',
    description: 'Designer apparel, luxury silk dresses, denim & sneakers',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&auto=format&fit=crop&q=85',
    subcategories: [
      'Jackets',
      'Sneakers',
      'Dresses',
      'Shirts',
      'Jeans',
      'Bags',
      'Shoes',
      'T-shirts',
      'Kids clothing',
      "Women's clothing",
      "Men's clothing"
    ]
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    slug: 'home-living',
    icon: 'Grid',
    description: 'Solid wood furniture, smart ambient lamps & luxury bedding',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&auto=format&fit=crop&q=85',
    subcategories: [
      'Chairs',
      'Tables',
      'Lamps',
      'Bedding',
      'Kitchen products',
      'Decor',
      'Storage',
      'Home accessories'
    ]
  },
  {
    id: 'beauty-care',
    name: 'Beauty & Care',
    slug: 'beauty-care',
    aliases: ['Beauty & Personal Care'],
    icon: 'Sparkles',
    description: 'Luxury skincare, iconic perfumes, makeup & grooming',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&auto=format&fit=crop&q=85',
    subcategories: [
      'Haircare',
      'Skincare',
      'Perfume',
      'Grooming',
      'Makeup',
      'Personal care'
    ]
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    aliases: ['Sports & Outdoors'],
    icon: 'Flame',
    description: 'Marathon carbon shoes, fitness weights, yoga & camping gear',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&auto=format&fit=crop&q=85',
    subcategories: [
      'Running shoes',
      'Fitness equipment',
      'Yoga products',
      'Football',
      'Cricket',
      'Basketball',
      'Cycling',
      'Outdoor accessories'
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive',
    slug: 'automotive',
    icon: 'Zap',
    description: '4K dual dashcams, portable smart inflators & detailing kits',
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1400&auto=format&fit=crop&q=85',
    subcategories: [
      'Car accessories',
      'Cleaning products',
      'Bike accessories',
      'Interior accessories'
    ]
  },
  {
    id: 'toys-games',
    name: 'Toys & Games',
    slug: 'toys-games',
    icon: 'Zap',
    description: 'Collector LEGO sets, 4K camera drones & strategy board games',
    image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1563941402622-4e7a488bcc57?w=1400&auto=format&fit=crop&q=85',
    subcategories: [
      'Building blocks',
      'Remote-control toys',
      'Board games',
      'Puzzles',
      'Educational toys'
    ]
  },
  {
    id: 'books-stationery',
    name: 'Books & Stationery',
    slug: 'books-stationery',
    icon: 'Grid',
    description: 'Iconic fountain pens, artists’ colored pencils & bestselling books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1400&auto=format&fit=crop&q=85',
    subcategories: [
      'Notebooks',
      'Pens',
      'Art supplies',
      'Books',
      'Office supplies'
    ]
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    icon: 'Watch',
    description: 'Swiss automatic watches, 18k diamond pendants & Italian leather',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1400&auto=format&fit=crop&q=85',
    subcategories: [
      'Wallets',
      'Watches',
      'Jewelry',
      'Belts',
      'Sunglasses',
      'Travel accessories'
    ]
  }
];

export const ALL_CATEGORY_NAMES = CATEGORIES_DATA.map((c) => c.name);

export const getCategoryBySlugOrName = (val) => {
  if (!val || val === 'All') return null;
  const lower = val.toLowerCase().trim();
  return (
    CATEGORIES_DATA.find(
      (c) =>
        c.name.toLowerCase() === lower ||
        c.slug.toLowerCase() === lower ||
        (c.aliases && c.aliases.some((a) => a.toLowerCase() === lower))
    ) || null
  );
};
