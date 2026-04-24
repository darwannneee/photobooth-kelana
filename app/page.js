'use client'

import { useState, useEffect } from 'react'
import HomeScreen from '../components/HomeScreen'
import CameraScreen from '../components/CameraScreen'
import PreviewScreen from '../components/PreviewScreen'
import GateScreen from '../components/GateScreen'

export default function Page() {
  const [unlocked, setUnlocked] = useState(null) // null = loading
  const [screen, setScreen] = useState('home')
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [photos, setPhotos] = useState([])
  const [retakeIndex, setRetakeIndex] = useState(null)

  useEffect(() => {
    setUnlocked(localStorage.getItem('kr_unlocked') === '1')
  }, [])

  const goCamera = (frame) => {
    setSelectedFrame(frame)
    setPhotos([])
    setRetakeIndex(null)
    setScreen('camera')
  }

  const goRetake = (index) => {
    setRetakeIndex(index)
    setScreen('camera')
  }

  const goPreview = (capturedPhotos) => {
    if (retakeIndex !== null) {
      setPhotos((prev) => {
        const updated = [...prev]
        updated[retakeIndex] = capturedPhotos[0]
        return updated
      })
      setRetakeIndex(null)
    } else {
      setPhotos(capturedPhotos)
    }
    setScreen('preview')
  }

  const goHome = () => setScreen('home')

  // Still checking localStorage
  if (unlocked === null) return null

  if (!unlocked) return <GateScreen onUnlock={() => setUnlocked(true)} />

  return (
    <div className="h-screen w-screen overflow-hidden">
      {screen === 'home' && <HomeScreen onStart={goCamera} />}
      {screen === 'camera' && (
        <CameraScreen
          frame={selectedFrame}
          retakeIndex={retakeIndex}
          onDone={goPreview}
          onBack={() => retakeIndex !== null ? setScreen('preview') : goHome()}
        />
      )}
      {screen === 'preview' && (
        <PreviewScreen
          frame={selectedFrame}
          photos={photos}
          onRetake={goRetake}
          onRetakeAll={() => goCamera(selectedFrame)}
          onHome={goHome}
        />
      )}
    </div>
  )
}
