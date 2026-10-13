import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * Dessin de la mascotte (viewBox 200 × 190), partagé par la grande mascotte de l'accueil et la mini-mascotte de la carte.
 * Boîte-mystère en volume : face arrière en retrait, reflets, rivets dorés, couvercle épais avec fermoir, ampoule à l'antenne.
 */
export default function CorpsMascotte({ largeur, hauteur, yeuxFermes = false }: { largeur: number; hauteur: number; yeuxFermes?: boolean }) {
  return (
    <Svg width={largeur} height={hauteur} viewBox="0 0 200 190">
    <Defs >
      <LinearGradient id="gCorps" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFE08A" />
        <Stop offset="0.5" stopColor="#FBBC3E" />
        <Stop offset="1" stopColor="#E8941C" />
      </LinearGradient>
      <RadialGradient id="gLuisant" cx="0.28" cy="0.2" r="0.75">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.6" />
        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </RadialGradient>
      <LinearGradient id="gOmbre" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#9A5200" stopOpacity="0" />
        <Stop offset="1" stopColor="#9A5200" stopOpacity="0.45" />
      </LinearGradient>
      <LinearGradient id="gCouvercle" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#B49CFF" />
        <Stop offset="0.5" stopColor="#7A58F0" />
        <Stop offset="1" stopColor="#4B2FB8" />
      </LinearGradient>
      <LinearGradient id="gPied" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#8C6BFF" />
        <Stop offset="1" stopColor="#4328A8" />
      </LinearGradient>
      <LinearGradient id="gOr" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFF0B8" />
        <Stop offset="0.5" stopColor="#F5B942" />
        <Stop offset="1" stopColor="#B97A0A" />
      </LinearGradient>
      <RadialGradient id="gOeil" cx="0.5" cy="0.38" r="0.65">
        <Stop offset="0" stopColor="#8F72F0" />
        <Stop offset="0.55" stopColor="#4A2FB5" />
        <Stop offset="1" stopColor="#1E1245" />
      </RadialGradient>
      <RadialGradient id="gJoue" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#FF6B8A" stopOpacity="0.85" />
        <Stop offset="1" stopColor="#FF6B8A" stopOpacity="0" />
      </RadialGradient>
      <RadialGradient id="gAmpoule" cx="0.4" cy="0.35" r="0.65">
        <Stop offset="0" stopColor="#FFFFFF" />
        <Stop offset="0.45" stopColor="#FFF1A8" />
        <Stop offset="1" stopColor="#F5B942" />
      </RadialGradient>
      <RadialGradient id="gHalo" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#FFF1A8" stopOpacity="0.75" />
        <Stop offset="1" stopColor="#FFF1A8" stopOpacity="0" />
      </RadialGradient>
      <RadialGradient id="gGant" cx="0.35" cy="0.3" r="0.8">
        <Stop offset="0" stopColor="#FFFFFF" />
        <Stop offset="0.7" stopColor="#EDE8FF" />
        <Stop offset="1" stopColor="#B9AEE8" />
      </RadialGradient>
    </Defs>
    <Ellipse cx="100" cy="179" rx="64" ry="9" fill="#000" fillOpacity="0.2" />
    <Ellipse cx="100" cy="179" rx="40" ry="5" fill="#000" fillOpacity="0.22" />
    <Rect x="52" y="155" width="36" height="21" rx="10.5" fill="url(#gPied)" stroke="#2F1C80" strokeWidth="1.5" />
    <Rect x="112" y="155" width="36" height="21" rx="10.5" fill="url(#gPied)" stroke="#2F1C80" strokeWidth="1.5" />
    <Rect x="58" y="158.5" width="15" height="4" rx="2" fill="#FFFFFF" fillOpacity="0.4" />
    <Rect x="118" y="158.5" width="15" height="4" rx="2" fill="#FFFFFF" fillOpacity="0.4" />
    <Path d="M34 114 Q8 106 14 80" stroke="#A8620A" strokeWidth="16" strokeLinecap="round" fill="none" />
    <Path d="M34 114 Q8 106 14 80" stroke="#F5B03A" strokeWidth="12" strokeLinecap="round" fill="none" />
    <Path d="M33 111 Q11 104 16 82" stroke="#FFE08A" strokeWidth="4" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
    <Path d="M166 114 Q194 122 188 98" stroke="#A8620A" strokeWidth="16" strokeLinecap="round" fill="none" />
    <Path d="M166 114 Q194 122 188 98" stroke="#F5B03A" strokeWidth="12" strokeLinecap="round" fill="none" />
    <Path d="M167 111 Q191 118 186 99" stroke="#FFE08A" strokeWidth="4" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
    <Circle cx="14" cy="74" r="12" fill="url(#gGant)" stroke="#8E82C8" strokeWidth="1.2" />
    <Circle cx="6" cy="72" r="4.5" fill="url(#gGant)" stroke="#8E82C8" strokeWidth="1" />
    <Circle cx="189" cy="92" r="12" fill="url(#gGant)" stroke="#8E82C8" strokeWidth="1.2" />
    <Circle cx="197" cy="90" r="4.5" fill="url(#gGant)" stroke="#8E82C8" strokeWidth="1" />
    <Rect x="33" y="66" width="144" height="102" rx="26" fill="#9C5A08" />
    <Rect x="28" y="58" width="144" height="106" rx="26" fill="url(#gCorps)" stroke="#B97410" strokeWidth="2" />
    <Rect x="28" y="58" width="144" height="106" rx="26" fill="url(#gLuisant)" />
    <Rect x="28" y="108" width="144" height="56" rx="26" fill="url(#gOmbre)" />
    <Rect x="35" y="84" width="7" height="58" rx="3.5" fill="#FFFFFF" fillOpacity="0.3" />
    <Rect x="35" y="147" width="14" height="4" rx="2" fill="#FFFFFF" fillOpacity="0.22" />
    <Circle cx="42" cy="152" r="5" fill="#8A5206" />
    <Circle cx="42" cy="151.5" r="3.8" fill="url(#gOr)" />
    <Circle cx="158" cy="152" r="5" fill="#8A5206" />
    <Circle cx="158" cy="151.5" r="3.8" fill="url(#gOr)" />
    <Circle cx="40" cy="92" r="4.2" fill="#8A5206" />
    <Circle cx="40" cy="91.6" r="3.2" fill="url(#gOr)" />
    <Circle cx="160" cy="92" r="4.2" fill="#8A5206" />
    <Circle cx="160" cy="91.6" r="3.2" fill="url(#gOr)" />
    <Rect x="26" y="70" width="148" height="16" rx="8" fill="#6B3A00" fillOpacity="0.28" />
    <Rect x="18" y="52" width="164" height="26" rx="13" fill="#2F1C80" />
    <Rect x="18" y="40" width="164" height="35" rx="17" fill="url(#gCouvercle)" stroke="#2F1C80" strokeWidth="2" />
    <Rect x="31" y="45" width="66" height="7" rx="3.5" fill="#FFFFFF" fillOpacity="0.42" />
    <Circle cx="105" cy="48.5" r="2" fill="#FFFFFF" fillOpacity="0.5" />
    <Rect x="26" y="66" width="148" height="4" rx="2" fill="#2F1C80" fillOpacity="0.35" />
    <Circle cx="34" cy="58" r="3.4" fill="url(#gOr)" stroke="#8A5206" strokeWidth="1" />
    <Circle cx="166" cy="58" r="3.4" fill="url(#gOr)" stroke="#8A5206" strokeWidth="1" />
    <Rect x="86" y="58" width="28" height="27" rx="7" fill="url(#gOr)" stroke="#8A5206" strokeWidth="1.6" />
    <Rect x="90" y="61" width="20" height="5" rx="2.5" fill="#FFFFFF" fillOpacity="0.5" />
    <Circle cx="100" cy="72" r="4" fill="#5A3200" />
    <Rect x="98.4" y="72" width="3.2" height="8" rx="1.6" fill="#5A3200" />
    <Rect x="97.5" y="26" width="5" height="15" rx="2.5" fill="#4B2FB8" />
    <Circle cx="100" cy="20" r="17" fill="url(#gHalo)" />
    <Circle cx="100" cy="20" r="9" fill="url(#gAmpoule)" stroke="#C98812" strokeWidth="1.4" />
    <Path d="M96.5 22 Q98 17 100 22 Q102 17 103.5 22" stroke="#C98812" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <Circle cx="96.5" cy="16.5" r="2.2" fill="#FFFFFF" fillOpacity="0.9" />
    <Path d="M57 93 Q72 84 88 92" stroke="#8A4B05" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    <Path d="M112 92 Q128 84 143 93" stroke="#8A4B05" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {yeuxFermes ? (
        <>
      <Path d="M58 113 Q73 125 88 113" stroke="#2A1B5C" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Path d="M112 113 Q127 125 142 113" stroke="#2A1B5C" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Path d="M60 116 L56 120 M86 116 L90 120" stroke="#2A1B5C" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <Path d="M114 116 L110 120 M140 116 L144 120" stroke="#2A1B5C" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
      <Ellipse cx="73" cy="113" rx="16" ry="19" fill="#FFFFFF" stroke="#C98812" strokeWidth="1.5" />
      <Ellipse cx="127" cy="113" rx="16" ry="19" fill="#FFFFFF" stroke="#C98812" strokeWidth="1.5" />
      <Path d="M58 108 Q73 96 88 108 Q73 101 58 108 Z" fill="#B8A8E8" fillOpacity="0.55" />
      <Path d="M112 108 Q127 96 142 108 Q127 101 112 108 Z" fill="#B8A8E8" fillOpacity="0.55" />
      <Circle cx="76" cy="115" r="11" fill="url(#gOeil)" />
      <Circle cx="124" cy="115" r="11" fill="url(#gOeil)" />
      <Circle cx="76.5" cy="115.5" r="5.2" fill="#0F0828" />
      <Circle cx="123.5" cy="115.5" r="5.2" fill="#0F0828" />
      <Circle cx="80.5" cy="109.5" r="3.8" fill="#FFFFFF" />
      <Circle cx="127.5" cy="109.5" r="3.8" fill="#FFFFFF" />
      <Circle cx="72" cy="121" r="1.9" fill="#FFFFFF" fillOpacity="0.85" />
      <Circle cx="120" cy="121" r="1.9" fill="#FFFFFF" fillOpacity="0.85" />
        </>
      )}
    <Ellipse cx="49" cy="138" rx="13" ry="8" fill="url(#gJoue)" />
    <Ellipse cx="151" cy="138" rx="13" ry="8" fill="url(#gJoue)" />
    <Path d="M79 134 Q100 130 121 134 Q118 159 100 159 Q82 159 79 134 Z" fill="#2A1B5C" stroke="#2A1B5C" strokeWidth="2.5" strokeLinejoin="round" />
    <Path d="M82 135 Q100 132 118 135 L117 141 Q100 138 83 141 Z" fill="#FFFFFF" />
    <Path d="M89 154 Q100 145 111 154 Q100 161 89 154 Z" fill="#FF7A9A" />
    <Path d="M95 150 Q100 148 105 150" stroke="#FFB3C6" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <Path d="M154 108 L156 114 L162 116 L156 118 L154 124 L152 118 L146 116 L152 114 Z" fill="#FFFFFF" fillOpacity="0.75" />
    </Svg>
  );
}
