import Vector from "../utils/Vector";
import { Particle } from "./Particle";
import type { ParticleSettings } from "./ParticleCanvasContext";

export default class ParticleFactory {
    public settings: ParticleSettings;

    constructor(settings: ParticleSettings) {
        this.settings = settings;
    }

    createParticle(position: Vector, velocity: Vector = Vector.Zero): Particle {
        return new Particle(
            position.x,
            position.y,
            this.settings.particleRadius,
            this.settings.particleColor,
            this.settings
        );
    }
}