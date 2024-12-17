import log from "loglevel";
import { ResourceManager } from "Engine/Manager/ResourceManager";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { EditorContainer } from "Editor";
import Icon from '@mdi/react';
import { mdiArrowSplitVertical } from '@mdi/js';

import file_config_resource from "Resources/Config/resource.config.json";
import { FileConfig } from "Engine/Config/FileResourceConfig";
import Engine from "Engine";

/**
 * An asset file from the project.
 */
type ProjectFile = {
  is_directory: false
}

/**
 * An asset directory from the project.
 */
type ProjectDirectory = {
  is_directory: true,
  children: ProjectFileType[]
}

type ProjectFileType = { name: string; path: string; } & (ProjectFile | ProjectDirectory);

async function get_project_structure() {
  const file_path_separator = "/";
  const paths_to_loader = await ResourceManager.get_resource_paths();

  const file_tree: ProjectFileType = {
    name: "src",
    path: "src",
    is_directory: true,
    children: []
  };

  for (const path of paths_to_loader.keys()) {

    //  Split path into each component
    const components = path.split(file_path_separator);

    //  Navigate the file tree to add the component into the right spot.
    //  There will always be a parent (src)
    let current_file: ProjectFileType = file_tree;

    //  Skip the first two components ('' and 'src')
    for (let i = 2; i < components.length; i++) {

      if (current_file.is_directory) {
        const index = current_file.children.findIndex((child) => child.name == components[i]);

        //  If the component exists as a child of the current file, then this becomes the current file 
        if (index >= 0) {
          current_file = current_file.children[index];
        }

        //  Otherwise, add the component to the file tree.
        else {
          let child: ProjectFileType;
          if (i != components.length - 1) {
            child = {
              name: components[i],
              path: path,
              is_directory: true,
              children: []
            };
          }
          else {
            child = {
              name: components[i],
              path: path,
              is_directory: false,
            };
          }
          current_file.children.push(child);
          current_file = child;
        }
      }

      //  This shouldn't be possible (only directories can have children)
      else {
        log.warn(`Current file structure doesn't make sense: ${current_file}`);
        break;
      }
    }
  }

  return file_tree;
}

type FileTreeProps = {
  node: ProjectFileType;
};

function FileTree({ node }: FileTreeProps) {
  const [is_expanded, set_is_expanded] = useState(true);
  const context = useProjectViewerData();

  function on_focus() {
    if(context != undefined) {
      context.set_current_file(node);
    }
  }

  if (!node.is_directory) {
    return (
      <li 
        tabIndex={0} 
        className="select-none block relative pl-3 focus:bg-primary/30"
        onClick={on_focus}
        onFocus={on_focus}
      >
        <div className="pl-1 border-solid border-0 border-l border-inherit">
          {node.name}
        </div>
      </li>
    )
  }

  return (
    <ul className={`ml-3 pl-0 select-none whitespace-nowrap ${
      node.name != "src" && node.children != undefined ? 
      "border-solid border-0 border-l border-inherit" : 
      ""}`
      }
    >
      <div
        tabIndex={0}
        className="cursor-pointer focus:bg-primary/30"
        onClick={() => set_is_expanded(!is_expanded)}
      >
        {is_expanded ? "📂" : "📁"} {node.name}
      </div>
      {
        is_expanded &&
        node.children.map((child) => (
          <FileTree key={child.name} node={child} />
        ))
      }
    </ul>
  );
}

function FileViewer({ node }: FileTreeProps) {
  const data_context = useProjectViewerData();
  const [uuid, set_uuid] = useState("");
  const [file_content, set_file_content] = useState<string>("");

  useEffect(() => {
    async function load_content() {
      //  Search through the file content to find the uuid of the path, if it exists
      let found: boolean = false;
      let uuid: string = "";
      for(let i = 0; i < file_config_resource.files.length; i++) {
        if(file_config_resource.files[i].file_path.toLowerCase() == node.path) {
          found = true;
          uuid = file_config_resource.files[i].uuid;
          set_uuid(uuid);
          break;
        }
      }
  
      const value = await data_context?.load_resource(uuid);
      if(value != undefined) {
        set_file_content((await value()).default);
      }
      else {
        found = false;
      }
      
      if(!found) {
        set_file_content("");
        set_uuid("");
      }
    }

    load_content()
  }, [node, data_context])

  return (
    <div>
      <table className="text-left">
        <tbody>
          <tr>
            <th className="px-2">Name</th>
            <td className="px-2 bg-surfacecontainer">{node.name}</td>
          </tr>
          <tr>
            <th className="px-2">UUID</th>
            <td className="px-2 bg-surfacecontainer">{uuid != "" ? uuid : "n/a"}</td>
          </tr>
        </tbody>
      </table>

      {
        file_content == "" ?
        <p className="bg-errorcontainer text-error">
          This file is not a resource in the file config. Consider adding it to use it in the project.
        </p> :
        <div className="bg-surfacebright font-mono whitespace-pre-wrap raw-text max-h-[50vh] overflow-y-auto">
        {
          file_content.split("\n").map((line, index) => {
            return (
              <div key={index}>{line}</div>
            )
          })
        }
      </div>
      }
    </div>
  );
}

