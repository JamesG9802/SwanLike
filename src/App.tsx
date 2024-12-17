// import { Box, OrbitControls, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react';
import { useWorld } from 'Engine/World'

import app_config_resource from "Resources/Config/application.config.json";
import file_config_resource from "Resources/Config/resource.config.json";

import { WorldManager, WorldManagerProvider } from 'Engine/Manager/WorldManager';
import { ResourceManager } from 'Engine/Manager/ResourceManager';
import { ApplicationConfig } from 'Engine/Config/AppConfig';
import { FileConfig } from 'Engine/Config/FileResourceConfig';
import { InputManager } from 'Engine/Manager/InputManager';
import Engine from 'Engine';

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
export function App() {
  const [engine, set_engine] = useState<Engine>();
  const [world_manager, set_world_manager] = useState<WorldManager>();
  const [input_manager, set_input_manager] = useState<InputManager>();
  const [resource_manager, set_resource_manager] = useState<ResourceManager>();

  const canvas_ref = useRef<HTMLCanvasElement>(null);

  async function Initialize() {
    const app_config = app_config_resource as ApplicationConfig;
    const file_config = file_config_resource as FileConfig;

    const new_engine = new Engine();

    //  Initializes the resource manager's asset dictionary
    const new_resource_manager = new ResourceManager(new_engine);
    await new_resource_manager.initialize(file_config);
    new_engine.add_managers(new_resource_manager);

    const new_input_manager = new InputManager(new_engine);
    new_engine.add_managers(new_input_manager);

    //  Create the world manager with the default scene loaded from the resource manager.
    const new_world_manager = new WorldManager(new_engine);
    new_engine.add_managers(new_world_manager);

    new_world_manager.change_scene(app_config.start_scene);

    set_resource_manager(new_resource_manager);
    set_world_manager(new_world_manager);
    set_input_manager(new_input_manager);

    set_engine(new_engine);
  }

  useEffect(() => {
    Initialize();
  }, []);

  useEffect(() => {
    if (input_manager && canvas_ref.current) {
      input_manager.canvas_size.x = canvas_ref.current?.getBoundingClientRect().width;
      input_manager.canvas_size.y = canvas_ref.current?.getBoundingClientRect().height;
    }
  }, [input_manager, canvas_ref]);

  return (
    <>
      {
        engine && resource_manager && world_manager && input_manager ?
          <WorldManagerProvider manager={world_manager}>
            <Canvas ref={canvas_ref} onMouseMove={(event) => { input_manager.on_mouse_move(event) }} >
              <Scene />
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
