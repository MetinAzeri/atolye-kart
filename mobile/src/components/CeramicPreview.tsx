import { useId } from 'react';
import {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
  Svg,
  Text,
} from 'react-native-svg';

import { getLuminance, shadeColor } from '@/lib/color';

export type CeramicType = 'plate' | 'cup' | 'tray' | 'vase';

const NEUTRAL_COLOR = '#e4dcd0';

const leafPath = 'M12 4 C18 8 18 16 12 20 C6 16 6 8 12 4 Z';

function patternTile(patternId: string, type: string, tint: string) {
  switch (type) {
    case 'dots':
      return (
        <Pattern id={patternId} width={50} height={50} patternUnits="userSpaceOnUse">
          <Circle cx={10} cy={12} r={3} fill={tint} opacity={0.7} />
          <Circle cx={28} cy={8} r={5} fill={tint} opacity={0.55} />
          <Circle cx={31} cy={11} r={1} fill={tint} opacity={0.6} />
          <Circle cx={40} cy={20} r={2.5} fill={tint} opacity={0.8} />
          <Circle cx={15} cy={30} r={4} fill={tint} opacity={0.6} />
          <Circle cx={35} cy={38} r={3.5} fill={tint} opacity={0.75} />
          <Circle cx={37.5} cy={40} r={1.2} fill={tint} opacity={0.55} />
          <Circle cx={6} cy={42} r={2} fill={tint} opacity={0.65} />
          <Circle cx={44} cy={44} r={2.5} fill={tint} opacity={0.5} />
        </Pattern>
      );
    case 'brush':
      return (
        <Pattern id={patternId} width={60} height={40} patternUnits="userSpaceOnUse">
          <G transform="translate(5 8) rotate(-15)" opacity={0.75}>
            <Path d="M0 3 Q10 0 20 2 Q10 5 0 3 Z" fill={tint} />
          </G>
          <G transform="translate(28 5) rotate(20) scale(0.8)" opacity={0.85}>
            <Path d="M0 3 Q10 0 20 2 Q10 5 0 3 Z" fill={tint} />
          </G>
          <G transform="translate(8 25) rotate(-30) scale(1.1)" opacity={0.65}>
            <Path d="M0 3 Q10 0 20 2 Q10 5 0 3 Z" fill={tint} />
          </G>
          <G transform="translate(35 28) rotate(10) scale(0.9)" opacity={0.7}>
            <Path d="M0 3 Q10 0 20 2 Q10 5 0 3 Z" fill={tint} />
          </G>
        </Pattern>
      );
    case 'olive':
      return (
        <Pattern id={patternId} width={70} height={70} patternUnits="userSpaceOnUse">
          <Path
            d="M8 65 Q30 45 32 25 Q34 10 45 2"
            fill="none"
            stroke={tint}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.8}
          />
          <Ellipse cx={15} cy={55} rx={6} ry={2.5} fill={tint} opacity={0.7} transform="rotate(-30 15 55)" />
          <Ellipse cx={23} cy={44} rx={6} ry={2.5} fill={tint} opacity={0.75} transform="rotate(40 23 44)" />
          <Ellipse cx={29} cy={32} rx={6} ry={2.5} fill={tint} opacity={0.7} transform="rotate(-35 29 32)" />
          <Ellipse cx={34} cy={19} rx={6} ry={2.5} fill={tint} opacity={0.75} transform="rotate(45 34 19)" />
          <Ellipse cx={41} cy={9} rx={5} ry={2.2} fill={tint} opacity={0.7} transform="rotate(-30 41 9)" />
        </Pattern>
      );
    case 'wave':
      return (
        <Pattern id={patternId} width={80} height={24} patternUnits="userSpaceOnUse">
          <Path
            d="M0 8 Q8 2 18 9 Q26 14 34 7 Q42 1 50 8 Q60 13 68 6 Q74 2 80 8"
            fill="none"
            stroke={tint}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.8}
          />
          <Path
            d="M0 18 Q10 14 20 19 Q28 22 36 17 Q46 12 54 18 Q62 21 70 16 Q76 13 80 18"
            fill="none"
            stroke={tint}
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.6}
          />
        </Pattern>
      );
    case 'leaves':
      return (
        <Pattern id={patternId} width={90} height={90} patternUnits="userSpaceOnUse">
          <Path d={leafPath} fill={tint} opacity={0.7} transform="translate(10 10) rotate(15) scale(0.8)" />
          <Path d={leafPath} fill={tint} opacity={0.8} transform="translate(55 15) rotate(-50) scale(1)" />
          <Path d={leafPath} fill={tint} opacity={0.6} transform="translate(30 50) rotate(110) scale(0.7)" />
          <Path d={leafPath} fill={tint} opacity={0.75} transform="translate(70 60) rotate(-20) scale(0.9)" />
          <Path d={leafPath} fill={tint} opacity={0.65} transform="translate(15 70) rotate(60) scale(0.85)" />
        </Pattern>
      );
    default:
      return null;
  }
}

