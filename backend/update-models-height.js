const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateModelsToGroundLevel() {
  try {
    console.log('Updating all models to ground level (height = 0)...');
    
    const result = await prisma.model.updateMany({
      where: {
        active: true
      },
      data: {
        height: 0
      }
    });
    
    console.log(`Updated ${result.count} models to ground level`);
    
    // Verify the update
    const models = await prisma.model.findMany({
      where: { active: true },
      select: { id: true, name: true, height: true, longitude: true, latitude: true }
    });
    
    console.log('Current models:');
    models.forEach(model => {
      console.log(`- ${model.name}: ${model.longitude}, ${model.latitude}, height: ${model.height}`);
    });
    
  } catch (error) {
    console.error('Error updating models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateModelsToGroundLevel();
