// import { Box, OrbitControls, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react';
import { useWorld } from 'Three/World'

import app_config_resource from "resources/config/application.config.json";
import file_config_resource from "resources/config/resource.config.json";
import { WorldManager, WorldManagerProvider } from 'Three/Managers/WorldManager';
import { FileConfig, ResourceManager } from 'Three/Managers/ResourceManager';

/**
 * The format of the Application Config JSON.
 */
export type ApplicationConfig = {
  /**
   * The UUID of the starting scene.
   */
  start_scene: string;
}

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
  const [_, set_resource_manager] = useState<ResourceManager>();

  async function Initialize() {
    const app_config = app_config_resource as any as ApplicationConfig;
    const file_config = file_config_resource as any as FileConfig;

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
