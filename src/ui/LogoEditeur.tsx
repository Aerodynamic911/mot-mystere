import React from 'react';
import Svg, { Circle, G, Rect } from 'react-native-svg';

/** Emblème d'Occitan Games : une croix aux extrémités arrondies dans un médaillon, inspirée de la croix occitane. */
export default function LogoEditeur({ taille = 120 }: { taille?: number }) {
  const or = '#F5B942';
  const bouts: [number, number][] = [
    [60, 14],
    [60, 106],
    [14, 60],
    [106, 60],
  ];
  return (
    <Svg width={taille} height={taille} viewBox="0 0 120 120">
      <Circle cx={60} cy={60} r={56} fill="rgba(245,185,66,0.10)" stroke={or} strokeWidth={3} />
      <Circle cx={60} cy={60} r={46} fill="none" stroke={or} strokeWidth={1.2} opacity={0.5} />
      <G>
        <Rect x={55} y={22} width={10} height={76} rx={5} fill={or} />
        <Rect x={22} y={55} width={76} height={10} rx={5} fill={or} />
        {bouts.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={7} fill={or} />
        ))}
        <Circle cx={60} cy={60} r={13} fill="#2A0A66" stroke={or} strokeWidth={4} />
        <Circle cx={60} cy={60} r={4} fill={or} />
      </G>
    </Svg>
  );
}
