import ROSLIB from "roslib";

// -----------------------------------------------------------------------------
// ROS setup

// Connect to local rosbridge server via
var ros = new ROSLIB.Ros({
  url: "ws://localhost:9090"
});

// Called on connection, outputs feedback to indicate connection success
ros.on("connection", function() {
  console.log("connected");
});

// Called on error. outputs error for user to see.
ros.on("error", function(error) {
  console.log("err");
});

// called on close. outputs feedback to indicate server shutdown
ros.on("close", function() {
  console.log("connection closed");
});

// Create a service that facilitates moving the end effector.
var endEffectorClient = new ROSLIB.Service({
  ros: ros,
  name: "/open_manipulator/goal_task_space_path_position_only",
  serviceType: "open_manipulator_msgs/SetKinematicsPose"
});

// Create a service that facilitates panning and tilting.
var tiltAndPanClient = new ROSLIB.Service({
  ros: ros,
  name: "/open_manipulator/goal_joint_space_path",
  serviceType: "open_manipulator_msgs/SetJointPosition"
});

// Create a service that facilitates rolling the screen.
var pitchClient = new ROSLIB.Service({
  ros: ros,
  name: "/open_manipulator/goal_tool_control",
  serviceType: "open_manipulator_msgs/SetJointPosition"
});

// Set up a service request with parameters for the endEffectorClient.
var endEffector = new ROSLIB.ServiceRequest({
  planning_group: "",
  end_effector_name: "gripper",
  kinematics_pose: {
    pose: {
      position: {
        x: 0.286,
        y: 0.0,
        z: 0.2045
      },
      orientation: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        w: 1.0
      }
    },
    max_accelerations_scaling_factor: 0.0,
    max_velocity_scaling_factor: 0.0,
    tolerance: 0.0
  },
  path_time: 2.0
});

// Service with parameters for thetiltAndPanClient
var tiltAndPan = new ROSLIB.ServiceRequest({
  planning_group: "",
  joint_position: {
    joint_name: ["joint1", "joint2", "joint3", "joint4"],
    position: [0.0, 0.0, 0.0, 0.0],
    max_accelerations_scaling_factor: 0.0,
    max_velocity_scaling_factor: 0.0
  },
  path_time: 2.0
});

// Service with parameters for pitchClient
var pitchSrv = new ROSLIB.ServiceRequest({
  planning_group: "",
  joint_position: {
    joint_name: ["gripper"],
    position: [0.0],
    max_accelerations_scaling_factor: 0.0,
    max_velocity_scaling_factor: 0.0
  },
  path_time: 2.0
});

/*
  Calls the moveArmClient service with the requested parameters.
  Params:
    srv: a ROSLIB.ServiceRequest
    client: The service to client to call
  RetVal: if service is planned then return true.
*/
function callService(srv, client) {
  var retVal = false;

  client.callService(srv, function(result) {
    console.log(
      "Result for service call on " + client.name + ": " + result.is_planned
    );

    retVal = result.is_planned;
  });

  return retVal;
}

// -----------------------------------------------------------------------------
// Movement primitives

// helper function thaat calls the service and returns success or failure
function move(srv, client) {
  // print error if there is one
  if (callService(srv, client)) {
    console.log("success");
  } else {
    console.log("failure");
  }
}

/* format of pos paramater:

var pos = {
  x : 0.25,
  y : 0.0,
  z : 0.2045
}; */

/*
 Moves the end effector by pos in dur seconds.
 If specified pos is out of range, end effector will not move.
 Params:
    pos: struct that specifies which x, y, z coordinates to move to
    dur: movement duration.
*/
function moveEndEffector(pos, dur) {
  endEffector.kinematics_pose.pose.position = pos;
  endEffector.path_time = dur;
  move(endEffector, endEffectorClient);
}

/*
  Rotates screen along Y axis by angle in dur seconds.
  If specified pos is out of range, end effector will not move.
  Params:
    angle: radians to rotate by. min -1.67, max 1.53.
    dur: movement duration.
*/
function tilt(angle, dur) {
  tiltAndPan.joint_position.position[3] = angle;
  tiltAndPan.path_time = dur;
  move(tiltAndPan, tiltAndPanClient);
}

/*
  Rotates screen along Z axis by angle in dur seconds.
  If specified pos is out of range, end effector will not move.
  Params:
    angle: radians to rotate by. min -3.14, max 3.14.
    dur: movement duration.
*/
function pan(angle, dur) {
  tiltAndPan.joint_position.position[0] = angle;
  tiltAndPan.path_time = dur;
  move(tiltAndPan, tiltAndPanClient);
}

/*
  Rotates screen along X axis by angle in dur seconds.
  Params:
    angle: meters to rotate by. min -0.01, max 0.01.
    dur: movement duration.
*/
function pitch(angle, dur) {
  pitchSrv.joint_position.position[0] = angle;
  pitchSrv.path_time = dur;
  move(pitchSrv, pitchClient);
}

export { move, pan, tilt, pitch };
