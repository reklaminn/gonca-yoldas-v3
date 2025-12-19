import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonListEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  sectionKey: string;
}

export const JsonListEditor: React.FC<JsonListEditorProps> = ({ value, onChange, sectionKey }) => {
  const [items, setItems] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value ? [value] : [''];
    }
  });

  const updateItems = (newItems: string[]) => {
    setItems(newItems);
    onChange(JSON.stringify(newItems.filter(item => item.trim() !== '')));
  };

  const addItem = () => {
    updateItems([...items, '']);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    updateItems(newItems.length > 0 ? newItems : ['']);
  };

  const handleChange = (index: number, newValue: string) => {
    const newItems = [...items];
    newItems[index] = newValue;
    updateItems(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Duyuru Listesi
        </label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          Ekle
        </Button>
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <Input
                value={item}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={`${index + 1}. duyuru metni...`}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              disabled={items.length === 1 && item === ''}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 italic">
        * Boş bırakılan satırlar kaydedilmez.
      </p>
    </div>
  );
};
