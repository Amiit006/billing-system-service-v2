// ===================================
// ENHANCED MIGRATION SCRIPT WITH INTELLIGENT CATEGORIZATION
// File: scripts/enhancedMigrateParticulars.js
// ===================================

const mongoose = require('mongoose');
const Product = require('../services/product/product.model');
const Particular = require('../services/particular/particular.model');
require('dotenv').config();

const categoryMappingRules = {
  // TOPS - SHIRTS (High confidence patterns)
  shirts: {
    patterns: [
      'shirt', 'blind love shirt', 'yorker shirt', 'locust shirt', 'loose shirt',
      'bajson shirt', 'denis spark shirt', 'gob shirt', 's-sparkle shirt',
      'tdg shirt', 'beckaam kids shirt', 'bee-10 kids shirt',
      'yorker 1049', 'yorker 1099'  // Added these specific Yorker items
    ],
    category: 'Tops',
    subCategory: 'Shirts'
  },

  // TOPS - T-SHIRTS (High confidence patterns)
  tshirts: {
    patterns: [
      'tshirt', 't-shirt', 'bold tshirt', 'dlb tshirt', 'duke tshirt',
      'f/n t-shirt', 'f/s tshirt', 'h/s tshirt', 'kids tshirt',
      'liberation 47 tshirt', 'mayfair tshirt', 'qee-pee tshirt',
      'urban tshirt', 'bold pouch'  // CORRECT: Bold Pouch is a T-Shirt!
    ],
    category: 'Tops',
    subCategory: 'T-Shirts'
  },

  // BOTTOMS - JEANS (High confidence patterns)
  jeans: {
    patterns: [
      'jeans', 'mayfair jeans', 'kids jeans', 'ladies jeans',
      'sparkey jeans', 'wk- kids jeans'
    ],
    category: 'Bottoms',
    subCategory: 'Jeans'
  },

  // BOTTOMS - FORMAL TROUSERS (Medium confidence patterns)
  formalTrousers: {
    patterns: [
      'formal', 'mayfair formal'
    ],
    category: 'Bottoms',
    subCategory: 'Formal Trousers'
  },

  // BOTTOMS - COTTON TROUSERS (Medium confidence patterns)
  cottonTrousers: {
    patterns: [
      'cotton', 'mayfair cotton', 'bold track', 'track', 'track pant', 'bermunda'
    ],
    category: 'Bottoms',
    subCategory: 'Cotton Trousers'
  },

  // WINTER PRODUCTS - JACKETS (High confidence patterns)
  jackets: {
    patterns: [
      'jacket', 'arpan-jacket', 'gents flees jacket', 'gents foma jacket',
      'kids foma jacket', 'kids jacket', 'kids ladies jacket',
      'ladies foma jacket', 'lapaz - sports jacket', 'lapaz sports jacket',
      'lb47 - gents flees jacket', 'lb47 - sports jacket', 'ldn jacket',
      'ldn kids jacket', 'ldn ladies jacket', 'ldn sports jacket',
      'leather jacket', 'liberation 47 jacket', 'liberation jacket',
      'liberation kids jacket', 'liberation ladies jacket',
      'ph - gents flees jacket', 'sns jacket', 'sns kids jacket',
      'sns ladies jacket', 'vaio kids jacket',
      // Added specific Lapaz Foma items that are jackets
      'lapaz foma 26x34', 'lapaz grundle xl', 'lapaz r/n foma', 
      'lapaz foma xl', 'lapaz grundle', 'lapaz foma'
    ],
    category: 'Winter Products',
    subCategory: 'Jackets'
  },

  // WINTER PRODUCTS - SWEATERS (High confidence patterns)
  sweaters: {
    patterns: [
      'sweater', 'full sweater', 'jilabi sweater', 'oswal sweater',
      'red sweater', 's/l sweater', 'cardigans', 'ladies cardigans',
      'lapaz cardigans'
    ],
    category: 'Winter Products',
    subCategory: 'Sweaters'
  },

  // WINTER PRODUCTS - HOODIES (Medium confidence patterns)
  hoodies: {
    patterns: [
      'hoodie', 'sweatshirt', 'lb47 - gents sweatshirt', 'flees chain',
      'lapaz flees chain', 'flees rn', 'lapaz flees rn', 'darno', 'tutor',
      // Added specific Lapaz R/N Foma XL that is a hoodie
      'lapaz r/n foma xl', 'lapaz r/n foma l', 'lapaz r/n foma xxl'
    ],
    category: 'Winter Products',
    subCategory: 'Hoodies'
  }
};

