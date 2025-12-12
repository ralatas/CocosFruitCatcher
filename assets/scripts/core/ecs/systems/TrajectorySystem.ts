import { queries } from "../world";
import { TrajectoryKind } from "../components";

export class TrajectorySystem {
  public update(dt: number): void {
    for (const entity of queries.withTrajectory) {
      const { trajectory, lifetime, velocity } = entity;

      if (!trajectory || !lifetime || !velocity) {
        continue;
      }

      lifetime.value += dt;

      switch (trajectory.kind) {
        case TrajectoryKind.Linear: {
          break;
        }
        case TrajectoryKind.Zigzag: {
          const amplitude = trajectory.amplitude ?? 80;
          const frequency = trajectory.frequency ?? 2;
          velocity.x = amplitude * Math.sin(lifetime.value * frequency);
          break;
        }
        case TrajectoryKind.Accelerated: {
          const acceleration = trajectory.acceleration ?? -600;
          velocity.y += acceleration * dt;
          break;
        }
        default:
          break;
      }
    }
  }
}
