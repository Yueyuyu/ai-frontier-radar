import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Activity } from 'lucide-react'

const introNodes = [
  { label: 'GPT-5.6 Sol', provider: 'OpenAI', x: 31, y: 42, accent: '#16c8be', delay: 4 },
  { label: 'GPT-5.6 Terra', provider: 'OpenAI', x: 45, y: 28, accent: '#ff8f5f', delay: 8 },
  { label: 'GPT-5.6 Luna', provider: 'OpenAI', x: 61, y: 30, accent: '#8eb9ff', delay: 12 },
  { label: 'Codex', provider: 'OpenAI', x: 78, y: 42, accent: '#7da7ff', delay: 16 },
  { label: 'Rankings', provider: 'OpenRouter', x: 82, y: 61, accent: '#ff6fd8', delay: 20 },
  { label: 'Kimi K2.6', provider: 'Moonshot', x: 72, y: 72, accent: '#111827', delay: 24 },
  { label: 'Agent Runtime', provider: 'Agent', x: 60, y: 78, accent: '#f7d774', delay: 28 },
  { label: 'MCP / Skills', provider: 'Ecosystem', x: 43, y: 79, accent: '#b79cff', delay: 32 },
  { label: 'DeepSeek V4 Pro', provider: 'DeepSeek', x: 24, y: 58, accent: '#58d68d', delay: 36 },
]

const introParticles = Array.from({ length: 160 }, (_, index) => {
  const cluster = index % 2 === 0 ? 32 : 70
  const spreadX = index % 2 === 0 ? 22 : 25
  const spreadY = index % 2 === 0 ? 16 : 20
  const angle = ((index * 137.5) % 360) * (Math.PI / 180)
  const radius = Math.sqrt(((index * 41) % 100) / 100)

  return {
    x: cluster + Math.cos(angle) * spreadX * radius,
    y: 52 + Math.sin(angle) * spreadY * radius,
    size: index % 19 === 0 ? 5 : index % 7 === 0 ? 3 : 2,
    tone: index % 17 === 0 ? '#ff7c4d' : index % 11 === 0 ? '#3d8cff' : '#16c8be',
  }
})

