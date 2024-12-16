import { EditorContainer } from "Editor";
import { useState } from "react";

import { v6 } from "uuid";

import { Alert } from "@material-tailwind/react";

import Icon from "@mdi/react";

import { mdiPlusCircle } from '@mdi/js';
import { mdiClipboard } from '@mdi/js';
import { mdiClipboardTextOff } from '@mdi/js';


export function UUID_Generator() {
  const [uuid, set_uuid] = useState<string>("");
  const [show_alert, set_show_alert] = useState<boolean>(false);

  function to_clipboard() {
    navigator.clipboard.writeText(uuid);
    set_show_alert(true);
    setTimeout(() => {
      set_show_alert(false);
    }, 1000);
  }

  return (
    <EditorContainer title={"UUID Generator"}>
      <Alert 
        className="absolute left-0 right-0 top-2 w-fit m-auto bg-opacity-80 cursor-pointer" 
        open={show_alert}
        onTap={() => {set_show_alert(false)}}
      >
        UUID copied to clipboard.
      </Alert>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-row ">
          <div
            className="cursor-pointer rounded-md hover:text-primary hover:fill-primary hover:bg-surfacecontainer" 
            onClick={() => {
              const uuid = v6();
              set_uuid(uuid);
              to_clipboard();
            }}
          >
            <Icon path={mdiPlusCircle} size={1}/>
          </div>
          <div 
            className={`rounded-md ${
              uuid == "" ? 
              "text-surfacecontainer fill-surfacecontainer" : 
              "cursor-pointer hover:text-primary hover:fill-primary hover:bg-surfacecontainer"}`}
            onClick={() => { if(uuid != "") to_clipboard(); }}
          > 
            <Icon
              path={uuid == "" ? mdiClipboardTextOff : mdiClipboard}
              size={1}
              aria-disabled={uuid == ""}
            />
          </div>
        </div>
        <div>
          <p className="m-0 py-1 inline float-left select-none">UUID:&nbsp;</p>
          <p className="m-0 py-1 inline float-left bg-surfacecontainer">{uuid}</p>
        </div>
      </div>
    </EditorContainer>
  );
}