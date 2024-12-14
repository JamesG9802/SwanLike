import { ReactNode, useEffect, useRef, useState } from "react";
import { ProjectViewer } from "./ProjectStructure";
import { UUID_Generator } from "./UUIDGenerator";

import { useSpring, animated } from 'react-spring';

import "./index.css";

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
    <div className="bg-surfacevariant text-onsurfacevariant rounded-b-md mb-8">
      <div
        className="select-none font-bold text-primary px-2 py-1 shadow-md cursor-pointer"
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

  return (
    <div className="h-screen bg-surface text-onsurface font-sans">
      <div className="mx-12">
        <UUID_Generator />
        <ProjectViewer />
      </div>
    </div>
  );
}