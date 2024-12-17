// import { Box, OrbitControls, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react';
import { useWorld } from 'Engine/World'

import debug_app_config_resource from "Resources/Config/debug.config.json";
import file_config_resource from "Resources/Config/resource.config.json";

import { WorldManager, WorldManagerProvider } from 'Engine/Manager/WorldManager';
import { ResourceManager } from 'Engine/Manager/ResourceManager';
import { ApplicationConfig } from 'Engine/Config/AppConfig';
import { FileConfig } from 'Engine/Config/FileResourceConfig';
import { InputManager } from 'Engine/Manager/InputManager';
import Engine from 'Engine';

import { EditorContainer } from 'Editor';
import Icon from '@mdi/react';
import { mdiPause } from '@mdi/js';
import { mdiPlay } from '@mdi/js';
import { Option, Select } from '@material-tailwind/react';

/**
 * Functional component for rendering out the current scene from the World Manager.
 * @returns 
 */
function Scene() {
  const world = useWorld();

  return world;
}

export default function SceneEditor() {
  const [engine, set_engine] = useState<Engine>();
  const [world_manager, set_world_manager] = useState<WorldManager>();
  const [input_manager, set_input_manager] = useState<InputManager>();
  const [resource_manager, set_resource_manager] = useState<ResourceManager>();

  const canvas_ref = useRef<HTMLCanvasElement>(null);

  const [is_active, set_is_active] = useState<boolean>(true);

  useEffect(() => {
    async function Initialize() {
      const app_config = debug_app_config_resource as ApplicationConfig;
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

      await new_world_manager.change_scene(app_config.start_scene);

      const world = new_world_manager.get_world();
      if (world) {
        world.active = is_active;
      }
      
      set_resource_manager(new_resource_manager);
      set_world_manager(new_world_manager);
      set_input_manager(new_input_manager);

      set_engine(new_engine);
    }
    Initialize();
    // `is_active` shouldn't trigger an initialization. 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (input_manager && canvas_ref.current) {
      input_manager.canvas_size.x = canvas_ref.current?.getBoundingClientRect().width;
      input_manager.canvas_size.y = canvas_ref.current?.getBoundingClientRect().height;
    }
  }, [input_manager, canvas_ref]);

  return (
    <EditorContainer title="Scene Editor">
      <div className="flex flex-row items-center">
        <div
          className="cursor-pointer hover:fill-primary hover:text-primary hover:bg-surfacecontainer"
          onClick={() => { set_is_active(!is_active); world_manager!.get_world()!.active = !is_active; }}
        >
          <Icon
            path={is_active ? mdiPlay : mdiPause}
            size={1}
          />
        </div>
        <div>
          <Select variant="standard"
            onChange={(value) => {
              world_manager?.change_scene(value!)
                .then(() => {
                  const world = world_manager.get_world()
                  if (world) {
                    world.active = is_active;
                  }
                })
            }}
          >
            {
              (file_config_resource as FileConfig).files
                .filter((file) => file.type == "scene")
                .map((file, index) => {
                  return <Option
                    key={index}
                    value={file.uuid}
                  >
                    {file.file_path.split("/")[file.file_path.split("/").length - 1]}
                  </Option>;
                })
            }
          </Select>
        </div>
      </div>
      <div className="border-2 border-solid border-primary">
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
      </div>
    </EditorContainer>
  )
}