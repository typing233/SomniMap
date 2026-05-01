import React, { useEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'

interface FirstPersonControlsProps {
  enabled?: boolean
  moveSpeed?: number
  lookSpeed?: number
  onLockChange?: (isLocked: boolean) => void
}

export const FirstPersonControls: React.FC<FirstPersonControlsProps> = ({
  enabled = true,
  moveSpeed = 30,
  lookSpeed = 0.002,
  onLockChange
}) => {
  const { camera, gl } = useThree()
  const controlsRef = useRef<PointerLockControls | null>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const velocityRef = useRef(new THREE.Vector3())
  const directionRef = useRef(new THREE.Vector3())
  const moveForwardRef = useRef(false)
  const moveBackwardRef = useRef(false)
  const moveLeftRef = useRef(false)
  const moveRightRef = useRef(false)
  const canJumpRef = useRef(false)
  const [isLocked, setIsLocked] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  useEffect(() => {
    if (!enabled) return

    const controls = new PointerLockControls(camera, gl.domElement)
    controlsRef.current = controls

    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current.add(event.code)
      
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForwardRef.current = true
          break
        case 'KeyS':
        case 'ArrowDown':
          moveBackwardRef.current = true
          break
        case 'KeyA':
        case 'ArrowLeft':
          moveLeftRef.current = true
          break
        case 'KeyD':
        case 'ArrowRight':
          moveRightRef.current = true
          break
        case 'Space':
          if (canJumpRef.current) {
            velocityRef.current.y = 10
          }
          canJumpRef.current = false
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.code)
      
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveForwardRef.current = false
          break
        case 'KeyS':
        case 'ArrowDown':
          moveBackwardRef.current = false
          break
        case 'KeyA':
        case 'ArrowLeft':
          moveLeftRef.current = false
          break
        case 'KeyD':
        case 'ArrowRight':
          moveRightRef.current = false
          break
      }
    }

    const handleLockChange = () => {
      const locked = controls.isLocked
      setIsLocked(locked)
      setShowInstructions(!locked)
      onLockChange?.(locked)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    controls.addEventListener('lock', handleLockChange)
    controls.addEventListener('unlock', handleLockChange)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      controls.removeEventListener('lock', handleLockChange)
      controls.removeEventListener('unlock', handleLockChange)
      controls.dispose()
    }
  }, [camera, gl, enabled, onLockChange])

  useFrame((_, delta) => {
    if (!enabled || !controlsRef.current?.isLocked) return

    velocityRef.current.x -= velocityRef.current.x * 10.0 * delta
    velocityRef.current.z -= velocityRef.current.z * 10.0 * delta
    velocityRef.current.y -= 9.8 * 10.0 * delta

    directionRef.current.z = Number(moveForwardRef.current) - Number(moveBackwardRef.current)
    directionRef.current.x = Number(moveRightRef.current) - Number(moveLeftRef.current)
    directionRef.current.normalize()

    if (moveForwardRef.current || moveBackwardRef.current) {
      velocityRef.current.z -= directionRef.current.z * moveSpeed * delta
    }
    if (moveLeftRef.current || moveRightRef.current) {
      velocityRef.current.x -= directionRef.current.x * moveSpeed * delta
    }

    controlsRef.current.moveRight(-velocityRef.current.x * delta)
    controlsRef.current.moveForward(-velocityRef.current.z * delta)
    camera.position.y += velocityRef.current.y * delta

    if (camera.position.y < 1) {
      velocityRef.current.y = 0
      camera.position.y = 1
      canJumpRef.current = true
    }
  })

  const handleCanvasClick = () => {
    if (enabled && controlsRef.current && !controlsRef.current.isLocked) {
      controlsRef.current.lock()
    }
  }

  return (
    <>
      <mesh onClick={handleCanvasClick} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {showInstructions && (
        <div
          onClick={handleCanvasClick}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(37, 37, 64, 0.95)',
            padding: '2rem 3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            border: '1px solid rgba(130, 102, 160, 0.5)',
            maxWidth: '400px'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎮</div>
          <h2 style={{ 
            color: '#f0f0f5', 
            marginBottom: '1rem',
            fontSize: '1.25rem',
            fontWeight: 600
          }}>
            点击开始漫游
          </h2>
          <div style={{ color: '#a1a1c3', fontSize: '0.875rem', lineHeight: 1.8 }}>
            <p><strong style={{ color: '#8266a0' }}>W/S/A/D</strong> 或 <strong style={{ color: '#8266a0' }}>方向键</strong> - 移动</p>
            <p><strong style={{ color: '#8266a0' }}>鼠标</strong> - 视角控制</p>
            <p><strong style={{ color: '#8266a0' }}>空格键</strong> - 跳跃</p>
            <p><strong style={{ color: '#8266a0' }}>ESC</strong> - 退出控制</p>
          </div>
          <p style={{ 
            marginTop: '1.5rem', 
            color: '#6b5b8a', 
            fontSize: '0.75rem' 
          }}>
            点击任意位置开始
          </p>
        </div>
      )}
    </>
  )
}

export default FirstPersonControls
