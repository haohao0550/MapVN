const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@dthub.com' },
      update: {},
      create: {
        email: 'admin@dthub.com',
        username: 'admin',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin user created:', admin.email);

    // Create demo user
    const userPassword = await bcrypt.hash('demo123', 12);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@dthub.com' },
      update: {},
      create: {
        email: 'demo@dthub.com',
        username: 'demo',
        password: userPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: 'USER'
      }
    });
    console.log('✅ Demo user created:', demoUser.email);

    // Create categories
    const categories = [
      {
        name: 'Infrastructure',
        slug: 'infrastructure',
        description: 'Urban infrastructure models and data',
        icon: '🏗️',
        color: '#3B82F6',
        children: [
          {
            name: 'Electric',
            slug: 'electric',
            description: 'Electrical infrastructure',
            icon: '⚡',
            color: '#F59E0B'
          },
          {
            name: 'Water',
            slug: 'water',
            description: 'Water infrastructure',
            icon: '💧',
            color: '#06B6D4'
          },
          {
            name: 'Traffic',
            slug: 'traffic',
            description: 'Traffic infrastructure',
            icon: '🚦',
            color: '#DC2626'
          }
        ]
      },
      {
        name: 'Vegetation',
        slug: 'vegetation',
        description: 'Trees, plants and green spaces',
        icon: '🌳',
        color: '#10B981',
        children: [
          {
            name: 'Trees',
            slug: 'trees',
            description: 'Tree models',
            icon: '🌲',
            color: '#059669'
          },
          {
            name: 'Bushes',
            slug: 'bushes',
            description: 'Bush and shrub models',
            icon: '🌿',
            color: '#16A34A'
          }
        ]
      },
      {
        name: 'Transportation',
        slug: 'transportation',
        description: 'Transportation infrastructure',
        icon: '🚗',
        color: '#8B5CF6'
      },
      {
        name: 'Buildings',
        slug: 'buildings',
        description: 'Building models',
        icon: '🏢',
        color: '#6B7280'
      }
    ];

    for (const categoryData of categories) {
      const { children, ...mainCategoryData } = categoryData;
      
      const category = await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: mainCategoryData
      });
      console.log('✅ Category created:', category.name);

      // Create child categories
      if (children) {
        for (const childData of children) {
          const childCategory = await prisma.category.upsert({
            where: { slug: childData.slug },
            update: {},
            create: {
              ...childData,
              parentId: category.id
            }
          });
          console.log('  ✅ Subcategory created:', childCategory.name);
        }
      }
    }

    // Create sample models
    const sampleModels = [
      {
        name: 'Electric Pole 22kV',
        description: 'Standard 22kV electric pole model for urban infrastructure',
        url: 'uploads/models/sample/La_Queenara.glb',
        longitude: 106.6297,
        latitude: 10.8231,
        height: 0,
        category: 'electric',
        tags: ['electric', 'pole', '22kv', 'infrastructure'],
        userId: admin.id
      }
      // ,
      // {
      //   name: 'Xa Cu Tree',
      //   description: 'Traditional Vietnamese Xa Cu tree model',
      //   url: 'uploads/models/sample/xa_cu_tree.glb',
      //   longitude: 106.6320,
      //   latitude: 10.8250,
      //   height: 0,
      //   scale: 1.5,
      //   category: 'trees',
      //   tags: ['tree', 'xa-cu', 'vegetation', 'vietnamese'],
      //   userId: demoUser.id
      // },
      // {
      //   name: 'Traffic Light',
      //   description: '3-way traffic light for intersection management',
      //   url: 'uploads/models/sample/traffic_light.glb',
      //   longitude: 106.6280,
      //   latitude: 10.8200,
      //   height: 0,
      //   category: 'traffic',
      //   tags: ['traffic', 'light', 'intersection', 'control'],
      //   userId: admin.id
      // }
    ];

    for (const modelData of sampleModels) {
      if (sampleModels.length > 0) {
        const model = await prisma.model.create({
          data: modelData
        });
        console.log('✅ Sample model created:', model.name);
      }
    }

    // Đọc dữ liệu từ file Viet_Nam.geojson
    const fs = require('fs');
    const path = require('path');
    const geojsonFilePath = path.join(__dirname, '../src/geojson_data/Viet_Nam.geojson');
    let vietNamGeoJSON = {};
    try {
      const geojsonRaw = fs.readFileSync(geojsonFilePath, 'utf8');
      vietNamGeoJSON = JSON.parse(geojsonRaw);
      console.log('📄 GeoJSON data loaded from Viet_Nam.geojson');
    } catch (err) {
      console.error('❌ Error reading Viet_Nam.geojson:', err);
    }

    const geoJsonRecord = await prisma.geoJson.create({
      data: {
        name: 'Vietnam Boundary',
        description: 'Administrative boundary of Vietnam',
        data: vietNamGeoJSON,
        category: 'administrative',
        tags: ['boundary', 'country', 'administrative', 'vietnam'],
        userId: admin.id
      }
    });
    console.log('✅ GeoJSON created from Viet_Nam.geojson:', geoJsonRecord.name);

    // Create system configurations
    const configurations = [
      {
        key: 'upload_max_size',
        value: '50000000',
        category: 'storage',
        description: 'Maximum upload file size in bytes'
      },
      {
        key: 'upload_allowed_types',
        value: 'glb,gltf,geojson,kml,kmz,csv,gpx',
        category: 'storage',
        description: 'Allowed file extensions for uploads'
      },
      {
        key: 'map_default_center',
        value: '106.6297,10.8231',
        category: 'map',
        description: 'Default map center coordinates (lng,lat)'
      },
      {
        key: 'map_default_zoom',
        value: '15',
        category: 'map',
        description: 'Default map zoom level'
      },
      {
        key: 'cesium_ion_token',
        value: 'your-cesium-ion-token-here',
        category: 'cesium',
        description: 'Cesium Ion access token for 3D tiles and imagery'
      }
    ];

    for (const config of configurations) {
      await prisma.configuration.upsert({
        where: { key: config.key },
        update: {},
        create: config
      });
      console.log('✅ Configuration created:', config.key);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@dthub.com / admin123');
    console.log('Demo:  demo@dthub.com / demo123');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });