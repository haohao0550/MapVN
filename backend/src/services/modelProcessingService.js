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
   * Process GLB file and convert to 3D Tiles format
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

      // Convert GLB to B3DM using 3d-tiles-tools CLI
      console.log('Converting GLB to B3DM for model:', modelId);
      
      const convertCommand = `npx 3d-tiles-tools glbToB3dm -i "${glbFilePath}" -o "${b3dmFilePath}"`;
      console.log('Executing command:', convertCommand);
      
      await execAsync(convertCommand);

      // Clean up original GLB file
      await fs.remove(glbFilePath);

      const fileStats = await this.getFileStats(b3dmFilePath);

      return {
        success: true,
        b3dmPath: b3dmFilePath,
        modelDir: modelOutputDir,
        url: `/3dmodel/${modelId}/tileset.json`, // API endpoint, not file path
        fileSize: fileStats?.size || 0
      };
    } catch (error) {
      console.error('Error processing GLB to B3DM:', error);
      throw new Error(`Failed to process GLB file: ${error.message}`);
    }
  }

  /**
   * Create transformation matrix for positioning model in world coordinates, with scale, heading, pitch, roll
   * @param {Object} params - {longitude, latitude, height, scale, heading, pitch, roll}
   * @returns {Array} - 4x4 transformation matrix (column-major)
   */
  createTransformMatrix(params) {
    const { longitude, latitude, height, scale = 1, heading = 0, pitch = 0, roll = 0 } = params;
    // Convert degrees to radians
    const lonRad = longitude * Math.PI / 180;
    const latRad = latitude * Math.PI / 180;
    const headingRad = heading * Math.PI / 180;
    const pitchRad = pitch * Math.PI / 180;
    const rollRad = roll * Math.PI / 180;
    // Earth's radius in meters
    const earthRadius = 6378137.0;
    // Calculate Cartesian coordinates
    const cosLat = Math.cos(latRad);
    const sinLat = Math.sin(latRad);
    const cosLon = Math.cos(lonRad);
    const sinLon = Math.sin(lonRad);
    const x = (earthRadius + height) * cosLat * cosLon;
    const y = (earthRadius + height) * cosLat * sinLon;
    const z = (earthRadius + height) * sinLat;
    // Rotation matrices (heading, pitch, roll)
    // Heading (Z), Pitch (X), Roll (Y) - Tait-Bryan angles
    const ch = Math.cos(headingRad), sh = Math.sin(headingRad);
    const cp = Math.cos(pitchRad), sp = Math.sin(pitchRad);
    const cr = Math.cos(rollRad), sr = Math.sin(rollRad);
    // Compose rotation: R = Rz(heading) * Rx(pitch) * Ry(roll)
    // Column-major order for Cesium
    const m00 = ch * cr + sh * sp * sr;
    const m01 = sr * cp;
    const m02 = -sh * cr + ch * sp * sr;
    const m10 = -ch * sr + sh * sp * cr;
    const m11 = cr * cp;
    const m12 = sr * sh + ch * sp * cr;
    const m20 = sh * cp;
    const m21 = -sp;
    const m22 = ch * cp;
    // Apply scale
    return [
      m00 * scale, m01 * scale, m02 * scale, 0,
      m10 * scale, m11 * scale, m12 * scale, 0,
      m20 * scale, m21 * scale, m22 * scale, 0,
      x, y, z, 1
    ];
  }

  /**
   * Generate tileset.json dynamically for a model, supporting scale, heading, roll, pitch
   * @param {string} modelId - Model ID
   * @param {Object} model - Model data from database (should include longitude, latitude, height, scale, heading, roll, pitch)
   * @returns {Object} - Tileset configuration
   */
  generateTilesetJson(modelId, model) {
    const tileset = {
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
          uri: `model.b3dm`
        }
      }
    };

    // Add transformation matrix if model position is available
    if (model && model.longitude !== undefined && model.latitude !== undefined && model.height !== undefined) {
      tileset.root.transform = this.createTransformMatrix({
        longitude: model.longitude,
        latitude: model.latitude,
        height: model.height,
        scale: model.scale || 1,
        heading: model.heading || 0,
        pitch: model.pitch || 0,
        roll: model.roll || 0
      });
    }

    return tileset;
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
   * Get tileset information for a model
   * @param {string} modelId - Model ID
   * @param {Object} model - Model data from database
   * @returns {Promise<Object>} - Tileset data
   */
  async getTilesetInfo(modelId, model) {
    try {
      const b3dmPath = path.join(this.modelsDir, modelId, 'model.b3dm');
      
      if (!await fs.pathExists(b3dmPath)) {
        throw new Error('B3DM file not found');
      }
      
      const tileset = this.generateTilesetJson(modelId, model);
      const stats = await this.getFileStats(b3dmPath);
      
      return {
        tileset,
        tilesetUrl: `/3dmodel/${modelId}/tileset.json`,
        b3dmUrl: `/3dmodel/${modelId}/model.b3dm`,
        fileSize: stats?.size || 0,
        lastModified: stats?.modified
      };
    } catch (error) {
      console.error('Error getting tileset info:', error);
      throw error;
    }
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