type ProjectViewerData = {
  resource_manager: ResourceManager,
  current_file?: ProjectFileType;
}
type ProjectViewerAPI = {
  set_current_file: (current_file: ProjectFileType) => void;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  load_resource: (path: string) => Promise<(() => Promise<any> | undefined) | undefined>;
}

const ProjectViewerAPIContext = createContext<ProjectViewerAPI | undefined>(undefined);

function useProjectViewerData(): ProjectViewerAPI | undefined {
  const data_context = useContext<ProjectViewerAPI | undefined>(ProjectViewerAPIContext);
  if (!data_context) {
      log.error("useWorld hook must be used with a WorldProvider");
      return undefined;
  }
  return data_context;
}

export function ProjectViewer() {
  const [project_data, set_project_data] = useState<ProjectViewerData>({
    resource_manager: new ResourceManager(undefined as unknown as Engine),
    current_file: undefined,
  });

  useEffect(() => {
    project_data.resource_manager.initialize(file_config_resource as FileConfig, true);
  });


  const project_viewer_api = useRef<ProjectViewerAPI>({
    set_current_file: (current_file) => {
      set_project_data({
        ...project_data,
        current_file: current_file,
      });
    },
    load_resource: (path: string) => {
      return project_data.resource_manager.load(path);
    }
  });
  const project_tree = useRef<ProjectFileType>();
  const resize_handle_down = useRef<boolean>(false);
  const container_ref = useRef<HTMLDivElement>(null);
  const file_tree_ref = useRef<HTMLDivElement>(null);

  const [has_fetched, set_has_fetched] = useState(false);

  async function init() {
    project_tree.current = await get_project_structure();
    set_has_fetched(true);
  }

  function handle_mouse_down() {
    resize_handle_down.current = true;

    document.addEventListener("mousemove", handle_mouse_move);
    document.addEventListener("mouseup", handle_mouse_up);
    document.body.style.userSelect = "none";
  }

  function handle_mouse_move(event: MouseEvent) {
    if(!resize_handle_down.current) {
      return;
    } 
    const container_offset_left = container_ref.current!.offsetLeft;
    const pointer_relative_x = event.clientX - container_offset_left;
    const min_width = 100;

    file_tree_ref.current!.style.width = (Math.max(min_width, pointer_relative_x - 8)) + 'px';
    file_tree_ref.current!.style.flexGrow = '0';
  }

  function handle_mouse_up() {
    resize_handle_down.current = false;

    document.removeEventListener("mousemove", handle_mouse_move);
    document.removeEventListener("mouseup", handle_mouse_up);
    document.body.style.userSelect = "";
  }

  useEffect(() => {
    if (!has_fetched) {
      init();
    }
  });

  return (
    <EditorContainer title="File Viewer">
      <ProjectViewerAPIContext.Provider value={project_viewer_api.current!}>
        <div 
          ref={container_ref}
          className="flex flex-row"
        >
          <div
            ref={file_tree_ref} 
            className="flex-auto box-border overflow-x-auto"
          >
            {
              project_tree.current && <FileTree node={project_tree.current!} />
            }
          </div>
          <div
            className="handler w-[20px] p-0 cursor-ew-resize flex-grow-0 flex-shrink-0 relative"
            // https://stackoverflow.com/a/46934825
            onMouseDown={handle_mouse_down}
          >
            <Icon className="pointer-events-none text-primary fill-primary" path={mdiArrowSplitVertical} size={0.675}/>
          </div>
          <div className="flex-auto box-border">
            {
              project_data.current_file ? 
                <FileViewer node={project_data.current_file}/> :
                <div>
                  <p className="italic text-center">Select a file to view it.</p>
                </div>
            }
          </div>
        </div>
      </ProjectViewerAPIContext.Provider>
    </EditorContainer>
  );
}
