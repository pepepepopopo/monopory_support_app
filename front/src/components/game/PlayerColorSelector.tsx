import playerColors from "../../utils/playerColors";

interface Props {
  selectedColor: string;
  onSelect: (color: string) => void;
}

const PlayerColorSelector = ({ selectedColor, onSelect }: Props) => (
  <fieldset className="fieldset">
    <legend className="fieldset-legend">カラー選択</legend>
    <div className="grid grid-cols-4 gap-3">
      {playerColors.map(color => (
        <button
          key={color}
          type="button"
          className={`w-full aspect-square rounded-lg transition-all ${
            selectedColor === color
              ? 'ring-2 ring-offset-2 scale-110'
              : 'hover:scale-105 ring-2 ring-border ring-base-200'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onSelect(color)}
        />
      ))}
    </div>
  </fieldset>
);

export default PlayerColorSelector;
