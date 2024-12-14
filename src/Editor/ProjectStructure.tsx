import log from "loglevel";
import { ResourceManager } from "Engine/Managers/ResourceManager";
import { useEffect, useRef, useState } from "react";
import { EditorContainer } from "Editor";
import Icon from '@mdi/react';
import { mdiArrowSplitVertical } from '@mdi/js';


type ProjectFile = {
  is_directory: false
}

type ProjectDirectory = {
  is_directory: true,
  children: ProjectFileType[]
}

type ProjectFileType = { name: string; } & (ProjectFile | ProjectDirectory);

async function get_project_structure() {
  const file_path_separator = "/";
  const paths_to_loader = await ResourceManager.get_resource_paths();

  const file_tree: ProjectFileType = {
    name: "src",
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
              is_directory: true,
              children: []
            };
          }
          else {
            child = {
              name: components[i],
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
  const [is_expanded, set_is_expanded] = useState(false);
  if (!node.is_directory) {
    return <li tabIndex={0} className="select-none block relative pl-6 focus:bg-primary/30">{node.name}</li>;
  }

  return (
    <ul className="ml-3 pl-0 select-none whitespace-nowrap"
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

export function ProjectViewer() {
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
  }

  useEffect(() => {
    if (!has_fetched) {
      init();
    }
  });

  return (
    <EditorContainer title="File Viewer">
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
          great
        </div>
      </div>
    </EditorContainer>
  );
}
