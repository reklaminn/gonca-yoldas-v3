import React from 'react';
import { Sun, Moon, Monitor, MoonStar } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'light') return <Sun className="h-9 w-9" />;
    if (theme === 'dark') return <Moon className="h-9 w-9" />;
    return <MoonStar className="h-9 w-9" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--fg)] hover:text-[var(--color-accent)] hover:bg-[var(--bg-elev)] transition-all duration-200 rounded-lg h-12 w-12"
          aria-label="Tema değiştir"
        >
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-[var(--bg-card)] border-[var(--border)] text-[var(--fg)]"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`cursor-pointer hover:bg-[var(--bg-elev)] ${
            theme === 'light' ? 'bg-[var(--bg-elev)] font-semibold' : ''
          }`}
        >
          <Sun className="h-5 w-5 mr-2" />
          Açık
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`cursor-pointer hover:bg-[var(--bg-elev)] ${
            theme === 'dark' ? 'bg-[var(--bg-elev)] font-semibold' : ''
          }`}
        >
          <Moon className="h-5 w-5 mr-2" />
          Koyu
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('auto')}
          className={`cursor-pointer hover:bg-[var(--bg-elev)] ${
            theme === 'auto' ? 'bg-[var(--bg-elev)] font-semibold' : ''
          }`}
        >
          <MoonStar className="h-5 w-5 mr-2" />
          Otomatik
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
