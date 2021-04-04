import math
import os
import pathlib
import mathutils
import bpy
SMALLNESS_MULTIPLIER = 0.3
BRANCH_LENGTH = 15

dir_path = pathlib.Path(__file__).parent.absolute()

desired_objects = ['Trunk', 'size reference', 'mind']

collection = bpy.context.collection

def distance(p1, p2):
    return sqrt((p1[0]-p2[0])**2+(p1[1]-p2[1])**2+(p1[2]-p2[2])**2)

class Agent():
    def __init__(self, json_data):
        self.children = []
        self.id = None
        self.depth = None
        for key, value in json_data.items():
            setattr(self, key, value)
        self.rotation_angle = mathutils.Vector([0, 0, 1, 0])
        self.orientation_vector = mathutils.Vector([0, 0, 1])
        self.location = mathutils.Vector([0,0,0])
        self.scale = 1
        self.length = BRANCH_LENGTH
        self.phi = 0
        self.radius = 1000
        self.blender_objects = {}
        self.initialize_blender_objects()

    def initialize_blender_objects(self):
        with bpy.data.libraries.load(os.path.join(dir_path, '../../blends/treesection.blend'), link=True) as (src, dst):
            dst.objects = [x for x in desired_objects]

        for obj_name in desired_objects:
            obj = bpy.data.objects.get(obj_name)
            obj.name = obj_name + self.id
            collection.objects.link(obj)
            self.blender_objects[obj_name] = obj

        self.location = self.blender_objects['Trunk'].location
        self.blender_objects['Trunk'].rotation_mode = 'AXIS_ANGLE'
        print('self.location', self.location)

    #recursive function that updates the positions of all of this node's children
    def recompute_positions(self):
        # we need to compute three values for each child, X, Theta, and Phi
        # X the position along the trunk of the parent
        # Theta the angle the child will make relative to the parent as it branches off
        # Phi the position of the child around the trunk
        
        for i, child in enumerate(self.children):
            child.length = self.length /2
            child.scale = self.scale * .75
            child.theta = math.radians(45)
            child.phi = (math.pi*2) *i /len(self.children)
            # print('child.phi', child.phi)

        for child in self.children:


            # set X
            self_direction_vector = self.orientation_vector.normalized()
            # child_direction_vector = child.rotation_euler.normalized()
            child.location = self.location + (self_direction_vector * self.length * .25)
            # print('self_direction_vector', self_direction_vector, (self_direction_vector * child.length))
            child.blender_objects['Trunk'].location = child.location
            
            # initial rotation matrix relative to self (the child branch's parent)
            # rotate by theta
            rotation_matrix = mathutils.Matrix.Rotation(self.rotation_angle[0] + child.theta, 3, self.rotation_angle[1:])
            # rotate by phi
            rotation_matrix.rotate(rotation_matrix.Rotation(child.phi, 3, self.orientation_vector))

            child.orientation_vector.rotate(rotation_matrix)
            rotation_axis_angle = rotation_matrix.to_quaternion().to_axis_angle()
            child.rotation_angle = [rotation_axis_angle[1], *rotation_axis_angle[0]]
            child.blender_objects['Trunk'].rotation_axis_angle = child.rotation_angle
            # print('child.rotation_angle', child.rotation_angle)

            child.blender_objects['Trunk'].scale = mathutils.Vector([1,1,1]) * child.scale
            
            
            # child.blender_objects['Trunk'].rotation_euler = child.rotation_euler
            child.recompute_positions()