function computeFontSize(text: string) {
  const len = text.length;
  if (len <= 6) return 18;
  if (len >= 12) return 11;
  return Math.round(18 - ((len - 6) / 6) * 7);
}

function TextLayer({ x, y, text, baseColor }: { x: number; y: number; text?: string; baseColor: string }) {
  if (!text) return null;
  const fill = getLuminance(baseColor) > 0.55 ? '#3d2b1f' : '#f7f3ec';
  return (
    <Text x={x} y={y} textAnchor="middle" fontSize={computeFontSize(text)} fontWeight={600} fill={fill}>
      {text}
    </Text>
  );
}

export function CeramicPreview({
  type,
  color,
  pattern,
  text,
  size = 120,
}: {
  type: CeramicType;
  color?: string | null;
  pattern?: string | null;
  text?: string;
  size?: number;
}) {
  const uid = useId();
  const base = color || NEUTRAL_COLOR;
  const light = shadeColor(base, 30);
  const dark = shadeColor(base, -25);
  const edge = shadeColor(base, -15);
  const patternTint = pattern ? (getLuminance(base) > 0.55 ? shadeColor(base, -30) : shadeColor(base, 35)) : null;

  const gradId = `grad-${uid}`;
  const wellGradId = `well-${uid}`;
  const shadowGradId = `shadow-${uid}`;
  const clipId = `clip-${uid}`;
  const patternId = `pattern-${uid}`;

  const defs = (
    <>
      <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor={dark} />
        <Stop offset="45%" stopColor={base} />
        <Stop offset="100%" stopColor={light} />
      </LinearGradient>
      <RadialGradient id={wellGradId} cx="35%" cy="35%" r="75%">
        <Stop offset="0%" stopColor={light} />
        <Stop offset="100%" stopColor={dark} />
      </RadialGradient>
      <RadialGradient id={shadowGradId} cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="#000" stopOpacity={0.28} />
        <Stop offset="70%" stopColor="#000" stopOpacity={0.12} />
        <Stop offset="100%" stopColor="#000" stopOpacity={0} />
      </RadialGradient>
    </>
  );

  let clipShape: React.ReactElement;
  let shapeElements: React.ReactElement;
  let textPos: { x: number; y: number };

  if (type === 'plate') {
    clipShape = <Ellipse cx={100} cy={100} rx={85} ry={50} />;
    shapeElements = (
      <>
        <Ellipse cx={100} cy={100} rx={85} ry={50} fill={`url(#${gradId})`} stroke={edge} strokeWidth={2.5} />
        <Ellipse cx={100} cy={99} rx={80} ry={46} fill="none" stroke={light} strokeWidth={1} opacity={0.5} />
        <Ellipse
          cx={100}
          cy={103}
          rx={60}
          ry={35}
          fill={`url(#${wellGradId})`}
          stroke={dark}
          strokeWidth={1}
          opacity={0.9}
        />
      </>
    );
    textPos = { x: 100, y: 108 };
  } else if (type === 'cup') {
    const bodyPath = 'M58 55 L142 55 L132 160 Q132 170 122 170 L78 170 Q68 170 68 160 Z';
    const handlePath = 'M138 74 C182 79 190 156 138 161 L138 145 C162 141 166 90 138 88 Z';
    clipShape = <Path d={bodyPath} />;
    shapeElements = (
      <>
        <Path d={handlePath} fill={`url(#${gradId})`} stroke={edge} strokeWidth={2} />
        <Path
          d="M180 82 C186 105 184 138 140 156"
          fill="none"
          stroke={light}
          strokeWidth={1}
          opacity={0.55}
        />
        <Path d={bodyPath} fill={`url(#${gradId})`} stroke={edge} strokeWidth={2.5} />
        <Ellipse cx={100} cy={55} rx={42} ry={10} fill={dark} />
        <Ellipse cx={100} cy={55} rx={42} ry={10} fill="none" stroke={edge} strokeWidth={2} />
        <Path d="M62 51 Q100 44 138 51" fill="none" stroke={light} strokeWidth={1.2} opacity={0.6} />
        <Ellipse cx={100} cy={55} rx={34} ry={7} fill="none" stroke={light} strokeWidth={1} opacity={0.35} />
      </>
    );
    textPos = { x: 100, y: 118 };
  } else if (type === 'tray') {
    clipShape = <Rect x={20} y={55} width={160} height={95} rx={30} ry={30} />;
    shapeElements = (
      <>
        <Rect
          x={20}
          y={55}
          width={160}
          height={95}
          rx={30}
          ry={30}
          fill={`url(#${gradId})`}
          stroke={edge}
          strokeWidth={2.5}
        />
        <Rect
          x={26}
          y={61}
          width={148}
          height={83}
          rx={25}
          ry={25}
          fill="none"
          stroke={light}
          strokeWidth={1}
          opacity={0.5}
        />
        <Rect
          x={42}
          y={72}
          width={116}
          height={61}
          rx={18}
          ry={18}
          fill={`url(#${wellGradId})`}
          stroke={dark}
          strokeWidth={1}
          opacity={0.9}
        />
      </>
    );
    textPos = { x: 100, y: 107 };
  } else {
    const bodyPath = 'M85 20 L115 20 L115 45 Q155 65 155 112 Q155 168 100 168 Q45 168 45 112 Q45 65 85 45 Z';
    clipShape = <Path d={bodyPath} />;
    shapeElements = (
      <>
        <Path d={bodyPath} fill={`url(#${gradId})`} stroke={edge} strokeWidth={2.5} />
        <Ellipse cx={100} cy={20} rx={15} ry={5} fill={dark} />
        <Ellipse cx={100} cy={20} rx={15} ry={5} fill="none" stroke={edge} strokeWidth={1.5} />
        <Path d="M87 16 Q100 12 113 16" fill="none" stroke={light} strokeWidth={1} opacity={0.6} />
        <Path d="M78 60 Q73 110 81 155" fill="none" stroke={light} strokeWidth={1} opacity={0.4} />
        <Path d="M122 60 Q127 110 119 155" fill="none" stroke={dark} strokeWidth={1} opacity={0.25} />
      </>
    );
    textPos = { x: 100, y: 118 };
  }

  return (
    <Svg width={size} height={(size * 220) / 200} viewBox="0 0 200 220">
      <Defs>
        {defs}
        {pattern && <ClipPath id={clipId}>{clipShape}</ClipPath>}
        {pattern && patternTile(patternId, pattern, patternTint as string)}
      </Defs>
      <Ellipse cx={100} cy={198} rx={62} ry={12} fill={`url(#${shadowGradId})`} />
      {shapeElements}
      {pattern && (
        <Rect
          x={0}
          y={0}
          width={200}
          height={220}
          fill={`url(#${patternId})`}
          opacity={0.55}
          clipPath={`url(#${clipId})`}
        />
      )}
      <TextLayer x={textPos.x} y={textPos.y} text={text} baseColor={base} />
    </Svg>
  );
}
