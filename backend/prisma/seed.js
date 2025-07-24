const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dthub.com' },
    update: {},
    create: {
      email: 'admin@dthub.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create demo user
  const userPassword = await bcrypt.hash('user123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@dthub.com' },
    update: {},
    create: {
      email: 'user@dthub.com',
      name: 'Demo User',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create categories
  const buildingCategory = await prisma.category.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      name: 'Buildings',
      description: 'Building and architecture models',
      color: '#FF6B35',
      icon: 'building',
    },
  });

  const transportCategory = await prisma.category.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      name: 'Transportation',
      description: 'Vehicles and transportation models',
      color: '#4ECDC4',
      icon: 'car',
    },
  });

  const infrastructureCategory = await prisma.category.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      name: 'Infrastructure',
      description: 'Infrastructure and utility models',
      color: '#45B7D1',
      icon: 'bridge',
    },
  });

  // Create sample models (demo data)
  const sampleModels = [
    {
      id: 'model-1',
      name: 'Hanoi Opera House',
      description: 'Historic opera house in Hanoi, Vietnam',
      url: '/3dmodel/demo/hanoi-opera-house/tileset.json',
      longitude: 105.8567,
      latitude: 21.0200,
      height: 10,
      scale: 1.0,
      heading: 0,
      pitch: 0,
      roll: 0,
      modelCategory: 'Buildings',
      tags: ['historic', 'opera', 'hanoi', 'architecture'],
      isPublic: true,
      active: true,
      userId: admin.id,
      categoryId: buildingCategory.id,
      fileSize: 2048000,
      mimeType: 'model/gltf-binary'
    },
    {
      id: 'model-2',
      name: 'Long Bien Bridge',
      description: 'Historic cantilever bridge in Hanoi',
      url: '/3dmodel/demo/long-bien-bridge/tileset.json',
      longitude: 105.8647,
      latitude: 21.0465,
      height: 5,
      scale: 1.2,
      heading: 45,
      pitch: 0,
      roll: 0,
      modelCategory: 'Infrastructure',
      tags: ['bridge', 'historic', 'hanoi', 'infrastructure'],
      isPublic: true,
      active: true,
      userId: user.id,
      categoryId: infrastructureCategory.id,
      fileSize: 5120000,
      mimeType: 'model/gltf-binary'
    },
    {
      id: 'model-3',
      name: 'Ho Chi Minh Mausoleum',
      description: 'Memorial building for Ho Chi Minh',
      url: '/3dmodel/demo/hcm-mausoleum/tileset.json',
      longitude: 105.8342,
      latitude: 21.0368,
      height: 15,
      scale: 0.8,
      heading: 0,
      pitch: 0,
      roll: 0,
      modelCategory: 'Buildings',
      tags: ['memorial', 'hanoi', 'historic', 'monument'],
      isPublic: true,
      active: true,
      userId: admin.id,
      categoryId: buildingCategory.id,
      fileSize: 3072000,
      mimeType: 'model/gltf-binary'
    }
  ];

  for (const modelData of sampleModels) {
    await prisma.model.upsert({
      where: { id: modelData.id },
      update: {},
      create: modelData,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: admin@dthub.com / admin123456`);
  console.log(`👤 Demo user: user@dthub.com / user123456`);
  console.log(`📦 Created ${sampleModels.length} sample models`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
