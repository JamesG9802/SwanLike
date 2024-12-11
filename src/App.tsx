// import { Box, OrbitControls, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react';
import { useWorld } from 'Engine/World'

import app_config_resource from "resources/config/application.config.json";
import file_config_resource from "resources/config/resource.config.json";
import { WorldManager, WorldManagerProvider } from 'Engine/Managers/WorldManager';
import { ResourceManager } from 'Engine/Managers/ResourceManager';
import { ApplicationConfig } from 'Engine/Config/AppConfig';
import { FileConfig } from 'Engine/Config/FileResourceConfig';

/**
 * Functional component for rendering out the current scene from the World Manager.
 * @returns 
 */
function Scene() {
  const world = useWorld();

  return world;
}

/**
 * The main application.
 * @returns 
 */
function App() {
  const [world_manager, set_world_manager] = useState<WorldManager>();
  const [, set_resource_manager] = useState<ResourceManager>();

  async function Initialize() {
    const app_config = app_config_resource as ApplicationConfig;
    const file_config = file_config_resource as FileConfig;

    //  Initializes the resource manager's asset dictionary
    const new_resource_manager = new ResourceManager();
    await new_resource_manager.initialize(file_config);

    //  Create the world manager with the default scene loaded from the resource manager.
    const new_world_manager = new WorldManager(app_config.start_scene, new_resource_manager);

    set_resource_manager(new_resource_manager);
    set_world_manager(new_world_manager);
  }
  useEffect(() => {
    Initialize();
  }, []);

  return (
    <>
      {
        world_manager ? 
        <WorldManagerProvider manager={world_manager}>
          <Canvas>
            <Scene/>
          </Canvas>
        </WorldManagerProvider> 
        :
        <div>
          Loading...
        </div>
      }
    </>
  )
}

export default App
