import { Box, OrbitControls, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'

function App() {
  return (
    <>
      <Canvas>
        <orthographicCamera/>
        <ambientLight intensity={0.1}/>
        <directionalLight color={"red"} position={[0, 1, 1]}/>
        <Box/>
        <Stats/>
        <OrbitControls/>
      </Canvas>
    </>
  )
}

export default App
