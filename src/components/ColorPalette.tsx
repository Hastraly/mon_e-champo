import { Check } from 'lucide-react';

const COLORS = [
  { name: 'Rose', value: '#FF6B9D' },
  { name: 'Coral', value: '#FF8C42' },
  { name: 'Sunset', value: '#FFA94D' },
  { name: 'Honey', value: '#FFD93D' },
  { name: 'Lime', value: '#95E1D3' },
  { name: 'Mint', value: '#6BCB77' },
  { name: 'Turquoise', value: '#4ECDC4' },
  { name: 'Ocean', value: '#45B7D1' },
  { name: 'Sky', value: '#5DADE2' },
  { name: 'Lavender', value: '#A8DADC' },
  { name: 'Sage', value: '#B4C7A3' },
  { name: 'Peach', value: '#FFABAB' },
  { name: 'Salmon', value: '#FF9AA2' },
  { name: 'Marigold', value: '#FFC75F' },
  { name: 'Emerald', value: '#45B384' },
  { name: 'Teal', value: '#36CFC9' },
];

interface ColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export default function ColorPalette({ selectedColor, onColorSelect }: ColorPaletteProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onColorSelect(color.value)}
          className="group relative w-10 h-10 rounded-xl transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          style={{ backgroundColor: color.value }}
          title={color.name}
        >
          {selectedColor === color.value && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="w-5 h-5 text-white drop-shadow-lg" strokeWidth={3} />
            </div>
          )}
          <div className="absolute inset-0 rounded-xl ring-2 ring-white group-hover:ring-4 transition-all" />
        </button>
      ))}
    </div>
  );
}
