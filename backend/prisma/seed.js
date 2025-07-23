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
      description: 'Transportation infrastructure',
      color: '#004E89',
      icon: 'car',
    },
  });

  const environmentCategory = await prisma.category.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      name: 'Environment',
      description: 'Environmental and natural features',
      color: '#1A936F',
      icon: 'tree',
    },
  });

  // Create sub-categories
  await prisma.category.upsert({
    where: { id: '4' },
    update: {},
    create: {
      id: '4',
      name: 'Residential',
      description: 'Residential buildings',
      parentId: buildingCategory.id,
      color: '#FFB700',
      icon: 'home',
    },
  });

  await prisma.category.upsert({
    where: { id: '5' },
    update: {},
    create: {
      id: '5',
      name: 'Commercial',
      description: 'Commercial buildings',
      parentId: buildingCategory.id,
      color: '#C7EFCF',
      icon: 'store',
    },
  });

  // Create sample models
  await prisma.model.create({
    data: {
      name: 'Sample Building Model',
      description: 'A sample 3D building model for testing',
      filePath: '/uploads/sample-building.glb',
      latitude: 21.0285,
      longitude: 105.8542,
      altitude: 50,
      userId: admin.id,
      categoryId: buildingCategory.id,
    },
  });

  // Create sample GeoJSON data
  await prisma.geoJson.create({
    data: {
      name: 'Vietnam Provinces',
      description: 'Vietnam administrative boundaries',
      type: 'FEATURECOLLECTION',
      data: {
        type: 'FeatureCollection',
        features: []
      },
      userId: admin.id,
      categoryId: environmentCategory.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin: admin@dthub.com / admin123456`);
  console.log(`👤 User: user@dthub.com / user123456`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
