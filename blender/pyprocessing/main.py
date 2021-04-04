import sys
sys.path.append('/home/firescar96/Documents/InnerTicks/blender-git/build_linux/bin')
sys.path.append('.')
import bpy
import mathutils
import bmesh
import math
import json
import os
import pathlib
from models.agent import Agent

dir_path = pathlib.Path(__file__).parent.absolute()

# vertices = [(0, 0, 0),]
# edges = []
# faces = []

# new_mesh = bpy.data.meshes.new('new_mesh')

# new_mesh.from_pydata(vertices, edges, faces)
# new_mesh.update()

# new_collection = bpy.data.collections.new('new_collection')
# bpy.context.scene.collection.children.link(new_collection)


# new_collection = bpy.data.collections.new('new_collection')
# bpy.context.scene.collection.children.link(new_collection)

scene = bpy.context.scene
collection = bpy.context.collection

bpy.data.objects.remove(bpy.data.objects.get('Cube'))

desired_data = {
    'materials': ['bark'], 
    'meshes': ['body'], 
    'curves': ['BezierCurve'], 
    'textures': [],
}

with bpy.data.libraries.load(os.path.join(dir_path, '../blends/treesection-rendered.blend'), link=True) as (src, dst):
    for data_field, field_values in desired_data.items():
        setattr(dst, data_field, field_values)

with open('../../rawhistorydata/database.json') as f:
    database_data = json.load(f)

# testing_ids = ['604d8ce639154e75e32a5c55', '604d8ce639154e75e32a5c57', '604d8ce639154e75e32a5c59', '604d8ce639154e75e32a5c5b','604d8ce639154e75e32a5c6b', '604d8ce639154e75e32a5c61']
testing_ids = [x['id'] for x in database_data[:18]]
bpy.ops.object.transform_apply( rotation = True, location=True)

agent_map = {d['id']:Agent(d) for d in database_data if d['id'] in testing_ids}
for datum in agent_map.values():
    if not datum.parent:
        root = datum
        continue
    
    agent_map[datum.parent].children.append(datum)
    

# root = Agent(database_data[0])
# root.children = [Agent(database_data[0]), Agent(database_data[1])]
root.recompute_positions()

# Create a light
light_data = bpy.data.lights.new('light', type='POINT')
light = bpy.data.objects.new('light', light_data)
collection.objects.link(light)
light.location = mathutils.Vector((3, -4.2, 5))

cam = bpy.data.objects.get("Camera")
scene.camera = cam
# cam.location = mathutils.Vector((40, -20, 30))
# x controls up down pitch
# y controls roll
# z controls left right yaw
# cam starts on y axis pointing down
cam.location = mathutils.Vector((0, -40, 7))
cam.rotation_euler = mathutils.Euler((math.radians(90), 0, 0))

# render settings355
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = "./scroll.png"
bpy.ops.render.render(write_still = 1)

# bpy.ops.wm.save_as_mainfile(filepath='./python-tree')