// Special items that need specific categorization
// ORDER MATTERS: These are checked BEFORE categoryMappingRules
const specialCategorization = {
  // Specific items that should be handled explicitly
  explicit: {
    patterns: [
      'misc', 'old stock winter'  // Added explicit handling
    ],
    category: 'Winter Products',
    subCategory: 'Miscellaneous'
  },

  // Accessories (removed bold pouch - it's a T-Shirt!)
  accessories: {
    patterns: [
      'cap', 'socks', 'gloves', 'muffler', 'scarf', 'mask',
      'bhola cap', 'gents h/cap', 'gents m/cap', 'kids h/cap', 'kids m/cap',
      'kids red cap', 'ladies cap', 'oswal half cap', 'oswal kids cap',
      'oswal ladies cap', 'shivaji cap', 'rumal topi', 'o stk cap',
      'puma socks', 'gents socks', 'kids socks', 'ladies socks',
      'gloves', 'kids gloves', 'ladies gloves',
      'muffler', 'gents muffler', 'ladies muffler', 'oswal muffler',
      'scarf', 'ladies scarf', 'kana pati', 'oswal monkey'
      // Removed 'bold pouch' - it's actually a T-Shirt!
    ],
    category: 'Winter Products',
    subCategory: 'Miscellaneous'
  },

  // Blankets
  blankets: {
    patterns: [
      'blanket', 'db blanket', 'sb blanket'
    ],
    category: 'Winter Products',
    subCategory: 'Blanket'
  },

  // Shawls
  shawls: {
    patterns: [
      'shawls'
    ],
    category: 'Winter Products',
    subCategory: 'Shawl'
  },

  // Kids specific items (MOVED TO END to avoid overriding specific kids items)
  // Only generic "kids" items that don't have specific patterns above
  kids: {
    patterns: [
      'vaio kids', 'changer kids settings', 'kids winter settings',
      'kids foma setting', 'zero setting', 'baba suit', 'ph-box packing baba suit', 'PH - Bhalu', 'Kids'
      // Removed generic 'kids' to avoid conflicts
    ],
    category: 'Winter Products',
    subCategory: 'Kids Wear'
  }
};

// Function to intelligently categorize a particular
function categorizeParticular(particularName) {
  const name = particularName.toLowerCase().trim();
  
  // Check special categorizations first
  for (const [key, config] of Object.entries(specialCategorization)) {
    for (const pattern of config.patterns) {
      if (name.includes(pattern.toLowerCase())) {
        return {
          category: config.category,
          subCategory: config.subCategory,
          confidence: 'HIGH',
          matchedPattern: pattern
        };
      }
    }
  }

  // Check main categorizations
  for (const [key, config] of Object.entries(categoryMappingRules)) {
    for (const pattern of config.patterns) {
      if (name.includes(pattern.toLowerCase())) {
        return {
          category: config.category,
          subCategory: config.subCategory,
          confidence: 'HIGH',
          matchedPattern: pattern
        };
      }
    }
  }

  // Default fallback
  return {
    category: 'Winter Products',
    subCategory: 'Miscellaneous',
    confidence: 'LOW',
    matchedPattern: 'default'
  };
}

