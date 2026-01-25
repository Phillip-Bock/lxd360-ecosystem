#!/usr/bin/env python3
"""
merge_animations.py - Blender Python Script for Avatar Pipeline

This script merges a rigged character model with multiple animation clips
and exports a single compressed .glb file with all animations embedded.

Usage (from repo root):
    pnpm process:cortex

Requirements:
    - Blender 5.0+ installed
    - Input files:
        - cortex_master.blend (rigged character)
        - animations/*.fbx (animation clips)

Output:
    - public/models/cortex.glb (merged model with animations)
"""

import argparse
import glob
import os
import sys

import bpy


# =============================================================================
# BLENDER 5.0 "NUCLEAR" PATCH
# The official bpy.types.CyclesLightSettings path is broken in 5.0.
# We must find the class at runtime and inject a pure Python property mock.
# =============================================================================
def apply_nuclear_patch():
    """Inject cast_shadow property mock to prevent FBX import crash."""
    print("Applying Nuclear Patch for Blender 5.0...")
    try:
        # 1. Create a dummy light to find the elusive class type at runtime
        temp_light = bpy.data.lights.new(name="Patch_Probe", type='POINT')

        # 2. Get the actual class object from the instance
        # (This bypasses the broken bpy.types registry)
        CyclesSettingsClass = type(temp_light.cycles)

        # 3. Inject a dummy property using pure Python setattr
        # This allows 'lamp.cycles.cast_shadow = True' to succeed silently
        if not hasattr(CyclesSettingsClass, "cast_shadow"):
            print("  -> Injecting 'cast_shadow' mock into runtime class...")
            setattr(CyclesSettingsClass, 'cast_shadow', property(lambda self: True, lambda self, v: None))
            print("  -> Patch applied successfully")
        else:
            print("  -> 'cast_shadow' already exists. No patch needed.")

        # Cleanup dummy light
        bpy.data.lights.remove(temp_light)

    except Exception as e:
        print(f"Patch Warning: {e}")


# Apply immediately before any imports
apply_nuclear_patch()
# =============================================================================


def normalize_path(path):
    """Normalize and convert path to absolute (Windows-safe)."""
    return os.path.normpath(os.path.abspath(path))


def main():
    """Main pipeline function."""
    # Parse Arguments
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = []

    parser = argparse.ArgumentParser(description="Merge animations into GLB")
    parser.add_argument("--master", required=True, help="Path to master .blend file")
    parser.add_argument("--anims", required=True, help="Directory containing .fbx files")
    parser.add_argument("--output", required=True, help="Output path for .glb file")
    args = parser.parse_args(argv)

    master_path = normalize_path(args.master)
    anims_dir = normalize_path(args.anims)
    output_path = normalize_path(args.output)

    print()
    print("=" * 60)
    print("  LXD360 Avatar Animation Merge Pipeline")
    print(f"  Blender Version: {bpy.app.version_string}")
    print("=" * 60)
    print()
    print("Configuration:")
    print(f"  Master file:  {master_path}")
    print(f"  Anims dir:    {anims_dir}")
    print(f"  Output file:  {output_path}")
    print()

    # Step 1: Clear and open master file
    print("Clearing scene...")
    bpy.ops.wm.read_homefile(use_empty=True)

    if not os.path.exists(master_path):
        print("=" * 60)
        print("CRITICAL: Master blend file not found!")
        print(f"  Expected: {master_path}")
        print("=" * 60)
        sys.exit(1)

    print(f"Opening master file: {master_path}")
    bpy.ops.wm.open_mainfile(filepath=master_path)
    print("  -> Master file loaded")

    # Step 2: Identify Master Armature
    master_armature = None
    for obj in bpy.data.objects:
        if obj.type == 'ARMATURE':
            master_armature = obj
            break

    if not master_armature:
        print("=" * 60)
        print("CRITICAL: No Armature found in Master file!")
        print("The master file must contain a rigged character.")
        print("=" * 60)
        sys.exit(1)

    print(f"  -> Target rig: {master_armature.name}")
    print()

    # Step 3: Find animation files
    fbx_pattern_lower = os.path.join(anims_dir, "*.fbx")
    fbx_pattern_upper = os.path.join(anims_dir, "*.FBX")

    fbx_files = glob.glob(fbx_pattern_lower)
    fbx_files.extend(glob.glob(fbx_pattern_upper))
    fbx_files = sorted(set(fbx_files))

    success_count = 0

    if not fbx_files:
        print("WARNING: No FBX files found in animations folder.")
        print("Exporting base model only...")
    else:
        print(f"Processing {len(fbx_files)} animations...")
        print("-" * 40)

        for fbx_path in fbx_files:
            anim_name = os.path.splitext(os.path.basename(fbx_path))[0]
            print(f"  Importing: {anim_name}...")

            try:
                # Import FBX (Nuclear Patch protects this call)
                bpy.ops.import_scene.fbx(
                    filepath=normalize_path(fbx_path),
                    use_anim=True,
                    ignore_leaf_bones=True,
                    force_connect_children=True,
                    use_custom_props=False
                )
            except Exception as e:
                print(f"    ERROR importing {anim_name}: {e}")
                continue

            # Find Imported Armature
            imported_armature = None
            if bpy.context.selected_objects:
                for obj in bpy.context.selected_objects:
                    if obj.type == 'ARMATURE' and obj != master_armature:
                        imported_armature = obj
                        break

            if imported_armature and imported_armature.animation_data and imported_armature.animation_data.action:
                action = imported_armature.animation_data.action
                action.name = anim_name

                # Create NLA Track on Master
                if not master_armature.animation_data:
                    master_armature.animation_data_create()

                track = master_armature.animation_data.nla_tracks.new()
                track.name = anim_name
                frame_start = int(action.frame_range[0])
                strip = track.strips.new(anim_name, frame_start, action)
                strip.action = action

                frame_end = int(action.frame_range[1])
                print(f"    -> Merged '{anim_name}' (frames {frame_start}-{frame_end})")
                success_count += 1

                # Cleanup imported objects
                bpy.ops.object.select_all(action='DESELECT')
                for obj in list(bpy.context.scene.objects):
                    if obj == imported_armature or (obj.parent and obj.parent == imported_armature):
                        obj.select_set(True)
                bpy.ops.object.delete()
            else:
                print(f"    -> WARNING: No animation data in {anim_name}")

        print("-" * 40)
        print(f"Successfully merged {success_count}/{len(fbx_files)} animations")

    # List all actions
    print()
    print(f"Final actions ({len(bpy.data.actions)}):")
    for action in bpy.data.actions:
        frame_start, frame_end = action.frame_range
        duration = frame_end - frame_start
        print(f"  - {action.name}: {frame_start:.0f}-{frame_end:.0f} ({duration:.0f} frames)")

    # Step 4: Export with Maximum Compression
    print()
    print(f"Exporting GLB: {output_path}")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_animations=True,
        export_nla_strips=True,
        export_skins=True,
        export_morph=True,
        export_lights=False,
        export_cameras=False,
        export_apply=True,
        # Maximum Draco compression
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=10,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
    )

    # Report file size
    if os.path.exists(output_path):
        file_size = os.path.getsize(output_path)
        print(f"  -> File size: {file_size / 1024:.1f} KB (Draco max compression)")
        print(f"  -> SUCCESS: {output_path}")
    else:
        print("  -> ERROR: Export failed - file not created")
        sys.exit(1)

    print()
    print("=" * 60)
    print(f"  PIPELINE COMPLETE - Merged {success_count} animations")
    print("=" * 60)
    print()


if __name__ == "__main__":
    main()
