const SMALLNESS_MULTIPLIER = 0.3;

class AgentModel {
  constructor(jsonData) {
    Object.assign(this, jsonData);
    this.x = 0;
    this.y = 0;
    this.angle = Math.PI * 1.5;
    this.radius = 1000;
    this.depth = 0;
  }

  recomputePositions() {
    let childAngleDifference = Math.abs(Math.PI / 1 / (this.children.length + 1));
    childAngleDifference *= 0.4 ** this.depth;
    //console.log('childAngleDifference', childAngleDifference);
    this.children.forEach((child, i) => {
      const offset = i - ((this.children.length - 1) / 2);
      child.angle = (offset * childAngleDifference) + this.angle;
    });

    this.children.forEach((child) => {
      child.radius = this.radius * (SMALLNESS_MULTIPLIER + 0.2);
      child.x = this.x + (Math.cos(child.angle) * child.radius);
      child.y = this.y - (Math.sin(child.angle) * child.radius);

      child.test = Math.sqrt((child.x - this.x) ** 2 + (child.y - this.y) ** 2);

      child.recomputePositions();
    });
  }
}

export { AgentModel, SMALLNESS_MULTIPLIER };
