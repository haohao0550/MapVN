const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ModelProcessingService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../../uploads');
    this.wwwrootDir = path.join(__dirname, '../../../wwwroot');
    this.modelsDir = path.join(this.wwwrootDir, '3dmodel');
  }

  async ensureDirectories() {
    await fs.ensureDir(this.uploadsDir);
    await fs.ensureDir(this.modelsDir);
  }

  /**
   * Process GLB file and convert to B3DM format
   * @param {string} glbFilePath - Path to the uploaded GLB file
   * @param {string} modelId - Unique model ID
   * @returns {Promise<Object>} - Processing result
   */
  async processGlbToB3dm(glbFilePath, modelId) {
    try {
      await this.ensureDirectories();
      
      const modelOutputDir = path.join(this.modelsDir, modelId);
      await fs.ensureDir(modelOutputDir);

      const b3dmFilePath = path.join(modelOutputDir, 'model.b3dm');
      const tilesetPath = path.join(modelOutputDir, 'tileset.json');

      // Convert GLB to B3DM using 3d-tiles-tools
      const convertCommand = `npx 3d-tiles-tools glbToB3dm "${glbFilePath}" "${b3dmFilePath}"`;
      
      console.log('Converting GLB to B3DM:', convertCommand);
      
      try {
        const { stdout, stderr } = await execAsync(convertCommand);
        console.log('GLB conversion stdout:', stdout);
        if (stderr) {
          console.log('GLB conversion stderr:', stderr);
        }
        
        // Create tileset.json for B3DM
        const tilesetContent = this.createTilesetJson(modelId);
        await fs.writeJson(tilesetPath, tilesetContent, { spaces: 2 });
        
      } catch (conversionError) {
        console.error('GLB conversion failed:', conversionError);
        
        // Fallback: Just copy the GLB file as a simple model
        console.log('Falling back to copying GLB file...');
        await fs.copy(glbFilePath, path.join(modelOutputDir, 'model.glb'));
        
        // Create a simple tileset.json that references the GLB directly
        const fallbackTileset = this.createFallbackTilesetJson(modelId);
        await fs.writeJson(tilesetPath, fallbackTileset, { spaces: 2 });
      }

      // Clean up original GLB file
      await fs.remove(glbFilePath);

      return {
        success: true,
        b3dmPath: b3dmFilePath,
        tilesetPath: tilesetPath,
        modelDir: modelOutputDir,
        url: `/3dmodel/${modelId}/tileset.json`
      };
    } catch (error) {
      console.error('Error processing GLB to B3DM:', error);
      throw new Error(`Failed to process GLB file: ${error.message}`);
    }
  }

  /**
   * Create tileset.json configuration for B3DM
   * @param {string} modelId - Model ID
   * @returns {Object} - Tileset configuration
   */
  createTilesetJson(modelId) {
    return {
      asset: {
        version: "1.0",
        tilesetVersion: "1.0.0"
      },
      properties: {},
      geometricError: 500,
      root: {
        boundingVolume: {
          box: [0, 0, 0, 100, 0, 0, 0, 100, 0, 0, 0, 100]
        },
        geometricError: 100,
        refine: "REPLACE",
        content: {
          uri: "model.b3dm"
        }
      }
    };
  }

  /**
   * Create fallback tileset.json for GLB files (when B3DM conversion fails)
   * @param {string} modelId - Model ID
   * @returns {Object} - Fallback tileset configuration
   */
  createFallbackTilesetJson(modelId) {
    return {
      asset: {
        version: "1.0",
        tilesetVersion: "1.0.0"
      },
      properties: {},
      geometricError: 500,
      root: {
        boundingVolume: {
          box: [0, 0, 0, 100, 0, 0, 0, 100, 0, 0, 0, 100]
        },
        geometricError: 100,
        refine: "REPLACE",
        content: {
          uri: "model.glb"
        }
      }
    };
  }

  /**
   * Calculate position offset to place model under ground relative to camera
   * @param {Object} cameraPosition - Camera position {longitude, latitude, height}
   * @param {number} offset - Height offset (default: -5 meters)
   * @returns {Object} - Adjusted position
   */
  calculateGroundPosition(cameraPosition, offset = -5) {
    return {
      longitude: cameraPosition.longitude,
      latitude: cameraPosition.latitude,
      height: cameraPosition.height + offset
    };
  }

  /**
   * Delete model files and directories
   * @param {string} modelId - Model ID to delete
   */
  async deleteModelFiles(modelId) {
    try {
      const modelDir = path.join(this.modelsDir, modelId);
      if (await fs.pathExists(modelDir)) {
        await fs.remove(modelDir);
        console.log(`Deleted model directory: ${modelDir}`);
      }
    } catch (error) {
      console.error('Error deleting model files:', error);
      throw error;
    }
  }

  /**
   * Get model file statistics
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} - File stats
   */
  async getFileStats(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      console.error('Error getting file stats:', error);
      return null;
    }
  }
}

module.exports = new ModelProcessingService();
