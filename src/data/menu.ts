/**
 * ASR Divine — Full Product Menu
 * Source: ASR DIVINE Menu.xlsx
 * Each category has a curated Unsplash hero image and a list of items.
 */

export type MenuItem = {
  name: string
  tags?: ('eggless' | 'vegan' | 'gluten-free' | 'sugar-free' | 'signature')[]
}

export type MenuSubSection = {
  title: string
  items: MenuItem[]
}

export type MenuCategory = {
  id: string
  name: string
  description: string
  image: string // Unsplash URL
  accent: string // Tailwind bg colour for fallback / accents
  items?: MenuItem[]
  subSections?: MenuSubSection[]
}

export const MENU_CATEGORIES: MenuCategory[] = [
  // ── 1. BREADS ──────────────────────────────────────────────────────────────
  {
    id: 'breads',
    name: 'Breads',
    description: 'Artisan loaves, soft rolls & specialty breads baked fresh every day.',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=1200&q=80',
    accent: 'bg-amber-900',
    items: [
      { name: 'Milk Bread' },
      { name: 'Caramelised Onion Bread' },
      { name: 'White Bread' },
      { name: 'Stuffed Kulcha' },
      { name: 'Pumpkin Bread' },
      { name: 'Wholewheat Bread', tags: ['eggless'] },
      { name: 'Bread Sticks' },
      { name: 'Lavash' },
      { name: 'Oats Bread', tags: ['eggless'] },
      { name: 'Sweet Sunday Loaf' },
      { name: 'Cumin Marble Bread' },
      { name: 'Burger Bun' },
      { name: 'Ladi Pav' },
      { name: 'Garlic Bread' },
      { name: 'Multigrain Bread', tags: ['eggless'] },
      { name: 'French Baguette' },
      { name: 'Bagels' },
      { name: 'Doughnuts' },
      { name: 'Potato Bread' },
      { name: 'Masala Bread' },
      { name: 'Ragi Bread', tags: ['eggless'] },
      { name: 'Bread Roll' },
      { name: 'Rye Bread' },
      { name: 'Pretzels' },
      { name: 'Olive Rosemary Bread' },
      { name: 'Ciabatta' },
      { name: 'Sourdough (Polish Method)' },
      { name: 'Cottage Cheese Dill Bread' },
      { name: 'Panni Bread' },
      { name: 'Cinnamon Raisin Bread' },
      { name: 'Soda Bread' },
      { name: 'Challah Bread' },
      { name: 'Stuffed Pita Bread' },
      { name: 'Pane Pugliese' },
    ],
  },

  // ── 2. COOKIES ─────────────────────────────────────────────────────────────
  {
    id: 'cookies',
    name: 'Cookies & Bars',
    description: 'Hand-crafted cookies, biscotti & energy bars in classic and exotic flavours.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=1200&q=80',
    accent: 'bg-yellow-800',
    items: [
      { name: 'Butter Cookies' },
      { name: 'Marble Cookies' },
      { name: 'Coconut Cookies', tags: ['eggless'] },
      { name: 'Cornflakes Cookies' },
      { name: 'Aniseed Cookies' },
      { name: 'Nan Khatai', tags: ['eggless'] },
      { name: 'Red Velvet Cookies' },
      { name: 'Atta Cookies', tags: ['eggless'] },
      { name: 'Oatmeal Banana Cookies', tags: ['eggless'] },
      { name: 'Cinnamon Rolls' },
      { name: 'Triple Chocolate Cookies' },
      { name: 'Centre Filled Cookies' },
      { name: 'Coffee Walnut Cookies' },
      { name: 'Choco Chips Cookies' },
      { name: 'Jam Ring Cookies' },
      { name: 'Almond Cookies' },
      { name: 'Jeera Cookies', tags: ['eggless'] },
      { name: 'Coconut Macaron' },
      { name: 'Ajwain Cookies', tags: ['eggless'] },
      { name: 'Vanilla Chocolate Cookies' },
      { name: 'Orange Chocolate Chips Cookies' },
      { name: 'Caramel Jowar Cookies' },
      { name: 'Almond Biscotti' },
      { name: 'Parmesan Chilly Cookies' },
      { name: 'Scones' },
      { name: 'Florentine Berry Granola Bar' },
      { name: 'Dark Chocolate Sea Salt Granola Bar' },
      { name: 'Protein Bar', tags: ['eggless'] },
      { name: 'Peanut Butter Oats & Nuts Bar', tags: ['eggless'] },
      { name: 'Ragi Nuts Bar', tags: ['gluten-free', 'eggless'] },
      { name: "S'mores Cookies", tags: ['signature'] },
      { name: 'Hazelnut Caramel Cookies', tags: ['signature'] },
      { name: 'Walnut Fudge Sandwich Cookies', tags: ['signature'] },
    ],
  },

  // ── 3. CHOCOLATES ──────────────────────────────────────────────────────────
  {
    id: 'chocolates',
    name: 'Chocolates',
    description: 'Premium handcrafted chocolates — truffles, bonbons, fudge & more.',
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=1200&q=80',
    accent: 'bg-stone-900',
    items: [
      { name: 'Truffle Balls' },
      { name: 'Dates Almond Chocolate', tags: ['eggless'] },
      { name: 'Coconut Chocolate', tags: ['eggless'] },
      { name: 'Lemon Chocolate' },
      { name: 'Spicy Chocolate' },
      { name: 'Orange Chocolate' },
      { name: 'Caramel Filled Chocolate' },
      { name: 'Fudgy Chocolate' },
      { name: 'Centre Filled Chocolate' },
      { name: 'Rum & Raisin Chocolate' },
      { name: 'Rum Ball' },
      { name: 'Fruit & Nut Chocolate', tags: ['eggless'] },
      { name: 'Rose Chocolate' },
      { name: 'Blueberry Chocolate' },
      { name: 'Coffee Chocolate' },
      { name: 'Chocolate Garnishing' },
      { name: 'Dark Chocolate' },
      { name: 'Passion Fruit Chocolate' },
      { name: 'Saffron Pistachio Chocolate' },
      { name: 'Irish Cream Chocolate' },
      { name: 'Mocha Cinnamon Chocolate' },
      { name: 'Cocopine Chocolate' },
      { name: 'Choco Hazel' },
      { name: 'Blueberry Lemon Chocolate' },
      { name: 'Cinnamon / Ginger / Cardamom Chocolate' },
      { name: 'Chewy Caramel Candy' },
      { name: 'Pâte de Fruit / Jelly' },
      { name: 'Brittle', tags: ['eggless'] },
      { name: 'Bonbons' },
      { name: 'Truffles' },
      { name: 'Clusters', tags: ['eggless'] },
      { name: 'Fudge' },
      { name: 'Chocolate Bars', tags: ['eggless'] },
      { name: 'Ruby Chocolate' },
    ],
  },

  // ── 4. PANNI CHOCOLATES ────────────────────────────────────────────────────
  {
    id: 'panni-chocolates',
    name: 'Panni Chocolates',
    description: 'Our signature Panni collection — almond, raisin & Edel chocolate assortments.',
    image: 'https://images.unsplash.com/photo-1481391032119-d89fee407e44?w=1200&q=80',
    accent: 'bg-yellow-950',
    subSections: [
      {
        title: 'Almond Collection',
        items: [
          { name: 'Tiramisu Almond' },
          { name: 'Rose Petal Almond' },
          { name: 'Dark Almond' },
          { name: 'Milk Almond' },
          { name: 'Cookies Almond' },
          { name: 'Blueberry Almond' },
          { name: 'Choco Hazelnut Almond' },
          { name: 'Kulfi Almond' },
          { name: 'Raspberry Almond' },
          { name: 'Strawberry Almond' },
          { name: 'Pineapple Almond' },
          { name: 'Mango Almond' },
          { name: 'Cranberry Milk + White Almond' },
          { name: 'Guava Chilli Almond' },
          { name: 'Kala Khatta Almond' },
          { name: 'Jamun Almond' },
          { name: 'Banana Almond' },
          { name: 'Biscoffee Almond' },
          { name: 'Rose & Litchi Almond' },
          { name: 'Sugar Free Almond', tags: ['sugar-free', 'eggless'] },
        ],
      },
      {
        title: 'Raisin Collection',
        items: [
          { name: 'Tiramisu Raisin' },
          { name: 'Blueberry Raisin' },
          { name: 'Dark Raisin' },
          { name: 'Milk Raisin' },
        ],
      },
      {
        title: 'Premium Milk & Hazelnut',
        items: [
          { name: 'Hazelnut Milk Chocolate' },
          { name: 'Coffee Dark Chocolate' },
          { name: 'Blueberry Dark Chocolate' },
          { name: 'Salted Pistachio' },
          { name: 'Filter Coffee Milk Chocolate' },
          { name: 'Crunchy Hazelnut' },
          { name: 'Blueberry Cheese Almond Cake Chocolate', tags: ['signature'] },
        ],
      },
      {
        title: 'Edel Collection',
        items: [
          { name: 'Edel Dark' },
          { name: 'Edel Passion Fruit' },
          { name: 'Edel Salt Pistachio' },
          { name: 'Edel Irish Cream' },
          { name: 'Edel Mocha Cinnamon' },
          { name: 'Edel Choco Pine' },
          { name: 'Edel Choco Hazelnut' },
          { name: 'Edel Blueberry Lemon' },
        ],
      },
    ],
  },

  // ── 5. CAKES ───────────────────────────────────────────────────────────────
  {
    id: 'cakes',
    name: 'Celebration Cakes',
    description:
      'Custom-crafted celebration cakes — from fondant masterpieces to anti-gravity wonders.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80',
    accent: 'bg-rose-900',
    items: [
      { name: 'Cream Cakes' },
      { name: 'Chocolate Cream Cake' },
      { name: 'Fondant Cake' },
      { name: 'Wedding Cake' },
      { name: 'Structured / Engineering Cake', tags: ['signature'] },
      { name: 'Chandelier Cake', tags: ['signature'] },
      { name: 'Anti Gravity Cake', tags: ['signature'] },
      { name: '3D Texture Cake', tags: ['signature'] },
      { name: 'Entremet Petit Gateaux', tags: ['signature'] },
      { name: 'Lemon Blueberry Cake' },
      { name: 'Caramel & Apple Cake' },
      { name: 'Black Forest Cake' },
      { name: 'Mango & Coconut Cake' },
    ],
  },

  // ── 6. SPONGE CAKES ────────────────────────────────────────────────────────
  {
    id: 'sponge',
    name: 'Sponge Cakes',
    description: 'Light, airy sponges in classic flavours — available egg or eggless.',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b19c?w=1200&q=80',
    accent: 'bg-amber-700',
    items: [
      { name: 'Vanilla Sponge', tags: ['eggless'] },
      { name: 'Chocolate Sponge', tags: ['eggless'] },
      { name: 'Red Velvet Sponge', tags: ['eggless'] },
      { name: 'Almond Sponge' },
      { name: 'Coconut Sponge', tags: ['eggless'] },
      { name: 'Rainbow Sponge', tags: ['eggless'] },
      { name: 'Marble Sponge', tags: ['eggless'] },
      { name: 'Chocolate Mud Cake' },
      { name: 'Chocolate Sacher Torte' },
      { name: 'Lemon Soufflé' },
      { name: 'Crème Brûlée' },
      { name: 'Tiramisu' },
      { name: 'Opera Cake' },
      { name: 'Cruffins' },
      { name: 'Panna Cotta' },
      { name: 'Croûtons' },
    ],
  },

  // ── 7. DRY CAKES & MUFFINS ─────────────────────────────────────────────────
  {
    id: 'dry-cakes',
    name: 'Dry Cakes & Muffins',
    description: 'Sliceable travel cakes, muffins and loaves perfect for gifting and snacking.',
    image: 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?w=1200&q=80',
    accent: 'bg-orange-900',
    items: [
      { name: 'Vanilla Muffin', tags: ['eggless'] },
      { name: 'Chocolate Chips Muffin' },
      { name: 'Lemon Juicy Cake' },
      { name: 'Banana Walnut Cake', tags: ['eggless'] },
      { name: 'Roman Apple Cake' },
      { name: 'Carrot Cake' },
      { name: 'Double Chocolate Cake' },
      { name: 'Chocolate Molten Lava Cake' },
      { name: 'Blueberry Muffin' },
      { name: 'Pineapple Upside Down Cake' },
      { name: 'Nutty Butty Cake', tags: ['eggless'] },
      { name: 'Almond Honey Cake' },
      { name: 'Chocolate Marble Cake', tags: ['eggless'] },
      { name: 'Date Nut Loaf', tags: ['eggless'] },
      { name: 'Orange Chocolate Praline Travel Cake' },
      { name: 'Almond Caramel Filling Cake' },
      { name: 'Cherry Financier' },
      { name: 'Wheat Cake (Variations)', tags: ['eggless'] },
      { name: 'Apple Sauce Cake', tags: ['eggless'] },
      { name: 'Zucchini Bread', tags: ['eggless'] },
    ],
  },

  // ── 8. SPREADS ─────────────────────────────────────────────────────────────
  {
    id: 'spreads',
    name: 'Spreads',
    description: 'Artisan spreads crafted with premium chocolate, nuts and fruits.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200&q=80',
    accent: 'bg-amber-950',
    items: [
      { name: 'Hazelnut Chocolate Spread', tags: ['eggless'] },
      { name: 'Peanut Butter Banana Chocolate Spread', tags: ['eggless'] },
      { name: 'Chocolate Almond Sea Salt Spread', tags: ['eggless'] },
      { name: 'Artisan Jam', tags: ['eggless', 'vegan'] },
    ],
  },

  // ── 9. PUFFS & CROISSANTS ──────────────────────────────────────────────────
  {
    id: 'puffs-croissants',
    name: 'Puffs & Croissants',
    description: 'Flaky, buttery croissants, vol-au-vents and delicate French pastries.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=80',
    accent: 'bg-yellow-700',
    items: [
      { name: 'Butter Croissants' },
      { name: 'Chocolate Croissants' },
      { name: 'Cheese Croissants' },
      { name: 'Bi-Coloured Croissants' },
      { name: 'Breakfast Danish' },
      { name: 'Puff Patties' },
      { name: 'French Heart Pastry' },
      { name: 'Apple Strudel' },
      { name: 'Vol-au-Vent' },
      { name: 'Masala Twisters' },
      { name: 'Fresh Mille-Feuille' },
      { name: 'Cheese Straws' },
      { name: 'Cinnamon Roll' },
    ],
  },

  // ── 10. TARTS & PIES ───────────────────────────────────────────────────────
  {
    id: 'tarts-pies',
    name: 'Tarts & Pies',
    description: 'Baked and chilled tarts, fruit pies and elegant entremet creations.',
    image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=1200&q=80',
    accent: 'bg-red-950',
    subSections: [
      {
        title: 'Tarts',
        items: [
          { name: 'Baked Chocolate Tarts' },
          { name: 'Baked Lemon Meringue Tarts' },
          { name: 'Chocolate Hazelnut Praline Tart' },
          { name: 'Fresh Fruit Tarts' },
          { name: 'Ginger Cream Tarts' },
          { name: 'Pineapple Tarts' },
          { name: 'Coconut Tarts' },
        ],
      },
      {
        title: 'Pies',
        items: [
          { name: 'Banoffee Pie' },
          { name: 'Apple Crumble' },
          { name: 'Caramel Chocolate Pie' },
          { name: 'Mushroom Pie' },
        ],
      },
      {
        title: 'Trail Mix',
        items: [
          { name: 'Mix Nut & Raisin Trail Mix', tags: ['eggless', 'vegan'] },
          { name: 'Nut Mix Cranberry Seeds & Nut', tags: ['eggless', 'vegan'] },
        ],
      },
    ],
  },

  // ── 11. MOUSSE CAKES & CHEESE CAKES ────────────────────────────────────────
  {
    id: 'mousse-cheesecake',
    name: 'Mousse & Cheesecakes',
    description: 'Elegant entremets, silky mousses, and indulgent cheesecakes.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=1200&q=80',
    accent: 'bg-pink-950',
    subSections: [
      {
        title: 'Mousse Cakes',
        items: [
          { name: 'Strawberry Sphere Entremet', tags: ['signature'] },
          { name: 'Death by Chocolate', tags: ['signature'] },
          { name: 'Pistachio Hearts', tags: ['signature'] },
          { name: 'Hazelnut Praline Mousse', tags: ['signature'] },
          { name: 'Chocolate Mystery Box', tags: ['signature'] },
        ],
      },
      {
        title: 'Cheesecakes',
        items: [
          { name: 'Baked Cheesecake' },
          { name: 'Cold Cheesecake' },
          { name: 'Basque Cheesecake', tags: ['signature'] },
        ],
      },
      {
        title: 'Choux Pastry',
        items: [
          { name: 'Cream Puffs' },
          { name: 'Éclairs' },
          { name: 'Craqueline Profiteroles' },
          { name: 'Churros' },
          { name: 'Croquembouche', tags: ['signature'] },
          { name: 'Paris-Brest', tags: ['signature'] },
        ],
      },
    ],
  },

  // ── 12. GRANOLA & HEALTH ───────────────────────────────────────────────────
  {
    id: 'granola-health',
    name: 'Granola & Healthy Bakes',
    description: 'Wholesome granola mixes, protein-packed bakes and wellness-focused treats.',
    image: 'https://images.unsplash.com/photo-1517093757585-b1bc5e9f9e64?w=1200&q=80',
    accent: 'bg-green-900',
    subSections: [
      {
        title: 'Granola Mixes',
        items: [
          { name: 'Seeds Granola', tags: ['eggless', 'vegan'] },
          { name: 'Mixed Berry Nut Granola', tags: ['eggless', 'vegan'] },
          { name: 'Cranberry Sides Granola', tags: ['eggless', 'vegan'] },
          { name: 'Mocha Bliss Nut Granola', tags: ['eggless'] },
        ],
      },
      {
        title: 'Protein Bakes',
        items: [
          { name: 'Nutrinest Protein Powder', tags: ['eggless'] },
          { name: 'Jaggery + Dates Protein Base', tags: ['eggless', 'vegan'] },
        ],
      },
      {
        title: 'Healthy Cookies & Cakes',
        items: [
          { name: 'Healthy Cookies Collection', tags: ['eggless'] },
          { name: 'Healthy Cakes Collection', tags: ['eggless'] },
          { name: 'Vegan Bakes', tags: ['vegan', 'eggless'] },
          { name: 'Gluten-Free Bakes', tags: ['gluten-free', 'eggless'] },
          { name: 'Keto Bakes', tags: ['eggless'] },
          { name: 'Fat-Free Bakes', tags: ['eggless'] },
          { name: 'Protein-Rich Bakes', tags: ['eggless'] },
          { name: 'Carbohydrate-Conscious Bakes', tags: ['eggless'] },
        ],
      },
    ],
  },

  // ── 13. FLAVOURED CASHEWS & CRACKERS ───────────────────────────────────────
  {
    id: 'cashews-crackers',
    name: 'Cashews & Crackers',
    description: 'Artisan flavoured cashews and hand-baked crackers for snacking and gifting.',
    image: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=1200&q=80',
    accent: 'bg-yellow-900',
    subSections: [
      {
        title: 'Flavoured Cashews',
        items: [
          { name: 'Thai Chilli Cashews', tags: ['eggless', 'vegan'] },
          { name: 'Brown Butter Cashews', tags: ['eggless'] },
        ],
      },
      {
        title: 'Crackers',
        items: [
          { name: 'Classic Salted Crackers', tags: ['eggless'] },
          { name: 'Cheese Herb Crackers' },
        ],
      },
    ],
  },

  // ── 14. BAKED SAVOURIES ────────────────────────────────────────────────────
  {
    id: 'savouries',
    name: 'Baked Savouries',
    description:
      'From Mexican rolls to Tandoori Paneer pockets — our savoury bakes are a crowd favourite.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&q=80',
    accent: 'bg-red-900',
    items: [
      { name: 'Mexican Roll' },
      { name: 'Tandoori Paneer Pocket' },
      { name: 'Pizza Bun' },
      { name: 'Chilli Paneer Roll' },
      { name: 'Potato Soufflé' },
      { name: 'Quiche' },
      { name: 'Pizza Calzone' },
      { name: 'Fatayer' },
      { name: 'Pizza (Fresh Dough & Ready Base)' },
    ],
  },

  // ── 15. SIGNATURE SPECIALS ─────────────────────────────────────────────────
  {
    id: 'signature',
    name: 'Signature Specials',
    description: 'Our most-loved, award-worthy creations — exclusive to ASR Divine.',
    image: 'https://images.unsplash.com/photo-1611329857570-f02f340e7378?w=1200&q=80',
    accent: 'bg-stone-950',
    items: [
      { name: 'Tres Leches', tags: ['signature'] },
      { name: 'Tiramisu (Classic)', tags: ['signature'] },
      { name: 'Nirvana Cake', tags: ['signature'] },
      { name: 'Strawberry Chocolate Tub', tags: ['signature'] },
      { name: 'Milk Chocolate Hazelnut Tian', tags: ['signature'] },
      { name: 'Choco Lava', tags: ['signature'] },
      { name: 'Sticky Toffee Cake', tags: ['signature'] },
      { name: 'Types of Brownies', tags: ['signature'] },
      { name: 'Types of Pastry', tags: ['signature'] },
    ],
  },
]

/** Flat list of all categories for nav rendering */
export const MENU_NAV = MENU_CATEGORIES.map(({ id, name }) => ({ id, name }))
