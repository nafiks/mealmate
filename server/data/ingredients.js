// Seed ingredients. `staple` = assumed present in every kitchen (salt, oil...),
// never counted as "missing" in the matching algorithm.
export const INGREDIENTS = [
  // Vegetables & Fruit
  { key: 'potato',       name: 'Potato',       emoji: '🥔', category: 'Vegetables & Fruit' },
  { key: 'onion',        name: 'Onion',        emoji: '🧅', category: 'Vegetables & Fruit' },
  { key: 'carrot',       name: 'Carrot',       emoji: '🥕', category: 'Vegetables & Fruit' },
  { key: 'garlic',       name: 'Garlic',       emoji: '🧄', category: 'Vegetables & Fruit' },
  { key: 'tomato',       name: 'Tomato',       emoji: '🍅', category: 'Vegetables & Fruit' },
  { key: 'cucumber',     name: 'Cucumber',     emoji: '🥒', category: 'Vegetables & Fruit' },
  { key: 'bell-pepper',  name: 'Bell pepper',  emoji: '🫑', category: 'Vegetables & Fruit' },
  { key: 'cabbage',      name: 'Cabbage',      emoji: '🥬', category: 'Vegetables & Fruit' },
  { key: 'lettuce',      name: 'Lettuce',      emoji: '🥗', category: 'Vegetables & Fruit' },
  { key: 'mushrooms',    name: 'Mushrooms',    emoji: '🍄', category: 'Vegetables & Fruit' },
  { key: 'green-onion',  name: 'Green onion',  emoji: '🌱', category: 'Vegetables & Fruit' },
  { key: 'dill',         name: 'Dill & parsley', emoji: '🌿', category: 'Vegetables & Fruit' },
  { key: 'banana',       name: 'Banana',       emoji: '🍌', category: 'Vegetables & Fruit' },
  { key: 'lemon',        name: 'Lemon',        emoji: '🍋', category: 'Vegetables & Fruit' },
  { key: 'avocado',      name: 'Avocado',      emoji: '🥑', category: 'Vegetables & Fruit' },
  { key: 'beet',         name: 'Beetroot',     emoji: '🍠', category: 'Vegetables & Fruit' },
  { key: 'pickles',      name: 'Pickles',      emoji: '🫙', category: 'Vegetables & Fruit' },

  // Meat & Fish
  { key: 'eggs',         name: 'Eggs',         emoji: '🥚', category: 'Meat & Fish' },
  { key: 'chicken',      name: 'Chicken',      emoji: '🍗', category: 'Meat & Fish' },
  { key: 'beef',         name: 'Beef',         emoji: '🥩', category: 'Meat & Fish' },
  { key: 'minced-meat',  name: 'Minced meat',  emoji: '🍖', category: 'Meat & Fish' },
  { key: 'sausage',      name: 'Sausage',      emoji: '🌭', category: 'Meat & Fish' },
  { key: 'bacon',        name: 'Bacon',        emoji: '🥓', category: 'Meat & Fish' },
  { key: 'fish',         name: 'Fish fillet',  emoji: '🐟', category: 'Meat & Fish' },
  { key: 'shrimp',       name: 'Shrimp',       emoji: '🦐', category: 'Meat & Fish' },

  // Dairy & Eggs
  { key: 'milk',         name: 'Milk',         emoji: '🥛', category: 'Dairy & Eggs' },
  { key: 'kefir',        name: 'Kefir',        emoji: '🍶', category: 'Dairy & Eggs' },
  { key: 'cheese',       name: 'Cheese',       emoji: '🧀', category: 'Dairy & Eggs' },
  { key: 'butter',       name: 'Butter',       emoji: '🧈', category: 'Dairy & Eggs' },
  { key: 'sour-cream',   name: 'Sour cream',   emoji: '🥄', category: 'Dairy & Eggs' },
  { key: 'cottage-cheese', name: 'Cottage cheese', emoji: '🥣', category: 'Dairy & Eggs' },
  { key: 'yogurt',       name: 'Yogurt',       emoji: '🥛', category: 'Dairy & Eggs' },

  // Grains & Pasta
  { key: 'rice',         name: 'Rice',         emoji: '🍚', category: 'Grains & Pasta' },
  { key: 'pasta',        name: 'Pasta',        emoji: '🍝', category: 'Grains & Pasta' },
  { key: 'noodles',      name: 'Instant noodles', emoji: '🍜', category: 'Grains & Pasta' },
  { key: 'buckwheat',    name: 'Buckwheat',    emoji: '🌾', category: 'Grains & Pasta' },
  { key: 'flour',        name: 'Flour',        emoji: '🌾', category: 'Grains & Pasta' },
  { key: 'bread',        name: 'Bread',        emoji: '🍞', category: 'Grains & Pasta' },
  { key: 'tortilla',     name: 'Tortilla',     emoji: '🌯', category: 'Grains & Pasta' },
  { key: 'oats',         name: 'Oats',         emoji: '🥣', category: 'Grains & Pasta' },

  // Pantry & Spices (staples — always assumed available)
  { key: 'salt',         name: 'Salt',         emoji: '🧂', category: 'Pantry & Spices', staple: true },
  { key: 'black-pepper', name: 'Black pepper', emoji: '🌶️', category: 'Pantry & Spices', staple: true },
  { key: 'sugar',        name: 'Sugar',        emoji: '🍬', category: 'Pantry & Spices', staple: true },
  { key: 'vegetable-oil', name: 'Vegetable oil', emoji: '🫒', category: 'Pantry & Spices', staple: true },
  { key: 'soy-sauce',    name: 'Soy sauce',    emoji: '🍶', category: 'Pantry & Spices' },

  // Canned & Frozen
  { key: 'canned-beans', name: 'Red beans (canned)', emoji: '🫘', category: 'Canned & Frozen' },
  { key: 'green-peas',   name: 'Green peas (canned)', emoji: '🫛', category: 'Canned & Frozen' },
  { key: 'canned-tomatoes', name: 'Chopped tomatoes (canned)', emoji: '🥫', category: 'Canned & Frozen' },
  { key: 'canned-corn',  name: 'Corn (canned)', emoji: '🌽', category: 'Canned & Frozen' },
  { key: 'frozen-pelmeni', name: 'Frozen pelmeni', emoji: '🥟', category: 'Canned & Frozen' },
  { key: 'frozen-manti', name: 'Frozen manti', emoji: '🥟', category: 'Canned & Frozen' },
]

export const CATEGORIES = [
  'Vegetables & Fruit',
  'Meat & Fish',
  'Dairy & Eggs',
  'Grains & Pasta',
  'Pantry & Spices',
  'Canned & Frozen',
]
