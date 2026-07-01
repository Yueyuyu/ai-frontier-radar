import { Player } from '@remotion/player'
import type { PlayerRef } from '@remotion/player'
import { useEffect, useRef } from 'react'
import { FrontierIntro } from './FrontierIntro'

export default function RemotionIntroPlayer() {
  const playerRef = useRef<PlayerRef>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      playerRef.current?.play()
    }, 80)

    return () => window.clearTimeout(timer)
  }, [])

  return (
    <Player
      ref={playerRef}
      component={FrontierIntro}
      durationInFrames={150}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      autoPlay
      acknowledgeRemotionLicense
      initiallyMuted
      clickToPlay={false}
      controls={false}
      loop={false}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
