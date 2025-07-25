const fs = require('fs-extra');
const path = require('path');
const modelProcessingService = require('./src/services/modelProcessingService');

async function testConversion() {
  try {
    console.log('Testing GLB to B3DM conversion...');
    
    // Create a test directory
    const testDir = path.join(__dirname, 'test');
    await fs.ensureDir(testDir);
    
    // Create a simple GLB structure for testing (this is just a placeholder)
    // In real usage, you would have an actual GLB file uploaded by user
    const testGLBPath = path.join(testDir, 'test.glb');
    
    // For now, let's just create a dummy file to test the workflow
    await fs.writeFile(testGLBPath, Buffer.from('dummy glb content'));
    
    console.log('Created test GLB file:', testGLBPath);
    
    // Test position
    const testPosition = {
      longitude: 106.6297,
      latitude: 10.8231,
      height: 50
    };
    
    const modelId = 'test-model-123';
    
    // This will fail because we don't have a real GLB file, but it will show us the workflow
    try {
      const result = await modelProcessingService.processGlbToB3dm(
        testGLBPath,
        modelId,
        testPosition
      );
      console.log('Conversion successful:', result);
    } catch (error) {
      console.log('Expected error (dummy GLB file):', error.message);
    }
    
    // Clean up
    await fs.remove(testDir);
    
    console.log('Test completed!');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testConversion();
