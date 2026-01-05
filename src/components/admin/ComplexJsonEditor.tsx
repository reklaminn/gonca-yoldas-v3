import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { JsonListEditor } from './JsonListEditor';

interface ComplexJsonEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  sectionKey: string;
}

export const ComplexJsonEditor: React.FC<ComplexJsonEditorProps> = ({ value, onChange, sectionKey }) => {
  const [parsedValue, setParsedValue] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Handle case where value might already be an object (though prop says string)
      // or if it's a stringified JSON
      let parsed;
      if (typeof value === 'object' && value !== null) {
        parsed = value;
      } else {
        parsed = value ? JSON.parse(value) : {};
      }
      setParsedValue(parsed);
      setError(null);
    } catch (e) {
      setParsedValue(null);
      setError('Geçersiz JSON formatı');
    }
  }, [value]);

  const updateField = (field: string, newValue: any) => {
    const updated = { ...parsedValue, [field]: newValue };
    setParsedValue(updated);
    onChange(JSON.stringify(updated));
  };

  // Helper to update items array in complex objects
  const updateItemsList = (newItemsJson: string, fieldName: string = 'items') => {
    try {
      const items = JSON.parse(newItemsJson);
      updateField(fieldName, items);
    } catch (e) {
      console.error('Error updating list:', e);
    }
  };

  if (error || !parsedValue) {
    return (
      <div className="space-y-2">
        <div className="text-red-500 text-sm">{error || 'Veri yüklenemedi'}</div>
        <Textarea 
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)} 
          onChange={(e) => onChange(e.target.value)} 
          className="font-mono text-xs"
          rows={5}
        />
      </div>
    );
  }

  // 1. Credentials Editors (Academic, Certificates, Expertise)
  // Structure: { title: string, items: string[] }
  if (sectionKey.includes('credentials_')) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
        <div className="space-y-2">
          <Label>Bölüm Başlığı</Label>
          <Input 
            value={parsedValue.title || ''} 
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Örn: Akademik Eğitim"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Liste Öğeleri</Label>
          <JsonListEditor 
            value={JSON.stringify(parsedValue.items || [])} 
            onChange={(val) => updateItemsList(val, 'items')}
            sectionKey={`${sectionKey}_items`}
          />
        </div>
      </div>
    );
  }

  // 2. Institutional Services Editor
  // Structure: { title: string, description: string, items: string[] }
  if (sectionKey.includes('institutional_services')) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
        <div className="space-y-2">
          <Label>Hizmetler Başlığı</Label>
          <Input 
            value={parsedValue.title || ''} 
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Örn: Kurumsal Hizmetler"
          />
        </div>

        <div className="space-y-2">
          <Label>Genel Açıklama</Label>
          <Textarea 
            value={parsedValue.description || ''} 
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Hizmetler hakkında genel açıklama..."
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Hizmet Listesi</Label>
          <JsonListEditor 
            value={JSON.stringify(parsedValue.items || [])} 
            onChange={(val) => updateItemsList(val, 'items')}
            sectionKey={`${sectionKey}_items`}
          />
        </div>
      </div>
    );
  }

  // 3. Program Editors (Parent Programs, Children Course)
  // Structure: { title, description, age, color, features: [] }
  if (sectionKey.includes('parent_program_') || sectionKey.includes('children_course')) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Program Başlığı</Label>
            <Input 
              value={parsedValue.title || ''} 
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Program Adı"
            />
          </div>
          <div className="space-y-2">
            <Label>Yaş Grubu</Label>
            <Input 
              value={parsedValue.age || ''} 
              onChange={(e) => updateField('age', e.target.value)}
              placeholder="Örn: 0-2 Yaş"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Açıklama</Label>
          <Textarea 
            value={parsedValue.description || ''} 
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Program hakkında kısa açıklama..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Renk Teması (CSS Class veya Hex)</Label>
          <div className="flex gap-2">
            <Input 
              value={parsedValue.color || ''} 
              onChange={(e) => updateField('color', e.target.value)}
              placeholder="from-blue-500 to-purple-500"
            />
            <div className={`w-10 h-10 rounded border bg-gradient-to-r ${parsedValue.color}`}></div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Özellikler Listesi</Label>
          <JsonListEditor 
            value={JSON.stringify(parsedValue.features || [])} 
            onChange={(val) => updateItemsList(val, 'features')}
            sectionKey={`${sectionKey}_features`}
          />
        </div>
      </div>
    );
  }

  // Default fallback for unknown JSON structures (Arrays)
  if (Array.isArray(parsedValue)) {
    return (
      <JsonListEditor 
        value={typeof value === 'string' ? value : JSON.stringify(value)} 
        onChange={onChange} 
        sectionKey={sectionKey} 
      />
    );
  }

  // Fallback for unknown Objects -> Raw JSON Textarea
  return (
    <div className="space-y-2">
      <Label className="text-yellow-600">Ham JSON Düzenleyici</Label>
      <Textarea 
        value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)} 
        onChange={(e) => onChange(e.target.value)} 
        className="font-mono text-sm"
        rows={8}
      />
    </div>
  );
};
