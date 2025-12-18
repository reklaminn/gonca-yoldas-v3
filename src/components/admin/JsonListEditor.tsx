import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface JsonListEditorProps {
  value: string;
  onChange: (value: string) => void;
  sectionKey: string;
}

interface SortableItemProps {
  id: string;
  item: any;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onDelete: (index: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  item,
  index,
  onUpdate,
  onDelete,
  isExpanded,
  onToggleExpand,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderFields = () => {
    if (typeof item === 'string') {
      return (
        <Textarea
          value={item}
          onChange={(e) => onUpdate(index, '', e.target.value)}
          rows={2}
          className="w-full"
        />
      );
    }

    return Object.entries(item).map(([key, val]) => {
      if (Array.isArray(val)) {
        return (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium capitalize">{key}</Label>
            {val.map((subItem: string, subIndex: number) => (
              <div key={subIndex} className="flex gap-2">
                <Input
                  value={subItem}
                  onChange={(e) => {
                    const newArray = [...val];
                    newArray[subIndex] = e.target.value;
                    onUpdate(index, key, newArray);
                  }}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newArray = val.filter((_, i) => i !== subIndex);
                    onUpdate(index, key, newArray);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate(index, key, [...val, ''])}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ekle
            </Button>
          </div>
        );
      }

      return (
        <div key={key} className="space-y-2">
          <Label className="text-sm font-medium capitalize">{key}</Label>
          {typeof val === 'string' && val.length > 50 ? (
            <Textarea
              value={val as string}
              onChange={(e) => onUpdate(index, key, e.target.value)}
              rows={3}
            />
          ) : (
            <Input
              value={val as string}
              onChange={(e) => onUpdate(index, key, e.target.value)}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50')}>
      <Card className="mb-3">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <button
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <CardTitle className="text-sm flex-1">
              Öğe {index + 1}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-4">
            {renderFields()}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export const JsonListEditor: React.FC<JsonListEditorProps> = ({
  value,
  onChange,
  sectionKey,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '[]');
      setItems(Array.isArray(parsed) ? parsed : [parsed]);
    } catch {
      setItems([]);
    }
  }, [value]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((_, i) => i.toString() === active.id);
      const newIndex = items.findIndex((_, i) => i.toString() === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onChange(JSON.stringify(newItems, null, 2));
    }
  };

  const handleUpdate = (index: number, field: string, val: any) => {
    const newItems = [...items];
    if (field === '') {
      newItems[index] = val;
    } else {
      newItems[index] = { ...newItems[index], [field]: val };
    }
    setItems(newItems);
    onChange(JSON.stringify(newItems, null, 2));
  };

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(JSON.stringify(newItems, null, 2));
  };

  const handleAdd = () => {
    const template = items.length > 0 ? { ...items[0] } : '';
    const newItems = [...items, template];
    setItems(newItems);
    setExpandedItems(new Set([...expandedItems, items.length]));
    onChange(JSON.stringify(newItems, null, 2));
  };

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Liste Düzenleyici ({items.length} öğe)
        </Label>
        <Button onClick={handleAdd} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Öğe Ekle
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>Henüz öğe eklenmemiş</p>
          <Button onClick={handleAdd} size="sm" variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            İlk Öğeyi Ekle
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((item, index) => (
                <SortableItem
                  key={index}
                  id={index.toString()}
                  item={item}
                  index={index}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isExpanded={expandedItems.has(index)}
                  onToggleExpand={() => toggleExpand(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