// Dry run function to preview categorization
async function dryRunCategorization() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔍 Connected to MongoDB for DRY RUN');

    const particulars = await Particular.find({ isActive: false });
    console.log(`\n📊 Found ${particulars.length} particulars to analyze\n`);

    const categorization = {};
    const unmatched = [];
    const stats = {
      'Tops': { 'Shirts': 0, 'T-Shirts': 0 },
      'Bottoms': { 'Jeans': 0, 'Formal Trousers': 0, 'Cotton Trousers': 0 },
      'Winter Products': { 'Jackets': 0, 'Sweaters': 0, 'Hoodies': 0, 'Kids Wear': 0, 'Miscellaneous': 0 },
      'Accessories': { 'Fashion Accessories': 0 },
      'Home & Living': { 'Textiles': 0 }
    };

    for (const particular of particulars) {
      const result = categorizeParticular(particular.particularName);
      
      const key = `${result.category}/${result.subCategory}`;
      if (!categorization[key]) {
        categorization[key] = [];
      }
      
      categorization[key].push({
        name: particular.particularName,
        confidence: result.confidence,
        pattern: result.matchedPattern
      });

      // Update stats
      if (stats[result.category] && stats[result.category][result.subCategory] !== undefined) {
        stats[result.category][result.subCategory]++;
      }

      if (result.confidence === 'LOW') {
        unmatched.push(particular.particularName);
      }
    }

    // Display results
    console.log('📋 CATEGORIZATION PREVIEW:\n');
    
    for (const [categoryPath, items] of Object.entries(categorization)) {
      console.log(`\n🏷️  ${categoryPath} (${items.length} items):`);
      items.forEach(item => {
        const confidence = item.confidence === 'HIGH' ? '✅' : '⚠️';
        console.log(`   ${confidence} ${item.name} (matched: ${item.pattern})`);
      });
    }

    console.log('\n\n📊 STATISTICS:');
    for (const [category, subCats] of Object.entries(stats)) {
      console.log(`\n${category}:`);
      for (const [subCat, count] of Object.entries(subCats)) {
        if (count > 0) {
          console.log(`  - ${subCat}: ${count} items`);
        }
      }
    }

    if (unmatched.length > 0) {
      console.log(`\n⚠️  ITEMS WITH LOW CONFIDENCE (${unmatched.length}):`);
      unmatched.forEach(name => console.log(`  - ${name}`));
    }

    console.log(`\n✅ DRY RUN COMPLETE! Review the categorization above.`);
    console.log(`💡 Items marked with ⚠️ will be categorized as Winter Products/Miscellaneous`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Dry run error:', error);
    process.exit(1);
  }
}

// Actual migration function
async function migrateParticularsToProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🚀 Connected to MongoDB for ACTUAL MIGRATION');

    const particulars = await Particular.find({ isActive: false });
    console.log(`\n📦 Migrating ${particulars.length} particulars to products\n`);

    let nextProductId = await getNextProductId();
    let migrated = 0;
    let skipped = 0;

    for (const particular of particulars) {
      // Check if product already exists
      const existingProduct = await Product.findOne({ 
        productName: particular.particularName 
      });

      if (existingProduct) {
        console.log(`⏭️  Skipped: ${particular.particularName} (already exists)`);
        skipped++;
        continue;
      }

      // Categorize the particular
      const result = categorizeParticular(particular.particularName);

      // Create the product
      await Product.create({
        productId: nextProductId++,
        productName: particular.particularName,
        category: result.category,
        subCategory: result.subCategory,
        unit: "pieces",
        gender: "Unisex",
        isActive: true
      });

      const confidence = result.confidence === 'HIGH' ? '✅' : '⚠️';
      console.log(`${confidence} Migrated: ${particular.particularName} → ${result.category}/${result.subCategory}`);
      migrated++;
    }

    console.log(`\n🎉 MIGRATION COMPLETED!`);
    console.log(`   ✅ Migrated: ${migrated} products`);
    console.log(`   ⏭️  Skipped: ${skipped} products (already existed)`);
    console.log(`   📊 Total: ${migrated + skipped} particulars processed`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

async function getNextProductId() {
  const lastProduct = await Product.findOne().sort({ productId: -1 });
  return lastProduct ? lastProduct.productId + 1 : 1;
}

// Command line argument handling
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');

if (isDryRun) {
  console.log('🔍 RUNNING DRY RUN - No actual changes will be made');
  dryRunCategorization();
} else {
  console.log('🚀 RUNNING ACTUAL MIGRATION - Products will be created');
  migrateParticularsToProducts();
}