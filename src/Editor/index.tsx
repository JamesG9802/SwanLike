import { ReactNode, useEffect, useRef, useState } from "react";
import { ProjectViewer } from "./ProjectStructure";
import { UUID_Generator } from "./UUIDGenerator";

import { useSpring, animated } from 'react-spring';

import "./index.css";
import SceneEditor from "./SceneEditor";
import { mdiArrowSplitVertical } from "@mdi/js";
import Icon from "@mdi/react";

type EditorContainerProps = {
  title: string,
  children?: ReactNode
}

export function EditorContainer({ title, children }: EditorContainerProps) {
  const [is_open, set_is_open] = useState(true);
  const [height, setHeight] = useState(0); // Store the dynamic height
  const content_ref = useRef<HTMLDivElement>(null);

  const styles = useSpring({
    height: is_open ? height : 0, // Animate to content's height or 0
    config: { tension: 250, friction: 30 }, // Customize animation speed/feel
  });

  useEffect(() => {
    const ref_current = content_ref.current;

    const resizeObserver = new ResizeObserver(() => {
      if (content_ref.current) {
        setHeight(content_ref.current.scrollHeight); // Get scrollHeight dynamically
      }; // Update height when the content size changes
    });

    if (content_ref.current) {
      resizeObserver.observe(content_ref.current); // Observe content div
    }

    // Cleanup the observer when component unmounts
    return () => {
      if (ref_current) {
        resizeObserver.unobserve(ref_current);
      }
    };
  }, [children]);



  return (
    <div className={`bg-surfacevariant text-onsurfacevariant rounded-b-md mb-8 overflow-auto ${is_open ? "" : "shadow-md"}`}>
      <div
        className={`select-none font-bold text-primary px-2 py-1 transition-all duration-500 cursor-pointer ${is_open ? "shadow-md" : ""}`}
        onClick={() => { set_is_open(!is_open); }}
      >
        {title}
      </div>
      <animated.div
        className="overflow-hidden editor-container"
        style={{
          ...styles
        }}
      >
        <div
          className="px-4 py-2"
          ref={content_ref}
        >
          {children}
        </div>
      </animated.div>
    </div>
  );
}

/**
 * Editor for SwanLike.
 */
export default function Editor() {
  const resize_handle_down = useRef<boolean>(false);
  const container_ref = useRef<HTMLDivElement>(null);
  const left_container_ref = useRef<HTMLDivElement>(null);
  
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
    const min_width = 200;

    left_container_ref.current!.style.width = (Math.max(min_width, pointer_relative_x - 8)) + 'px';
    left_container_ref.current!.style.flexGrow = '0';
  }

  function handle_mouse_up() {
    resize_handle_down.current = false;

    document.removeEventListener("mousemove", handle_mouse_move);
    document.removeEventListener("mouseup", handle_mouse_up);
    document.body.style.userSelect = "";
  }

  return (
    <div className="h-screen bg-surface text-onsurface font-sans">
      <div ref={container_ref} className="flex flex-row flex-auto space-x-4 mx-12">
        <div ref={left_container_ref} className="flex flex-col flex-auto">
          <UUID_Generator />
          <ProjectViewer />
        </div>
          <div
            className="handler w-[20px] p-0 cursor-ew-resize flex-grow-0 flex-shrink-0 relative"
            // https://stackoverflow.com/a/46934825
            onMouseDown={handle_mouse_down}
          >
          <Icon className="pointer-events-none text-primary fill-primary" path={mdiArrowSplitVertical} size={0.675}/>
        </div>
        <div className="flex flex-auto">
          <SceneEditor />
        </div>
      </div>
    </div>
  );
}