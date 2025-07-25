const { glbToB3dm, glbToTileset } = require('3d-tiles-tools');
const fs = require('fs-extra');
const path = require('path');

async function test3DTilesConversion() {
  try {
    console.log('Testing 3D Tiles tools...');
    
    // Test if the library is working
    console.log('glbToB3dm function:', typeof glbToB3dm);
    console.log('glbToTileset function:', typeof glbToTileset);
    
    // Test creating a simple tileset structure
    const testTileset = {
      asset: {
        version: "1.1",
        tilesetVersion: "1.0.0",
        generator: "DTHub 3D Tiles Converter"
      },
      properties: {},
      geometricError: 500,
      root: {
        boundingVolume: {
          box: [0, 0, 0, 50, 0, 0, 0, 50, 0, 0, 0, 50]
        },
        geometricError: 16,
        refine: "REPLACE",
        content: {
          uri: "tileset.b3dm"
        }
      }
    };
    
    console.log('Test tileset structure:', JSON.stringify(testTileset, null, 2));
    console.log('3D Tiles tools test completed successfully!');
    
  } catch (error) {
    console.error('Error testing 3D Tiles tools:', error);
  }
}

test3DTilesConversion();
