import { useState } from 'react';
import { X } from 'lucide-react';
import type { MenuCategory } from '@/shared/types';

interface MenuFormProps {
  type: 'category' | 'item';
  onClose: () => void;
  onSuccess: () => void;
  categories?: MenuCategory[];
  editData?: any; // Item or category to edit
}

export default function MenuForm({ type, onClose, onSuccess, categories = [], editData }: MenuFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    description: editData?.description || '',
    display_order: editData?.display_order || 0,
    category_id: editData?.category_id?.toString() || '',
    price: editData?.price?.toString() || '',
    image_url: editData?.image_url || '',
    preparation_time: editData?.preparation_time?.toString() || '15',
    is_available: editData?.is_available !== undefined ? editData.is_available : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalImageUrl = '';

    try {
      // Step 1: Upload the image if a file is selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const err = await uploadResponse.json();
          throw new Error(err.error || 'Image upload failed');
        }

        const uploadResult = await uploadResponse.json();
        finalImageUrl = uploadResult.url;
      }

      // Step 2: Submit the form data
      const isEditing = !!editData;
      const endpoint = type === 'category' 
        ? (isEditing ? `/api/menu/categories/${editData.id}` : '/api/menu/categories')
        : (isEditing ? `/api/menu/items/${editData.id}` : '/api/menu/items');
      
      const payload = type === 'category'
        ? {
            name: formData.name,
            description: formData.description || null,
            display_order: Number(formData.display_order),
          }
        : {
            category_id: Number(formData.category_id),
            name: formData.name,
            description: formData.description || null,
            price: Number(formData.price),
            image_url: finalImageUrl || formData.image_url || null,
            preparation_time: Number(formData.preparation_time),
            is_available: formData.is_available,
          };

      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save menu item');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {editData ? 'Edit' : 'Add'} {type === 'category' ? 'Category' : 'Menu Item'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" placeholder={type === 'category' ? 'e.g., Appetizers' : 'e.g., Samosas'}/>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" rows={3} placeholder={type === 'category' ? 'Describe this category...' : 'Describe this menu item...'}/>
          </div>

          {type === 'category' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Display Order</label>
              <input type="number" min="0" value={formData.display_order} onChange={(e) => setFormData(prev => ({ ...prev, display_order: Number(e.target.value) }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"/>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                <select required value={formData.category_id} onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                  <option value="">Select a category</option>
                  {categories.map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price (KSh) *</label>
                <input type="number" step="0.01" min="0" required value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" placeholder="0.00"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} 
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preparation Time (minutes)</label>
                <input type="number" min="1" value={formData.preparation_time} onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"/>
              </div>

              {editData && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium text-slate-700">Available for ordering</label>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-yellow-500 hover:text-black transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : (editData ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

