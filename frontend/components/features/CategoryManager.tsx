'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tags, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryManagerProps {
  authToken: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ authToken }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: ''
  });

  // Load categories from API
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${BACKEND_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('Failed to load categories:', result.message);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle create category
  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${BACKEND_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          parentId: formData.parentId || null
        })
      });

      const result = await response.json();
      if (result.success) {
        setCategories(prev => [...prev, result.data]);
        setFormData({ name: '', description: '', parentId: '' });
        setIsCreating(false);
      } else {
        alert(`Failed to create category: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category');
    } finally {
      setLoading(false);
    }
  };

  // Handle update category
  const handleUpdateCategory = async () => {
    if (!editingCategory || !formData.name.trim()) return;

    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${BACKEND_URL}/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          parentId: formData.parentId || null
        })
      });

      const result = await response.json();
      if (result.success) {
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, ...formData }
            : cat
        ));
        setEditingCategory(null);
        setFormData({ name: '', description: '', parentId: '' });
      } else {
        alert(`Failed to update category: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${BACKEND_URL}/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      } else {
        alert(`Failed to delete category: ${result.message}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || ''
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCategory(null);
    setIsCreating(false);
    setFormData({ name: '', description: '', parentId: '' });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Tags className="w-5 h-5" />
          Categories Management
        </h3>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isCreating || editingCategory !== null}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingCategory) && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">
            {isCreating ? 'Create New Category' : 'Edit Category'}
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter category description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Parent Category
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- No Parent --</option>
                {categories
                  .filter(cat => editingCategory ? cat.id !== editingCategory.id : true)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={isCreating ? handleCreateCategory : handleUpdateCategory}
                disabled={loading || !formData.name.trim()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={cancelEditing}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Categories List */}
      <div className="space-y-2">
        {loading && categories.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Tags className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No categories found</p>
            <p className="text-sm">Create your first category to get started</p>
          </div>
        ) : (
          categories.map((category) => (
            <Card
              key={category.id}
              className={`p-3 transition-colors ${
                editingCategory?.id === category.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{category.name}</h4>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                    {category.parentId && (
                      <span className="ml-2">
                        Parent: {categories.find(c => c.id === category.parentId)?.name || 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing(category)}
                    disabled={isCreating || editingCategory !== null}
                    title="Edit category"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={loading}
                    title="Delete category"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={loadCategories}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Categories'}
        </Button>
      </div>
    </div>
  );
};

export default CategoryManager;
