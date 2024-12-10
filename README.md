# PhysicsChess
 A physics-based variant of chess.

# To-do
- Features
    - WorldManager
		- ✅Scene loading
		- ❌Changing Scene (doesn't call dispose)
    - ResourceManager
		- ✅Loading resource
		- ❌Unloading resource
		- ❌Auto-unload resource based on reference counter
	- World
		- ❌Adding Entities (no way for components to access entity list)
		- ❌Removing Entities (doesn't call dispose)
	- Entity
		- ❌Adding Components (Doesn't invoke start)
		- ❌Removing Components (Doesn't call dispose)
		- ❌Querying Components (Components are just an array and no way to identify them yet)
	- Component
		- ✅Disabling/Enabling Components
	- Editor
		- ✅UUID Generator
		- ❌Automatic UUID generator for files
		- ❌Folder structure viewer
		- ❌JSON generator for (scenes, entities, components)
- Tests
    - WorldManager
    - ResourceManager
    - World
    - Entity
    - Component
    - Editor (or not really that important)
			