export function FrontierIntro() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const heroIn = spring({ frame, fps, config: { damping: 22, stiffness: 90 } })
  const hubIn = spring({ frame: frame - 22, fps, config: { damping: 18, stiffness: 80 } })
  const sweep = interpolate(frame, [0, 150], [0, 360], { extrapolateRight: 'clamp' })
  const fadeOut = interpolate(frame, [132, 150], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 50% 54%, rgba(22, 200, 190, 0.25), transparent 26%), radial-gradient(circle at 78% 26%, rgba(61, 140, 255, 0.14), transparent 22%), linear-gradient(115deg, #f8fcff, #edf9fc 48%, #fbfdff)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(90deg, rgba(93, 123, 151, 0.065) 1px, transparent 1px), linear-gradient(180deg, rgba(93, 123, 151, 0.052) 1px, transparent 1px)',
          backgroundSize: '86px 86px',
          maskImage: 'linear-gradient(180deg, black, transparent 82%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 1040,
          height: 650,
          transform: `translate(-50%, -50%) scale(${0.92 + hubIn * 0.08})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 620,
            height: 620,
            borderRadius: '50%',
            border: '1px solid rgba(22, 200, 190, 0.18)',
            transform: `translate(-50%, -50%) rotate(${sweep}deg)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 420,
            height: 420,
            borderRadius: '50%',
            border: '1px dashed rgba(61, 140, 255, 0.18)',
            transform: `translate(-50%, -50%) rotate(${-sweep * 0.7}deg)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 760,
            height: 760,
            borderRadius: '50%',
            background:
              'repeating-conic-gradient(from 0deg, rgba(22, 200, 190, 0.13) 0deg, rgba(22, 200, 190, 0.13) 1deg, transparent 1deg, transparent 10deg)',
            maskImage: 'radial-gradient(circle, transparent 0 24%, rgba(0,0,0,.42) 25% 44%, transparent 45%)',
            transform: `translate(-50%, -50%) rotate(${sweep * 0.85}deg)`,
          }}
        />

        {introParticles.map((particle, index) => {
          const particleIn = interpolate(frame, [index * 0.14, 46 + index * 0.06], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const drift = Math.sin((frame + index * 11) / 18) * 3
          return (
            <span
              key={`${particle.x}-${particle.y}-${index}`}
              style={{
                position: 'absolute',
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                borderRadius: '50%',
                background: particle.tone,
                opacity: particleIn * 0.72,
                boxShadow: `0 0 ${particle.size * 4}px ${particle.tone}`,
                transform: `translate(${drift}px, ${-drift}px)`,
              }}
            />
          )
        })}

        {introNodes.map((node) => {
          const nodeIn = spring({ frame: frame - node.delay, fps, config: { damping: 18, stiffness: 76 } })
          const lineOpacity = interpolate(frame - node.delay, [0, 28], [0, 0.3], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <div key={node.label}>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: `${Math.abs(node.x - 50) * 2.9}%`,
                  height: 1,
                  opacity: lineOpacity,
                  background: `linear-gradient(90deg, ${node.accent}, transparent)`,
                  transform: `rotate(${Math.atan2(node.y - 50, node.x - 50)}rad)`,
                  transformOrigin: '0 50%',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  display: 'grid',
                  gridTemplateColumns: '38px 1fr',
                  gap: 12,
                  alignItems: 'center',
                  minWidth: 166,
                  minHeight: 76,
                  padding: '12px 14px',
                  border: `1px solid ${node.accent}33`,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,.82)',
                  boxShadow: '0 24px 56px rgba(75,106,137,.15)',
                  opacity: nodeIn,
                  transform: `translate(-50%, -50%) scale(${0.78 + nodeIn * 0.22})`,
                }}
              >
                <span
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    color: node.accent,
                    background: `${node.accent}10`,
                    border: `1px solid ${node.accent}40`,
                    fontWeight: 900,
                  }}
                >
                  {node.label.slice(0, 1)}
                </span>
                <span style={{ display: 'grid', gap: 4 }}>
                  <strong style={{ color: '#13243a', fontSize: 15, lineHeight: 1.1 }}>{node.label}</strong>
                  <small style={{ color: '#7e8fa6', fontSize: 11 }}>{node.provider}</small>
                </span>
              </div>
            </div>
          )
        })}

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            display: 'grid',
            placeItems: 'center',
            width: 168,
            height: 168,
            borderRadius: '50%',
            color: '#13243a',
            background:
              'radial-gradient(circle, rgba(255,255,255,.98), rgba(239,251,255,.9) 72%), rgba(255,255,255,.86)',
            border: '1px solid rgba(22, 200, 190, 0.22)',
            boxShadow: 'inset 0 0 0 12px rgba(222,246,255,.7), 0 28px 80px rgba(34,148,177,.18)',
            opacity: hubIn,
            transform: `translate(-50%, -50%) scale(${0.82 + hubIn * 0.18})`,
          }}
        >
          <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 48,
                height: 48,
                borderRadius: '50%',
                color: '#16c8be',
                background: 'rgba(22,200,190,.1)',
              }}
            >
              <Activity size={30} />
            </span>
            <strong style={{ fontSize: 13, fontWeight: 900 }}>SIGNAL MATRIX</strong>
            <small style={{ color: '#7e8fa6', fontSize: 11 }}>实时感知 · 智能聚合</small>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 76,
          bottom: 72,
          opacity: heroIn,
          transform: `translateY(${interpolate(heroIn, [0, 1], [22, 0])}px)`,
        }}
      >
        <div style={{ color: '#13243a', fontSize: 76, fontWeight: 950, lineHeight: 0.96 }}>AI 前沿情报站</div>
        <div style={{ marginTop: 16, color: '#334761', fontSize: 24, fontWeight: 700 }}>
          正在聚合模型、工具、Agent 与 AI 编程生态信号
        </div>
      </div>
    </AbsoluteFill>
  )
}
