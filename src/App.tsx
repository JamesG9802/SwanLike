import { Box, OrbitControls, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'

function App() {
  return (
    <>
      <Canvas>
        <orthographicCamera/>
        <ambientLight intensity={0.1}/>
        <directionalLight color={"rgb(100, 0, 100)"} position={[0, 1, 1]}/>
        <mesh position={[-3,0,0]} scale={[2, 2, 2]}>
            <boxGeometry/>
            <meshStandardMaterial attach='material' color={'white'}/>
        </mesh>    
        <Box/>
        <mesh position={[3,0,0]} scale={[2, 2, 2]}>
            <boxGeometry/>
            <meshStandardMaterial attach='material' color={'red'}/>
        </mesh>    
        <Stats/>
        <OrbitControls/>
      </Canvas>
    </>
  )
}

export default App
