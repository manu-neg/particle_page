import { Particle } from "../Particle/Particle";
import { getRandomColor } from "../utils/Color";
import Vector from "../utils/Vector";

export default class Cursor {
    public pos: Vector;
    public radius: number;
    public color: string;

    constructor(radius: number, 
        color: string = getRandomColor()) {
        this.pos = new Vector(0, 0);
        this.radius = radius;
        this.color = color;
    }

    update(event: React.MouseEvent, bounds: DOMRect): void {
        // Position relative to the canvas
        let bounds_vec = new Vector(bounds.x, bounds.y);
        let event_vec = new Vector(event.clientX, event.clientY);
        this.pos = Vector.sub(event_vec, bounds_vec);
        
        
    }

    getParticlesInRange(particles: Particle[]): Particle[] {
        return particles.filter(particle => {
            const dp: Vector = Vector.sub(this.pos, particle.pos);
            const distance = Math.sqrt((dp.x * dp.x) + (dp.y * dp.y));
            return distance <= this.radius;
        });
    }

    applyForces(particles: Particle[]): void {
        let dp: Vector;
        let distance: number;
        let Zero = new Vector(0, 0);
        for (let particle of particles) {
            dp = Vector.sub(this.pos, particle.pos);
            distance = Math.sqrt((dp.x * dp.x) + (dp.y * dp.y));
            if (distance <= this.radius) {
                const vec_to_cursor = particle.pos.to(this.pos.x, this.pos.y);
                particle.applyForce(vec_to_cursor);
            } else {
                particle.applyForce(Zero);
            }
        }
    }

}