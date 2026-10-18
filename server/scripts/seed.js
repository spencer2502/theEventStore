const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { connectDB } = require("../src/config/db");
const User = require("../src/models/User");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");
const Order = require("../src/models/Order");
const Sale = require("../src/models/Sale");
const AuditLog = require("../src/models/AuditLog");

async function seed() {
  console.log("🌱 Seeding THE EVENT STORE database...");

  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Sale.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log("🧹 Cleaned existing records.");

  // 1. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("Admin123!", salt);

  const admin = await User.create({
    name: "Alex StoreAdmin",
    email: "admin@theeventstore.com",
    passwordHash: adminPasswordHash,
    role: "admin",
    isActive: true,
  });

  console.log("👤 Created 1 default admin user.");

  // 2. Create Categories with brand colors
  const categoriesData = [
    {
      name: "Lighting",
      slug: "lighting",
      colorKey: "yellow",
      description:
        "Fairy lights, warm pendants, neon signage, and spotlight effects for vibrant atmospheres.",
    },
    {
      name: "Backdrops",
      slug: "backdrops",
      colorKey: "pink",
      description:
        "Shimmer walls, wooden slat arches, velvet drapes, and customized photo backdrops.",
    },
    {
      name: "Balloons",
      slug: "balloons",
      colorKey: "blue",
      description:
        "Organic garlands, metallic arches, customized balloon rings, and jumbo confetti props.",
    },
    {
      name: "Tableware",
      slug: "tableware",
      colorKey: "lime",
      description:
        "Gold charger plates, crystal flutes, rose cutlery, and decorative runners.",
    },
    {
      name: "Furniture",
      slug: "furniture",
      colorKey: "purple",
      description:
        "Boho peacock chairs, velvet loveseats, dessert plinths, and rustic farmhouse tables.",
    },
  ];

  const categories = await Category.insertMany(categoriesData);
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.slug] = cat;
    return acc;
  }, {});

  console.log(`🏷️ Created ${categories.length} core categories.`);

  // 3. Create Sample Products
  const productsData = [
    // Lighting (yellow)
    {
      name: "Cascading Warm Fairy Light Curtain (3m x 3m)",
      slug: "fairy-light-curtain",
      categoryId: categoryMap["lighting"]._id,
      price: 45,
      stock: 15,
      description:
        "Dimmable warm-white waterfall fairy lights with 8 modes. Perfect for ceremony backgrounds, sweetheart tables, and entryways.",
      images: [
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
      ],
      featured: true,
    },
    {
      name: 'Neon Sign "Better Together" Script',
      slug: "neon-sign-better-together",
      categoryId: categoryMap["lighting"]._id,
      price: 85,
      stock: 3, // LOW STOCK
      description:
        "Stunning LED neon flex sign in warm champagne white mounted on high-grade clear acrylic backing with mounting hardware.",
      images: [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      ],
      featured: true,
    },
    {
      name: "Vintage Moroccan Brass Geometric Lantern",
      slug: "moroccan-brass-lantern",
      categoryId: categoryMap["lighting"]._id,
      price: 32,
      stock: 8,
      description:
        "Ornate pierced brass lantern with glass panels. Ideal for table centerpieces, aisle walkways, and floor groupings.",
      images: [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&w=800&q=80",
      ],
      featured: false,
    },

    // Backdrops (pink)
    {
      name: "Gold Shimmer Sequin Wall Backdrop (8ft x 8ft)",
      slug: "gold-shimmer-sequin-wall",
      categoryId: categoryMap["backdrops"]._id,
      price: 130,
      stock: 4, // LOW STOCK
      description:
        "Dynamic wind-activated gold square sequin panels that glitter with light. Includes heavy-duty aluminum tension frame.",
      images: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
      ],
      featured: true,
    },
    {
      name: "Hexagonal Geometric Wooden Floral Arch",
      slug: "hexagonal-wooden-floral-arch",
      categoryId: categoryMap["backdrops"]._id,
      price: 110,
      stock: 2, // LOW STOCK
      description:
        "Solid cedarwood hexagonal freestanding wedding arch. Sturdy weighted base, quick bolt assembly, and wire grid for flowers.",
      images: [
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
      ],
      featured: true,
    },
    {
      name: "Dusty Rose Velvet Luxury Drape Backdrop",
      slug: "dusty-rose-velvet-drapes",
      categoryId: categoryMap["backdrops"]._id,
      price: 65,
      stock: 12,
      description:
        "Heavy matte velvet 4-panel drape set with rod pockets. Flame-retardant fabric that absorbs glare and looks ultra-luxe.",
      images: [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
      ],
      featured: false,
    },

    // Balloons (blue)
    {
      name: "Pastel Sunset Organic Balloon Garland (16ft Kit)",
      slug: "pastel-sunset-balloon-garland",
      categoryId: categoryMap["balloons"]._id,
      price: 48,
      stock: 24,
      description:
        "140-piece double-stuffed biodegradable latex balloon kit in blush, terracotta, peach, and chrome champagne gold.",
      images: [
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80",
      ],
      featured: true,
    },
    {
      name: "Circular Metal Balloon Ring Stand (6.6ft Diameter)",
      slug: "circular-balloon-ring-stand",
      categoryId: categoryMap["balloons"]._id,
      price: 55,
      stock: 5, // LOW STOCK
      description:
        "Gold powder-coated steel round hoop arch stand with water weight bags. Ideal framework for half or full balloon styling.",
      images: [
        "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
      ],
      featured: false,
    },

    // Tableware (lime)
    {
      name: "Hammered Brass Gold Charger Plates (Set of 10)",
      slug: "hammered-brass-charger-plates",
      categoryId: categoryMap["tableware"]._id,
      price: 38,
      stock: 18,
      description:
        "13-inch metallic hammered charger plates with beaded rim. Food-safe rim coating, stackable, and non-slip felt backing.",
      images: [
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      ],
      featured: true,
    },
    {
      name: "Crystal Ribbed Vintage Champagne Coupes (Set of 6)",
      slug: "crystal-ribbed-champagne-coupes",
      categoryId: categoryMap["tableware"]._id,
      price: 42,
      stock: 10,
      description:
        "Art Deco ribbed optic glass champagne coupe set with delicate gold rim. Holds 220ml with weighted base for towers.",
      images: [
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=800&q=80",
      ],
      featured: false,
    },

    // Furniture (purple)
    {
      name: "Boho Rattan Peacock Throne Accent Chair",
      slug: "boho-rattan-peacock-chair",
      categoryId: categoryMap["furniture"]._id,
      price: 150,
      stock: 2, // LOW STOCK
      description:
        "Handwoven natural wicker peacock chair with plush ivory cushion. The quintessential statement chair for baby showers & weddings.",
      images: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      ],
      featured: true,
    },
    {
      name: "Set of 3 Fluted Cylindrical Dessert Plinths",
      slug: "fluted-cylinder-plinths",
      categoryId: categoryMap["furniture"]._id,
      price: 95,
      stock: 6,
      description:
        "Nesting white fluted display pedestals in 3 graduated heights (90cm, 75cm, 60cm). Supports up to 40kg per tier.",
      images: [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
      ],
      featured: false,
    },
  ];

  const createdProducts = await Product.insertMany(productsData);
  console.log(
    `📦 Created ${createdProducts.length} demo products with multi-image carousels.`,
  );

  // 4. Create a Sample Storefront Order (enquiry)
  const sampleOrder = await Order.create({
    orderNumber: "ORD-20260920-8801",
    customerName: "Priya Sharma",
    customerPhone: "+91 98765 43210",
    customerAddress: "Flat 402, Lotus Boulevard, Sector 100, Noida, UP",
    items: [
      {
        productId: createdProducts[0]._id,
        name: createdProducts[0].name,
        quantity: 2,
        priceAtOrder: 45,
        image: createdProducts[0].images[0],
      },
      {
        productId: createdProducts[3]._id,
        name: createdProducts[3].name,
        quantity: 1,
        priceAtOrder: 130,
        image: createdProducts[3].images[0],
      },
    ],
    totalAmount: 220,
    status: "pending",
    telegramNotified: true,
    notes: "For garden engagement party on Saturday evening.",
  });

  // 5. Create a Sample Finalized Sale (POS bill)
  const sampleSale = await Sale.create({
    billNumber: "BILL-20260920-1042",
    items: [
      {
        productId: createdProducts[1]._id,
        name: createdProducts[1].name,
        quantitySold: 1,
        soldPrice: 80, // discounted from 85 listed
        subtotal: 80,
      },
      {
        productId: createdProducts[6]._id,
        name: createdProducts[6].name,
        quantitySold: 2,
        soldPrice: 48,
        subtotal: 96,
      },
    ],
    totalAmount: 176,
    createdBy: admin._id,
    createdByName: admin.name,
    customerName: "Kavita Mehta",
    customerPhone: "+91 98111 22334",
    customerAddress: "402, Lotus Avenue, Koregaon Park, Pune",
    paymentMethod: "upi",
    notes: "Walk-in booking for weekend corporate mixer.",
  });

  // 6. Create Audit Log Entry
  await AuditLog.create({
    action: "SYSTEM_SEED",
    entity: "System",
    performedBy: admin._id,
    performedByName: admin.name,
    performedByRole: admin.role,
    details: {
      message: "Initial database seeding completed successfully.",
      productsCount: createdProducts.length,
      categoriesCount: categories.length,
    },
  });

  console.log("📜 Created sample order, sample POS sale, and audit log.");
  console.log("\n======================================================");
  console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
  console.log("------------------------------------------------------");
  console.log("Login credentials:");
  console.log("Admin: admin@theeventstore.com / Admin123!");
  console.log("======================================================\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
