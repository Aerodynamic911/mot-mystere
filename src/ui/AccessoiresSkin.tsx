import React from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * Accessoires dessinés par-dessus la mascotte (viewBox 200 × 190), un jeu par skin.
 * Ce sont des évocations originales (couvre-chef, perruque, lunettes…), pas des reproductions de personnages.
 */
export default function AccessoiresSkin({ skin }: { skin: string }) {
  switch (skin) {
    case 'empereur':
      // Bicorne noir et or avec cocarde, épaulettes dorées.
      return (
        <G>
          <Path d="M8 52 Q28 8 100 6 Q172 8 192 52 Q150 36 100 38 Q50 36 8 52 Z" fill="#17172B" stroke="#E5B338" strokeWidth="3" strokeLinejoin="round" />
          <Path d="M30 40 Q100 22 170 40" stroke="#E5B338" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Circle cx="100" cy="24" r="8" fill="#E8453C" stroke="#FFFFFF" strokeWidth="2" />
          <Circle cx="100" cy="24" r="3.5" fill="#2F4FD0" />
          <Rect x="22" y="70" width="22" height="8" rx="4" fill="#E5B338" stroke="#8A5206" strokeWidth="1" />
          <Rect x="156" y="70" width="22" height="8" rx="4" fill="#E5B338" stroke="#8A5206" strokeWidth="1" />
        </G>
      );
    case 'cleopatre':
      // Coiffe rayée bleu et or, serpent doré, traits d'eye-liner.
      return (
        <G>
          <Path d="M14 54 Q12 96 26 128 L40 124 L38 58 Z" fill="#1F55C9" stroke="#E5B338" strokeWidth="2" strokeLinejoin="round" />
          <Path d="M186 54 Q188 96 174 128 L160 124 L162 58 Z" fill="#1F55C9" stroke="#E5B338" strokeWidth="2" strokeLinejoin="round" />
          <Path d="M17 72 L38 72 M18 90 L38 90 M21 108 L39 108" stroke="#E5B338" strokeWidth="3" />
          <Path d="M183 72 L162 72 M182 90 L162 90 M179 108 L161 108" stroke="#E5B338" strokeWidth="3" />
          <Path d="M18 52 Q100 22 182 52 L182 60 Q100 34 18 60 Z" fill="#E5B338" stroke="#8A5206" strokeWidth="1.2" />
          <Path d="M100 40 Q92 28 100 14 Q108 28 100 40 Z" fill="#E5B338" stroke="#8A5206" strokeWidth="1.2" />
          <Circle cx="100" cy="22" r="2" fill="#1F55C9" />
          <Path d="M52 109 Q72 100 90 108" stroke="#1B1033" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M148 109 Q128 100 110 108" stroke="#1B1033" strokeWidth="3" strokeLinecap="round" fill="none" />
        </G>
      );
    case 'roi-soleil':
      // Grande perruque bouclée et couronne dorée.
      return (
        <G>
          {[[18, 76], [14, 98], [18, 120], [26, 140], [182, 76], [186, 98], [182, 120], [174, 140]].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r="13" fill="#6B3F1D" stroke="#4A2A10" strokeWidth="1.5" />
          ))}
          <Path d="M20 58 Q100 30 180 58 L180 50 Q100 20 20 50 Z" fill="#6B3F1D" />
          <Path d="M52 44 L60 18 L80 34 L100 10 L120 34 L140 18 L148 44 Z" fill="#F5B942" stroke="#8A5206" strokeWidth="2" strokeLinejoin="round" />
          <Circle cx="100" cy="30" r="4" fill="#E8453C" />
          <Circle cx="72" cy="36" r="3" fill="#3DB1FF" />
          <Circle cx="128" cy="36" r="3" fill="#3DB1FF" />
          <Path d="M80 130 Q92 124 100 130 Q108 124 120 130" stroke="#4A2A10" strokeWidth="3" strokeLinecap="round" fill="none" />
        </G>
      );
    case 'savant':
      // Cheveux blancs ébouriffés, lunettes rondes, moustache.
      return (
        <G>
          {[[22, 56], [40, 40], [62, 34], [100, 30], [138, 34], [160, 40], [178, 56], [14, 78], [186, 78]].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r="13" fill="#F4F4F8" stroke="#B8BCCB" strokeWidth="1.5" />
          ))}
          <Circle cx="73" cy="113" r="22" fill="#FFFFFF" fillOpacity="0.18" stroke="#2A2A3A" strokeWidth="3.5" />
          <Circle cx="127" cy="113" r="22" fill="#FFFFFF" fillOpacity="0.18" stroke="#2A2A3A" strokeWidth="3.5" />
          <Path d="M95 112 Q100 107 105 112" stroke="#2A2A3A" strokeWidth="3.5" fill="none" />
          <Path d="M78 132 Q90 124 100 132 Q110 124 122 132 Q112 140 100 135 Q88 140 78 132 Z" fill="#F4F4F8" stroke="#B8BCCB" strokeWidth="1.5" />
        </G>
      );
    case 'compositeur':
      // Perruque poudrée à boucles latérales, ruban et nœud.
      return (
        <G>
          <Path d="M20 58 Q24 22 100 18 Q176 22 180 58 Q140 40 100 42 Q60 40 20 58 Z" fill="#F7F5FA" stroke="#BDB8CC" strokeWidth="1.8" />
          {[[14, 76], [14, 96], [186, 76], [186, 96]].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r="11" fill="#F7F5FA" stroke="#BDB8CC" strokeWidth="1.6" />
          ))}
          <Path d="M92 56 L108 56 L104 68 L96 68 Z" fill="#E8453C" />
          <Path d="M86 54 L100 62 L86 70 Z M114 54 L100 62 L114 70 Z" fill="#C2342C" />
          <Path d="M150 40 Q166 34 160 50" stroke="#1B1033" strokeWidth="0" fill="none" />
        </G>
      );
    case 'astronaute':
      // Casque en bulle de verre, avec reflet.
      return (
        <G>
          <Ellipse cx="100" cy="96" rx="97" ry="86" fill="#CFE8FF" fillOpacity="0.14" stroke="#DCEEFF" strokeWidth="4" />
          <Path d="M34 58 Q58 24 96 22" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" strokeOpacity="0.7" />
          <Rect x="70" y="170" width="60" height="9" rx="4.5" fill="#9AA6C4" stroke="#6F7A96" strokeWidth="1.5" />
          <Circle cx="60" cy="174" r="3" fill="#E8453C" />
        </G>
      );
    case 'pirate':
      // Tricorne noir à tête de mort, bandeau sur l'œil, boucle d'oreille.
      return (
        <G>
          <Path d="M10 56 Q30 8 100 6 Q170 8 190 56 Q150 40 100 42 Q50 40 10 56 Z" fill="#14141F" stroke="#E5B338" strokeWidth="2.4" strokeLinejoin="round" />
          <Circle cx="100" cy="26" r="9" fill="#F4F4F8" />
          <Rect x="94" y="32" width="12" height="6" rx="2" fill="#F4F4F8" />
          <Circle cx="96" cy="25" r="2" fill="#14141F" />
          <Circle cx="104" cy="25" r="2" fill="#14141F" />
          <Path d="M82 38 L118 18 M82 18 L118 38" stroke="#F4F4F8" strokeWidth="2.4" strokeLinecap="round" />
          <Path d="M50 82 L152 104" stroke="#14141F" strokeWidth="3" strokeLinecap="round" />
          <Ellipse cx="73" cy="113" rx="20" ry="23" fill="#14141F" />
          <Circle cx="14" cy="120" r="5" fill="none" stroke="#E5B338" strokeWidth="3" />
        </G>
      );
    case 'explorateur':
      // Chapeau de brousse kaki.
      return (
        <G>
          <Ellipse cx="100" cy="46" rx="92" ry="14" fill="#C9A26A" stroke="#7A5A2A" strokeWidth="2" />
          <Path d="M48 46 Q50 8 100 6 Q150 8 152 46 Q100 56 48 46 Z" fill="#DDB97E" stroke="#7A5A2A" strokeWidth="2" strokeLinejoin="round" />
          <Path d="M50 38 Q100 48 150 38 L151 46 Q100 56 49 46 Z" fill="#7A4A1E" />
          <Rect x="94" y="38" width="12" height="9" rx="2" fill="#E5B338" />
        </G>
      );
    default:
      return null;
  }
}
