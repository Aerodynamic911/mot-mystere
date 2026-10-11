import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

/** Version minuscule de Cluby, pour se promener sur la carte de l'aventure. */
export default function MiniMascotte({ taille = 40 }: { taille?: number }) {
  return (
    <Svg width={taille} height={taille * 0.95} viewBox="0 0 200 190">
      <Ellipse cx={100} cy={178} rx={58} ry={9} fill="rgba(0,0,0,0.25)" />
      <Rect x={55} y={158} width={30} height={16} rx={8} fill="#5B3FD6" />
      <Rect x={115} y={158} width={30} height={16} rx={8} fill="#5B3FD6" />
      <Rect x={28} y={58} width={144} height={106} rx={26} fill="#F6B73D" />
      <Rect x={20} y={40} width={160} height={36} rx={16} fill="#7A58F0" />
      <Rect x={86} y={34} width={28} height={14} rx={7} fill="#FFD36B" />
      <Ellipse cx={73} cy={110} rx={14} ry={17} fill="#FFFFFF" />
      <Ellipse cx={127} cy={110} rx={14} ry={17} fill="#FFFFFF" />
      <Circle cx={76} cy={112} r={8} fill="#2A1B5C" />
      <Circle cx={124} cy={112} r={8} fill="#2A1B5C" />
      <Path d="M82 134 Q100 152 118 134 Q100 140 82 134 Z" fill="#2A1B5C" stroke="#2A1B5C" strokeWidth={3} strokeLinejoin="round" />
    </Svg>
  );
}
